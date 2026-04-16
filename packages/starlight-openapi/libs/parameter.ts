import type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'
import { parseTemplate, type PrimitiveValue } from 'url-template'

import type { Header } from './header'
import { isObjectLike } from './predicate'

const ignoredHeaderParameters = new Set(['accept', 'authorization', 'content-type'])

// https://datatracker.ietf.org/doc/html/rfc3986#section-2.2
const reservedUriCharacters = ":/?#[]@!$&'()*+,;="

const collectionFormatSeparators = {
  csv: ',',
  pipes: '|',
  ssv: ' ',
  tsv: '\t',
}

export function getParametersByLocation(
  operationParameters: OpenAPI.Parameters | undefined,
  pathItemParameters: OpenAPI.Parameters | undefined,
) {
  const parametersByLocation = new Map<string, Parameters>()

  for (const parameter of [...(pathItemParameters ?? []), ...(operationParameters ?? [])]) {
    if (!isParameter(parameter) || isIgnoredParameter(parameter)) {
      continue
    }

    const id = getParameterId(parameter)
    const parametersById: Parameters = parametersByLocation.get(parameter.in) ?? new Map<ParameterId, Parameter>()

    parametersById.set(id, parameter)

    parametersByLocation.set(parameter.in, parametersById)
  }

  return new Map(
    [...parametersByLocation].toSorted((locationA, locationB) =>
      locationA[0] === 'path' ? -1 : locationB[0] === 'path' ? 1 : 0,
    ),
  )
}

export function isHeaderParameter(parameter: Header): parameter is Omit<Parameter, 'type'> {
  return isObjectLike(parameter) && !('name' in parameter) && !('in' in parameter)
}

export function formatQueryParameterExample(parameter: Parameter, value: unknown): string {
  const explode = typeof parameter.explode === 'boolean' ? parameter.explode : undefined

  switch (parameter.style) {
    case 'deepObject': {
      if (!isObjectLike(value) || !explode) return formatParameterValue(value, true)

      return `?${Object.entries(value)
        .map(([key, entryValue]) => `${parameter.name}[${key}]=${String(entryValue)}`)
        .join('&')}`
    }
    case 'form': {
      return expandQueryTemplate(parameter.name, value, explode)
    }
    case 'pipeDelimited':
    case 'spaceDelimited': {
      if (!Array.isArray(value)) return formatParameterValue(value, true)

      return explode
        ? expandQueryTemplate(parameter.name, value, explode)
        : `?${parameter.name}=${value.join(parameter.style === 'pipeDelimited' ? '|' : '%20')}`
    }
    default: {
      return formatParameterValue(value, true)
    }
  }
}

export function formatParameterValue(value: unknown, pretty = false): string {
  switch (typeof value) {
    case 'string': {
      return value
    }
    case 'number':
    case 'boolean': {
      return value.toString()
    }
    case 'undefined': {
      return ''
    }
    default: {
      return JSON.stringify(value, null, pretty ? 2 : undefined)
    }
  }
}

function expandQueryTemplate(name: string, value: unknown, explode: boolean | undefined): string {
  // https://datatracker.ietf.org/doc/html/rfc6570#section-3.2.8
  return parseTemplate(`{?${name}${explode ? '*' : ''}}`).expand({
    [name]: value as PrimitiveValue,
  })
}

export function serializeQueryParameter(parameter: Parameter, value: unknown): SerializedQueryParameter {
  const allowReserved =
    'allowReserved' in parameter && typeof parameter.allowReserved === 'boolean' ? parameter.allowReserved : false

  if (isOpenAPIV2ArrayParameter(parameter, 'query') && Array.isArray(value)) {
    const collectionFormat = getCollectionFormat(parameter)

    if (collectionFormat === 'multi') {
      const entries = value.map((item) => ({ name: parameter.name, value: formatParameterValue(item) }))

      return {
        encodedEntries: entries.map(({ name, value }) => {
          return `${serializeUriComponent(name)}=${serializeUriComponent(value, { allowReserved })}`
        }),
        entries,
      }
    }

    return {
      encodedEntries: [
        `${serializeUriComponent(parameter.name)}=${serializeEncodedArrayWithCollectionFormat(value, collectionFormat, {
          allowReserved,
        })}`,
      ],
      entries: [{ name: parameter.name, value: serializeArrayWithCollectionFormat(value, collectionFormat) }],
    }
  }

  const style = getParameterValueStyle(parameter.style, 'form')
  const explode = getParameterExplode(parameter.explode, style === 'form')

  return {
    encodedEntries: serializeEncodedParameterValue(parameter.name, value, style, explode, { allowReserved }),
    entries: serializeParameterValue(parameter.name, value, style, explode),
  }
}

