import type { OpenAPIV2 } from 'openapi-types'

export function isOpenAPIV2Items(items: unknown): items is Items {
  return (
    items !== undefined && typeof items === 'object' && 'type' in (items as Items) && !('schema' in (items as Items))
  )
}

export type Items = Omit<OpenAPIV2.ItemsObject, 'exclusiveMaximum' | 'exclusiveMinimum' | 'type'> & {
  exclusiveMaximum?: boolean | number
  exclusiveMinimum?: boolean | number
  type?: string | string[]
  // TODO(HiDeoo)
  items?: Items
}
