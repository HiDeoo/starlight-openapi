import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import type { Parameter } from './parameter'
import { hasDefinedValue, isObjectLike } from './predicate'

export function getNullable(schemaObject: SchemaObject) {
  return 'nullable' in schemaObject ? (schemaObject as OpenAPIV3.NonArraySchemaObject).nullable : undefined
}

export function isParameterWithSchemaObject(parameter: Parameter): parameter is Parameter & { schema: SchemaObject } {
  return hasSchemaObject(parameter)
}

export function isSchemaObjectObject(schemaObject: SchemaObject): schemaObject is SchemaObjectObject {
  return (
    schemaObject.type === 'object' ||
    'properties' in schemaObject ||
    ('oneOf' in schemaObject && (schemaObject.oneOf as SchemaObject[]).some(isSchemaObjectObject)) ||
    ('anyOf' in schemaObject && (schemaObject.anyOf as SchemaObject[]).some(isSchemaObjectObject)) ||
    ('allOf' in schemaObject && (schemaObject.allOf as SchemaObject[]).some(isSchemaObjectObject))
  )
}

export function isSchemaObjectAllOf(schemaObject: SchemaObject): schemaObject is SchemaObject {
  return schemaObject.type === 'object' || 'allOf' in schemaObject
}

export function getProperties(schemaObject: SchemaObject): Properties {
  return (schemaObject.properties ?? {}) as Properties
}

export function isAdditionalPropertiesWithSchemaObject(
  additionalProperties: SchemaObject['additionalProperties'],
): additionalProperties is SchemaObject {
  return isObjectLike(additionalProperties)
}

export function isSchemaObject(schemaObject: unknown): schemaObject is SchemaObject {
  return isObjectLike(schemaObject)
}

export function hasSchemaObject(value: unknown): value is { schema: SchemaObject } {
  return hasDefinedValue(value, 'schema') && isObjectLike(value.schema) && isSchemaObject(value.schema)
}

export function isArraySchemaType(type: SchemaObject['type']) {
  return type === 'array' || (Array.isArray(type) && type.includes('array'))
}

export function getSchemaObjects(schemaObject: SchemaObject): SchemaObjects | undefined {
  if (schemaObject.oneOf && schemaObject.oneOf.length > 0) {
    const { oneOf, ...otherProperties } = schemaObject

    return {
      schemaObjects: normalizeSchemaObjects(oneOf as SchemaObject[], otherProperties),
      type: 'oneOf',
    }
  } else if (schemaObject.anyOf && schemaObject.anyOf.length > 0) {
    const { anyOf, ...otherProperties } = schemaObject

    return {
      schemaObjects: normalizeSchemaObjects(anyOf as SchemaObject[], otherProperties),
      type: 'anyOf',
    }
  }

  return
}

export function getSchemaObjectItems(schemaObject: unknown): SchemaObject | undefined {
  if (!isObjectLike(schemaObject) || !('items' in schemaObject)) return

  return isSchemaObject(schemaObject['items']) ? schemaObject['items'] : undefined
}

export function getRecursiveSchemaObject(
  schemaObject: SchemaObject,
  parents: SchemaObject[],
): SchemaObject | undefined {
  const items = getSchemaObjectItems(schemaObject)

  return parents.find((parent) => parent === schemaObject || parent === items)
}

export function getRecursiveSchemaObjectItems(
  schemaObject: SchemaObject,
  parents: SchemaObject[],
): SchemaObject | undefined {
  const items = getSchemaObjectItems(schemaObject)

  return items && parents.includes(items) ? items : undefined
}

export function getSchemaFormat(schema: SchemaObject) {
  return hasDefinedValue(schema, 'format') && typeof schema.format === 'string' ? schema.format : undefined
}

export function getSchemaObjectRequired(schemaObject: SchemaObject): string[] | undefined {
  const required = mergeRequired(
    schemaObject.required,
    'allOf' in schemaObject && Array.isArray(schemaObject.allOf)
      ? schemaObject.allOf.filter(isSchemaObject).flatMap((allOfSchemaObject) => allOfSchemaObject.required ?? [])
      : undefined,
  )

  return required
}

function normalizeSchemaObjects(schemaObjects: SchemaObject[], parentSchemaObject: SchemaObject) {
  return schemaObjects.map((schemaObjectsObject) => {
    const parentIsObject = isSchemaObjectObject(parentSchemaObject)
    const schemaObjectIsObject = isSchemaObjectObject(schemaObjectsObject)
    const shouldNormalize = schemaObjectsObject.type === undefined || (parentIsObject && schemaObjectIsObject)

    if (!shouldNormalize) return schemaObjectsObject

    if (parentIsObject && schemaObjectIsObject) {
      const properties = { ...getProperties(parentSchemaObject), ...getProperties(schemaObjectsObject) }
      const required = mergeRequired(
        getSchemaObjectRequired(parentSchemaObject),
        getSchemaObjectRequired(schemaObjectsObject),
      )

      const normalizedSchemaObject = {
        ...parentSchemaObject,
        ...schemaObjectsObject,
        ...(Object.keys(properties).length > 0 ? { properties } : {}),
        ...(required ? { required } : {}),
      } as SchemaObject

      if (!normalizedSchemaObject.type && normalizedSchemaObject.properties) {
        normalizedSchemaObject.type = 'object'
      }

      return normalizedSchemaObject
    }

    const normalizedSchemaObject = {
      ...parentSchemaObject,
      ...schemaObjectsObject,
    } as SchemaObject

    if (!normalizedSchemaObject.type && normalizedSchemaObject.properties) {
      normalizedSchemaObject.type = 'object'
    }

    return normalizedSchemaObject
  })
}

function mergeRequired(...requiredValues: (string[] | undefined)[]): string[] | undefined {
  const required = requiredValues.flatMap((value) => value ?? [])

  return required.length > 0 ? [...new Set(required)] : undefined
}

export type SchemaObject = OpenAPIV2.SchemaObject | OpenAPIV3.NonArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject
export type Properties = Record<string, SchemaObject>
export type Discriminator = SchemaObject['discriminator']

export interface SchemaObjects {
  schemaObjects: SchemaObject[]
  type: 'anyOf' | 'oneOf'
}

type SchemaObjectObject =
  | (SchemaObject & { type: 'object' })
  | (SchemaObject & { properties: Properties })
  | (SchemaObject & { oneOf: SchemaObject[] })
  | (SchemaObject & { anyOf: SchemaObject[] })
  | (SchemaObject & { allOf: SchemaObject[] })
