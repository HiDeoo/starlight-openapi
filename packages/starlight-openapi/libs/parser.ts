import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { bundle } from '@readme/openapi-parser'
import type { AstroConfig, AstroIntegrationLogger } from 'astro'

import type { Schema, StarlightOpenAPISchemaConfig } from './schema'

export async function parseSchema(
  logger: AstroIntegrationLogger,
  root: AstroConfig['root'],
  config: StarlightOpenAPISchemaConfig,
): Promise<Schema> {
  try {
    const schemaLocation = getSchemaLocation(root, config.schema)

    logger.info(`Parsing OpenAPI schema at '${config.schema}'.`)

    const document = await bundle(schemaLocation)

    return { config, document }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message)
    }

    throw error
  }
}

function getSchemaLocation(root: AstroConfig['root'], schemaPath: string): string {
  if (isSchemaUrl(schemaPath)) return schemaPath

  return pathToFileURL(path.isAbsolute(schemaPath) ? schemaPath : path.resolve(fileURLToPath(root), schemaPath)).href
}

function isSchemaUrl(schemaPath: string): boolean {
  try {
    const url = new URL(schemaPath)
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'file:'
  } catch {
    return false
  }
}
