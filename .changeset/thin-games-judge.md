---
'starlight-openapi': minor
---

Adds a new [`sidebar.operations.labels`](https://starlight-openapi.vercel.app/configuration/#labels) configuration option to define whether the operation sidebar labels should use the operation ID or summary.

The current behavior to use the operation summary and fall back to the operation ID if no summary is provided is preserved by default. Setting this option to `'operationId'` will always use the operation ID as the operation sidebar label.
