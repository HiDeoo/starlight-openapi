import type { Parameter } from './parameter'
import { hasDefinedValue, isObjectLike } from './predicate'
import {
  getProperties,
  getSchemaFormat,
  getSchemaObjects,
  hasSchemaObject,
  isAdditionalPropertiesWithSchemaObject,
  isArraySchemaType,
  isParameterWithSchemaObject,
  isSchemaObject,
  isSchemaObjectObject,
  type SchemaObject,
} from './schemaObject'

const schemaExampleValuePrecedence = ['const', 'enum', 'default', 'example', 'examples'] as const
const parameterExampleValuePrecedence = ['example', 'examples', 'default', 'const', 'enum'] as const

export function createSchemaExampleValue(rootSchema: SchemaObject): unknown {
  const seen = new WeakSet<SchemaObject>()

  function visit(schema: SchemaObject): unknown {
    if (seen.has(schema)) {
      if (isArraySchemaType(schema.type)) return []
      if (isSchemaObjectObject(schema)) return {}

      return createPrimitiveExampleValue(schema.type, getSchemaFormat(schema))
    }

    seen.add(schema)

    try {
      // Use the first defined value based on an explicit order of precedence.
      const value = getSchemaExampleValueByPrecedence(schema)
      if (value !== undefined) return value

      // For `oneOf` and `anyOf`, use the schema object with the highest fallback priority based on an explicit order
      // of precedence.
      const otherSchemaObjects = getSchemaObjects(schema)?.schemaObjects
      if (otherSchemaObjects) {
        const [firstSchemaObject, ...remainingSchemaObjects] = otherSchemaObjects

        if (firstSchemaObject) {
          let selectedSchemaObject = firstSchemaObject
          let higherPriority = getSchemaExamplePriority(firstSchemaObject)

          for (const remainingSchemaObject of remainingSchemaObjects) {
            const priority = getSchemaExamplePriority(remainingSchemaObject)

            if (priority > higherPriority) {
              selectedSchemaObject = remainingSchemaObject
              higherPriority = priority
            }
          }

          return visit(selectedSchemaObject)
        }
      }

      // For `allOf`, try to merge all schema objects, and fall back to the first defined value.
      if ('allOf' in schema && Array.isArray(schema.allOf) && schema.allOf.length > 0) {
        const otherSchemaObjects = schema.allOf.filter(isSchemaObject)
        const objectValues: Record<string, unknown>[] = []
        let firstValue: unknown = undefined

        for (const otherSchemaObject of otherSchemaObjects) {
          const value = visit(otherSchemaObject)
          if (firstValue === undefined && value !== undefined) firstValue = value

          if (isSchemaObjectObject(otherSchemaObject) && isObjectLike(value) && !Array.isArray(value)) {
            objectValues.push(value)
          }
        }

        if (objectValues.length > 0) return Object.assign({}, ...objectValues)
        if (firstValue !== undefined) return firstValue
      }

      // If the schema is an object, skip `readOnly` properties and recurse in all remaining properties.
      if (isSchemaObjectObject(schema)) {
        const value: Record<string, unknown> = {}

        for (const [propertyName, propertySchema] of Object.entries(getProperties(schema))) {
          if (hasDefinedValue(propertySchema, 'readOnly') && propertySchema.readOnly === true) continue

          value[propertyName] = visit(propertySchema)
        }

        if (Object.keys(value).length > 0) return value

        if (isAdditionalPropertiesWithSchemaObject(schema.additionalProperties)) {
          return { additionalProperty: visit(schema.additionalProperties) }
        }

        return {}
      }

      // For array types, use the first item if possible and fall back to an array of primitive values.
      if (isArraySchemaType(schema.type)) {
        return 'items' in schema && isSchemaObject(schema.items) ? [visit(schema.items)] : ['example']
      }

      return createPrimitiveExampleValue(schema.type, getSchemaFormat(schema))
    } finally {
      seen.delete(schema)
    }
  }

  return visit(rootSchema)
}

