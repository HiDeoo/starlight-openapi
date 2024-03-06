import type { StarlightPlugin } from '@astrojs/starlight/types'

export function starlightOpenAPIDocsDemoPlugin(): StarlightPlugin {
  return {
    name: 'starlight-openapi-rapidoc-docs-demo-plugin',
    hooks: {
      setup: ({ config, updateConfig }) => {
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
  return 'items' in (item as SidebarGroup)
}

export interface SidebarGroup {
  items: unknown[]
  label: string
}
