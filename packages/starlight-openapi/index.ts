import type { StarlightPlugin } from '@astrojs/starlight/types'

import { validateConfig, type StarlightOpenAPIUserConfig } from './libs/config'
import { starlightOpenAPIIntegration } from './libs/integration'
import { parseSchema } from './libs/parser'
import { getSidebarGroupsPlaceholder } from './libs/starlight'

export const openAPISidebarGroups = getSidebarGroupsPlaceholder()

export default function starlightOpenAPIPlugin(userConfig: StarlightOpenAPIUserConfig): StarlightPlugin {
  return {
    name: 'starlight-openapi-plugin',
    hooks: {
      'config:setup': async ({
        addIntegration,
        addRouteMiddleware,
        command,
        config: starlightConfig,
        logger,
        updateConfig,
      }) => {
        if (command !== 'build' && command !== 'dev') {
          return
        }

        const config = validateConfig(logger, userConfig)
        const schemas = await Promise.all(config.map((schemaConfig) => parseSchema(logger, schemaConfig)))

        addRouteMiddleware({ entrypoint: 'starlight-openapi/middleware', order: 'post' })
        addIntegration(starlightOpenAPIIntegration(schemas))

        const updatedConfig: Parameters<typeof updateConfig>[0] = {
          customCss: [...(starlightConfig.customCss ?? []), 'starlight-openapi/styles'],
        }

        if (updatedConfig.expressiveCode !== false) {
          updatedConfig.expressiveCode =
            updatedConfig.expressiveCode === true || updatedConfig.expressiveCode === undefined
              ? {}
              : updatedConfig.expressiveCode
          updatedConfig.expressiveCode.removeUnusedThemes = false
        }

        updateConfig(updatedConfig)
      },
    },
  }
}
