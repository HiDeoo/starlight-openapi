import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import { getContentEntries, isJsonLikeMediaType, type MediaEntry } from './content'
import { createSchemaExampleValue, getSchemaAuthoredExampleValue } from './exampleValue'
import type { Operation } from './operation'
import {
  formatParameterValue,
  getParameterValueStyle,
  serializeEncodedParameterValue,
  serializeParameterValue,
  serializeUriComponent,
  type Parameter,
  type ParameterValueStyle,
} from './parameter'
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

  const normalizedEntries = entries.map(normalizeRequestBodyMediaEntry)

  return schema.config.snippets.requestBody ? addGeneratedRequestBodyExamples(normalizedEntries) : normalizedEntries
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

export function serializeUrlEncodedFormParams(
  mediaType: unknown,
  value: Record<string, unknown>,
): UrlEncodedFormParam[] {
  return Object.entries(value).flatMap(([name, fieldValue]) => {
    const { contentType, explode, style } = getFormFieldEncodingOptions(mediaType, name)

    if (contentType !== undefined) return [{ name, value: serializeRequestBodyFieldValue(fieldValue, contentType) }]

    return serializeParameterValue(name, fieldValue, style, explode)
  })
}

export function serializeUrlEncodedRequestBodyExample(mediaType: unknown, value: Record<string, unknown>): string {
  return Object.entries(value)
    .flatMap(([name, fieldValue]) => {
      const { allowReserved, contentType, explode, style } = getFormFieldEncodingOptions(mediaType, name)

      if (contentType !== undefined) {
        const encodedName = serializeUriComponent(name, { useFormSpaceEncoding: true })
        const encodedValue = serializeUriComponent(serializeRequestBodyFieldValue(fieldValue, contentType), {
          allowReserved,
          useFormSpaceEncoding: true,
        })

        return [`${encodedName}=${encodedValue}`]
      }

      return serializeEncodedParameterValue(name, fieldValue, style, explode, {
        allowReserved,
        useFormSpaceEncoding: true,
      })
    })
    .join('&')
}

export function getFormFieldEncodingOptions(mediaType: unknown, fieldName: string): FormFieldEncodingOptions {
  const defaultStyle: ParameterValueStyle = 'form'
  const defaultOptions: FormFieldEncodingOptions = {
    allowReserved: false,
    explode: true,
    style: defaultStyle,
  }

  if (!mediaType || !hasDefinedValue(mediaType, 'encoding') || !isObjectLike(mediaType.encoding)) {
    return defaultOptions
  }

  const fieldEncoding = mediaType.encoding[fieldName]

  if (!isObjectLike(fieldEncoding)) return defaultOptions

  const style = getParameterValueStyle(
    hasDefinedValue(fieldEncoding, 'style') ? fieldEncoding.style : undefined,
    'form',
  )

  const contentType =
    hasDefinedValue(fieldEncoding, 'contentType') && typeof fieldEncoding.contentType === 'string'
      ? fieldEncoding.contentType
      : undefined

  return {
    allowReserved:
      hasDefinedValue(fieldEncoding, 'allowReserved') && typeof fieldEncoding.allowReserved === 'boolean'
        ? fieldEncoding.allowReserved
        : false,
    explode:
      hasDefinedValue(fieldEncoding, 'explode') && typeof fieldEncoding.explode === 'boolean'
        ? fieldEncoding.explode
        : style === 'form',
    style,
    ...(contentType === undefined ? {} : { contentType }),
  }
}

export function serializeRequestBodyFieldValue(fieldValue: unknown, contentType: string): string {
  if (contentType.includes('json')) return stringifyRequestBodyInline(fieldValue)
  if (typeof fieldValue === 'string') return fieldValue

  return formatParameterValue(fieldValue, false)
}

// Stringify request bodies inline to keep snippets compact, but with some spacing to improve readability and without
// any newlines that could end up being escaped in some operation snippet clients like Wget with `httpsnippet`.
export function stringifyRequestBodyInline(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[ ${value.map((item) => stringifyRequestBodyInline(item)).join(', ')} ]`
  }

  const entries = Object.entries(value)
  if (entries.length === 0) return '{}'

  return `{ ${entries.map(([key, entryValue]) => `${JSON.stringify(key)}: ${stringifyRequestBodyInline(entryValue)}`).join(', ')} }`
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

function normalizeRequestBodyMediaEntry(entry: MediaEntry): MediaEntry {
  if (entry.mediaType !== 'application/x-www-form-urlencoded') return entry

  return {
    ...entry,
    ...(entry.example === undefined ? {} : { example: serializeRequestBodyExample(entry, entry.example) }),
    ...(entry.examples === undefined ? {} : { examples: normalizeRequestBodyExamples(entry, entry.examples) }),
  }
}

function normalizeRequestBodyExamples(
  entry: MediaEntry,
  examples: NonNullable<MediaEntry['examples']>,
): NonNullable<MediaEntry['examples']> {
  return Object.fromEntries(
    Object.entries(examples).map(([name, example]) => [
      name,
      'value' in example ? { ...example, value: serializeRequestBodyExample(entry, example.value) } : example,
    ]),
  )
}

function serializeRequestBodyExample(entry: MediaEntry, value: unknown): unknown {
  if (entry.mediaType !== 'application/x-www-form-urlencoded') return value
  if (!isObjectLike(value)) return value
  return serializeUrlEncodedRequestBodyExample(entry.media, value)
}

function addGeneratedRequestBodyExamples(entries: MediaEntry[]): MediaEntry[] {
  return entries.map((entry) => {
    if (entry.example !== undefined || entry.examples !== undefined) return entry
    if (!isSupportedGeneratedRequestBodyMediaType(entry.mediaType)) return entry
    if (!entry.schema) return entry

    const schemaExample = getSchemaAuthoredExampleValue(entry.schema)
    if (schemaExample !== undefined) return entry

    const generatedExample = createSchemaExampleValue(entry.schema)

    if (generatedExample === undefined) return entry

    if (entry.mediaType === 'application/x-www-form-urlencoded') {
      if (!isObjectLike(generatedExample)) return entry

      return {
        ...entry,
        example: serializeUrlEncodedRequestBodyExample(entry.media, generatedExample),
        generated: true,
      }
    }

    return { ...entry, example: generatedExample, generated: true }
  })
}

function isSupportedGeneratedRequestBodyMediaType(mediaType: string | undefined): boolean {
  return isJsonLikeMediaType(mediaType) || mediaType === 'application/x-www-form-urlencoded'
}

type RequestBody = OpenAPIV3.RequestBodyObject | OpenAPIV3_1.RequestBodyObject

interface UrlEncodedFormParam {
  name: string
  value: string
}

interface FormFieldEncodingOptions {
  allowReserved: boolean
  contentType?: string
  explode: boolean
  style: ParameterValueStyle
}
