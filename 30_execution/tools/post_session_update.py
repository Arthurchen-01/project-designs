#!/usr/bin/env python3
"""
Sakura 课后自动更新脚本
解析当日 logs/YYYY-MM-DD.md，自动更新仓库中的 md 文件，并 git commit + push。

用法:
    python post_session_update.py --date 2026-03-30 --path "C:/Users/25472/Sakura - gemini版"
    python post_session_update.py --date 2026-03-30 --dry-run
    python post_session_update.py --date 2026-03-30 --no-push

环境变量:
    SAKURA_BASE_PATH  覆盖默认路径
"""

import argparse
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path

# ---------------------------------------------------------------------------
# 路径配置
# ---------------------------------------------------------------------------
DEFAULT_WINDOWS_BASE = Path(r"C:\Users\25472\Sakura - gemini版")

# 角色文件列表
ROLE_FILES = ["Mikasa.md", "Asuka.md", "Sakura.md", "Kenshin.md"]

# 科目标签关键词
SUBJECT_KEYWORDS = {
    "AP-Calculus-BC": ["极限", "连续", "导数", "求导", "隐函数", "积分",
                       "微分", "ε", "δ", "chain rule", "derivative",
                       "limit", "洛必达", "极值", "临界点"],
}


def resolve_base_path(cli_path: str | None) -> Path:
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
# 文件读写
# ---------------------------------------------------------------------------
def read_file(base: Path, filename: str, encoding: str = "utf-8") -> str:
    path = base / filename
    if not path.exists():
        return ""
    try:
        return path.read_text(encoding=encoding)
    except UnicodeDecodeError:
        return path.read_text(encoding="gbk")


def write_file(base: Path, filename: str, content: str):
    (base / filename).write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# 日志解析
# ---------------------------------------------------------------------------
@dataclass
class SessionData:
    date: str
    sections: list[str]           # 章节标题列表
    questions: list[str]          # 所有 [Qn] 内容
    answers: list[str]            # 所有 [An] 内容
    topics: list[str]             # 推断的知识点
    subject: str                  # 推断的科目
    teachers: list[str]           # 出现的老师名
    key_understanding: str        # 核心理解摘要


def parse_log(log_content: str) -> list[SessionData]:
    """
    解析 logs/YYYY-MM-DD.md，返回一个或多个 SessionData。
    每个 ## 二级标题算一个 session section。
    """
    sessions = []
    # 按 ## 标题分段
    blocks = re.split(r"(?=^#{2}\s+)", log_content, flags=re.MULTILINE)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        # 提取标题行
        title_match = re.search(r"^#{1,3}\s+(.+)$", block, re.MULTILINE)
        if not title_match:
            continue
        section_title = title_match.group(1).strip()
        body = block[len(title_match.group(0)):].strip()

        # 提取所有 Q&A 对
        qa_blocks = re.split(r"(?=\*\*\[Q\d+\]\*\*)", body)
        questions, answers = [], []
        for qa in qa_blocks:
            qm = re.search(r"\*\*\[Q(\d+)\]\*\*(.+?)(?=\*\*\[A|\Z)", qa, re.DOTALL)
            am = re.search(r"\*\*\[A\d+\]\*\*(.+?)(?=\*\*\[Q|\Z)", qa, re.DOTALL)
            if qm:
                questions.append(qm.group(2).strip())
            if am:
                answers.append(am.group(1).strip())

        # 推断科目
        full_text = section_title + " " + " ".join(questions) + " " + " ".join(answers)
        subject = "AP-Calculus-BC"
        for subj, kws in SUBJECT_KEYWORDS.items():
            if any(kw in full_text for kw in kws):
                subject = subj
                break

        # 推断知识点（从问题中提取关键词）
        topics = []
        for q in questions[:5]:
            kw = re.sub(r"^.*?[？?]|请问|什么|如何|为什么", "", q).strip()[:30]
            if kw:
                topics.append(kw)

        # 推断出现的老师
        teachers = []
        for t in ["三笠", "明日香", "小樱", "剑心"]:
            if t in section_title:
                teachers.append(t)

        # 核心理解：第一个答案的前100字
        key_understanding = answers[0][:100] if answers else ""

        sessions.append(SessionData(
            date="",
            sections=[section_title],
            questions=questions,
            answers=answers,
            topics=topics,
            subject=subject,
            teachers=teachers,
            key_understanding=key_understanding,
        ))
    return sessions


