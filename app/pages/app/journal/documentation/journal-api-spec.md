# Journal Module — API Spec (REST-first)

Updated: 2026-03-04

Base path: `/api/v1`

This API supports daily journaling with daily metrics capture, calendar views, and insights.

---

## 1. Auth

All endpoints require:
- `Authorization: Bearer <token>`

---

## 2. Entries

### GET `/journal/today`
Get (or create draft) for today in user timezone.

Response:
```json
{
  "entryDate": "2026-03-04",
  "entry": { "id": "uuid", "title": "", "content": "" },
  "metrics": []
}
```

### GET `/journal/entries/:date`
Get entry by date (`YYYY-MM-DD`).

### POST `/journal/entries`
Upsert entry (one per date).

Request:
```json
{
  "entryDate": "2026-03-04",
  "title": "A busy day",
  "content": "Today I worked on...",
  "tags": ["work", "health"]
}
```

Response: `200` entry object.

### GET `/journal/entries`
List entries.

Query params:
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `tag=work` (repeatable)
- `q=search text`

### POST `/journal/entries/:id/archive`
Archive entry (optional; usually not needed).

---

## 3. Tags

### GET `/journal/tags`
List user tags.

### POST `/journal/tags`
Create tag.

Request:
```json
{ "name": "gratitude" }
```

### DELETE `/journal/tags/:id`
Delete tag (optional; careful with entry associations).

---

## 4. Metrics Catalog

### GET `/journal/metrics`
List metric definitions.

### POST `/journal/metrics`
Create custom metric definition.

Request:
```json
{
  "key": "sleep_hours",
  "name": "Sleep (hours)",
  "type": "number",
  "unit": "hours",
  "minValue": 0,
  "maxValue": 24,
  "step": 0.5
}
```

### PATCH `/journal/metrics/:id`
Update metric definition (activate/deactivate, range, etc.)

---

## 5. Daily Metric Values

### GET `/journal/metrics/values`
List metric values in a date range.

Query params:
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `metricKey=mood` (optional)

### POST `/journal/metrics/values`
Upsert daily metric values for a date.

Request:
```json
{
  "entryDate": "2026-03-04",
  "values": [
    { "metricKey": "mood", "numberValue": 7 },
    { "metricKey": "energy", "numberValue": 6 },
    { "metricKey": "sleep_hours", "numberValue": 7.5 },
    { "metricKey": "gratitude", "textValue": "Coffee with a friend" }
  ]
}
```

Response: `200`.

---

## 6. Insights

### GET `/journal/insights`
Return summary metrics.

Query params:
- `range=7d|30d|90d|custom`
- `from`/`to` if custom

Response example:
```json
{
  "range": "30d",
  "metrics": [
    { "key": "mood", "avg": 6.8, "min": 3, "max": 9, "trend": "up" }
  ]
}
```

---

## 7. Export (optional)

### POST `/journal/export`
Export entries and metrics to CSV/JSON.

Request:
```json
{ "from": "2026-02-01", "to": "2026-03-01", "format": "csv" }
```

---

## 8. Error Model

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "numberValue must be between minValue and maxValue"
  }
}
```
