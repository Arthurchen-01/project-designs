#!/usr/bin/env python3
"""
Sakura Anki 导出器
从 progress.md 和 diary.md 提取 Q&A 对，生成 Anki 可导入的 CSV 文件。

用法:
    python export_anki.py                                    # 导出所有卡片
    python export_anki.py --subject "AP-Calculus-BC"         # 只导出特定科目
    python export_anki.py --output my_cards.csv             # 指定输出文件
    python export_anki.py --path "C:/path/to/"              # 指定设定目录

环境变量:
    SAKURA_BASE_PATH  覆盖默认设定目录
"""

import argparse
import os
import re
import sys
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# 路径配置（跨平台支持）
# ---------------------------------------------------------------------------
DEFAULT_WINDOWS_BASE = Path(r"C:\Users\25472\Sakura - gemini版")


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


from dataclasses import dataclass

# ---------------------------------------------------------------------------
# 数据结构
# ---------------------------------------------------------------------------
@dataclass
class QACard:
    front: str
    back: str
    lesson_num: str      # "0001"
    subject: str         # "AP-Calculus-BC"
    tags: list[str]


# ---------------------------------------------------------------------------
# 解析 progress.md
# ---------------------------------------------------------------------------
# 匹配形如：## 第 0001 课：极限定义（ε-δ）
LESSON_PATTERN = re.compile(r"^#{1,3}\s*第\s*([0-9]{4})\s*课[：:]\s*(.+?)$", re.MULTILINE)
# 匹配形如：理解了极限的严格定义，做了 5 道证明题。
NOTE_PATTERN  = re.compile(r"(?:^[-*]\s*|^(?!#)).+?[。！？\n]", re.MULTILINE)


def parse_progress(content: str) -> list[dict]:
    """从 progress.md 提取每个课次的信息。"""
    lessons = []
    # 按标题分段
    blocks = re.split(r"(?=^#{1,3}\s*第)", content, flags=re.MULTILINE)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        m = LESSON_PATTERN.search(block)
        if not m:
            continue
        lesson_num = m.group(1)
        title = m.group(2).strip()
        # 去掉标题行，剩余内容作为 description
        body = LESSON_PATTERN.sub("", block).strip()
        # 清理行首的 ## 和空行
        body = re.sub(r"^#{1,3}\s*", "", body, flags=re.MULTILINE).strip()
        lessons.append({
            "lesson_num": lesson_num,
            "title": title,
            "description": body,
        })
    return lessons


# ---------------------------------------------------------------------------
# 解析 diary.md
# ---------------------------------------------------------------------------
# 匹配形如：## 第 0001 课：极限
DIARY_LESSON_PATTERN = re.compile(r"^#{1,3}\s*第\s*([0-9]{4})\s*课[：:]\s*(.+?)$", re.MULTILINE)


def parse_diary(content: str) -> list[dict]:
    """从 diary.md 提取每节课的反思记录。"""
    entries = []
    blocks = re.split(r"(?=^#{1,3}\s*第)", content, flags=re.MULTILINE)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        m = DIARY_LESSON_PATTERN.search(block)
        if not m:
            continue
        lesson_num = m.group(1)
        topic = m.group(2).strip()
        body = DIARY_LESSON_PATTERN.sub("", block).strip()
        body = re.sub(r"^#{1,3}\s*", "", body, flags=re.MULTILINE).strip()
        entries.append({
            "lesson_num": lesson_num,
            "topic": topic,
            "reflection": body,
        })
    return entries


# ---------------------------------------------------------------------------
# 生成卡片
# ---------------------------------------------------------------------------
# 用于从标题推导科目的关键词
SUBJECT_KEYWORDS = {
    "AP-Calculus-BC": ["极限", "连续", "导数", "求导", "隐函数", "积分", "微分",
                       "ε", "δ", "chain rule", "derivative", "limit", "连续性"],
    "default": ["未分类"],
}


def infer_subject(title: str, description: str) -> str:
    """从标题和描述推断科目。"""
    text = title + " " + description
    for subject, keywords in SUBJECT_KEYWORDS.items():
        if subject == "default":
            continue
        if any(kw in text for kw in keywords):
            return subject
    return "default"


def make_tags(lesson_num: str, subject: str) -> list[str]:
    return [f"lesson-{lesson_num}", subject]


