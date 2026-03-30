#!/usr/bin/env python3
"""
Sakura Prompt 生成器（升级版）
支持 morning/review 两种模式，以及 GitHub raw link 模式。

用法:
    python generate_prompt.py --mode morning --path /sakura
    python generate_prompt.py --mode review --date 2026-03-30 --path /sakura
    python generate_prompt.py --link --repo-url https://github.com/...
    python generate_prompt.py --teacher asuka  # 搭配 morning/review 使用

环境变量:
    SAKURA_BASE_PATH   设定文件所在目录
    SAKURA_TEACHER    默认主讲老师
"""

import argparse
import os
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# 路径配置
# ---------------------------------------------------------------------------
DEFAULT_WINDOWS_BASE = Path(r"C:\Users\25472\Sakura - gemini版")
VALID_MODES = {"morning", "review", "link"}
VALID_TEACHERS = {"mikasa", "asuka", "sakura", "kenshin"}


def resolve_base_path(cli_path: str | None) -> Path:
    """Resolve the Sakura base directory."""
    if cli_path:
        p = Path(cli_path)
        if not p.exists():
            raise FileNotFoundError(f"指定的路径不存在: {p}")
        return p.resolve()
    env_path = os.environ.get("SAKURA_BASE_PATH")
    if env_path:
        p = Path(env_path)
        if p.exists():
            return p.resolve()
    script_dir = Path(__file__).parent.resolve()
    sample_dir = script_dir / "sample_files"
    if sample_dir.exists():
        return sample_dir
    raise FileNotFoundError(
        "未找到设定目录。请通过 --path 参数、环境变量 SAKURA_BASE_PATH "
        "或确保 sample_files/ 目录存在。"
    )


# ---------------------------------------------------------------------------
# 文件读取
# ---------------------------------------------------------------------------
def read_file(base: Path, filename: str, encoding: str = "utf-8") -> str:
    path = base / filename
    if not path.exists():
        return f"[警告: 文件不存在 {filename}]"
    try:
        return path.read_text(encoding=encoding)
    except UnicodeDecodeError:
        return path.read_text(encoding="gbk")


def read_recent_entries(base: Path, filename: str, n: int = 5) -> str:
    """从 diary.md 读取最近 n 条记录（以 ## / ### 标题分段）。"""
    content = read_file(base, filename)
    if content.startswith("[警告"):
        return content
    sections = re.split(r"(?=^#{1,3}\s)", content, flags=re.MULTILINE)
    sections = [s.strip() for s in sections if s.strip()]
    recent = sections[-n:] if len(sections) > n else sections
    return "\n\n---\n\n".join(recent)


def read_date_log(base: Path, date: str) -> str:
    """读取指定日期的 log 文件（logs/YYYY-MM-DD.md）。"""
    log_path = base / "logs" / f"{date}.md"
    if not log_path.exists():
        return f"[警告: 未找到日志文件 logs/{date}.md]"
    try:
        return log_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return log_path.read_text(encoding="gbk")


def extract_lesson_number(progress_content: str) -> str:
    """从 progress.md 提取最新课次编号，生成下一个编号。"""
    matches = re.findall(r"第\s*([0-9]{4})\s*课", progress_content)
    if not matches:
        return "0001"
    latest = max(int(m) for m in matches)
    return f"{latest + 1:04d}"


# ---------------------------------------------------------------------------
# Prompt 拼接
# ---------------------------------------------------------------------------
TEACHER_FILES = {
    "mikasa":  "Mikasa.md",
    "asuka":   "Asuka.md",
    "sakura":  "Sakura.md",
    "kenshin": "Kenshin.md",
}
TEACHER_DISPLAY = {
    "mikasa":  "三笠（米卡莎）",
    "asuka":   "明日香（惣流）",
    "sakura":  "小樱",
    "kenshin": "剑心（绯村）",
}


def build_morning_prompt(base: Path, teacher: str) -> str:
    """Morning 模式：完整 prompt — 包含所有设定、进度、记忆、日记。"""
    system_md    = read_file(base, "system.md")
    profile_md   = read_file(base, "learner_profile.md")
    progress_md  = read_file(base, "progress.md")
    teacher_file = TEACHER_FILES.get(teacher.lower(), "Sakura.md")
    teacher_md   = read_file(base, teacher_file)
    mid_term_md  = read_file(base, "mid_term_memory.md")
    diary_recent = read_recent_entries(base, "diary.md", n=5)

    next_lesson    = extract_lesson_number(progress_md)
    teacher_display = TEACHER_DISPLAY.get(teacher.lower(), teacher)

    lines = [
        "=" * 60,
        "【系统设定 — Sakura 苏格拉底家教系统】",
        f"课次：第 {next_lesson} 课  [模式: morning]",
        "=" * 60,
        "",
        "【一、角色定义 — 系统核心】",
        system_md,
        "",
        "【二、学习者档案】",
        profile_md,
        "",
        "【三、学习进度】",
        progress_md,
        "",
        "【四、主讲老师】",
        f"本次主讲：{teacher_display}",
        teacher_md,
        "",
        "【五、中期记忆】",
        mid_term_md,
        "",
        "【六、最近学习记录（最近 5 课）】",
        diary_recent,
        "",
        "=" * 60,
        "【启动指令】",
        "请以上述设定开始本次家教会话。",
        "=" * 60,
    ]
    return "\n".join(lines)


