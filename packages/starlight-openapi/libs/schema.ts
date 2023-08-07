import { z } from 'astro/zod'
import type { OpenAPI } from 'openapi-types'
import schemas from 'virtual:starlight-openapi-schemas'

import { stripLeadingAndTrailingSlashes } from './path'

const SchemaConfigSchema = z.object({
  // TODO(HiDeoo)
  base: z.string().min(1),
  // TODO(HiDeoo)
  schema: z.string().min(1),
})

export function getSchemasStaticPaths() {
  return Object.values(schemas).map(({ config, schema }) => {
    return {
      params: {
        base: stripLeadingAndTrailingSlashes(config.base),
        slug: undefined,
      },
      props: {
        config,
        schema,
      },
    }
  })
}

export type StarlightOpenAPISchema = OpenAPI.Document
export type StarlightOpenAPISchemaConfig = z.infer<typeof SchemaConfigSchema>

export interface Schema {
  config: StarlightOpenAPISchemaConfig
  schema: StarlightOpenAPISchema
}

export type Schemas = Record<StarlightOpenAPISchemaConfig['base'], Schema>
