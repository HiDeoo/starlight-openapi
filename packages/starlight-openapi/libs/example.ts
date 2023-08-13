import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

export function isExamples(examples: unknown): examples is Examples {
  return typeof examples === 'object'
}

export type Example = OpenAPIV3.ExampleObject | OpenAPIV3_1.ExampleObject
export type Examples = Record<string, Example>
