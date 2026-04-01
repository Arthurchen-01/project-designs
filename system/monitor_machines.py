from __future__ import annotations

import re
import socket
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from html import escape
from pathlib import Path

import paramiko


BASE_DIR = Path(r"C:\Users\25472")
WORKSPACE = BASE_DIR / ".openclaw" / "workspace-agent1"
STATUS_PATH = WORKSPACE / "STATUS.md"
OUTPUT_DIR = BASE_DIR / "Desktop" / "AI brain storming" / "5分率追踪平台"
SENSITIVE_PATH = OUTPUT_DIR / "AI全记忆交接-敏感信息-本地专用-2026-03-31.md"
LATEST_REPORT_MD = OUTPUT_DIR / "三机监控-最新报告.md"
LATEST_REPORT_HTML = OUTPUT_DIR / "三机监控面板.html"


@dataclass
class RemoteHost:
    label: str
    host: str
    user: str
    password: str
    workspace: str
    config_path: str


@dataclass
class MachineSnapshot:
    label: str
    lines: list[str]
    latest_execution_path: str = ""
    latest_execution_time: str = ""
    latest_review_path: str = ""
    latest_review_time: str = ""


def parse_sensitive_file(path: Path) -> tuple[RemoteHost, RemoteHost]:
    text = path.read_text(encoding="utf-8")

    def section(name: str) -> str:
        pattern = rf"### {re.escape(name)}\r?\n(.*?)(?=\r?\n## |\r?\n### |\Z)"
        match = re.search(pattern, text, re.S)
        if not match:
            raise RuntimeError(f"Could not find section for {name}")
        return match.group(1)

    def extract(block: str, field: str) -> str:
        patterns = [
            rf"- {re.escape(field)}:\s*`([^`]+)`",
            rf"{re.escape(field)}：\s*\r?\n\r?\n- `([^`]+)`",
            rf"{re.escape(field)}:\s*\r?\n\r?\n- `([^`]+)`",
        ]
        for pattern in patterns:
            match = re.search(pattern, block, re.S)
            if match:
                return match.group(1)
        raise RuntimeError(f"Could not find field {field}")

    block2 = section("2 号机")
    block3 = section("3 号机")
    return (
        RemoteHost(
            label="agent2",
            host=extract(block2, "host"),
            user=extract(block2, "user"),
            password=extract(block2, "password"),
            workspace=extract(block2, "已知工作区"),
            config_path="/home/ubuntu/.openclaw/openclaw.json",
        ),
        RemoteHost(
            label="agent3",
            host=extract(block3, "host"),
            user=extract(block3, "推荐可用 user"),
            password=extract(block3, "password"),
            workspace=extract(block3, "已知工作区"),
            config_path="/root/.openclaw/openclaw.json",
        ),
    )


