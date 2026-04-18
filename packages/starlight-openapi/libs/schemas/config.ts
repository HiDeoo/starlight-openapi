import { AstroError } from 'astro/errors'
import { z } from 'astro/zod'

import { SchemaConfigSchema } from './schema'

const configSchema = z.array(SchemaConfigSchema).min(1)

export function validateConfig(userConfig: unknown): StarlightOpenAPIConfig {
  const config = configSchema.safeParse(userConfig)

  if (!config.success) {
    throw new AstroError(
      `Invalid starlight-openapi configuration:

${z.prettifyError(config.error)}
`,
      `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/HiDeoo/starlight-openapi/issues/new/choose`,
    )
  }

  return config.data
}

export type StarlightOpenAPIUserConfig = z.input<typeof configSchema>
export type StarlightOpenAPIConfig = z.output<typeof configSchema>
