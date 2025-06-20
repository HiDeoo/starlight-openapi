import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals
  const { sidebar } = starlightRoute

  starlightRoute.sidebar = sidebar.filter((item) => {
    return !(isSidebarGroup(item) && item.label === 'Tests')
  })
})

function isSidebarGroup(item: SidebarItem): item is SidebarGroup {
  return item.type === 'group'
}

type SidebarItem = StarlightRouteData['sidebar'][number]
export type SidebarGroup = Extract<SidebarItem, { type: 'group' }>
