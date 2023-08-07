import type { ViteUserConfig } from 'astro'

import type { Schemas } from './schema'

export function vitePluginStarlightOpenAPISchemas(schemas: Schemas): VitePlugin {
  const moduleId = `virtual:starlight-openapi-schemas`
  const resolvedModuleId = `\0${moduleId}`
  const moduleContent = `export default ${JSON.stringify(schemas)}`

  return {
    name: `vite-plugin-starlight-openapi-schemas`,
    load(id) {
      return id === resolvedModuleId ? moduleContent : undefined
    },
    resolveId(id) {
      return id === moduleId ? resolvedModuleId : undefined
    },
  }
}

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
