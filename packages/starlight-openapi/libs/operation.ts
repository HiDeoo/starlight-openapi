import type { OpenAPI, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import type { Callback } from './callback'
import { type Document, isOpenAPIV2Document } from './document'
import { getURLWithPath, slug } from './path'
import { isPathItem, type PathItem } from './pathItem'
import type { Schema } from './schemas/schema'

const defaultOperationTag = 'Operations'
const operationHttpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const

const leadingDoubleSlashRegex = /^\/\//
const absoluteURLRegex = /^[a-z][a-z\d+.-]*:\/\//i
const templateVariableRegex = /\{([^}]+)\}/g

const defaultServerOrigin = 'https://example.com'

export function getOperationsByTag({ config, document }: Schema) {
  const operationsByTag = new Map<string, { entries: PathItemOperation[]; tag: OperationTag }>()

  for (const [pathItemPath, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isPathItem(pathItem)) {
      continue
    }

    const allOperationIds = operationHttpMethods.map((method) => {
      return isPathItemOperation(pathItem, method) ? (pathItem[method].operationId ?? pathItemPath) : undefined
    })

    for (const [index, method] of operationHttpMethods.entries()) {
      const operationId = allOperationIds[index]

      if (!operationId || !isPathItemOperation(pathItem, method)) {
        continue
      }

      const operation = pathItem[method]
      const isDuplicateOperationId = allOperationIds.filter((id) => id === operationId).length > 1
      const operationIdSlug = slug(operationId)

      for (const tag of operation.tags ?? [defaultOperationTag]) {
        const operations = operationsByTag.get(tag) ?? { entries: [], tag: { name: tag } }

        const title =
          operation.summary ?? (isDuplicateOperationId ? `${operationId} (${method.toUpperCase()})` : operationId)

        operations.entries.push({
          method,
          operation,
          path: pathItemPath,
          pathItem,
          sidebar: {
            label:
              config.sidebar.operations.labels === 'path'
                ? pathItemPath
                : config.sidebar.operations.labels === 'summary' && operation.summary
                  ? title
                  : operationId,
          },
          slug: isDuplicateOperationId
            ? `operations/${operationIdSlug}/${slug(method)}`
            : `operations/${operationIdSlug}`,
          title,
        })

        operationsByTag.set(tag, operations)
      }
    }
  }

  if (document.tags) {
    const orderedTags = new Map(document.tags.map((tag, index) => [tag.name, { index, tag }]))
    const operationsByTagArray = [...operationsByTag.entries()].toSorted(([tagA], [tagB]) => {
      const orderA = orderedTags.get(tagA)?.index ?? Number.POSITIVE_INFINITY
      const orderB = orderedTags.get(tagB)?.index ?? Number.POSITIVE_INFINITY

      return orderA - orderB
    })

    operationsByTag.clear()

    for (const [tag, operations] of operationsByTagArray) {
      operationsByTag.set(tag, { ...operations, tag: orderedTags.get(tag)?.tag ?? operations.tag })
    }
  }

  return operationsByTag
}

export function getWebhooksOperations({ config, document }: Schema): PathItemOperation[] {
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

      const title = operation.summary ?? operationId

      operations.push({
        method,
        operation,
        pathItem,
        sidebar: {
          label: config.sidebar.operations.labels === 'summary' && operation.summary ? title : operationId,
        },
        slug: `webhooks/${slug(operationId)}`,
        title,
      })
    }
  }

  return operations
}

export function getCallbackOperations(callback: Callback): CallbackOperation[] {
  const operations: CallbackOperation[] = []

  for (const method of operationHttpMethods) {
    const operation = callback[method]
    if (!operation) continue

    operations.push({ method, operation })
  }

  return operations
}

export function isPathItemOperation<TMethod extends OperationHttpMethod>(
  pathItem: PathItem,
  method: TMethod,
): pathItem is Record<TMethod, Operation> {
  return method in pathItem
}

export function isMinimalOperationTag(tag: OperationTag): boolean {
  return (tag.description === undefined || tag.description.length === 0) && tag.externalDocs === undefined
}

export function getOperationURLs(document: Document, pathItemOperation: PathItemOperation): OperationURL[] {
  return getOperationServerObjects(document, pathItemOperation).map((serverObject) => ({
    description: serverObject.description,
    url: getURLWithPath(getDisplayServerURL(serverObject), pathItemOperation.path ?? ''),
  }))
}

export function getOperationBaseURL(document: Document, pathItemOperation: PathItemOperation): string | undefined {
  const serverObject = getOperationServerObjects(document, pathItemOperation)[0]
  if (!serverObject) return
  return getRequestServerURL(serverObject)
}

function getDisplayServerURL(serverObject: ServerObject): string {
  return serverObject.url.replace(absoluteURLRegex, '').replace(leadingDoubleSlashRegex, '')
}

function getRequestServerURL(serverObject: ServerObject): string {
  const url = serverObject.variables
    ? replaceTemplateVariables(
        serverObject.url,
        Object.fromEntries(Object.entries(serverObject.variables).map(([name, variable]) => [name, variable.default])),
      )
    : serverObject.url

  if (url.startsWith('//')) return `https:${url}`
  if (absoluteURLRegex.test(url)) return url

  return new URL(url, defaultServerOrigin).toString()
}

export function replaceTemplateVariables(template: string, values: Record<string, string>): string {
  return template.replaceAll(templateVariableRegex, (_, name: string) => {
    return values[name] ?? `{${name}}`
  })
}

function getOperationServerObjects(document: Document, { operation, pathItem }: PathItemOperation): ServerObject[] {
  if (isOpenAPIV2Document(document)) {
    if (!document.host) return []

    const schemes = document.schemes?.length ? document.schemes : ['https']

    return schemes.map((scheme) => ({
      url: `${scheme}://${document.host}${document.basePath ?? ''}`,
    }))
  }

  const servers =
    'servers' in operation && operation.servers.length > 0
      ? operation.servers
      : 'servers' in pathItem && pathItem.servers.length > 0
        ? pathItem.servers
        : 'servers' in document
          ? document.servers
          : []

  return servers.map((server) => {
    const serverObject: ServerObject = { url: server.url }

    if (server.description) serverObject.description = server.description
    if (server.variables) serverObject.variables = server.variables

    return serverObject
  })
}

type ServerObject = OpenAPIV3.ServerObject | OpenAPIV3_1.ServerObject

export interface PathItemOperation {
  method: OperationHttpMethod
  operation: Operation
  path?: string
  pathItem: PathItem
  sidebar: {
    label: string
  }
  slug: string
  title: string
}

export interface CallbackOperation {
  method: OperationHttpMethod
  operation: Operation
}

export type Operation = OpenAPI.Operation<{ 'x-codeSamples'?: OperationCodeSample[] }>
export type OperationHttpMethod = (typeof operationHttpMethods)[number]
export type OperationTag = NonNullable<Document['tags']>[number]

export interface OperationURL {
  description?: string | undefined
  url: string
}

export interface OperationCodeSample {
  label?: string
  lang: string
  source: string
}
