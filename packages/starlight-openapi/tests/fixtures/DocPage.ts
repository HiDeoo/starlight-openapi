import type { Page } from '@playwright/test'

export class DocPage {
  constructor(public readonly page: Page) {}

  goto(url: string) {
    return this.page.goto(`/api${url}`)
  }

  getByText(...args: Parameters<Page['getByText']>) {
    return this.page.getByText(...args)
  }
}
