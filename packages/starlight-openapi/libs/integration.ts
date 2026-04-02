import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegration } from 'astro'

import { getSchemaBasePath, stripLeadingAndTrailingSlashes } from './path'
import type { Schema } from './schema'
import { vitePluginStarlightOpenAPI } from './vite'

export function starlightOpenAPIIntegration(
  starlightConfig: Pick<StarlightUserConfig, 'pagination' | 'prerender'>,
  schemas: Schema[],
): AstroIntegration {
  const starlightOpenAPI: AstroIntegration = {
    name: 'starlight-openapi',
    hooks: {
      'astro:config:setup': ({ config, injectRoute, updateConfig }) => {
        const prerender = starlightConfig.prerender ?? true

        if (prerender) {
          injectRoute({
            entrypoint: 'starlight-openapi/routes/static',
            pattern: `[...openAPISlug]`,
            prerender: true,
          })
        } else {
          for (const schema of schemas) {
            injectRoute({
              entrypoint: 'starlight-openapi/routes/ssr',
              pattern: `${stripLeadingAndTrailingSlashes(getSchemaBasePath(schema.config))}/[...openAPISlug]`,
              prerender: false,
            })
          }
        }

        updateConfig({
          vite: {
            plugins: [
              vitePluginStarlightOpenAPI(schemas, {
                pagination: starlightConfig.pagination ?? true,
                trailingSlash: config.trailingSlash,
                build: { format: config.build.format },
              }),
            ],
          },
        })
      },
    },
  }

  return starlightOpenAPI
}