export function createParameterExampleValue(parameter: Parameter): unknown {
  // When using OpenAPI v3 `content` to define a parameter, use the first media type's `example`, then `examples`, then
  // fall back to that media type's schema.
  if (hasDefinedValue(parameter, 'content') && isObjectLike(parameter.content)) {
    const [firstMediaType] = Object.values(parameter.content)

    if (hasDefinedValue(firstMediaType, 'example')) return firstMediaType.example

    if (hasDefinedValue(firstMediaType, 'examples')) {
      const exampleValue = getFirstExampleValue(firstMediaType.examples)
      if (exampleValue !== undefined) return exampleValue
    }

    if (hasSchemaObject(firstMediaType)) return createSchemaExampleValue(firstMediaType.schema)
  }

  // Handle parameters defined with a schema object.
  if (isParameterWithSchemaObject(parameter)) return createSchemaExampleValue(parameter.schema)

  // If no `content` or schema-based value is available, use the parameter primitive type to create a fallback value.
  if ('type' in parameter) {
    return createPrimitiveExampleValue(parameter.type)
  }

  return 'example'
}

export function getParameterExampleValueByPrecedence(value: unknown): unknown {
  return getExampleValueByPrecedence(value, parameterExampleValuePrecedence)
}

export function getSchemaExampleValueByPrecedence(value: unknown): unknown {
  return getExampleValueByPrecedence(value, schemaExampleValuePrecedence)
}

function createPrimitiveExampleValue(primitiveType: unknown, format?: string): unknown {
  const type =
    typeof primitiveType === 'string'
      ? primitiveType
      : Array.isArray(primitiveType) && primitiveType.every((item): item is string => typeof item === 'string')
        ? primitiveType[0]
        : undefined

  switch (type) {
    case 'boolean': {
      return true
    }
    case 'integer':
    case 'number': {
      return 1
    }
    case 'file': {
      return 'file'
    }
    case 'string': {
      switch (format) {
        case 'binary': {
          return 'binary'
        }
        case 'date': {
          return '2026-04-15'
        }
        case 'date-time': {
          return '2026-04-15T12:00:00Z'
        }
        case 'email': {
          return 'hello@example.com'
        }
        case 'uri': {
          return 'https://example.com'
        }
        case 'uuid': {
          return '2489E9AD-2EE2-8E00-8EC9-32D5F69181C0'
        }
      }
    }
  }

  return 'example'
}

function getExampleValueByPrecedence(value: unknown, precedence: readonly ExampleValuePrecedence[]): unknown {
  for (const field of precedence) {
    switch (field) {
      case 'const': {
        if (hasDefinedValue(value, 'const')) return value.const
        break
      }
      case 'default': {
        if (hasDefinedValue(value, 'default')) return value.default
        break
      }
      case 'enum': {
        if (hasDefinedValue(value, 'enum') && Array.isArray(value.enum) && value.enum.length > 0) {
          return value.enum[0]
        }
        break
      }
      case 'example': {
        if (hasDefinedValue(value, 'example')) return value.example
        break
      }
      case 'examples': {
        if (hasDefinedValue(value, 'examples')) {
          const exampleValue = getFirstExampleValue(value.examples)
          if (exampleValue !== undefined) return exampleValue
        }
        break
      }
    }
  }

  return undefined
}

function getFirstExampleValue(examples: unknown): unknown {
  if (!isObjectLike(examples)) return undefined

  const [firstExample] = Object.values(examples)

  return hasDefinedValue(firstExample, 'value') ? firstExample.value : firstExample
}

function getSchemaExamplePriority(schema: SchemaObject): number {
  if (getSchemaExampleValueByPrecedence(schema) !== undefined) return 4
  if ('allOf' in schema && Array.isArray(schema.allOf) && schema.allOf.length > 0) return 3
  if (isSchemaObjectObject(schema)) return 2
  if (isArraySchemaType(schema.type)) return 1
  return 0
}

type ExampleValuePrecedence =
  | (typeof parameterExampleValuePrecedence)[number]
  | (typeof schemaExampleValuePrecedence)[number]
