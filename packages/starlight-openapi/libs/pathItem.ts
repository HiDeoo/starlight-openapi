import type { StarlightOpenAPISchemaConfig } from './config'
import { writeSchemaFile } from './fs'
import { OPERATION_HTTP_METHODS, isPathItemOperation } from './operation'
import { getBaseLink, slug } from './path'
import type { StarlightOpenAPISchema } from './schema'
import { makeSidebarGroup, makeSidebarLink, type SidebarGroup } from './starlight'

const defaultPathItemTag = 'Operations'

export async function generatePathItemDocs(
  config: StarlightOpenAPISchemaConfig,
  schema: StarlightOpenAPISchema,
): Promise<SidebarGroup['items']> {
  const baseLink = getBaseLink(config)
  const schemaPaths: Paths = schema.paths ?? {}
  const sidebarItemsByTags = new Map<string, SidebarGroup['items']>()

  for (const [schemaPath, schemaPathItem] of Object.entries(schemaPaths)) {
    if (!isPathItem(schemaPathItem)) {
      continue
    }

    for (const method of OPERATION_HTTP_METHODS) {
      if (!isPathItemOperation(schemaPathItem, method)) {
        continue
      }

      const operation = schemaPathItem[method]
      const operationPath = `operations/${slug(operation.operationId ?? schemaPath)}`

      await writeSchemaFile(
        config,
        `${operationPath}.md`,
        // FIXME(HiDeoo)
        `---
title: ${schema.info.title}
---

${JSON.stringify(schema, null, 2)}}
`,
      )

      for (const tag of operation.tags ?? [defaultPathItemTag]) {
        const sidebarItems = sidebarItemsByTags.get(tag) ?? []
        sidebarItems.push(makeSidebarLink(operation.summary ?? schemaPath, baseLink + operationPath))
        sidebarItemsByTags.set(tag, sidebarItems)
      }
    }
  }

  return [...sidebarItemsByTags.entries()].map(([tag, items]) => makeSidebarGroup(tag, items))
}

function isPathItem(pathItem: unknown): pathItem is PathItem {
  return typeof pathItem === 'object'
}

type Paths = NonNullable<StarlightOpenAPISchema['paths']>
export type PathItem = NonNullable<Paths[string]>
