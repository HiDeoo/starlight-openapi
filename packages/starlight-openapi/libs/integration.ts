import type { AstroIntegration, AstroUserConfig } from 'astro'

import type { Schema } from './schema'
import { vitePluginStarlightOpenAPISchemas } from './vite'

export function createStarlightOpenAPIIntegration(schemas: Schema[]) {
  return function starlightOpenAPIIntegration(): AstroIntegration {
    const starlightOpenAPI: AstroIntegration = {
      name: 'starlight-openapi',
      hooks: {
        'astro:config:setup': ({ injectRoute, updateConfig }) => {
          injectRoute({
            entryPoint: 'starlight-openapi/route',
            pattern: `[...openAPISlug]`,
          })

          const astroConfig: AstroUserConfig = {
            vite: {
              plugins: [vitePluginStarlightOpenAPISchemas(schemas)],
            },
          }

          updateConfig(astroConfig)
        },
      },
    }

    return starlightOpenAPI
  }
}
