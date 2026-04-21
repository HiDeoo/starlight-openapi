import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import { getContentEntries, isJsonLikeMediaType, type MediaEntry } from './content'
import { createSchemaExampleValue, getSchemaAuthoredExampleValue } from './exampleValue'
import type { Operation } from './operation'
import type { Parameter } from './parameter'
import { hasDefinedValue, isObjectLike } from './predicate'
import { hasSchemaObject } from './schemaObject'
import type { Schema } from './schemas/schema'

export function getRequestBodyMediaEntries(schema: Schema, operation: Operation): MediaEntry[] {
  const openAPIV2RequestBodyParameter = getOpenAPIV2RequestBodyParameter(operation)
  const openAPIV3RequestBody = getOpenAPIV3RequestBody(operation)

  const entries = openAPIV2RequestBodyParameter
    ? getOpenAPIV2RequestBodyMediaEntries(schema, operation, openAPIV2RequestBodyParameter)
    : openAPIV3RequestBody
      ? getContentEntries(openAPIV3RequestBody.content)
      : []

  return schema.config.snippets.requestBody ? addGeneratedRequestBodyExamples(entries) : entries
}

export function getOpenAPIV2RequestBodyParameter(operation: Operation): OpenAPIV2.InBodyParameterObject | undefined {
  if ('requestBody' in operation || operation.parameters === undefined) {
    return
  }

  return (operation.parameters as Parameter[]).find(isOpenAPIV2RequestBodyParameter)
}

export function getOpenAPIV3RequestBody(operation: Operation): RequestBody | undefined {
  if (!isOperationWithRequestBody(operation)) {
    return
  }

  return operation.requestBody
}

export function hasRequestBody(operation: Operation): boolean {
  return getOpenAPIV2RequestBodyParameter(operation) !== undefined || getOpenAPIV3RequestBody(operation) !== undefined
}

export function getOpenAPIV2OperationConsumes(schema: Schema, operation: Operation): OpenAPIV2.MimeTypes | undefined {
  if ('consumes' in operation) {
    return operation.consumes
  } else if ('consumes' in schema.document) {
    return schema.document.consumes
  }

  return
}

export function getOpenAPIV2OperationProduces(schema: Schema, operation: Operation): OpenAPIV2.MimeTypes | undefined {
  if ('produces' in operation) {
    return operation.produces
  } else if ('produces' in schema.document) {
    return schema.document.produces
  }

  return
}

function getOpenAPIV2RequestBodyMediaEntries(
  schema: Schema,
  operation: Operation,
  parameter: OpenAPIV2.InBodyParameterObject,
): MediaEntry[] {
  if (!hasSchemaObject(parameter)) return []

  const mediaTypes = getOpenAPIV2OperationConsumes(schema, operation) ?? []

  if (mediaTypes.length === 0) return [{ schema: parameter.schema }]

  return mediaTypes.map((mediaType) => ({
    mediaType,
    schema: parameter.schema,
  }))
}

function isOpenAPIV2RequestBodyParameter(parameter: Parameter): parameter is OpenAPIV2.InBodyParameterObject {
  return parameter.in === 'body'
}

function isOperationWithRequestBody(operation: Operation): operation is Operation & { requestBody: RequestBody } {
  return hasDefinedValue(operation, 'requestBody') && isObjectLike(operation.requestBody)
}

function addGeneratedRequestBodyExamples(entries: MediaEntry[]): MediaEntry[] {
  return entries.map((entry) => {
    if (entry.example !== undefined || entry.examples !== undefined) return entry
    if (!isJsonLikeMediaType(entry.mediaType)) return entry
    if (!entry.schema) return entry

    const schemaExample = getSchemaAuthoredExampleValue(entry.schema)
    if (schemaExample !== undefined) return entry

    const generatedExample = createSchemaExampleValue(entry.schema)

    return generatedExample === undefined ? entry : { ...entry, example: generatedExample, generated: true }
  })
}

type RequestBody = OpenAPIV3.RequestBodyObject | OpenAPIV3_1.RequestBodyObject