export function serializeUriComponent(
  value: string,
  options: { allowReserved?: boolean; useFormSpaceEncoding?: boolean } = {},
): string {
  const { allowReserved = false, useFormSpaceEncoding = false } = options

  let encodedValue = encodeURIComponent(value)

  if (useFormSpaceEncoding) encodedValue = encodedValue.replaceAll('%20', '+')
  if (!allowReserved) return encodedValue

  for (const character of reservedUriCharacters) {
    encodedValue = encodedValue.replaceAll(encodeURIComponent(character), character)
  }

  return encodedValue
}

export function serializeCookieParameter(parameter: Parameter, value: unknown): SerializedParameterValue[] {
  const style = getParameterValueStyle(parameter.style, 'form')
  const explode = getParameterExplode(parameter.explode, true)

  return serializeParameterValue(parameter.name, value, style, explode)
}

export function serializeHeaderParameter(parameter: Parameter, value: unknown): SerializedParameterValue[] {
  if (isOpenAPIV2ArrayParameter(parameter, 'header') && Array.isArray(value)) {
    return [
      {
        name: parameter.name,
        value: serializeArrayWithCollectionFormat(value, parameter.collectionFormat ?? 'csv'),
      },
    ]
  }

  const explode = getParameterExplode(parameter.explode, false)

  return [{ name: parameter.name, value: serializeSimpleStyleHeaderValue(value, explode) }]
}

function serializeSimpleStyleHeaderValue(value: unknown, explode: boolean): string {
  if (Array.isArray(value)) return value.map(stringifyValue).join(',')

  if (isObjectLike(value)) {
    const entries = Object.entries(value)

    return explode
      ? entries.map(([name, entryValue]) => `${name}=${stringifyValue(entryValue)}`).join(',')
      : entries.flatMap(([name, entryValue]) => [name, stringifyValue(entryValue)]).join(',')
  }

  return stringifyValue(value)
}

export function serializePathParameter(parameter: Parameter, value: unknown): string {
  if (isOpenAPIV2ArrayParameter(parameter, 'path') && Array.isArray(value)) {
    return serializeEncodedArrayWithCollectionFormat(value, parameter.collectionFormat ?? 'csv')
  }

  const style = typeof parameter.style === 'string' ? parameter.style : 'simple'
  const explode = getParameterExplode(parameter.explode, false)

  switch (style) {
    case 'label': {
      return serializeLabelStylePathParameter(value, explode)
    }
    case 'matrix': {
      return serializeMatrixStylePathParameter(parameter.name, value, explode)
    }
    default: {
      return serializeSimpleStylePathParameter(value, explode)
    }
  }
}

export function serializeParameterValue(
  name: string,
  value: unknown,
  style: ParameterValueStyle,
  explode: boolean,
): SerializedParameterValue[] {
  return serializeParameterEntries(name, value, style, explode, {
    serializeName: (value) => value,
    serializeValue: stringifyValue,
    spaceDelimitedSeparator: ' ',
  })
}

