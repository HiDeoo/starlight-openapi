import { stripLeadingAndTrailingSlashes } from './path'
import type { Schemas } from './schema'

const locale = 'en'

export function getSidebarGroups(schemas: Schemas): SidebarGroup[] {
  return Object.values(schemas).map(({ config, schema }) => {
    return {
      label: config.label ?? schema.info.title,
      items: [
        {
          label: 'Overview',
          link: `/${stripLeadingAndTrailingSlashes(config.base)}/`,
        },
      ],
    }
  })
}

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

export interface SidebarGroup {
  collapsed?: boolean
  items: (LinkItem | SidebarGroup)[]
  label: string
}

interface LinkItem {
  label: string
  link: string
}
