---
"starlight-openapi": minor
---

Fixes a potential issue where some heading levels in operation pages could be skipped.

⚠️ **Potentially breaking change:** The heading level of examples and callback response headers now depends on where they are rendered. If you use custom CSS targeting these headings by their element, e.g. `h5`, you may need to update it.
