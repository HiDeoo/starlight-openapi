import type { ViteUserConfig } from 'astro'

import type { Schema } from './schema'

export function vitePluginStarlightOpenAPISchemas(schemas: Schema[]): VitePlugin {
  const moduleId = `virtual:starlight-openapi-rapidoc-schemas`
  const resolvedModuleId = `\0${moduleId}`
  const moduleContent = `export default ${JSON.stringify(
    Object.fromEntries(schemas.map((schema) => [schema.config.base, schema])),
  )}`

  return {
    name: `vite-plugin-starlight-openapi-rapidoc-rapidoc-schemas`,
    load(id) {
      return id === resolvedModuleId ? moduleContent : undefined
    },
    resolveId(id) {
      return id === moduleId ? resolvedModuleId : undefined
    },
  }
}

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
