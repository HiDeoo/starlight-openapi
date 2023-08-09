const locale = 'en'

export function getPageProps(title: string) {
  return {
    entry: {
      data: {
        editUrl: false,
        head: [],
        tableOfContents: false,
        title,
      },
    },
    entryMeta: {
      lang: locale,
    },
    lang: locale,
  }
}

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
