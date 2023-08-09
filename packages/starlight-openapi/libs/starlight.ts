export function makeSidebarGroup(label: string, items: SidebarGroup['items']): SidebarGroup {
  return { items, label }
}

export function makeSidebarLink(label: string, link: string): SidebarLink {
  return { label, link }
}

export interface SidebarGroup {
  items: (SidebarLink | SidebarGroup)[]
  label: string
}

interface SidebarLink {
  label: string
  link: string
}