def build_review_prompt(base: Path, teacher: str, date: str) -> str:
    """Review 模式：精简 prompt — 仅角色设定 + 指定日期记录。"""
    teacher_file = TEACHER_FILES.get(teacher.lower(), "Sakura.md")
    teacher_md   = read_file(base, teacher_file)
    log_content  = read_date_log(base, date)

    teacher_display = TEACHER_DISPLAY.get(teacher.lower(), teacher)

    lines = [
        "=" * 60,
        "【复习模式 — Sakura 苏格拉底家教系统】",
        f"复习日期：{date}  [模式: review]",
        "=" * 60,
        "",
        "【角色设定】",
        f"本次复习老师：{teacher_display}",
        teacher_md,
        "",
        "【当日学习记录】",
        log_content,
        "",
        "=" * 60,
        "【复习指令】",
        "请根据以上记录，用苏格拉底式提问帮助我复习今天学过的内容。",
        "先从第一道题开始，引导我回忆答案，而不是直接告诉我答案。",
        "=" * 60,
    ]
    return "\n".join(lines)


def build_link_output(base: Path, repo_url: str) -> str:
    """Link 模式：生成 GitHub raw 文件链接列表。"""
    files = [
        "system.md",
        "learner_profile.md",
        "progress.md",
        "mid_term_memory.md",
        "diary.md",
    ] + list(TEACHER_FILES.values())

    # Remove duplicates while preserving order
    seen = set()
    unique_files = []
    for f in files:
        if f not in seen:
            seen.add(f)
            unique_files.append(f)

    # Normalize repo URL to raw base
    raw_base = repo_url.rstrip("/").replace("github.com", "raw.githubusercontent.com") + "/main"

    lines = [
        "=" * 60,
        "【Sakura 设定文件 Raw Link 列表】",
        "复制以下链接到浏览器或脚本中加载设定文件：",
        "=" * 60,
        "",
    ]
    for fname in unique_files:
        link = f"{raw_base}/{fname}"
        lines.append(f"[{fname}]  {link}")

    lines += [
        "",
        "使用方式：浏览器打开每个链接，复制内容后粘贴到 AI 侧边栏。",
        "=" * 60,
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Sakura Prompt 生成器（morning / review / link 模式）"
    )
    parser.add_argument(
        "--mode", "-m",
        choices=VALID_MODES,
        default=os.environ.get("SAKURA_MODE", "morning"),
        help="模式：morning=完整设定，review=精简复习，link=raw链接（默认: morning）",
    )
    parser.add_argument(
        "--teacher", "-t",
        choices=list(VALID_TEACHERS),
        default=os.environ.get("SAKURA_TEACHER", "mikasa"),
        help="指定主讲老师 (默认: mikasa)",
    )
    parser.add_argument(
        "--date",
        help="日期（review 模式必需，格式: YYYY-MM-DD）",
    )
    parser.add_argument(
        "--path", "-p",
        help="设定文件所在目录（覆盖默认 Windows 路径）",
    )
    parser.add_argument(
        "--repo-url",
        help="GitHub 仓库 URL（link 模式必需）",
    )
    parser.add_argument(
        "--output", "-o",
        help="输出文件路径（默认: prompt_output.txt）",
    )
    args = parser.parse_args()

    # 模式校验
    if args.mode == "review" and not args.date:
        sys.exit("[错误] review 模式必须指定 --date YYYY-MM-DD")
    if args.mode == "link" and not args.repo_url:
        sys.exit("[错误] link 模式必须指定 --repo-url https://github.com/...")

    # 构建 prompt
    if args.mode == "link":
        output_text = build_link_output(
            resolve_base_path(args.path), args.repo_url
        )
    elif args.mode == "review":
        base = resolve_base_path(args.path)
        print(f"[INFO] 使用设定目录: {base}")
        output_text = build_review_prompt(base, args.teacher, args.date)
    else:
        # morning (default)
        base = resolve_base_path(args.path)
        print(f"[INFO] 使用设定目录: {base}")
        output_text = build_morning_prompt(base, args.teacher)

    # 输出
    output_path = Path(args.output) if args.output else Path("prompt_output.txt")
    output_path.write_text(output_text, encoding="utf-8")
    print(f"[INFO] 已保存至: {output_path}")
    print(f"[INFO] 字符数: {len(output_text)}，Token (估算): ~{len(output_text)//4}")

    # 剪贴板（仅非 link 模式）
    if args.mode != "link":
        try:
            import pyperclip
            pyperclip.copy(output_text)
            print("[INFO] 已复制到剪贴板。")
        except Exception as e:
            print(f"[警告] 剪贴板复制失败（{e}），请手动复制文件内容。")


if __name__ == "__main__":
    main()
