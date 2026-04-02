import { fileURLToPath } from 'node:url'

import { build, preview } from 'astro'

// `4321` is used by the Playwright web server for the docs playground.
let firstPort = 4322
const appPorts = new Map<string, number>()

function getAppPort(root: string) {
  let port = appPorts.get(root)

  if (port === undefined) {
    port = firstPort
    firstPort += 1
    appPorts.set(root, port)
  }

  return port
}

export class TestApp {
  #root: string
  #port: number
  #server: Awaited<ReturnType<typeof preview>> | undefined

  constructor(root: URL) {
    this.#root = fileURLToPath(root)
    this.#port = getAppPort(this.#root)
  }

  private get baseURL() {
    if (!this.#server) throw new Error('Test app server has not been started.')

    return `http://${this.#server.host ?? 'localhost'}:${this.#port}`
  }

  url(pathname: string) {
    return new URL(pathname, this.baseURL).toString()
  }

  async start() {
    if (this.#server) return

    await build({
      logLevel: 'error',
      root: this.#root,
    })

    this.#server = await preview({
      logLevel: 'error',
      root: this.#root,
      server: { port: this.#port },
    })
  }

  async stop() {
    await this.#server?.stop()
    this.#server = undefined
  }
}