def read_date_log(base: Path, date_str: str) -> str:
    log_path = base / "logs" / f"{date_str}.md"
    if not log_path.exists():
        return ""
    try:
        return log_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return log_path.read_text(encoding="gbk")


# ---------------------------------------------------------------------------
# 提取最新课次编号
# ---------------------------------------------------------------------------
def extract_lesson_number(progress_content: str) -> str:
    matches = re.findall(r"第\s*([0-9]{4})\s*课", progress_content)
    if not matches:
        return "0001"
    return f"{max(int(m) for m in matches) + 1:04d}"


def extract_diary_count(diary_content: str) -> int:
    return len(re.findall(r"^#{1,3}\s*第\s*[0-9]{4}\s*课", diary_content, re.MULTILINE))


# ---------------------------------------------------------------------------

def _first_meaningful_session(sessions: list) -> "SessionData|None":
    """返回第一个有实际 Q&A 内容或章节标题的 session（跳过纯日期 H1 块）。"""
    if not sessions:
        return None
    for s in sessions:
        if s.questions or (s.sections and not s.sections[0].startswith(s.date)):
            return s
    return sessions[0] if sessions else None


# 更新 progress.md
# ---------------------------------------------------------------------------
def update_progress(base: Path, sessions: list[SessionData], date_str: str,
                    dry_run: bool = False) -> str:
    progress_content = read_file(base, "progress.md")
    next_num = extract_lesson_number(progress_content)
    next_num_int = int(next_num)
    new_num = f"{next_num_int:04d}"

    # 构建新课次内容
    # 取第一个 session 的核心内容作为进度条目
    session = _first_meaningful_session(sessions)
    if session:
        # 优先用提取的知识点，其次用第一个 H2 标题
        if session.topics:
            topics_str = "、".join(session.topics[:3])
        else:
            # 取第一个非日期的 section 标题作为主题
            for s in session.sections:
                if not re.match(r"^\d{4}-\d{2}-\d{2}", s):
                    topics_str = re.sub(r"^[^：：]+[：:]\s*", "", s).strip()
                    if topics_str:
                        break
            else:
                topics_str = "综合复习"
        content_line = f"## 第 {new_num} 课：{topics_str}"
        notes_line = f"- 核心理解：{session.key_understanding[:80]}"
        teacher_line = f"- 主讲老师：{', '.join(session.teachers) if session.teachers else '待补充'}"
        new_entry = f"\n\n{content_line}\n{notes_line}\n{teacher_line}"
    else:
        new_entry = f"\n\n## 第 {new_num} 课：{date_str} 学习记录\n- 日期：{date_str}"

    updated = progress_content.rstrip() + new_entry

    if not dry_run:
        write_file(base, "progress.md", updated)
        print(f"[OK] progress.md 已更新（第 {new_num} 课）")
    else:
        print(f"[DRY] progress.md 将更新为（第 {new_num} 课）")

    return new_num


# ---------------------------------------------------------------------------
# 更新 diary.md
# ---------------------------------------------------------------------------
def update_diary(base: Path, sessions: list[SessionData], date_str: str,
                 dry_run: bool = False):
    diary_content = read_file(base, "diary.md")

    session = _first_meaningful_session(sessions)
    if session:
        # 取第一个非日期的 H2/H3 标题（忽略顶部的日期 H1）
        section_title = "综合学习"
        for s in session.sections:
            if not re.match(r"^\d{4}-\d{2}-\d{2}", s):
                section_title = re.sub(r"^[^：：]+[：:]\s*", "", s).strip()
                if section_title:
                    break
        lines = [
            f"## 第 {date_str}：{section_title}",
        ]
        for i, (q, a) in enumerate(zip(session.questions[:4], session.answers[:4]), 1):
            # 截断 Q&A 展示
            q_short = q[:60].replace("\n", " ")
            a_short = a[:80].replace("\n", " ")
            lines.append(f"\n**[Q{i}]** {q_short}\n\n**[A{i}]** {a_short}")

        if session.key_understanding:
            lines.append(f"\n> 核心收获：{session.key_understanding[:100]}")

        new_entry = "\n\n".join(lines)
    else:
        new_entry = f"\n\n## 第 {date_str}\n当日学习记录（详见 logs/{date_str}.md）"

    updated = diary_content.rstrip() + "\n\n" + new_entry

    if not dry_run:
        write_file(base, "diary.md", updated)
        print(f"[OK] diary.md 已更新")
    else:
        print(f"[DRY] diary.md 将追加新条目")


