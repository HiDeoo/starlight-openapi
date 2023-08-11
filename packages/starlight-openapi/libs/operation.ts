import type { OpenAPI } from 'openapi-types'

import { slug } from './path'
import { isPathItem, type PathItem } from './pathItem'
import type { Schema } from './schema'

const defaultOperationTag = 'Operations'
const operationHttpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const

export function getOperationsByTag(document: Schema['document']) {
  const operationsByTag = new Map<string, PathItemOperation[]>()

  for (const [pathItemPath, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isPathItem(pathItem)) {
      continue
    }

    for (const method of operationHttpMethods) {
      if (!isPathItemOperation(pathItem, method)) {
        continue
      }

      const operation = pathItem[method]
      const operationId = operation.operationId ?? pathItemPath

      for (const tag of operation.tags ?? [defaultOperationTag]) {
        const operations = operationsByTag.get(tag) ?? []

        operations.push({
          method,
          operation,
          path: pathItemPath,
          pathItem,
          slug: `operations/${slug(operationId)}`,
          title: operation.summary ?? operationId,
        })

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

export interface PathItemOperation {
  method: OperationHttpMethod
  operation: Operation
  path: string
  pathItem: PathItem
  slug: string
  title: string
}

type Operation = OpenAPI.Operation
type OperationHttpMethod = (typeof operationHttpMethods)[number]