import fs from 'node:fs/promises'
import { dirname } from 'node:path'

import type { StarlightOpenAPISchemaConfig } from './config'
import { getSchemaFilePath, getSchemaPath } from './path'

export function clearSchemaDirectory(config: StarlightOpenAPISchemaConfig) {
  return fs.rm(getSchemaPath(config), { recursive: true, force: true })
}

export async function writeSchemaFile(config: StarlightOpenAPISchemaConfig, relativeFilePath: string, content: string) {
  const file = getSchemaFilePath(config, relativeFilePath)
  const dir = dirname(file)

  await fs.mkdir(dir, { recursive: true })

  return fs.writeFile(file, content, 'utf8')
}
