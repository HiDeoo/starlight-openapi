---
'starlight-openapi': minor
---

Deprecates the sidebar `label`, `collapsed`, and `sidebarMethodBadges` options in favor of a new [`sidebar`](https://starlight-openapi.vercel.app/configuration/#sidebar) option object.

The previous options are still supported for backward compatibility, but they will be removed in a future release.

```diff
starlightOpenAPI([
  {
    base: 'api',
    schema: '../schemas/api-schema.yaml',
-   label: 'My API',
-   collapsed: false,
-   sidebarMethodBadges: true,
+   sidebar: {
+     label: 'My API',
+     collapsed: false,
+     operations: { badges: true },
+   },
  },
])
```
