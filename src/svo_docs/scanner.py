"""Обход файлового дерева проекта и извлечение метаданных из кода.

Контракт входа/выхода описан в spec.md, раздел 4.1, шаг 2.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class ScannedFile:
    path: Path
    role: str = ""
    docstrings: list[str] = field(default_factory=list)
    function_signatures: list[str] = field(default_factory=list)


@dataclass
class ScanResult:
    files: list[ScannedFile] = field(default_factory=list)


def scan_repo(root: Path, config: dict) -> ScanResult:
    """Сканирует репозиторий согласно `source.include`/`source.ignore_patterns` из конфига.

    Заглушка: логика обхода дерева и извлечения AST-метаданных ещё не реализована,
    см. spec.md, раздел "Бэклог и Roadmap".
    """
    raise NotImplementedError("scan_repo ещё не реализован — см. spec.md, Roadmap")
