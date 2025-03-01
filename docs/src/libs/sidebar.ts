import type { StarlightPlugin } from '@astrojs/starlight/types'

export function starlightOpenAPIDocsDemoPlugin(): StarlightPlugin {
  return {
    name: 'starlight-openapi-docs-demo-plugin',
    hooks: {
      'config:setup': ({ config, updateConfig }) => {
        if (process.env.TEST) return

        updateConfig({
          sidebar: config.sidebar?.map((item) => {
            if (isSidebarGroup(item) && item.label === 'Demo') {
              return { ...item, items: item.items.slice(0, 3) }
            }

            return item
          }),
        })
      },
    },
  }
}

function isSidebarGroup(item: unknown): item is SidebarGroup {
  return typeof item !== 'string' && 'items' in (item as SidebarGroup)
}

export interface SidebarGroup {
  items: unknown[]
  label: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEST: string
    }
  }
}