def build_cards_from_progress(lessons: list[dict]) -> list[QACard]:
    """从 progress.md 的每节课生成卡片。"""
    cards = []
    for lesson in lessons:
        num  = lesson["lesson_num"]
        title = lesson["title"]
        desc = lesson["description"]
        subject = infer_subject(title, desc)
        tags = make_tags(num, subject)

        # Card 1: 概念确认卡
        # 从标题提取核心概念词
        # e.g. "极限定义（ε-δ）" → "极限的 ε-δ 定义"
        concept = re.sub(r"[（(].*?[）)]", "", title).strip()

        card1_front = f"第{num}课 | {concept} 的定义/核心思想是什么？"
        card1_back  = desc if desc else f"本课主题：{title}"
        cards.append(QACard(front=card1_front, back=card1_back,
                            lesson_num=num, subject=subject, tags=tags))

        # Card 2: 如果描述中有数字/关键词，生成理解卡
        if desc and len(desc) > 10:
            # 提取描述中第一句作为独立理解卡
            first_sent = re.split(r"[。！？\n]", desc)[0].strip()
            if first_sent and len(first_sent) > 5:
                card2_front = f"第{num}课 | 关于「{concept}」，你学到的关键点是？"
                card2_back  = first_sent
                cards.append(QACard(front=card2_front, back=card2_back,
                                    lesson_num=num, subject=subject, tags=tags))
    return cards


def build_cards_from_diary(entries: list[dict]) -> list[QACard]:
    """从 diary.md 的每条反思生成卡片。"""
    cards = []
    for entry in entries:
        num  = entry["lesson_num"]
        topic = entry["topic"]
        reflection = entry["reflection"]
        subject = infer_subject(topic, reflection)
        tags = make_tags(num, subject)

        if not reflection:
            continue

        # 从反思中提取第一句作为核心理解
        first_sent = re.split(r"[。！？\n]", reflection)[0].strip()
        if not first_sent or len(first_sent) < 5:
            first_sent = reflection[:100]

        # 苏格拉底式复习卡：角色会这样问
        card_front = f"第{num}课「{topic}」| 请用自己的话解释你学到了什么。"
        card_back  = first_sent
        cards.append(QACard(front=card_front, back=card_back,
                            lesson_num=num, subject=subject, tags=tags))

        # 第二句如果有的话，作为理解深化卡
        sentences = [s.strip() for s in re.split(r"[。！？]", reflection) if s.strip()]
        if len(sentences) >= 2:
            second_sent = sentences[1]
            if len(second_sent) > 5:
                card2_front = f"第{num}课「{topic}」| {topic} 有什么具体例子或细节？"
                card2_back  = second_sent
                cards.append(QACard(front=card2_front, back=card2_back,
                                    lesson_num=num, subject=subject, tags=tags))
    return cards


# ---------------------------------------------------------------------------
# CSV 输出
# ---------------------------------------------------------------------------
def escape_csv_field(s: str) -> str:
    """Anki CSV: fields separated by tabs, internal tabs/newlines replaced."""
    s = s.replace("\t", " ").replace("\n", " ").replace("\r", "")
    return s


def write_anki_csv(cards: list[QACard], output_path: Path):
    """写入 Anki 兼容的 TSV CSV 文件。"""
    lines = []
    for card in cards:
        tags_str = ",".join(card.tags)
        front = escape_csv_field(card.front)
        back  = escape_csv_field(card.back)
        lines.append(f"{front}\t{back}\t{tags_str}")
    output_path.write_text("\n".join(lines), encoding="utf-8")


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Sakura Anki 导出器")
    parser.add_argument(
        "--subject", "-s",
        help="只导出指定科目的卡片 (如 'AP-Calculus-BC')",
    )
    parser.add_argument(
        "--path", "-p",
        help="设定文件所在目录（覆盖默认 Windows 路径）",
    )
    parser.add_argument(
        "--output", "-o",
        help="输出文件路径（默认: anki_export.tsv）",
    )
    args = parser.parse_args()

    base = resolve_base_path(args.path)
    print(f"[INFO] 使用设定目录: {base}")

    progress_content = read_file(base, "progress.md")
    diary_content   = read_file(base, "diary.md")

    if progress_content.startswith("[警告]") and diary_content.startswith("[警告]"):
        print("[ERROR] 无法读取 progress.md 和 diary.md，退出。")
        sys.exit(1)

    # 解析
    lessons = parse_progress(progress_content)
    diary_entries = parse_diary(diary_content)
    print(f"[INFO] 从 progress.md 提取了 {len(lessons)} 节课")
    print(f"[INFO] 从 diary.md 提取了 {len(diary_entries)} 条反思")

    # 生成卡片
    cards = []
    cards += build_cards_from_progress(lessons)
    cards += build_cards_from_diary(diary_entries)

    # 科目筛选
    if args.subject:
        subject_filter = args.subject.strip()
        before = len(cards)
        cards = [c for c in cards if c.subject == subject_filter]
        print(f"[INFO] 科目筛选 '{subject_filter}': {before} → {len(cards)} 张卡片")
    else:
        print(f"[INFO] 共生成 {len(cards)} 张卡片")

    if not cards:
        print("[WARN] 没有可导出的卡片。")
        sys.exit(0)

    output_path = Path(args.output) if args.output else Path("anki_export.tsv")
    write_anki_csv(cards, output_path)
    print(f"[INFO] 已导出至: {output_path}")
    print(f"[INFO] 卡片数量: {len(cards)}")
    print(f"[INFO] Anki 导入: 文件 → 导入 → 选择 '允许在第一行显示字段名称' (如需)")


if __name__ == "__main__":
    main()