# ---------------------------------------------------------------------------
# 更新中期记忆
# ---------------------------------------------------------------------------
def update_mid_term_memory(base: Path, sessions: list[SessionData],
                           dry_run: bool = False):
    content = read_file(base, "mid_term_memory.md")

    session = _first_meaningful_session(sessions)
    if not session or not session.topics:
        print("[SKIP] mid_term_memory.md 无需更新")
        return

    # 追加新的知识点条目
    new_topics = session.topics[:3]
    new_entry_lines = [
        "",
        f"## {session.subject} — 最新学习",
    ]
    for t in new_topics:
        new_entry_lines.append(f"- {t}")

    if session.key_understanding:
        new_entry_lines.append(f"- 核心理解：{session.key_understanding[:80]}")

    updated = content.rstrip() + "\n".join(new_entry_lines)

    if not dry_run:
        write_file(base, "mid_term_memory.md", updated)
        print(f"[OK] mid_term_memory.md 已更新")
    else:
        print(f"[DRY] mid_term_memory.md 将追加 {len(new_topics)} 条知识点")


# ---------------------------------------------------------------------------
# 更新 session_archive.md
# ---------------------------------------------------------------------------
def update_session_archive(base: Path, date_str: str, sessions: list[SessionData],
                           dry_run: bool = False):
    import json as _json

    # 读取现有 archive
    archive_path = base / "session_archive.md"
    if archive_path.exists():
        archive_content = archive_path.read_text(encoding="utf-8")
    else:
        archive_content = "# 会话归档记录\n\n<!-- 格式: YYYY-MM-DD | 课次 | 知识点 | 老师 -->"

    session = _first_meaningful_session(sessions)
    if session and session.topics:
        topics_str = "、".join(session.topics[:3])
    elif session:
        for s in session.sections:
            if not re.match(r"^\d{4}-\d{2}-\d{2}", s):
                topics_str = re.sub(r"^[^：：]+[：:]\s*", "", s).strip()[:20]
                if topics_str:
                    break
        else:
            topics_str = "综合"
    else:
        topics_str = "综合"
    teachers_str = "、".join(session.teachers) if (session and session.teachers) else ""

    new_row = f"\n| {date_str} | | {topics_str} | {teachers_str} |"

    updated = archive_content.rstrip() + new_row

    if not dry_run:
        write_file(base, "session_archive.md", updated)
        print(f"[OK] session_archive.md 已更新")
    else:
        print(f"[DRY] session_archive.md 将追加一行")


# ---------------------------------------------------------------------------
# 更新角色文件（关系变化检测）
# ---------------------------------------------------------------------------
def update_role_files(base: Path, sessions: list[SessionData], date_str: str,
                      dry_run: bool = False):
    session = _first_meaningful_session(sessions)
    if not session or not session.teachers:
        return

    # 检测互动的情感信号词
    ALL_TEXT = " ".join(session.questions + session.answers)
    signals = {
        "正面": ["谢谢", "清楚", "懂了", "明白", "有帮助", "太棒了", "喜欢"],
        "中性": ["继续", "下一个", "下一题"],
        "需关注": ["困惑", "不太懂", "有点难", "搞不清"],
    }

    sentiment = "中性"
    for neg_word in signals["需关注"]:
        if neg_word in ALL_TEXT:
            sentiment = "需关注"
            break
    else:
        for pos_word in signals["正面"]:
            if pos_word in ALL_TEXT:
                sentiment = "正面"
                break

    for teacher_name, role_file in [("三笠", "Mikasa.md"), ("明日香", "Asuka.md"),
                                     ("小樱", "Sakura.md"), ("剑心", "Kenshin.md")]:
        if teacher_name in session.teachers:
            role_content = read_file(base, role_file)
            # 检查是否已有关系记录段落
            RELATION_SECTION = "## 互动关系记录"
            if RELATION_SECTION not in role_content:
                new_section = f"\n\n{RELATION_SECTION}\n\n- **{date_str}** — {sentiment}"
            else:
                new_section = f"\n- **{date_str}** — {sentiment}"
                # 找到位置插入（放在关系记录段落末尾）
                idx = role_content.find(RELATION_SECTION)
                insert_pos = role_content.rfind("\n", idx + len(RELATION_SECTION))
                if insert_pos == -1:
                    insert_pos = idx + len(RELATION_SECTION)
                role_content = role_content[:insert_pos] + new_section + role_content[insert_pos:]

            if not dry_run:
                write_file(base, role_file, role_content)
                print(f"[OK] {role_file} 已更新（{teacher_name}）")
            else:
                print(f"[DRY] {role_file} 将追加关系记录")


