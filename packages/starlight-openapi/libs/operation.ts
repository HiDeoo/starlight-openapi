import type { OpenAPI } from 'openapi-types'

import { slug } from './path'
import { isPathItem, type PathItem } from './pathItem'
import type { Schema } from './schema'

const defaultOperationTag = 'Operations'
const operationHttpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const

export function getOperationsByTag(document: Schema['document']) {
  const operationsByTag = new Map<string, { operation: Operation; path: string }[]>()

  for (const [pathItemPath, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isPathItem(pathItem)) {
      continue
    }

    for (const method of operationHttpMethods) {
      if (!isPathItemOperation(pathItem, method)) {
        continue
      }

      const operation = pathItem[method]
      const operationPath = `operations/${slug(operation.operationId ?? pathItemPath)}`

      for (const tag of operation.tags ?? [defaultOperationTag]) {
        const operations = operationsByTag.get(tag) ?? []
        operations.push({ operation, path: operationPath })
        operationsByTag.set(tag, operations)
      }
    }
  }

  return operationsByTag
}

export function isPathItemOperation<TMethod extends OperationHttpMethod>(
  pathItem: PathItem,
  method: TMethod,
): pathItem is { [key in TMethod]: Operation } {
  return method in pathItem
}

type Operation = OpenAPI.Operation
type OperationHttpMethod = (typeof operationHttpMethods)[number]
