import { validateConfig, type StarlightOpenAPIConfig } from './libs/config'
import { parseSchema } from './libs/parser'
import { generateSchemaDocs } from './libs/schema'
import type { SidebarGroup } from './libs/starlight'

export async function generateAPI(userConfig: StarlightOpenAPIConfig): Promise<SidebarGroup[]> {
  const config = validateConfig(userConfig)

  return Promise.all(
    config.map(async (schemaConfig) => generateSchemaDocs(schemaConfig, await parseSchema(schemaConfig))),
  )
}
