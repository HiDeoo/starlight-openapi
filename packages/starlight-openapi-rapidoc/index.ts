import type { StarlightPlugin } from '@astrojs/starlight/types'

import { validateConfig, type StarlightOpenAPIUserConfig } from './libs/config'
import { starlightOpenAPIIntegration } from './libs/integration'
import { parseSchema } from './libs/parser'
import { getSidebarFromSchemas, getSidebarGroupsPlaceholder } from './libs/starlight'

export const openAPISidebarGroups = getSidebarGroupsPlaceholder()

export default function starlightOpenAPIPlugin(userConfig: StarlightOpenAPIUserConfig): StarlightPlugin {
  return {
    name: 'starlight-openapi-rapidoc-plugin',
    hooks: {
      setup: async ({ addIntegration, command, config: starlightConfig = {}, logger, updateConfig }) => {
        if (command !== 'build' && command !== 'dev') {
          return
        }

        const config = validateConfig(logger, userConfig)
        const schemas = await Promise.all(config.map((schemaConfig) => parseSchema(logger, schemaConfig)))

        addIntegration(starlightOpenAPIIntegration(schemas))

        const sidebar = getSidebarFromSchemas(starlightConfig.sidebar, schemas)

        updateConfig({ sidebar })
      },
    },
  }
}
