#!/usr/bin/env python3
"""
Sakura 一键 Prompt 生成器
自动读取 Sakura 设定文件，生成完整的系统 prompt。

用法:
    python generate_prompt.py                          # 使用默认路径
    python generate_prompt.py --teacher asuka         # 指定主讲老师
    python generate_prompt.py --path "C:/path/to/"   # 指定设定目录

环境变量:
    SAKURA_BASE_PATH  覆盖默认设定目录
"""

import argparse
import os
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# 路径配置（跨平台支持）
# ---------------------------------------------------------------------------
DEFAULT_WINDOWS_BASE = Path(r"C:\Users\25472\Sakura - gemini版")


def resolve_base_path(cli_path: str | None) -> Path:
    """Resolve the Sakura base directory, checking env var and CLI arg."""
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
    # Linux fallback: use sample files in same directory
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
    """从 diary.md 读取最近 n 条记录（以 ## 或 ### 标题分段）。"""
    content = read_file(base, filename)
    if content.startswith("[警告"):
        return content
    sections = re.split(r"(?=^#{1,3}\s)", content, flags=re.MULTILINE)
    sections = [s.strip() for s in sections if s.strip()]
    recent = sections[-n:] if len(sections) > n else sections
    return "\n\n---\n\n".join(recent)


def extract_lesson_number(progress_content: str) -> str:
    """从 progress.md 提取最新课次编号，生成下一个编号。"""
    matches = re.findall(r"第\s*([0-9]{4})\s*课", progress_content)
    if not matches:
        return "0001"
    latest = max(int(m) for m in matches)
    next_num = latest + 1
    return f"{next_num:04d}"


# ---------------------------------------------------------------------------
# Prompt 拼接
# ---------------------------------------------------------------------------
TEACHER_FILES = {
    "mikasa":   "Mikasa.md",
    "asuka":    "Asuka.md",
    "sakura":   "Sakura.md",
    "kenshin":  "Kenshin.md",
}

TEACHER_DISPLAY = {
    "mikasa":   "三笠（米卡莎）",
    "asuka":    "明日香（惣流）",
    "sakura":   "小樱",
    "kenshin":  "剑心（绯村）",
}


def build_prompt(base: Path, teacher: str) -> str:
    """按 system.md 第 9 节顺序拼接完整 prompt。"""
    system_md     = read_file(base, "system.md")
    profile_md    = read_file(base, "learner_profile.md")
    progress_md   = read_file(base, "progress.md")
    teacher_file  = TEACHER_FILES.get(teacher.lower(), "Sakura.md")
    teacher_md    = read_file(base, teacher_file)
    mid_term_md   = read_file(base, "mid_term_memory.md")
    diary_recent  = read_recent_entries(base, "diary.md", n=5)

    next_lesson = extract_lesson_number(progress_md)
    teacher_display = TEACHER_DISPLAY.get(teacher.lower(), teacher)

    # 按 system.md 第 9 节定义的顺序组装
    lines = [
        "=" * 60,
        "【系统设定 — Sakura 苏格拉底家教系统】",
        f"课次：第 {next_lesson} 课",
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


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Sakura Prompt 生成器")
    parser.add_argument(
        "--teacher", "-t",
        choices=["mikasa", "asuka", "sakura", "kenshin"],
        default=os.environ.get("SAKURA_TEACHER", "mikasa"),
        help="指定主讲老师 (默认: mikasa)",
    )
    parser.add_argument(
        "--path", "-p",
        help="设定文件所在目录（覆盖默认 Windows 路径）",
    )
    parser.add_argument(
        "--output", "-o",
        help="输出文件路径（默认: prompt_output.txt）",
    )
    args = parser.parse_args()

    base = resolve_base_path(args.path)
    print(f"[INFO] 使用设定目录: {base}")

    prompt = build_prompt(base, args.teacher)
    output_path = Path(args.output) if args.output else Path("prompt_output.txt")
    output_path.write_text(prompt, encoding="utf-8")
    print(f"[INFO] Prompt 已保存至: {output_path}")
    print(f"[INFO] 字符数: {len(prompt)}，Token (估算): ~{len(prompt)//4}")

    # 复制到剪贴板（跨平台）
    try:
        import pyperclip
        pyperclip.copy(prompt)
        print("[INFO] 已复制到剪贴板。")
    except Exception as e:
        print(f"[警告] 剪贴板复制失败（{e}），请手动复制文件内容。")


if __name__ == "__main__":
    main()
