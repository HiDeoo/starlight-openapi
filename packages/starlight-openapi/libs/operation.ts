import type { OpenAPI } from 'openapi-types'

import type { PathItem } from './pathItem'

export const OPERATION_HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const

export function isPathItemOperation<TMethod extends OperationHttpMethod>(
  pathItem: PathItem,
  method: TMethod,
): pathItem is { [key in TMethod]: Operation } {
  return method in pathItem
}

type Operation = OpenAPI.Operation
type OperationHttpMethod = (typeof OPERATION_HTTP_METHODS)[number]
