import type { AstroIntegration } from 'astro'

import type { Schema } from './schema'
import { vitePluginStarlightOpenAPISchemas } from './vite'

export function starlightOpenAPIIntegration(schemas: Schema[]): AstroIntegration {
  const starlightOpenAPI: AstroIntegration = {
    name: 'starlight-openapi-rapidoc',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        injectRoute({
          entrypoint: 'starlight-openapi-rapidoc/route',
          pattern: `[...openAPISlug]`,
          prerender: true,
        })

        updateConfig({
          vite: {
            plugins: [vitePluginStarlightOpenAPISchemas(schemas)],
          },
        })
      },
    },
  }

  return starlightOpenAPI
}
