import {
  createParameterExampleValue,
  createSchemaExampleValue,
  getParameterExampleValueByPrecedence,
  getSchemaExampleValueByPrecedence,
} from './exampleValue'
import { getOperationBaseURL, replaceTemplateVariables, type PathItemOperation } from './operation'
import {
  formatParameterValue,
  getCollectionFormat,
  getParametersByLocation,
  isOpenAPIV2ArrayParameter,
  serializeArrayWithCollectionFormat,
  serializeCookieParameter,
  serializeHeaderParameter,
  serializeParameterValue,
  serializePathParameter,
  serializeQueryParameter,
  serializeUriComponent,
  type Parameter,
  type ParameterValueStyle,
} from './parameter'
import { getURLWithPath } from './path'
import { hasDefinedValue, isArray, isObjectLike } from './predicate'
import {
  getFormFieldEncodingOptions,
  getOpenAPIV2OperationConsumes,
  getOpenAPIV2RequestBodyParameter,
  getOpenAPIV3RequestBody,
  serializeRequestBodyFieldValue,
  serializeUrlEncodedFormParams,
  stringifyRequestBodyInline,
} from './requestBody'
import {
  getProperties,
  getSchemaFormat,
  hasSchemaObject,
  isArraySchemaType,
  isSchemaObject,
  isSchemaObjectObject,
  type SchemaObject,
} from './schemaObject'
import type { Schema } from './schemas/schema'
import { getSecurityDefinitions, getSecurityRequirements } from './security'

export function getOperationHarRequest(schema: Schema, pathItemOperation: PathItemOperation): HarRequest {
  const baseURL = getOperationBaseURL(schema.document, pathItemOperation)

  if (!baseURL) {
    throw new Error(
      `Fail to get base URL for ${pathItemOperation.method.toUpperCase()} operation: ${pathItemOperation.path ?? ''}`,
    )
  }

  const parameterValues = getOperationParameterValues(pathItemOperation)
  const nonQueryParameters = getOperationNonQueryParameters(parameterValues)
  const security = getOperationSecurity(schema, pathItemOperation)
  const requestBody = getOperationRequestBody(schema, pathItemOperation, parameterValues)

  // HAR contains decoded query entries in the `queryString` field, but the returned request object still needs an
  // encoded url so we need to keep track of both.
  const queryString: HarKeyValue[] = []
  const encodedQueryStringEntries: string[] = []

  for (const { parameter, value } of parameterValues) {
    if (parameter.in !== 'query') continue

    const serialized = serializeQueryParameter(parameter, value)
    queryString.push(...serialized.entries)
    encodedQueryStringEntries.push(...serialized.encodedEntries)
  }

  queryString.push(...security.queryString)

  for (const { name, value } of security.queryString) {
    encodedQueryStringEntries.push(`${serializeUriComponent(name)}=${serializeUriComponent(value)}`)
  }

  const headers = [...nonQueryParameters.headers, ...security.headers, ...requestBody.headers]
  const cookies = [...nonQueryParameters.cookies, ...security.cookies]

  const path = replaceTemplateVariables(pathItemOperation.path ?? '', nonQueryParameters.pathParameters)
  const baseWithPath = getURLWithPath(baseURL, path)
  const serializedQueryString = encodedQueryStringEntries.join('&')
  const url = `${baseWithPath}${serializedQueryString.length > 0 ? `?${serializedQueryString}` : ''}`

  return {
    method: pathItemOperation.method.toUpperCase(),
    url,
    httpVersion: 'HTTP/1.1',
    cookies,
    headers,
    queryString,
    ...(requestBody.postData ? { postData: requestBody.postData } : {}),
    headersSize: -1,
    bodySize: -1,
  }
}

function getOperationParameterValues({ operation, pathItem }: PathItemOperation): OperationParameterValue[] {
  const parametersByLocation = getParametersByLocation(operation.parameters, pathItem.parameters)
  const parameterValues: OperationParameterValue[] = []

  for (const parameters of parametersByLocation.values()) {
    for (const parameter of parameters.values()) {
      const value = getOperationParameterExampleValue(parameter)
      if (value === undefined) continue

      parameterValues.push({ parameter, value })
    }
  }

  return parameterValues
}

function getOperationParameterExampleValue(parameter: Parameter): unknown {
  const value = getParameterExampleValueByPrecedence(parameter)
  if (value !== undefined) return value
  // Skip optional parameters without explicit example-like values.
  return parameter.required ? createParameterExampleValue(parameter) : undefined
}

