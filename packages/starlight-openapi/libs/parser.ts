import OpenAPIParser from '@readme/openapi-parser'

import { logError, logInfo } from './logger'
import type { Schema, StarlightOpenAPISchemaConfig } from './schema'

export async function parseSchema(config: StarlightOpenAPISchemaConfig): Promise<Schema> {
  try {
    logInfo(`Parsing OpenAPI schema at '${config.schema}'.`)

    const document = await OpenAPIParser.dereference(config.schema)

    return { config, document }
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message)
    }

    throw error
  }
}