def parse_status(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("- ") and ":" in stripped:
            key, value = stripped[2:].split(":", 1)
            data[key.strip()] = value.strip()
    return data


def run_powershell(command: str) -> str:
    completed = subprocess.run(
        ["powershell", "-NoProfile", "-Command", command],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())
    return completed.stdout.strip()


def local_gateway_status() -> list[str]:
    lines: list[str] = []
    try:
        process_output = run_powershell(
            "Get-Process | Where-Object { $_.ProcessName -like '*openclaw*' -or $_.ProcessName -like '*node*' } "
            "| Sort-Object StartTime -Descending "
            "| Select-Object -First 3 ProcessName,Id,StartTime | Format-Table -HideTableHeaders"
        )
        if process_output:
            for row in process_output.splitlines():
                if row.strip():
                    lines.append(f"local_process={row.strip()}")
    except Exception as exc:
        lines.append(f"local_process_error={exc}")
    return lines


def local_recent_files(root: Path) -> list[str]:
    files = sorted(
        (p for p in root.rglob("*") if p.is_file()),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )[:5]
    lines = []
    for item in files:
        ts = datetime.fromtimestamp(item.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
        lines.append(f"recent_file={item.relative_to(root)} | {ts}")
    return lines


def remote_exec(client: paramiko.SSHClient, command: str, timeout: int = 30) -> str:
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    out = stdout.read().decode("utf-8", "replace").strip()
    err = stderr.read().decode("utf-8", "replace").strip()
    if err:
        return f"{out}\n[stderr]\n{err}".strip()
    return out


def parse_latest_artifact(line: str) -> tuple[str, str]:
    if not line:
        return "", ""
    match = re.match(r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\s+(.+)", line.strip())
    if not match:
        return "", line.strip()
    return match.group(1), match.group(2)


def latest_task_id(path_text: str) -> str:
    match = re.search(r"(TASK-[A-Z0-9-]+)", path_text)
    return match.group(1) if match else ""


def remote_health_check(host: RemoteHost) -> MachineSnapshot:
    lines: list[str] = []
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        host.host,
        username=host.user,
        password=host.password,
        timeout=12,
        banner_timeout=12,
        auth_timeout=12,
    )
    try:
        lines.append(f"whoami={remote_exec(client, 'whoami')}")
        lines.append(
            f"git={remote_exec(client, f'cd {host.workspace} && git status -sb | head -1')}"
        )
        lines.append(
            f"branch={remote_exec(client, f'cd {host.workspace} && git branch --show-current')}"
        )
        lines.append(f"role={remote_exec(client, f'cat {host.workspace}/.agent-role.local')}")
        lines.append(
            "service="
            + remote_exec(
                client,
                "systemctl --user is-active openclaw-gateway.service && "
                "systemctl --user show openclaw-gateway.service -p ActiveEnterTimestamp --value",
            ).replace("\n", " | started=")
        )
        lines.append(
            "listen="
            + remote_exec(client, "ss -ltn | grep 18789 || true").replace("\n", " | ")
        )
        lines.append(
            "health="
            + remote_exec(
                client,
                "python3 - <<'PY'\n"
                "import urllib.request\n"
                "try:\n"
                "    with urllib.request.urlopen('http://127.0.0.1:18789/health', timeout=10) as resp:\n"
                "        print(resp.status, resp.read(120).decode('utf-8','replace'))\n"
                "except Exception as e:\n"
                "    print('ERROR', repr(e))\n"
                "PY",
            ).replace("\n", " ")
        )
        latest_execution_raw = remote_exec(
            client,
            f"find {host.workspace}/30_execution -maxdepth 2 -type f -printf '%TY-%Tm-%Td %TH:%TM %p\\n' | sort | tail -1",
        )
        exec_time, exec_path = parse_latest_artifact(latest_execution_raw)
        lines.append(f"latest_execution={latest_execution_raw}")
        latest_review_raw = remote_exec(
            client,
            f"find {host.workspace}/40_review -maxdepth 2 -type f -printf '%TY-%Tm-%Td %TH:%TM %p\\n' | sort | tail -1",
        )
        review_time, review_path = parse_latest_artifact(latest_review_raw)
        lines.append(f"latest_review={latest_review_raw}")
        lines.append(
            "provider_keys="
            + remote_exec(
                client,
                "python3 - <<'PY'\n"
                "import json\n"
                f"from pathlib import Path\n"
                f"obj=json.loads(Path('{host.config_path}').read_text())\n"
                "providers=obj.get('models',{}).get('providers',{})\n"
                "for name, cfg in providers.items():\n"
                "    key=cfg.get('apiKey','')\n"
                "    print(f\"{name}:{key[:12]}...:{len(key)}\")\n"
                "PY",
            ).replace("\n", " | ")
        )
        lines.append(
            "recent_auth_log="
            + remote_exec(
                client,
                "python3 - <<'PY'\n"
                "import subprocess\n"
                "out=subprocess.run([\n"
                "    'journalctl','--user','-u','openclaw-gateway.service','-n','120','--no-pager'\n"
                "], capture_output=True)\n"
                "text=out.stdout.decode('utf-8','replace')\n"
                "lines=[line for line in text.splitlines() if '401' in line or 'hot reload applied' in line]\n"
                "print(' || '.join(lines[-3:]))\n"
                "PY",
            )
        )
        return MachineSnapshot(
            label=host.label,
            lines=lines,
            latest_execution_path=exec_path,
            latest_execution_time=exec_time,
            latest_review_path=review_path,
            latest_review_time=review_time,
        )
    finally:
        client.close()


def print_section(title: str, lines: list[str]) -> None:
    print(f"[{title}]")
    for line in lines:
        print(f"- {line}")
    print()


def build_alerts(status: dict[str, str], snapshots: list[MachineSnapshot]) -> list[str]:
    alerts: list[str] = []
    status_target_2 = status.get("agent2_target", "")
    status_target_3 = status.get("agent3_target", "")
    status_updated = status.get("last_updated", "")

    for snapshot in snapshots:
        health_line = next((line for line in snapshot.lines if line.startswith("health=")), "")
        if "200" not in health_line:
            alerts.append(f"{snapshot.label}: gateway health is not OK -> {health_line}")

        auth_line = next((line for line in snapshot.lines if line.startswith("recent_auth_log=")), "")
        if "401" in auth_line and "hot reload applied" not in auth_line:
            alerts.append(f"{snapshot.label}: recent auth log still shows unresolved 401")

    if snapshots:
        agent2 = next((s for s in snapshots if s.label == "agent2"), None)
        agent3 = next((s for s in snapshots if s.label == "agent3"), None)
        if agent2:
            latest_task = latest_task_id(agent2.latest_execution_path) or latest_task_id(agent2.latest_review_path)
            if status_target_2 and latest_task and latest_task not in status_target_2:
                alerts.append(
                    f"状态漂移: STATUS.md 写的是 agent2_target={status_target_2}，但 agent2 最新产物已经到 {latest_task}"
                )
        if agent3:
            latest_task = latest_task_id(agent3.latest_execution_path) or latest_task_id(agent3.latest_review_path)
            if status_target_3 and status_target_3 != "None" and latest_task and latest_task not in status_target_3:
                alerts.append(
                    f"状态漂移: STATUS.md 写的是 agent3_target={status_target_3}，但 agent3 最新产物已经到 {latest_task}"
                )
        if status_updated:
            latest_times = [s.latest_execution_time for s in snapshots if s.latest_execution_time] + [
                s.latest_review_time for s in snapshots if s.latest_review_time
            ]
            latest_times = [t for t in latest_times if t]
            if latest_times:
                latest_remote = max(latest_times)
                if latest_remote > status_updated[:16].replace("T", " "):
                    alerts.append(
                        f"状态漂移: STATUS.md 最后更新时间是 {status_updated}，但远端已有更晚产物到 {latest_remote}"
                    )
    if not alerts:
        alerts.append("无高优先级告警，当前三机基础连通与 gateway 健康正常。")
    return alerts


def build_markdown_report(
    status: dict[str, str],
    local_lines: list[str],
    snapshots: list[MachineSnapshot],
    alerts: list[str],
) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines: list[str] = []
    lines.append("# 三机监控最新报告")
    lines.append("")
    lines.append(f"- 生成时间: `{now}`")
    lines.append(f"- 状态文件: `{STATUS_PATH}`")
    lines.append("")
    lines.append("## 高亮告警")
    lines.append("")
    for alert in alerts:
        lines.append(f"- {alert}")
    lines.append("")
    lines.append("## 1号机状态板")
    lines.append("")
    for key in (
        "current_state",
        "active_project",
        "active_batch",
        "last_updated",
        "agent1_state",
        "agent1_target",
        "agent2_state",
        "agent2_target",
        "agent3_state",
        "agent3_target",
    ):
        if key in status:
            lines.append(f"- {key}: `{status[key]}`")
    lines.append("")
    lines.append("## 1号机本地")
    lines.append("")
    for line in local_lines:
        lines.append(f"- {line}")
    lines.append("")
    for snapshot in snapshots:
        lines.append(f"## {snapshot.label}")
        lines.append("")
        for line in snapshot.lines:
            lines.append(f"- {line}")
        lines.append("")
    lines.append("## 最方便的查看方式")
    lines.append("")
    lines.append(
        f"- 双击运行 `一键巡检三台机器.ps1`，它会刷新并打开 `{LATEST_REPORT_MD.name}`。"
    )
    lines.append(
        f"- 命令行方式: `powershell -NoProfile -ExecutionPolicy Bypass -File \"{OUTPUT_DIR / '一键巡检三台机器.ps1'}\"`"
    )
    lines.append("")
    return "\n".join(lines)


def health_badge(snapshot: MachineSnapshot) -> tuple[str, str]:
    health_line = next((line for line in snapshot.lines if line.startswith("health=")), "")
    service_line = next((line for line in snapshot.lines if line.startswith("service=")), "")
    if "200" in health_line and "active" in service_line:
        return "健康", "ok"
    return "异常", "bad"


def build_html_report(
    status: dict[str, str],
    local_lines: list[str],
    snapshots: list[MachineSnapshot],
    alerts: list[str],
) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def render_list(items: list[str]) -> str:
        return "".join(f"<li>{escape(item)}</li>" for item in items)

    status_rows = "".join(
        f"<div class='kv'><span>{escape(key)}</span><strong>{escape(status[key])}</strong></div>"
        for key in (
            "current_state",
            "active_project",
            "active_batch",
            "last_updated",
            "agent1_state",
            "agent1_target",
            "agent2_state",
            "agent2_target",
            "agent3_state",
            "agent3_target",
        )
        if key in status
    )

    machine_cards = []
    for snapshot in snapshots:
        badge_text, badge_class = health_badge(snapshot)
        machine_cards.append(
            f"""
            <section class="card machine">
              <div class="machine-head">
                <h2>{escape(snapshot.label)}</h2>
                <span class="badge {badge_class}">{escape(badge_text)}</span>
              </div>
              <ul class="detail-list">
                {render_list(snapshot.lines)}
              </ul>
            </section>
            """
        )

    alert_class = "good" if len(alerts) == 1 and alerts[0].startswith("无高优先级告警") else "warn"
    html = f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>三机监控面板</title>
  <style>
    :root {{
      --bg: #f3efe6;
      --paper: #fffdf8;
      --ink: #1f2a22;
      --muted: #5b655e;
      --line: #d8cfbf;
      --accent: #0f766e;
      --warn: #b45309;
      --bad: #b91c1c;
      --good: #166534;
      --shadow: 0 18px 40px rgba(46, 42, 35, 0.12);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(15,118,110,0.14), transparent 28%),
        radial-gradient(circle at top right, rgba(180,83,9,0.14), transparent 22%),
        linear-gradient(180deg, #f7f1e5 0%, var(--bg) 100%);
    }}
    .wrap {{
      max-width: 1320px;
      margin: 0 auto;
      padding: 28px 20px 40px;
    }}
    .hero {{
      background: linear-gradient(135deg, rgba(255,253,248,0.96), rgba(246,239,224,0.92));
      border: 1px solid rgba(216,207,191,0.9);
      border-radius: 24px;
      padding: 24px;
      box-shadow: var(--shadow);
    }}
    h1, h2, h3 {{
      margin: 0;
      font-weight: 700;
    }}
    .subtitle {{
      margin-top: 10px;
      color: var(--muted);
      font-size: 14px;
    }}
    .alert-box {{
      margin-top: 18px;
      padding: 16px 18px;
      border-radius: 18px;
      border: 1px solid rgba(0,0,0,0.06);
      background: {'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(255,251,235,0.96))' if alert_class == 'warn' else 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(240,253,244,0.96))'};
    }}
    .alert-box h2 {{
      font-size: 18px;
      margin-bottom: 10px;
    }}
    .alert-box ul {{
      margin: 0;
      padding-left: 18px;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 18px;
      margin-top: 22px;
    }}
    .card {{
      background: rgba(255,253,248,0.94);
      border: 1px solid var(--line);
      border-radius: 22px;
      padding: 18px;
      box-shadow: var(--shadow);
    }}
    .kv-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px 14px;
      margin-top: 14px;
    }}
    .kv {{
      padding: 12px 14px;
      background: rgba(243,239,230,0.75);
      border-radius: 14px;
      border: 1px solid rgba(216,207,191,0.85);
    }}
    .kv span {{
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    .kv strong {{
      font-size: 15px;
      line-height: 1.4;
    }}
    .machine-head {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }}
    .badge {{
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }}
    .badge.ok {{
      background: rgba(34,197,94,0.14);
      color: var(--good);
    }}
    .badge.bad {{
      background: rgba(220,38,38,0.14);
      color: var(--bad);
    }}
    .detail-list {{
      margin: 0;
      padding-left: 18px;
      color: var(--ink);
      line-height: 1.5;
      word-break: break-word;
    }}
    .detail-list li + li {{
      margin-top: 8px;
    }}
    .foot {{
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
    }}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>三机监控面板</h1>
      <div class="subtitle">生成时间: {escape(now)} | 状态文件: {escape(str(STATUS_PATH))}</div>
      <div class="alert-box">
        <h2>高亮告警</h2>
        <ul>{render_list(alerts)}</ul>
      </div>
    </section>

    <section class="grid">
      <section class="card">
        <h2>1号机状态板</h2>
        <div class="kv-grid">{status_rows}</div>
      </section>
      <section class="card">
        <h2>1号机本地</h2>
        <ul class="detail-list">{render_list(local_lines)}</ul>
      </section>
    </section>

    <section class="grid">
      {''.join(machine_cards)}
    </section>

    <div class="foot">查看方式: 双击桌面脚本 `一键巡检三台机器.ps1`，脚本会刷新报告并打开这个面板。</div>
  </main>
</body>
</html>
"""
    return html


def main() -> int:
    if not STATUS_PATH.exists():
        print(f"Missing status file: {STATUS_PATH}", file=sys.stderr)
        return 1
    if not SENSITIVE_PATH.exists():
        print(f"Missing sensitive file: {SENSITIVE_PATH}", file=sys.stderr)
        return 1

    status = parse_status(STATUS_PATH)
    local_lines = local_gateway_status() + local_recent_files(WORKSPACE)
    agent2, agent3 = parse_sensitive_file(SENSITIVE_PATH)
    snapshots: list[MachineSnapshot] = []

    for host in (agent2, agent3):
        try:
            snapshots.append(remote_health_check(host))
        except (OSError, socket.error, paramiko.SSHException) as exc:
            snapshots.append(MachineSnapshot(label=host.label, lines=[f"connection_error={exc}"]))

    alerts = build_alerts(status, snapshots)

    print_section("alerts", alerts)
    print_section("agent1", [f"{k}={v}" for k, v in status.items()])
    print_section("agent1-local", local_lines)
    for snapshot in snapshots:
        print_section(snapshot.label, snapshot.lines)

    report = build_markdown_report(status, local_lines, snapshots, alerts)
    LATEST_REPORT_MD.write_text(report, encoding="utf-8")
    html_report = build_html_report(status, local_lines, snapshots, alerts)
    LATEST_REPORT_HTML.write_text(html_report, encoding="utf-8")
    print(f"最新报告已写入: {LATEST_REPORT_MD}")
    print(f"HTML 面板已写入: {LATEST_REPORT_HTML}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