function getOperationNonQueryParameters(parameterValues: OperationParameterValue[]): OperationNonQueryParameters {
  const cookies: HarKeyValue[] = []
  const headers: HarKeyValue[] = []
  const pathParameters: Record<string, string> = {}

  for (const { parameter, value } of parameterValues) {
    switch (parameter.in) {
      case 'cookie': {
        cookies.push(...serializeCookieParameter(parameter, value))
        break
      }
      case 'formData': {
        // Handled in `getOperationRequestBody()`.
        break
      }
      case 'header': {
        headers.push(...serializeHeaderParameter(parameter, value))
        break
      }
      case 'path': {
        pathParameters[parameter.name] = serializePathParameter(parameter, value)
        break
      }
    }
  }

  return { cookies, headers, pathParameters }
}

function getOperationSecurity(schema: Schema, { operation }: PathItemOperation): OperationSecurity {
  const defaultOperationSecurity: OperationSecurity = { cookies: [], headers: [], queryString: [] }

  const securityRequirements = getSecurityRequirements(operation, schema)
  const securityDefinitions = getSecurityDefinitions(schema.document)

  if (!securityRequirements || securityRequirements.length === 0 || !securityDefinitions) {
    return defaultOperationSecurity
  }

  for (const securityRequirement of securityRequirements) {
    if (Object.keys(securityRequirement).length === 0) return defaultOperationSecurity

    const cookies: HarKeyValue[] = []
    const headers: HarKeyValue[] = []
    const queryString: HarKeyValue[] = []

    // Each security requirement is a different way to authorize, but a single requirement can have multiple schemes so
    // we need to check if we can represent all schemes in a single requirement before using it.
    let canRepresentSecurityRequirement = true

    for (const schemeName of Object.keys(securityRequirement)) {
      const securityScheme = securityDefinitions[schemeName]

      if (!securityScheme) {
        canRepresentSecurityRequirement = false
        break
      }

      if (securityScheme.type === 'apiKey') {
        const value = `<${securityScheme.name}>`

        switch (securityScheme.in) {
          case 'cookie': {
            if (!addOperationSecurityEntry(cookies, securityScheme.name, value)) {
              canRepresentSecurityRequirement = false
            }
            break
          }
          case 'query': {
            if (!addOperationSecurityEntry(queryString, securityScheme.name, value)) {
              canRepresentSecurityRequirement = false
            }
            break
          }
          default: {
            if (!addOperationSecurityHeaderEntry(headers, securityScheme.name, value)) {
              canRepresentSecurityRequirement = false
            }
            break
          }
        }

        if (!canRepresentSecurityRequirement) break

        continue
      }

      if (securityScheme.type === 'oauth2' || securityScheme.type === 'openIdConnect') {
        if (!addOperationSecurityHeaderEntry(headers, 'Authorization', 'Bearer <token>')) {
          canRepresentSecurityRequirement = false
          break
        }

        continue
      }

      if (securityScheme.type === 'basic') {
        if (!addOperationSecurityHeaderEntry(headers, 'Authorization', 'Basic <credentials>')) {
          canRepresentSecurityRequirement = false
          break
        }

        continue
      }

      if ('scheme' in securityScheme) {
        const scheme = securityScheme.scheme.toLowerCase()

        if (scheme === 'basic') {
          if (!addOperationSecurityHeaderEntry(headers, 'Authorization', 'Basic <credentials>')) {
            canRepresentSecurityRequirement = false
            break
          }

          continue
        }

        if (scheme === 'bearer') {
          if (!addOperationSecurityHeaderEntry(headers, 'Authorization', 'Bearer <token>')) {
            canRepresentSecurityRequirement = false
            break
          }

          continue
        }
      }

      canRepresentSecurityRequirement = false

      break
    }

    if (canRepresentSecurityRequirement) return { cookies, headers, queryString }
  }

  return defaultOperationSecurity
}

function addOperationSecurityEntry(
  entries: HarKeyValue[],
  name: string,
  value: string,
  normalizeName: (name: string) => string = (name) => name,
): boolean {
  const normalizedName = normalizeName(name)
  const existingEntry = entries.find((entry) => normalizeName(entry.name) === normalizedName)

  if (!existingEntry) {
    entries.push({ name, value })
    return true
  }

  return existingEntry.value === value
}

function addOperationSecurityHeaderEntry(entries: HarKeyValue[], name: string, value: string) {
  return addOperationSecurityEntry(entries, name, value, (name) => name.toLowerCase())
}

