export interface SidebarGroup {
  collapsed?: boolean
  items: (LinkItem | SidebarGroup)[]
  label: string
}

interface LinkItem {
  label: string
  link: string
}
