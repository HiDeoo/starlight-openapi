import type { OpenAPI } from 'openapi-types'

import type { StarlightOpenAPISchemaConfig } from './config'
import { clearSchemaDirectory, writeSchemaFile } from './fs'
import { logInfo } from './logger'
import { getBaseLink } from './path'
import { generatePathItemDocs } from './pathItem'
import { makeSidebarGroup, makeSidebarLink, type SidebarGroup } from './starlight'

export async function generateSchemaDocs(
  config: StarlightOpenAPISchemaConfig,
  schema: StarlightOpenAPISchema,
): Promise<SidebarGroup> {
  logInfo(`Generating OpenAPI documentation for '${config.schema}'.`)

  await clearSchemaDirectory(config)

  await writeSchemaFile(
    config,
    'index.md',
    // FIXME(HiDeoo)
    `---
title: ${schema.info.title}
---

${JSON.stringify(schema, null, 2)}}
  `,
  )

  return makeSidebarGroup(config.label ?? schema.info.title, [
    makeSidebarLink('Overview', getBaseLink(config)),
    ...(await generatePathItemDocs(config, schema)),
  ])
}

export type StarlightOpenAPISchema = OpenAPI.Document
