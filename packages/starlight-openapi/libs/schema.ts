import fs from 'node:fs/promises'
import path from 'node:path'

import { z } from 'astro/zod'
import { slug } from 'github-slugger'
import type { OpenAPI } from 'openapi-types'

import { logInfo } from './logger'
import { getSchemaFilePath, getSchemaPath, slugifyPath, stripLeadingAndTrailingSlashes } from './path'
import type { SidebarGroup } from './starlight'

const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const

// TODO(HiDeoo) baseUrl

export const SchemaConfigSchema = z.object({
  // TODO(HiDeoo)
  label: z.string().optional(),
  // TODO(HiDeoo)
  output: z.string().min(1).transform(stripLeadingAndTrailingSlashes),
  // TODO(HiDeoo)
  schema: z.string().min(1),
})

export async function generateDocs(
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

  return {
    label: config.label ?? schema.info.title,
    items: [
      {
        label: 'Overview',
        link: getBaseLink(config),
      },
      ...(await generatePathItemDocs(config, schema)),
    ],
  }
}

async function generatePathItemDocs(
  config: StarlightOpenAPISchemaConfig,
  schema: StarlightOpenAPISchema,
): Promise<SidebarGroup['items']> {
  const baseLink = getBaseLink(config)
  const schemaPaths: Paths = schema.paths ?? {}
  const sidebarItems: SidebarGroup['items'] = []

  // TODO(HiDeoo) group by tags

  for (const [schemaPath, schemaPathItem] of Object.entries(schemaPaths)) {
    if (!isPathItem(schemaPathItem)) {
      continue
    }

    for (const method of httpMethods) {
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

      sidebarItems.push({
        label: operation.summary ?? schemaPath,
        link: baseLink + operationPath,
      })
    }
  }

  return sidebarItems
}

function getBaseLink(config: StarlightOpenAPISchemaConfig) {
  return `/${slugifyPath(config.output)}/`
}

function clearSchemaDirectory(config: StarlightOpenAPISchemaConfig) {
  return fs.rm(getSchemaPath(config), { recursive: true, force: true })
}

async function writeSchemaFile(config: StarlightOpenAPISchemaConfig, relativeFilePath: string, content: string) {
  const file = getSchemaFilePath(config, relativeFilePath)
  const dir = path.dirname(file)

  await fs.mkdir(dir, { recursive: true })

  return fs.writeFile(file, content, 'utf8')
}

function isPathItem(pathItem: unknown): pathItem is PathItem {
  return typeof pathItem === 'object'
}

function isPathItemOperation<TMethod extends HttpMethod>(
  pathItem: PathItem,
  method: TMethod,
): pathItem is { [key in TMethod]: Operation } {
  return method in pathItem
}

export type StarlightOpenAPISchema = OpenAPI.Document
export type StarlightOpenAPISchemaConfig = z.infer<typeof SchemaConfigSchema>

type HttpMethod = (typeof httpMethods)[number]

type Paths = NonNullable<StarlightOpenAPISchema['paths']>
type PathItem = NonNullable<Paths[string]>
type Operation = OpenAPI.Operation
