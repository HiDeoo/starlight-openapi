import type { OpenAPIV2 } from 'openapi-types'

export function isItemObject(itemObject: unknown): itemObject is ItemObject {
  return itemObject !== undefined && typeof itemObject === 'object' && 'type' in (itemObject as ItemObject)
}

export type ItemObject = OpenAPIV2.GeneralParameterObject
