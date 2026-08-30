"""Точка входа CLI: подкоманды `generate` и `check`.

Workflow описаны в spec.md, разделы 4.1 и 4.2.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml

DEFAULT_CONFIG_PATH = Path("config/docs-automation.yaml")


def load_config(config_path: Path) -> dict:
    with open(config_path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def cmd_generate(args: argparse.Namespace) -> int:
    load_config(args.config)
    raise NotImplementedError(
        "generate ещё не реализован — требует scanner.scan_repo и generator.render"
    )


def cmd_check(args: argparse.Namespace) -> int:
    load_config(args.config)
    raise NotImplementedError(
        "check ещё не реализован — требует scanner.scan_repo и generator.render"
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="svo-docs")
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG_PATH,
        help="Путь к config/docs-automation.yaml",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate_parser = subparsers.add_parser("generate", help="Сгенерировать spec.md/data.md")
    generate_parser.set_defaults(func=cmd_generate)

    check_parser = subparsers.add_parser(
        "check", help="Проверить актуальность spec.md/data.md (для CI)"
    )
    check_parser.set_defaults(func=cmd_check)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
