import { validateConfig, type StarlightOpenAPIConfig } from './libs/config'
import { createStarlightOpenAPIIntegration } from './libs/integration'
import { parseSchema } from './libs/parser'
import { getSchemaSidebarGroups } from './libs/schema'

export async function generateAPI(userConfig: StarlightOpenAPIConfig) {
  const config = validateConfig(userConfig)
  const schemas = await Promise.all(config.map(parseSchema))

  return {
    openAPISidebarGroups: schemas.map((schema) => getSchemaSidebarGroups(schema)),
    starlightOpenAPI: createStarlightOpenAPIIntegration(schemas),
  }
}
