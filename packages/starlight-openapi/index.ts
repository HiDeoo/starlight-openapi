import { validateConfig, type StarlightOpenAPIConfig } from './libs/config'
import { createStarlightOpenAPIIntegration } from './libs/integration'
import { parseSchema } from './libs/openapi'

export async function generateAPI(userConfig: StarlightOpenAPIConfig) {
  const config = validateConfig(userConfig)
  const schemas = await Promise.all(config.map(({ schema }) => parseSchema(schema)))

  return {
    starlightOpenAPI: createStarlightOpenAPIIntegration(config, schemas),
  }
}