function getOperationRequestBody(
  schema: Schema,
  { operation }: PathItemOperation,
  parameterValues: OperationParameterValue[],
): OperationRequestBody {
  const defaultOperationRequestBody: OperationRequestBody = { headers: [] }

  const formDataParameterValues = parameterValues.filter(({ parameter }) => parameter.in === 'formData')

  if (formDataParameterValues.length > 0) {
    const consumes = getOpenAPIV2OperationConsumes(schema, operation) ?? []
    const hasFile = formDataParameterValues.some(({ parameter }) => 'type' in parameter && parameter.type === 'file')

    const mimeType = hasFile
      ? 'multipart/form-data'
      : (consumes.find(
          (candidate) => candidate === 'application/x-www-form-urlencoded' || candidate === 'multipart/form-data',
        ) ?? 'application/x-www-form-urlencoded')

    const params = formDataParameterValues.flatMap<OperationRequestBodyParam>(({ parameter, value }) => {
      if ('type' in parameter && parameter.type === 'file') {
        return [{ name: parameter.name, fileName: typeof value === 'string' ? value : 'file' }]
      }

      if (isOpenAPIV2ArrayParameter(parameter, 'formData') && Array.isArray(value)) {
        const collectionFormat = getCollectionFormat(parameter)

        if (collectionFormat === 'multi') {
          return value.map((item) => ({ name: parameter.name, value: formatParameterValue(item) }))
        }

        return [{ name: parameter.name, value: serializeArrayWithCollectionFormat(value, collectionFormat) }]
      }

      return [{ name: parameter.name, value: formatParameterValue(value) }]
    })

    return createOperationRequestBody({ mimeType, params })
  }

  const openAPIV2RequestBodyParameter = getOpenAPIV2RequestBodyParameter(operation)

  if (openAPIV2RequestBodyParameter) {
    const mimeType = getOpenAPIV2OperationConsumes(schema, operation)?.[0] ?? 'application/json'
    const value =
      getParameterExampleValueByPrecedence(openAPIV2RequestBodyParameter) ??
      createSchemaExampleValue(openAPIV2RequestBodyParameter.schema)

    return getMediaTypeRequestBody(mimeType, undefined, value)
  }

  const openAPIV3RequestBody = getOpenAPIV3RequestBody(operation)

  if (
    openAPIV3RequestBody &&
    hasDefinedValue(openAPIV3RequestBody, 'content') &&
    isObjectLike(openAPIV3RequestBody.content)
  ) {
    for (const [mimeType, mediaType] of Object.entries(openAPIV3RequestBody.content)) {
      if (!isObjectLike(mediaType)) continue

      const value =
        getSchemaExampleValueByPrecedence(mediaType) ??
        (hasSchemaObject(mediaType) ? createSchemaExampleValue(mediaType.schema) : undefined)

      if (value !== undefined) return getMediaTypeRequestBody(mimeType, mediaType, value)
    }
  }

  return defaultOperationRequestBody
}

function getMediaTypeRequestBody(
  mimeType: string,
  mediaType: Record<string, unknown> | undefined,
  value: unknown,
): OperationRequestBody {
  if (mimeType === 'application/x-www-form-urlencoded' && isObjectLike(value)) {
    return createOperationRequestBody({
      mimeType,
      params: serializeUrlEncodedFormParams(mediaType, value),
    })
  }

  if (mimeType === 'multipart/form-data' && isObjectLike(value)) {
    return createMultipartRequestBody(mediaType, value)
  }

  if (mimeType.includes('json')) {
    return createOperationRequestBody({
      mimeType,
      text: stringifyRequestBodyInline(value),
    })
  }

  if (mimeType.startsWith('text/') || mimeType.includes('xml')) {
    return createOperationRequestBody({
      mimeType,
      text: typeof value === 'string' ? value : formatParameterValue(value, true),
    })
  }

  return createOperationRequestBody({
    mimeType,
    text: typeof value === 'string' ? value : stringifyRequestBodyInline(value),
  })
}

function createOperationRequestBody(postData: NonNullable<HarRequest['postData']>): OperationRequestBody {
  return { headers: [{ name: 'Content-Type', value: postData.mimeType }], postData }
}

function createMultipartRequestBody(
  mediaType: Record<string, unknown> | undefined,
  value: Record<string, unknown>,
): OperationRequestBody {
  return createOperationRequestBody({
    mimeType: 'multipart/form-data',
    params: Object.entries(value).flatMap<OperationRequestBodyParam>(([name, fieldValue]) => {
      return serializeMultipartField(mediaType, name, fieldValue)
    }),
  })
}

function serializeMultipartField(
  mediaType: Record<string, unknown> | undefined,
  name: string,
  fieldValue: unknown,
): OperationRequestBodyParam[] {
  const metadata = getMultipartFieldMetadata(mediaType, name)

  if (metadata.binaryFieldType !== undefined) {
    return createMultipartFileParams(name, fieldValue, metadata)
  }

  if (
    metadata.contentType !== undefined &&
    (metadata.hasExplicitContentType || metadata.contentType === 'application/json')
  ) {
    return [
      {
        name,
        value: serializeRequestBodyFieldValue(fieldValue, metadata.contentType),
        contentType: metadata.contentType,
      },
    ]
  }

  return serializeParameterValue(name, fieldValue, metadata.style, metadata.explode).map((parameter) => ({
    ...parameter,
    ...(metadata.contentType ? { contentType: metadata.contentType } : {}),
  }))
}

