import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import { hasDefinedValue, isObjectLike } from './predicate'
import type { Response } from './response'

export function isResponseWithHeaders(response: Response): response is Response & { headers: Headers } {
  return hasDefinedValue(response, 'headers') && isObjectLike(response.headers)
}

export type Header = OpenAPIV2.HeaderObject | OpenAPIV3.HeaderObject | OpenAPIV3_1.HeaderObject
export type Headers = Record<string, Header>
