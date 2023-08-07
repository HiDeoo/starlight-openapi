import OpenAPIParser from '@readme/openapi-parser'
import type { OpenAPI } from 'openapi-types'

import { logError, logInfo } from './logger'

export async function parseSchema(path: string): Promise<OpenAPI.Document> {
  try {
    logInfo(`Parsing OpenAPI schema at '${path}'.`)

    // TODO(HiDeoo) remote schema
    const document = await OpenAPIParser.dereference(path)

    return document
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message)
    }

    throw error
  }
}
