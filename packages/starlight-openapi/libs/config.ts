import { z } from 'astro/zod'

import { logError } from './logger'
import { stripLeadingAndTrailingSlashes } from './path'

// TODO(HiDeoo) baseUrl

export const schemaConfigSchema = z.object({
  // TODO(HiDeoo)
  label: z.string().optional(),
  // TODO(HiDeoo)
  output: z.string().min(1).transform(stripLeadingAndTrailingSlashes),
  // TODO(HiDeoo)
  schema: z.string().min(1),
})

const configSchema = z.array(schemaConfigSchema).min(1)

export function validateConfig(userConfig: unknown): StarlightOpenAPIConfig {
  const config = configSchema.safeParse(userConfig)

  if (!config.success) {
    const errors = config.error.flatten()

    logError('Invalid starlight-openapi configuration.')

    throw new Error(`
${errors.formErrors.map((formError) => ` - ${formError}`).join('\n')}
${Object.entries(errors.fieldErrors)
  .map(([fieldName, fieldErrors]) => ` - ${fieldName}: ${(fieldErrors ?? []).join(' - ')}`)
  .join('\n')}
  `)
  }

  return config.data
}

export type StarlightOpenAPIConfig = z.infer<typeof configSchema>
export type StarlightOpenAPISchemaConfig = z.infer<typeof schemaConfigSchema>
