"""Базовые тесты CLI (заглушка)."""

import pytest

from svo_docs.cli import build_parser


def test_parser_requires_subcommand():
    parser = build_parser()
    with pytest.raises(SystemExit):
        parser.parse_args([])


def test_generate_not_implemented(tmp_path):
    config_path = tmp_path / "docs-automation.yaml"
    config_path.write_text(
        "source:\n  root: '.'\n  include: []\noutput:\n  spec_path: spec.md\n"
        "  data_path: data.md\n  cache_path: .svo-docs-cache.json\nllm:\n"
        "  enabled: false\n  provider: null\n  model: null\n"
    )
    parser = build_parser()
    args = parser.parse_args(["--config", str(config_path), "generate"])
    with pytest.raises(NotImplementedError):
        args.func(args)
