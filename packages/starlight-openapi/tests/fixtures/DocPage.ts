import { expect, type Page } from '@playwright/test'

export class DocPage {
  constructor(public readonly page: Page) {}

  goto(url: string) {
    return this.page.goto(`/api${url}`)
  }

  getByText(...args: Parameters<Page['getByText']>) {
    return this.page.getByText(...args)
  }

  async expectToHaveTitle(title: string) {
    await expect(this.page).toHaveTitle(title)
    await expect(this.page.getByRole('heading', { exact: true, level: 1, name: title })).toBeVisible()
  }

  getParameters(location: string) {
    return this.page.locator(`h3:has-text("${`${location} parameters`}") + ul`).getByRole('listitem')
  }

  getRequestBody() {
    return this.page.locator(`div:has(> h2:first-child:has-text("Request Body"))`)
  }

  getParameter(location: string, name: string) {
    return this.getParameters(location).filter({ hasText: name })
  }

  getResponse(name: string) {
    return this.page.locator(`h3:has-text("Response ${`${name}`}") + div`)
  }
}
