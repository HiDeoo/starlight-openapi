import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import { isExamples, type ExamplesV3 } from './example'
import { getDefinedValue } from './predicate'
import { hasSchemaObject, type SchemaObject } from './schemaObject'

export function getContentEntries(content: Content): MediaEntry[] {
  const entries: MediaEntry[] = []

  for (const mediaType of Object.keys(content)) {
    const media = content[mediaType]
    if (media === undefined) continue

    const example = getDefinedValue(media, 'example')
    const examples = getDefinedValue(media, 'examples')

    entries.push({
      mediaType,
      ...(hasSchemaObject(media) ? { schema: media.schema } : {}),
      ...(example === undefined ? {} : { example }),
      ...(isExamples(examples) ? { examples: examples } : {}),
    })
  }
  return entries
}

export function isJsonLikeMediaType(mediaType: string | undefined): boolean {
  return mediaType?.includes('json') ?? false
}

export type Content = Record<string, OpenAPIV3.MediaTypeObject | OpenAPIV3_1.MediaTypeObject>

export interface MediaEntry {
  example?: unknown
  examples?: ExamplesV3
  generated?: boolean
  mediaType?: string
  schema?: SchemaObject
}
