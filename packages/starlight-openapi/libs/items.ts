import type { OpenAPIV2 } from 'openapi-types'

import { hasDefinedValue } from './predicate'
import type { SchemaObject } from './schemaObject'

export function isOpenAPIV2Items(items: unknown): items is Items {
  return hasDefinedValue(items, 'type') && !('schema' in items)
}

export function getType(items: Items, seen = new WeakSet<object>()): string | undefined {
  if (seen.has(items)) return 'recursive'
  seen.add(items)

  const types = Array.isArray(items.type) ? items.type : items.type ? [items.type] : []

  if (types.includes('array') && items.items) {
    const arrayType = getType(items.items, seen)
    const type = arrayType ? `Array<${arrayType}>` : 'Array'
    const otherTypes = types.filter((type) => type !== 'array')

    return [type, ...otherTypes].join(' | ')
  }

  return Array.isArray(items.type) ? items.type.join(' | ') : items.type
}

export function getBound(items: Items, type: 'maximum' | 'minimum'): string | undefined {
  const exclusive = items[type === 'maximum' ? 'exclusiveMaximum' : 'exclusiveMinimum']
  const sign = type === 'maximum' ? '<' : '>'
  const value = items[type]

  if (typeof exclusive === 'number') {
    return `${sign} ${exclusive}`
  } else if (value) {
    return `${sign}${exclusive ? '' : '='} ${value}`
  }

  return
}

export type Items = Omit<OpenAPIV2.ItemsObject, 'exclusiveMaximum' | 'exclusiveMinimum' | 'type'> & {
  const?: unknown
  exclusiveMaximum?: boolean | number
  exclusiveMinimum?: boolean | number
  items?: SchemaObject
  type?: string | string[]
}
