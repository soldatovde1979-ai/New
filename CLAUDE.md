# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is an early-stage scaffold, not a working tool yet. `src/svo_docs/scanner.py` (`scan_repo`) and `src/svo_docs/generator.py` (`render`) both raise `NotImplementedError`, and `cli.py`'s `generate`/`check` commands call into them directly — so the CLI is not functional end to end. Don't assume any of this code runs successfully; check before building on top of it.

## Commands

```bash
pip install -e .              # install package + deps (PyYAML, Jinja2) in editable mode
pip install pytest && python -m pytest tests/ -q   # run tests (pytest is not a declared dependency)
python -m pytest tests/test_cli.py::test_generate_not_implemented -q  # run a single test
svo-docs --config config/docs-automation.yaml generate   # entry point (currently raises NotImplementedError)
```

There is no lint/format tooling configured yet.

## Architecture

The project's own purpose is to eventually scan a codebase and generate `spec.md` + `data.md` documentation for it — the two files in this repo's root are both the project's own documentation *and* a template for what the tool should eventually produce for other projects. Read `spec.md` and `data.md` before making changes; they are the source of truth for intended design, and `spec.md` §5 ("Правила разработки для AI-ассистента") states explicit rules for AI-assisted changes here:

- Don't add implementation beyond what's described in `spec.md`/`data.md` without an explicit request — this is a stub, not a finished system.
- Any config or data-schema field added in code must be reflected in `data.md` in the same commit.
- Don't hard-code a specific LLM provider in `analyzer.py` (not yet created) until one is explicitly chosen — see `data.md` §3 for the provider-agnostic request/response contract that any adapter must follow.

Intended data flow once implemented (`spec.md` §4):
1. `cli.py` loads `config/docs-automation.yaml` (schema: `data.md` §1.1).
2. `scanner.scan_repo(root, config)` walks the target repo per `source.include`/`source.ignore_patterns`, returning a `ScanResult` of `ScannedFile` entries (path, role, docstrings, function signatures).
3. `generator.render(scan_result, templates_dir)` fills `templates/spec.md.j2` / `templates/data.md.j2` (Jinja2) and writes to `output.spec_path` / `output.data_path`.
4. Output hashes are recorded in a drift-cache JSON (`output.cache_path`, schema: `data.md` §2.1) so `svo-docs check` can detect docs that are stale relative to the code (for CI gating) without regenerating them.

Wherever content in `spec.md`/`data.md` is marked `⚠️ Предположение` (assumption), treat it as unconfirmed — the whole repo was scaffolded with reasonable defaults before real requirements were gathered, not derived from an existing system.
