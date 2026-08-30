# SVO Docs Automation — data.md

> ⚠️ Предположение: схемы ниже — стартовый дефолт для нового проекта (репозиторий был пустым), а не описание уже работающей системы. Форматы полей, значения по умолчанию и контракт LLM подлежат уточнению.

## 1. Файлы конфигурации

### 1.1 `config/docs-automation.yaml`

Формат: YAML.

```yaml
# config/docs-automation.yaml
source:
  root: "."                     # корень репозитория, который сканируется
  include:                      # какие пути включать в сканирование
    - "src/**/*.py"
  ignore_patterns:               # какие пути исключать
    - "**/__pycache__/**"
    - "**/.git/**"
    - "**/tests/**"

output:
  spec_path: "spec.md"          # куда писать сгенерированный обзор системы
  data_path: "data.md"          # куда писать сгенерированную схему данных
  cache_path: ".svo-docs-cache.json"  # кэш хэшей для команды `check`

llm:
  enabled: false                # включить LLM-суммаризацию сложных workflow
  provider: null                # не выбран, см. раздел 3 "Контракт LLM"
  model: null
```

| Ключ | Тип | Обязателен | Описание |
|---|---|---|---|
| `source.root` | string | да | Корень репозитория относительно места запуска CLI |
| `source.include` | list[string] | да | Glob-паттерны файлов, которые сканер должен обработать |
| `source.ignore_patterns` | list[string] | нет | Glob-паттерны, исключаемые из сканирования |
| `output.spec_path` | string | да | Путь для записи сгенерированного `spec.md` |
| `output.data_path` | string | да | Путь для записи сгенерированного `data.md` |
| `output.cache_path` | string | да | Путь к JSON-кэшу хэшей для команды `check` |
| `llm.enabled` | boolean | да | Включает LLM-суммаризацию (см. раздел 3) |
| `llm.provider` | string \| null | нет | Имя LLM-провайдера; `null`, пока провайдер не выбран |
| `llm.model` | string \| null | нет | Идентификатор модели у выбранного провайдера |

#### Lifecycle (жизненный цикл полей)

- `llm.provider` и `llm.model` остаются `null`, пока `llm.enabled: false`. Значение появляется только после того, как провайдер выбран и добавлен адаптер в `analyzer.py` — до этого момента поля не участвуют в выполнении.
- `output.cache_path` создаётся автоматически при первом запуске `svo-docs generate`, если файла ещё нет.

## 2. Схема персистентных данных

### 2.1 `.svo-docs-cache.json` — кэш хэшей для команды `check`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["generated_at", "files"],
  "properties": {
    "generated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Момент последней генерации документации (ISO 8601)"
    },
    "files": {
      "type": "object",
      "description": "Карта путь_файла -> хэш содержимого на момент последней генерации",
      "additionalProperties": {
        "type": "string",
        "description": "SHA-256 хэш содержимого сгенерированного файла"
      }
    }
  }
}
```

| Поле | Тип | Обязательно | Описание |
|---|---|---|---|
| `generated_at` | string (date-time) | да | Время последнего успешного `generate` |
| `files` | object | да | Мапа `{путь: sha256}` для `spec.md` и `data.md` на момент генерации |

## 3. Контракт LLM (опциональная суммаризация)

> ⚠️ Предположение: этот контракт зафиксирован как заготовка — конкретный провайдер не выбран (`llm.provider: null` в конфиге). Реализация адаптера должна следовать этому контракту независимо от выбранного провайдера.

**Вход (запрос к LLM):**

Плейсхолдеры, подставляемые в промпт при суммаризации одного workflow:

| Плейсхолдер | Источник | Описание |
|---|---|---|
| `{file_path}` | scanner | Путь к файлу с кодом workflow |
| `{function_signatures}` | scanner (AST) | Список сигнатур функций, входящих в workflow |
| `{docstrings}` | scanner (AST) | Извлечённые докстринги этих функций |

**Ожидаемый ответ от LLM (контракт ответа):**

```json
{
  "type": "object",
  "required": ["summary", "steps"],
  "properties": {
    "summary": {
      "type": "string",
      "description": "Краткое описание workflow в 1-2 предложения"
    },
    "steps": {
      "type": "array",
      "description": "Пошаговое описание workflow для вставки в spec.md, раздел 4",
      "items": {
        "type": "string"
      }
    }
  }
}
```

Если ответ LLM не соответствует этой схеме — `analyzer.py` обязан откатиться на данные, извлечённые сканером напрямую (без LLM-суммаризации), а не завершать генерацию с ошибкой.
