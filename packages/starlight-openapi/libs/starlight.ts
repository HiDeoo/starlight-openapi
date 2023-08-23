import type { MarkdownHeading } from 'astro'

import type { PathItemOperation } from './operation'
import { getParametersByLocation } from './parameter'
import { slug } from './path'
import { hasRequestBody } from './requestBody'
import { includesDefaultResponse } from './response'
import type { Schema } from './schema'
import { getSecurityDefinitions, getSecurityRequirements } from './security'
import { capitalize } from './utils'

const locale = 'en'

export function getPageProps(title: string, schema: Schema, pathItemOperation?: PathItemOperation) {
  const isOverview = pathItemOperation === undefined

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
    headings: isOverview ? getOverviewHeadings(schema) : getOperationHeadings(schema, pathItemOperation),
    lang: locale,
  }
}

export function makeSidebarGroup(label: string, items: SidebarGroup['items'], collapsed: boolean): SidebarGroup {
  return { collapsed, items, label }
}

export function makeSidebarLink(label: string, link: string): SidebarLink {
  return { label, link }
}

function getOverviewHeadings({ document }: Schema): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [
    makeMarkdownHeading(2, `${document.info.title} (${document.info.version})`, 'overview'),
  ]

  const securityDefinitions = getSecurityDefinitions(document)

  if (securityDefinitions) {
    headings.push(makeMarkdownHeading(2, 'Authentication'))

    for (const name of Object.keys(securityDefinitions)) {
      headings.push(makeMarkdownHeading(3, name))
    }
  }

  return headings
}

function getOperationHeadings(schema: Schema, { operation, pathItem }: PathItemOperation): MarkdownHeading[] {
  const headings: MarkdownHeading[] = []

  const securityRequirements = getSecurityRequirements(schema, operation)

  if (securityRequirements && securityRequirements.length > 0) {
    headings.push(makeMarkdownHeading(2, 'Authorizations'))
  }

  const parametersByLocation = getParametersByLocation(operation.parameters, pathItem.parameters)

  if (parametersByLocation.size > 0) {
    headings.push(makeMarkdownHeading(2, 'Parameters'))

    for (const location of parametersByLocation.keys()) {
      headings.push(makeMarkdownHeading(3, `${capitalize(location)} Parameters`))
    }
  }

  if (hasRequestBody(operation)) {
    headings.push(makeMarkdownHeading(2, 'Request Body'))
  }

  if (operation.responses) {
    headings.push(makeMarkdownHeading(2, 'Responses'))

    for (const name of Object.keys(operation.responses)) {
      if (name !== 'default') {
        headings.push(makeMarkdownHeading(3, name))
      }
    }

    if (includesDefaultResponse(operation.responses)) {
      headings.push(makeMarkdownHeading(3, 'default'))
    }
  }

  return headings
}

function makeMarkdownHeading(depth: number, text: string, customSlug?: string): MarkdownHeading {
  return { depth, slug: customSlug ?? slug(text), text }
}

export interface SidebarGroup {
  collapsed: boolean
  items: (SidebarLink | SidebarGroup)[]
  label: string
}

interface SidebarLink {
  label: string
  link: string
}
