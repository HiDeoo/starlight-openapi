import type { MarkdownHeading } from 'astro'

import { slug } from './path'
import type { StarlighOpenAPIRoute } from './route'
import type { Schema } from './schema'
import { getSecurityDefinitions } from './security'

const locale = 'en'

export function getPageProps(title: string, schema: Schema, type: StarlighOpenAPIRoute['props']['type']) {
  return {
    entry: {
      data: {
        editUrl: false,
        head: [],
        tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
        title,
      },
    },
    entryMeta: {
      lang: locale,
    },
    headings: type === 'overview' ? getOverviewHeadings(schema) : getOperationHeadings(),
    lang: locale,
  }
}

export function makeSidebarGroup(label: string, items: SidebarGroup['items']): SidebarGroup {
  return { items, label }
}

export function makeSidebarLink(label: string, link: string): SidebarLink {
  return { label, link }
}

function getOverviewHeadings({ document }: Schema): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [
    {
      depth: 2,
      slug: 'overview',
      text: `${document.info.title} (${document.info.version})`,
    },
  ]

  const securityDefinitions = getSecurityDefinitions(document)

  if (securityDefinitions) {
    headings.push({
      depth: 2,
      slug: 'authentication',
      text: 'Authentication',
    })

    for (const name of Object.keys(securityDefinitions)) {
      headings.push({
        depth: 3,
        slug: slug(name),
        text: name,
      })
    }
  }

  return headings
}

function getOperationHeadings(): MarkdownHeading[] {
  return []
}

export interface SidebarGroup {
  items: (SidebarLink | SidebarGroup)[]
  label: string
}

interface SidebarLink {
  label: string
  link: string
}
