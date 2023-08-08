import fs from 'node:fs/promises'
import path from 'node:path'

import { z } from 'astro/zod'
import type { OpenAPI } from 'openapi-types'

import { logInfo } from './logger'
import { slugifyPath, stripLeadingAndTrailingSlashes } from './path'
import type { SidebarGroup } from './starlight'

// TODO(HiDeoo) baseUrl

export const SchemaConfigSchema = z.object({
  // TODO(HiDeoo)
  label: z.string().optional(),
  // TODO(HiDeoo)
  output: z.string().min(1).transform(stripLeadingAndTrailingSlashes),
  // TODO(HiDeoo)
  schema: z.string().min(1),
})

export async function generateDocs({ config, schema }: Schema): Promise<SidebarGroup> {
  logInfo(`Generating OpenAPI documentation for '${config.schema}'.`)

  const outputPath = path.join('src/content/docs', config.output)

  await fs.mkdir(outputPath, { recursive: true })

  // FIXME(HiDeoo)
  const content = `---
title: ${schema.info.title}
---

${JSON.stringify(schema, null, 2)}}
`

  await fs.writeFile(path.join(outputPath, 'index.md'), content)

  return {
    label: config.label ?? schema.info.title,
    items: [
      {
        label: 'Overview',
        link: `/${slugifyPath(config.output)}/`,
      },
    ],
  }
}

export type StarlightOpenAPISchema = OpenAPI.Document
export type StarlightOpenAPISchemaConfig = z.infer<typeof SchemaConfigSchema>

export interface Schema {
  config: StarlightOpenAPISchemaConfig
  schema: StarlightOpenAPISchema
}

export type Schemas = Record<StarlightOpenAPISchemaConfig['output'], Schema>