export function serializeEncodedParameterValue(
  name: string,
  value: unknown,
  style: ParameterValueStyle,
  explode: boolean,
  options: { allowReserved?: boolean; useFormSpaceEncoding?: boolean } = {},
): string[] {
  const { allowReserved = false, useFormSpaceEncoding = false } = options

  return serializeParameterEntries(name, value, style, explode, {
    serializeName: (value) => serializeUriComponent(value, { useFormSpaceEncoding }),
    serializeValue: (value) =>
      serializeUriComponent(formatParameterValue(value), { allowReserved, useFormSpaceEncoding }),
    spaceDelimitedSeparator: '%20',
  }).map(({ name, value }) => `${name}=${value}`)
}

function serializeParameterEntries(
  name: string,
  value: unknown,
  style: ParameterValueStyle,
  explode: boolean,
  options: {
    serializeName: (value: string) => string
    serializeValue: (value: unknown) => string
    spaceDelimitedSeparator: string
  },
): SerializedParameterValue[] {
  const { serializeName, serializeValue, spaceDelimitedSeparator } = options

  switch (style) {
    case 'deepObject': {
      if (!isObjectLike(value) || Array.isArray(value) || !explode) {
        return [{ name: serializeName(name), value: serializeValue(value) }]
      }

      return Object.entries(value).map(([key, entryValue]) => ({
        name: `${serializeName(name)}[${serializeName(key)}]`,
        value: serializeValue(entryValue),
      }))
    }
    case 'form': {
      if (Array.isArray(value)) {
        return explode
          ? value.map((item) => ({ name: serializeName(name), value: serializeValue(item) }))
          : [{ name: serializeName(name), value: value.map(serializeValue).join(',') }]
      }

      if (isObjectLike(value)) {
        const entries = Object.entries(value)

        return explode
          ? entries.map(([entryName, entryValue]) => ({
              name: serializeName(entryName),
              value: serializeValue(entryValue),
            }))
          : [
              {
                name: serializeName(name),
                value: entries
                  .flatMap(([entryName, entryValue]) => [serializeName(entryName), serializeValue(entryValue)])
                  .join(','),
              },
            ]
      }

      return [{ name: serializeName(name), value: serializeValue(value) }]
    }
    case 'pipeDelimited':
    case 'spaceDelimited': {
      if (!Array.isArray(value)) return [{ name: serializeName(name), value: serializeValue(value) }]

      return explode
        ? value.map((item) => ({ name: serializeName(name), value: serializeValue(item) }))
        : [
            {
              name: serializeName(name),
              value: value.map(serializeValue).join(style === 'pipeDelimited' ? '|' : spaceDelimitedSeparator),
            },
          ]
    }
  }
}

function serializeSimpleStylePathParameter(value: unknown, explode: boolean): string {
  if (Array.isArray(value)) return value.map(serializePathValue).join(',')

  if (isObjectLike(value)) {
    const entries = Object.entries(value)

    return explode
      ? entries.map(([name, entryValue]) => `${serializePathName(name)}=${serializePathValue(entryValue)}`).join(',')
      : entries.flatMap(([name, entryValue]) => [serializePathName(name), serializePathValue(entryValue)]).join(',')
  }

  return serializePathValue(value)
}

function serializeLabelStylePathParameter(value: unknown, explode: boolean): string {
  if (Array.isArray(value)) return `.${value.map(serializePathValue).join(explode ? '.' : ',')}`

  if (isObjectLike(value)) {
    const entries = Object.entries(value)

    return explode
      ? `.${entries.map(([name, entryValue]) => `${serializePathName(name)}=${serializePathValue(entryValue)}`).join('.')}`
      : `.${entries.flatMap(([name, entryValue]) => [serializePathName(name), serializePathValue(entryValue)]).join(',')}`
  }

  return `.${serializePathValue(value)}`
}

function serializeMatrixStylePathParameter(parameterName: string, value: unknown, explode: boolean): string {
  if (Array.isArray(value)) {
    return explode
      ? value.map((item) => `;${serializePathName(parameterName)}=${serializePathValue(item)}`).join('')
      : `;${serializePathName(parameterName)}=${value.map(serializePathValue).join(',')}`
  }

  if (isObjectLike(value)) {
    const entries = Object.entries(value)

    return explode
      ? entries.map(([name, entryValue]) => `;${serializePathName(name)}=${serializePathValue(entryValue)}`).join('')
      : `;${serializePathName(parameterName)}=${entries
          .flatMap(([name, entryValue]) => [serializePathName(name), serializePathValue(entryValue)])
          .join(',')}`
  }

  return `;${serializePathName(parameterName)}=${serializePathValue(value)}`
}