# ---------------------------------------------------------------------------
# Git 操作
# ---------------------------------------------------------------------------
def git_commit_and_push(base: Path, date_str: str, dry_run: bool = False,
                        no_push: bool = False):
    try:
        if dry_run:
            print(f"[DRY] git add -A && git commit -m 'post-session update {date_str}'")
            return True

        result = subprocess.run(
            ["git", "add", "-A"],
            cwd=base, capture_output=True, text=True, timeout=30
        )
        if result.returncode != 0:
            print(f"[WARN] git add 失败: {result.stderr}")
            return False

        commit_msg = f"post-session update {date_str}"
        result = subprocess.run(
            ["git", "commit", "-m", commit_msg],
            cwd=base, capture_output=True, text=True, timeout=30
        )
        if result.returncode != 0:
            print(f"[WARN] git commit 失败: {result.stderr}")
            return False
        print(f"[OK] git commit: {commit_msg}")

        if not no_push:
            result = subprocess.run(
                ["git", "push"],
                cwd=base, capture_output=True, text=True, timeout=30
            )
            if result.returncode != 0:
                print(f"[WARN] git push 失败: {result.stderr}（网络问题，稍后重试）")
                return False
            print("[OK] git push 完成")
        else:
            print("[INFO] --no-push，跳过 push")

        return True
    except FileNotFoundError:
        print("[WARN] 未找到 git，跳过版本控制操作")
        return False
    except Exception as e:
        print(f"[WARN] Git 操作异常: {e}")
        return False


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Sakura 课后自动更新脚本")
    parser.add_argument(
        "--date", "-d",
        required=True,
        help="会话日期（格式: YYYY-MM-DD）",
    )
    parser.add_argument(
        "--path", "-p",
        help="设定文件目录（覆盖默认 Windows 路径）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="仅显示将做的更改，不实际写入文件",
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="执行 git commit 但不 push",
    )
    args = parser.parse_args()

    # 验证日期格式
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", args.date):
        sys.exit("[错误] 日期格式需为 YYYY-MM-DD")

    base = resolve_base_path(args.path)
    print(f"[INFO] 使用目录: {base}")
    print(f"[INFO] 日期: {args.date}")
    if args.dry_run:
        print("[MODE] Dry-run 模式（不实际写入）")
    print("---")

    # 读取日志
    log_content = read_date_log(base, args.date)
    if not log_content:
        sys.exit(f"[错误] 未找到日志文件: logs/{args.date}.md")

    # 解析日志
    sessions = parse_log(log_content)
    if not sessions:
        sys.exit("[错误] 日志中未找到有效章节，请检查 logs/*.md 格式（使用 ## 标题 + **[Qn]**/**[An]** 格式）")

    print(f"[INFO] 解析到 {len(sessions)} 个学习章节")

    # 执行各项更新
    new_lesson = update_progress(base, sessions, args.date, dry_run=args.dry_run)
    update_diary(base, sessions, args.date, dry_run=args.dry_run)
    update_mid_term_memory(base, sessions, dry_run=args.dry_run)
    update_session_archive(base, args.date, sessions, dry_run=args.dry_run)
    update_role_files(base, sessions, args.date, dry_run=args.dry_run)

    print("---")

    # Git 操作
    git_ok = git_commit_and_push(
        base, args.date,
        dry_run=args.dry_run, no_push=args.no_push
    )

    print("---")
    if args.dry_run:
        print(f"[DONE] Dry-run 完成（无文件被修改）")
    else:
        print(f"[DONE] 课后更新完成！新课次：第 {new_lesson} 课")


if __name__ == "__main__":
    main()
