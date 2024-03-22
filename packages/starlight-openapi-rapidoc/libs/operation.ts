import type { OpenAPI } from 'openapi-types'

import { type Document, isOpenAPIV2Document } from './document'
import { slug } from './path'
import { isPathItem, type PathItem } from './pathItem'
import type { Schema } from './schema'

const defaultOperationTag = 'Operations'
const operationHttpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const

export function getOperationsByTag(document: Schema['document']) {
  const operationsByTag = new Map<string, PathItemOperation[]>()
  const { paths, tags: documentTags = [] } = document

  for (const [pathItemPath, pathItem] of Object.entries(paths)) {
    if (!isPathItem(pathItem)) {
      continue
    }

    for (const method of operationHttpMethods) {
      if (!isPathItemOperation(pathItem, method)) {
        continue
      }

      const operation = pathItem[method]
      const { operationId = pathItemPath, tags, summary, description } = operation

      for (const tag of tags ?? [defaultOperationTag]) {
        const operations = operationsByTag.get(tag) ?? []

        operations.push({
          method,
          operation,
          path: pathItemPath,
          pathItem,
          slug: `operations/${slug(operationId)}`,
          title: (summary ?? operationId) || pathItemPath || `${description}`.slice(100) || '',
          tag,
        })

        operationsByTag.set(tag, operations)
      }
    }
  }

  if (documentTags.length > 0) {
    const orderedTags = new Map(documentTags.map((tag, index) => [tag.name, index]))
    const operationsByTagArray = [...operationsByTag.entries()].sort(([tagA], [tagB]) => {
      const orderA = orderedTags.get(tagA) ?? Number.POSITIVE_INFINITY
      const orderB = orderedTags.get(tagB) ?? Number.POSITIVE_INFINITY

      return orderA - orderB
    })

    operationsByTag.clear()

    for (const [tag, operations] of operationsByTagArray) {
      operationsByTag.set(tag, operations)
    }
  }

  return operationsByTag
}

export function getWebhooksOperations(document: Schema['document']): PathItemOperation[] {
  if (!('webhooks' in document)) {
    return []
  }

  const operations: PathItemOperation[] = []

  for (const [webhookKey, pathItem] of Object.entries(document.webhooks)) {
    if (!isPathItem(pathItem)) {
      continue
    }

    for (const method of operationHttpMethods) {
      if (!isPathItemOperation(pathItem, method)) {
        continue
      }

      const operation = pathItem[method]
      const operationId = operation.operationId ?? webhookKey

      operations.push({
        method,
        operation,
        pathItem,
        slug: `webhooks/${slug(operationId)}`,
        title: operation.summary ?? operationId,
      })
    }
  }

  return operations
}

export function isPathItemOperation<TMethod extends OperationHttpMethod>(
  pathItem: PathItem,
  method: TMethod,
): pathItem is { [key in TMethod]: Operation } {
  return method in pathItem
}

export function getOperationURLs(document: Document, { operation, path, pathItem }: PathItemOperation): OperationURL[] {
  const urls: OperationURL[] = []

  if (isOpenAPIV2Document(document) && 'host' in document) {
    let url = document.host
    url += document.basePath ?? ''
    url += path ?? ''

    if (url.length > 0) {
      urls.push(makeOperationURL(url))
    }
  } else {
    const servers =
      'servers' in operation
        ? operation.servers
        : 'servers' in pathItem
        ? pathItem.servers
        : 'servers' in document
        ? document.servers
        : []

    for (const server of servers) {
      let url = server.url
      url += path ?? ''

      if (url.length > 0) {
        urls.push(makeOperationURL(url, server.description))
      }
    }
  }

  return urls
}

function makeOperationURL(url: string, description?: string): OperationURL {
  return { description, url: url.replace(/^\/\//, '') }
}

export interface PathItemOperation {
  method: OperationHttpMethod
  operation: Operation
  path?: string
  pathItem: PathItem
  slug: string
  title: string
  tag?: string
}

export type Operation = OpenAPI.Operation
export type OperationHttpMethod = (typeof operationHttpMethods)[number]

interface OperationURL {
  description?: string | undefined
  url: string
}
