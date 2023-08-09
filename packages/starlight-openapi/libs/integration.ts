import type { AstroIntegration, AstroUserConfig } from 'astro'

import type { Schema } from './schema'
import { vitePluginStarlightOpenAPIComponents, vitePluginStarlightOpenAPISchemas } from './vite'

export function createStarlightOpenAPIIntegration(schemas: Schema[]) {
  return function starlightOpenAPIIntegration(): AstroIntegration {
    return {
      name: 'starlight-openapi',
      hooks: {
        'astro:config:setup': ({ injectRoute, updateConfig }) => {
          injectRoute({
            entryPoint: 'starlight-openapi/route',
            pattern: `[...openAPISlug]`,
          })

          const astroConfig: AstroUserConfig = {
            vite: {
              plugins: [vitePluginStarlightOpenAPIComponents(), vitePluginStarlightOpenAPISchemas(schemas)],
            },
          }

          updateConfig(astroConfig)
        },
      },
    }
  }
}