function getMultipartFieldMetadata(
  mediaType: Record<string, unknown> | undefined,
  fieldName: string,
): MultipartFieldMetadata {
  const { contentType, explode, style } = getFormFieldEncodingOptions(mediaType, fieldName)

  let resolvedContentType = contentType

  const fieldSchema =
    hasSchemaObject(mediaType) && isSchemaObjectObject(mediaType.schema)
      ? getProperties(mediaType.schema)[fieldName]
      : undefined

  const binaryFieldType = getMultipartBinaryFieldType(fieldSchema)
  const hasExplicitContentType = contentType !== undefined

  if (!hasExplicitContentType && fieldSchema) {
    if (binaryFieldType !== undefined) {
      resolvedContentType = 'application/octet-stream'
    } else if (isSchemaObjectObject(fieldSchema)) {
      resolvedContentType = 'application/json'
    } else if (isArraySchemaType(fieldSchema.type)) {
      const itemsSchema = 'items' in fieldSchema && isSchemaObject(fieldSchema.items) ? fieldSchema.items : undefined
      resolvedContentType = itemsSchema && isSchemaObjectObject(itemsSchema) ? 'application/json' : 'text/plain'
    } else {
      resolvedContentType = 'text/plain'
    }
  }

  return {
    binaryFieldType: binaryFieldType,
    contentType: resolvedContentType,
    explode,
    hasExplicitBinaryFileName: hasValidBinaryFileNameExample(fieldSchema),
    hasExplicitContentType,
    style,
  }
}

function getMultipartBinaryFieldType(schema: SchemaObject | undefined): MultipartBinaryFieldType | undefined {
  if (!schema) return undefined

  const format = getSchemaFormat(schema)
  if (format === 'binary' || format === 'base64') return 'single'

  if (isArraySchemaType(schema.type) && 'items' in schema && isSchemaObject(schema.items)) {
    const itemFormat = getSchemaFormat(schema.items)
    if (itemFormat === 'binary' || itemFormat === 'base64') return 'array'
  }

  return undefined
}

// Use only explicit schema-provided example-like values for file names.
function hasValidBinaryFileNameExample(schema: SchemaObject | undefined): boolean {
  if (!schema) return false

  if (getSchemaExampleValueByPrecedence(schema) !== undefined) return true

  if (isArraySchemaType(schema.type) && 'items' in schema && isSchemaObject(schema.items)) {
    return getSchemaExampleValueByPrecedence(schema.items) !== undefined
  }

  return false
}

function createMultipartFileParams(
  name: string,
  fieldValue: unknown,
  metadata: MultipartFieldMetadata,
): OperationRequestBodyParam[] {
  if (!metadata.binaryFieldType) return []

  const fileValues =
    metadata.binaryFieldType === 'array'
      ? isArray(fieldValue)
        ? fieldValue
        : [fieldValue]
      : [isArray(fieldValue) ? (fieldValue[0] ?? 'file') : fieldValue]

  return fileValues.map((fileValue) => ({
    name,
    fileName: typeof fileValue === 'string' && metadata.hasExplicitBinaryFileName ? fileValue : 'file',
    ...(metadata.contentType ? { contentType: metadata.contentType } : {}),
  }))
}

// https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md#request
export interface HarRequest {
  method: string
  url: string
  httpVersion: 'HTTP/1.1'
  cookies: HarKeyValue[]
  headers: HarKeyValue[]
  queryString: HarKeyValue[]
  postData?:
    | {
        mimeType: string
        text: string
        params?: never
      }
    | {
        mimeType: string
        params: {
          name: string
          value?: string
          fileName?: string
          contentType?: string
        }[]
        text?: never
      }
  headersSize: number
  bodySize: number
}

interface HarKeyValue {
  name: string
  value: string
}

interface OperationParameterValue {
  parameter: Parameter
  value: unknown
}

interface OperationNonQueryParameters {
  cookies: HarKeyValue[]
  headers: HarKeyValue[]
  pathParameters: Record<string, string>
}

interface OperationSecurity {
  cookies: HarKeyValue[]
  headers: HarKeyValue[]
  queryString: HarKeyValue[]
}

interface OperationRequestBody {
  headers: HarKeyValue[]
  postData?: HarRequest['postData']
}

interface OperationRequestBodyParam {
  contentType?: string
  fileName?: string
  name: string
  value?: string
}

interface MultipartFieldMetadata {
  binaryFieldType: MultipartBinaryFieldType | undefined
  contentType: string | undefined
  explode: boolean
  hasExplicitBinaryFileName: boolean
  // Defines if `encoding.<field>.contentType` is explicitly set.
  hasExplicitContentType: boolean
  style: ParameterValueStyle
}

type MultipartBinaryFieldType = 'single' | 'array'
