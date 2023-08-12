import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import type { Parameter } from './parameter'

export function getNullable(schemaObject: SchemaObject) {
  return 'nullable' in schemaObject ? (schemaObject as OpenAPIV3.NonArraySchemaObject).nullable : undefined
}

export function isParameterWithSchemaObject(parameter: Parameter): parameter is Parameter & { schema: SchemaObject } {
  return 'schema' in parameter && typeof parameter.schema === 'object'
}

export type SchemaObject = OpenAPIV2.SchemaObject | OpenAPIV3.NonArraySchemaObject | OpenAPIV3_1.NonArraySchemaObject
