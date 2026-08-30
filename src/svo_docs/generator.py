"""Рендер spec.md/data.md по Jinja2-шаблонам из результата сканирования.

Контракт входа/выхода описан в spec.md, раздел 4.1, шаг 3.
"""

from __future__ import annotations

from pathlib import Path

from svo_docs.scanner import ScanResult


def render(scan_result: ScanResult, templates_dir: Path) -> dict[str, str]:
    """Рендерит spec.md и data.md на основе результата сканирования.

    Возвращает словарь {"spec.md": content, "data.md": content}.

    Заглушка: рендеринг по шаблонам ещё не реализован,
    см. spec.md, раздел "Бэклог и Roadmap".
    """
    raise NotImplementedError("render ещё не реализован — см. spec.md, Roadmap")
