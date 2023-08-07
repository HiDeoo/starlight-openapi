import type { AstroIntegration, AstroUserConfig } from 'astro'
import type { OpenAPI } from 'openapi-types'

import type { StarlightOpenAPIConfig } from './config'
import { stripLeadingAndTrailingSlashes } from './path'

export function createStarlightOpenAPIIntegration(config: StarlightOpenAPIConfig, schemas: OpenAPI.Document[]) {
  // FIXME(HiDeoo)
  schemas

  return function starlightOpenAPIIntegration(): AstroIntegration {
    return {
      name: 'starlight-openapi',
      hooks: {
        'astro:config:setup': ({ injectRoute, updateConfig }) => {
          for (const { base } of config) {
            injectRoute({
              entryPoint: 'starlight-openapi/api',
              pattern: `/${stripLeadingAndTrailingSlashes(base)}/[...page]`,
            })
          }

          const astroConfig: AstroUserConfig = {
            vite: {
              // TODO(HiDeoo)
              // plugins: [vitePluginStarlightBlogComponents(), vitePluginStarlightBlogConfig(config)],
            },
          }

          updateConfig(astroConfig)
        },
      },
    }
  }
}
