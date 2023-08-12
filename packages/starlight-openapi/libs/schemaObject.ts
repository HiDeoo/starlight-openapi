import type { IJsonSchema, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import type { Parameter } from './parameter'

export function getNullable(schemaObject: SchemaObject) {
  return 'nullable' in schemaObject ? (schemaObject as OpenAPIV3.NonArraySchemaObject).nullable : undefined
}

export function isParameterWithSchemaObject(parameter: Parameter): parameter is Parameter & { schema: SchemaObject } {
  return 'schema' in parameter && typeof parameter.schema === 'object'
}

export function isSchemaObjectObject(schemaObject: SchemaObject): schemaObject is SchemaObject {
  return schemaObject.type === 'object' || 'allOf' in schemaObject
}

export function getProperties(schemaObject: SchemaObject): Properties {
  return (schemaObject.properties ?? {}) as Properties
}

export function isAdditionalPropertiesWithSchemaObject(
  additionalProperties: SchemaObject['additionalProperties'],
): additionalProperties is SchemaObject {
  return typeof additionalProperties === 'object'
}

export function isSchemaObject(
  schemaObject: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject | IJsonSchema | undefined,
): schemaObject is SchemaObject {
  return typeof schemaObject === 'object'
}

export function getSchemaObjects(schemaObject: SchemaObject): SchemaObjects | undefined {
  if (schemaObject.oneOf && schemaObject.oneOf.length > 0) {
    return {
      schemaObjects: schemaObject.oneOf as SchemaObject[],
      type: 'oneOf',
    }
  } else if (schemaObject.anyOf && schemaObject.anyOf.length > 0) {
    return {
      schemaObjects: schemaObject.anyOf as SchemaObject[],
      type: 'anyOf',
    }
  }

  return
}

export type SchemaObject = OpenAPIV2.SchemaObject | OpenAPIV3.NonArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject
export type Properties = Record<string, SchemaObject>

export interface SchemaObjects {
  schemaObjects: SchemaObject[]
  type: 'anyOf' | 'oneOf'
}
