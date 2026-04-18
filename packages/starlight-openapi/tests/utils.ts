import type { AstroIntegrationLogger } from 'astro'
import type { z } from 'astro/zod'

import { ensureSchemaDereference } from '../libs/dereference'
import {
  getOperationsByTag,
  getWebhooksOperations,
  type OperationHttpMethod,
  type PathItemOperation,
} from '../libs/operation'
import { parseSchema } from '../libs/parser'
import { type Schema, SchemaConfigSchema } from '../libs/schemas/schema'

const schemasRoot = new URL('../../../schemas/', import.meta.url)

export async function parseTestSchema(
  schemaPath: string,
  schemaConfig: Partial<z.input<typeof SchemaConfigSchema>> = {},
) {
  const schema = await parseSchema(
    { info: () => undefined, error: () => undefined } as unknown as AstroIntegrationLogger,
    schemasRoot,
    SchemaConfigSchema.parse({
      base: 'test',
      schema: schemaPath,
      sidebar: {
        collapsed: true,
        operations: { badges: false, labels: 'summary', sort: 'document' },
        tags: { sort: 'document' },
      },
      snippets: { generated: false },
      ...schemaConfig,
    }),
  )

  await ensureSchemaDereference(schema)

  return schema
}

export function getTestOperation(
  schema: Schema,
  selector: { operationId: string } | { path: string; method: OperationHttpMethod },
): PathItemOperation {
  const operations = [
    ...[...getOperationsByTag(schema).values()].flatMap((group) => group.entries),
    ...getWebhooksOperations(schema),
  ]

  const operation =
    'operationId' in selector
      ? operations.find((entry) => entry.operation.operationId === selector.operationId)
      : operations.find((entry) => entry.path === selector.path && entry.method === selector.method)

  if (operation) return operation

  const description =
    'operationId' in selector
      ? `with ID '${selector.operationId}'`
      : `for ${selector.method.toUpperCase()} at ${selector.path}`

  throw new Error(`Could not find test operation ${description}.`)
}
