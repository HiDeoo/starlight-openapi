import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ViteUserConfig } from 'astro'

import type { Schema } from './schema'

// A map of Astro component name in Starlight that should be overridden mapped to the path of the override.
const componentOverrides = new Map([['Page', '../components/overrides/Page.astro']])

export function vitePluginStarlightOpenAPISchemas(schemas: Schema[]): VitePlugin {
  const moduleId = `virtual:starlight-openapi-schemas`
  const resolvedModuleId = `\0${moduleId}`
  const moduleContent = `export default ${JSON.stringify(
    Object.fromEntries(schemas.map((schema) => [schema.config.base, schema])),
  )}`

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

const overrideIds = new Map<string, string>()

export function vitePluginStarlightOpenAPIComponents(): VitePlugin {
  return {
    enforce: 'pre',
    name: 'vite-plugin-starlight-openapi-components',
    async resolveId(id, importer, options) {
      if (id.startsWith('/@fs') || importer?.endsWith('.html')) {
        return
      }
      for (const [name, override] of componentOverrides) {
        if (id.endsWith(`/${name}.astro`)) {
          // If the component is imported by Starlight, use the override.
          if (!importer?.includes('starlight-openapi/components')) {
            const resolvedOverride = await this.resolve(id, importer, { ...options, skipSelf: true })

            if (resolvedOverride) {
              overrideIds.set(name, resolvedOverride.id)
            }

            return path.join(path.dirname(fileURLToPath(import.meta.url)), override)
          }

          // If the component is imported internally by starlight-openapi, use the original component.
          return overrideIds.get(name)
        }
      }

      return
    },
  }
}

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
