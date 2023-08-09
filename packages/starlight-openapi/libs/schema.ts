import { z } from 'astro/zod'
import type { OpenAPI } from 'openapi-types'

import { getBaseLink, stripLeadingAndTrailingSlashes } from './path'
import { getPathItemSidebarGroups } from './pathItem'
import { makeSidebarGroup, makeSidebarLink, type SidebarGroup } from './starlight'

// TODO(HiDeoo) baseUrl

export const SchemaConfigSchema = z.object({
  // TODO(HiDeoo)
  base: z.string().min(1).transform(stripLeadingAndTrailingSlashes),
  // TODO(HiDeoo)
  label: z.string().optional(),
  // TODO(HiDeoo)
  schema: z.string().min(1),
})

export function getSchemaSidebarGroups(schema: Schema): SidebarGroup {
  const { config, document } = schema

  return makeSidebarGroup(config.label ?? document.info.title, [
    makeSidebarLink('Overview', getBaseLink(config)),
    ...getPathItemSidebarGroups(schema),
  ])
}

export type StarlightOpenAPISchemaConfig = z.infer<typeof SchemaConfigSchema>

export interface Schema {
  config: StarlightOpenAPISchemaConfig
  document: OpenAPI.Document
}
