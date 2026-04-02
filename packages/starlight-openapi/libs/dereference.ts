import { dereference } from '@readme/openapi-parser'

import type { Schema } from './schema'

const dereferences = new WeakMap<Schema, Promise<void>>()

export async function ensureSchemaDereference(schema: Schema) {
  let promise = dereferences.get(schema)

  if (!promise) {
    promise = (async () => {
      try {
        schema.document = await dereference(schema.document)
      } catch (error) {
        dereferences.delete(schema)
        throw error
      }
    })()

    dereferences.set(schema, promise)
  }

  await promise
}
