import type { OpenAPIV2 } from 'openapi-types'

import type { Schema } from './schema'

export function getOpenAPIVersion(document: Document) {
  return isOpenAPIV2Document(document) ? document.swagger : document.openapi
}

export function getSummary(document: Document) {
  return 'summary' in document.info ? document.info.summary : undefined
}

export function getLicenseIdentifier(document: Document) {
  return document.info.license && 'identifier' in document.info.license ? document.info.license.identifier : undefined
}

export function isOpenAPIV2Document(document: Document): document is DocumentV2 {
  return 'swagger' in document
}

export type Document = Schema['document']
type DocumentV2 = OpenAPIV2.Document
