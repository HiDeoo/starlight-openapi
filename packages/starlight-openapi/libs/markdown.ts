import fs from 'node:fs/promises'
import path from 'node:path'

import type { StarlightOpenAPISchemaConfig } from './schema'

export async function writeMdFile(config: StarlightOpenAPISchemaConfig, relativeFile: string, md: string) {
  const file = path.join('src/content/docs', config.output, relativeFile)
  const dir = path.dirname(file)

  await fs.mkdir(dir, { recursive: true })

  return fs.writeFile(file, md)
}
