import type { AstroIntegration, AstroUserConfig } from 'astro'

import type { Schemas } from './schema'
import { vitePluginStarlightOpenAPIComponents, vitePluginStarlightOpenAPISchemas } from './vite'

export function createStarlightOpenAPIIntegration(schemas: Schemas) {
  return function starlightOpenAPIIntegration(): AstroIntegration {
    return {
      name: 'starlight-openapi',
      hooks: {
        'astro:config:setup': ({ injectRoute, updateConfig }) => {
          injectRoute({
            entryPoint: 'starlight-openapi/api',
            pattern: `/[base]/[...slug]`,
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
