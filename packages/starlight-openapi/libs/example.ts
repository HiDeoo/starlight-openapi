import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import { hasDefinedValue, isObjectLike } from './predicate'
import type { Response } from './response'

export function isExamples(examples: unknown): examples is ExamplesV3 {
  return isObjectLike(examples)
}

export function isOpenAPIV2ResponseWithExamples(response: Response): response is Response & { examples: ExamplesV2 } {
  return hasDefinedValue(response, 'examples') && isObjectLike(response.examples)
}

export type ExampleV3 = OpenAPIV3.ExampleObject | OpenAPIV3_1.ExampleObject
export type ExamplesV2 = OpenAPIV2.ExampleObject
export type ExamplesV3 = Record<string, ExampleV3>