export function serializeArrayWithCollectionFormat(value: unknown[], collectionFormat: string | undefined): string {
  return value.map(stringifyValue).join(getCollectionFormatSeparator(collectionFormat))
}

function serializeEncodedArrayWithCollectionFormat(
  value: unknown[],
  collectionFormat: string | undefined,
  options: { allowReserved?: boolean } = {},
): string {
  const { allowReserved = false } = options

  const separator = getCollectionFormatSeparator(collectionFormat)
  const encodedSeparator = separator === ' ' ? '%20' : separator === '\t' ? '%09' : separator

  return value
    .map((item) => serializeUriComponent(formatParameterValue(item), { allowReserved }))
    .join(encodedSeparator)
}

function serializePathName(value: string): string {
  return serializeUriComponent(value)
}
function serializePathValue(value: unknown): string {
  return serializeUriComponent(formatParameterValue(value))
}

function stringifyValue(value: unknown): string {
  return formatParameterValue(value)
}

function getParameterId(parameter: Parameter): ParameterId {
  return `${parameter.name}:${parameter.in}`
}

function isParameter(parameter: OpenAPI.Parameter): parameter is Parameter {
  return isObjectLike(parameter) && !('$ref' in parameter)
}

function isIgnoredParameter(parameter: Parameter): boolean {
  return (
    parameter.in === 'body' || (parameter.in === 'header' && ignoredHeaderParameters.has(parameter.name.toLowerCase()))
  )
}

export function isOpenAPIV2ArrayParameter(
  parameter: Parameter,
  location: 'formData' | 'header' | 'path' | 'query',
): parameter is OpenAPIV2.GeneralParameterObject {
  return 'in' in parameter && parameter.in === location && 'type' in parameter && parameter.type === 'array'
}

export function getParameterValueStyle(style: unknown, fallback: ParameterValueStyle): ParameterValueStyle {
  return isParameterValueStyle(style) ? style : fallback
}

function isParameterValueStyle(style: unknown): style is ParameterValueStyle {
  return style === 'deepObject' || style === 'form' || style === 'pipeDelimited' || style === 'spaceDelimited'
}

function getParameterExplode(explode: unknown, fallback: boolean): boolean {
  return typeof explode === 'boolean' ? explode : fallback
}

export function getCollectionFormat(parameter: OpenAPIV2.GeneralParameterObject): CollectionFormat {
  switch (parameter.collectionFormat) {
    case 'multi':
    case 'pipes':
    case 'ssv':
    case 'tsv': {
      return parameter.collectionFormat
    }
    default: {
      return 'csv'
    }
  }
}

export function getCollectionFormatSeparator(collectionFormat: string | undefined): string {
  return collectionFormat && isCollectionFormatSeparatorKey(collectionFormat)
    ? collectionFormatSeparators[collectionFormat]
    : ','
}

function isCollectionFormatSeparatorKey(value: string): value is keyof typeof collectionFormatSeparators {
  return value in collectionFormatSeparators
}

export type Parameter = OpenAPIV2.Parameter | OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject
type ParameterId = `${Parameter['name']}:${Parameter['in']}`
type Parameters = Map<ParameterId, Parameter>

export type CollectionFormat = 'csv' | 'multi' | 'pipes' | 'ssv' | 'tsv'
export type ParameterValueStyle = 'deepObject' | 'form' | 'pipeDelimited' | 'spaceDelimited'

export interface SerializedParameterValue {
  name: string
  value: string
}

export interface SerializedQueryParameter {
  // Encoded `name=value` fragments used to build the final URL.
  encodedEntries: string[]
  // Non-encoded query entries, used for building HAR requests.
  entries: SerializedParameterValue[]
}
