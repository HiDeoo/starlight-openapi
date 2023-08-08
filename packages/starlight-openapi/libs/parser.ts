import OpenAPIParser from '@readme/openapi-parser'

import { logError, logInfo } from './logger'
import type { StarlightOpenAPISchema, StarlightOpenAPISchemaConfig } from './schema'

export async function parseSchema(config: StarlightOpenAPISchemaConfig): Promise<StarlightOpenAPISchema> {
  try {
    logInfo(`Parsing OpenAPI schema at '${config.schema}'.`)

    // TODO(HiDeoo) remote schema
    const schema = await OpenAPIParser.dereference(config.schema)

    return schema
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message)
    }

    throw error
  }
}
