import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import { getContentEntries, type MediaEntry } from './content'
import { isOpenAPIV2ResponseWithExamples } from './example'
import { createSchemaExampleValue, getSchemaExampleValueByPrecedence } from './exampleValue'
import type { Operation } from './operation'
import { getDefinedValue, hasDefinedValue, isObjectLike } from './predicate'
import { getOpenAPIV2OperationProduces } from './requestBody'
import { hasSchemaObject } from './schemaObject'
import type { Schema } from './schemas/schema'

export function includesDefaultResponse(responses: Responses): responses is Responses & { default: Response } {
  return hasDefinedValue(responses, 'default') && isObjectLike(responses.default)
}

export function getResponseMediaEntries(schema: Schema, operation: Operation, response: Response): MediaEntry[] {
  const entries =
    'swagger' in schema.document
      ? getOpenAPIV2ResponseMediaEntries(schema, operation, response)
      : 'content' in response
        ? getContentEntries(response.content)
        : []

  return schema.config.snippets.response ? addGeneratedResponseExamples(entries) : entries
}

function getOpenAPIV2ResponseMediaEntries(schema: Schema, operation: Operation, response: Response): MediaEntry[] {
  const mediaTypes = getOpenAPIV2ResponseMediaTypes(schema, operation, response)
  const schemaObject = hasSchemaObject(response) ? response.schema : undefined

  if (mediaTypes.length === 0) return schemaObject ? [{ schema: schemaObject }] : []

  return mediaTypes.map((mediaType) => {
    const example = isOpenAPIV2ResponseWithExamples(response)
      ? getDefinedValue(response.examples, mediaType)
      : undefined

    return {
      mediaType,
      ...(schemaObject ? { schema: schemaObject } : {}),
      ...(example === undefined ? {} : { example }),
    }
  })
}

function getOpenAPIV2ResponseMediaTypes(schema: Schema, operation: Operation, response: Response): string[] {
  const mediaTypes = new Set<string>()

  for (const mediaType of getOpenAPIV2OperationProduces(schema, operation) ?? []) mediaTypes.add(mediaType)

  if (isOpenAPIV2ResponseWithExamples(response)) {
    for (const mediaType of Object.keys(response.examples)) mediaTypes.add(mediaType)
  }

  return [...mediaTypes]
}

function addGeneratedResponseExamples(entries: MediaEntry[]): MediaEntry[] {
  return entries.map((entry) => {
    if (entry.example !== undefined || entry.examples !== undefined) return entry
    if (!isJsonLikeResponseMediaType(entry.mediaType)) return entry
    if (!entry.schema) return entry

    const schemaExample = getSchemaExampleValueByPrecedence(entry.schema)

    if (schemaExample !== undefined) return { ...entry, example: schemaExample }

    const generatedExample = createSchemaExampleValue(entry.schema)
    return generatedExample === undefined ? entry : { ...entry, example: generatedExample, generated: true }
  })
}

function isJsonLikeResponseMediaType(mediaType: string | undefined): boolean {
  return mediaType?.includes('json') ?? false
}

export type Response = OpenAPIV2.ResponseObject | OpenAPIV3.ResponseObject | OpenAPIV3_1.ResponseObject
export type Responses = OpenAPIV2.ResponsesObject | OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject
