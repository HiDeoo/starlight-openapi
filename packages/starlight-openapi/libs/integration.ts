import type { AstroIntegration } from 'astro'

import type { Schema } from './schema'
import { vitePluginStarlightOpenAPI } from './vite'

export function starlightOpenAPIIntegration(schemas: Schema[]): AstroIntegration {
  const starlightOpenAPI: AstroIntegration = {
    name: 'starlight-openapi',
    hooks: {
      'astro:config:setup': ({ config, injectRoute, updateConfig }) => {
        injectRoute({
          entrypoint: 'starlight-openapi/route',
          pattern: `[...openAPISlug]`,
          prerender: true,
        })

        updateConfig({
          vite: {
            plugins: [vitePluginStarlightOpenAPI(schemas, { trailingSlash: config.trailingSlash })],
          },
        })
      },
    },
  }

  return starlightOpenAPI
}
