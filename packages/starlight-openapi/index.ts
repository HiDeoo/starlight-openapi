import { validateConfig, type StarlightOpenAPIConfig } from './libs/config'
import { createStarlightOpenAPIIntegration } from './libs/integration'
import { parseSchema } from './libs/parser'
import type { Schemas } from './libs/schema'

export async function generateAPI(userConfig: StarlightOpenAPIConfig) {
  const config = validateConfig(userConfig)
  const schemas: Schemas = {}

  for (const schema of config) {
    schemas[schema.base] = await parseSchema(schema)
  }

  return {
    starlightOpenAPI: createStarlightOpenAPIIntegration(schemas),
  }
}
