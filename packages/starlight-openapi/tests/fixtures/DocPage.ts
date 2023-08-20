import { expect, type Page } from '@playwright/test'

export class DocPage {
  constructor(public readonly page: Page) {}

  goto(url: string) {
    return this.page.goto(`/api${url}`)
  }

  getByText(...args: Parameters<Page['getByText']>) {
    return this.page.getByText(...args)
  }

  getByRole(...args: Parameters<Page['getByRole']>) {
    return this.page.getByRole(...args)
  }

  getContent() {
    return this.page.getByRole('main')
  }

  async expectToHaveTitle(title: string) {
    await expect(this.page).toHaveTitle(title)
    await expect(this.page.getByRole('heading', { exact: true, level: 1, name: title })).toBeVisible()
  }

  getOperation() {
    return this.getContent().getByRole('group')
  }

  getParameters(location: string) {
    return this.page.locator(`h3:has-text("${`${location} parameters`}") + div > div`)
  }

  getRequestBody() {
    return this.page.locator(`section:has(> h2:first-child:has-text("Request Body"))`)
  }

  getRequestBodyParameter(name: string) {
    return this.getRequestBody().locator('.key').filter({ hasText: name })
  }

  getParameter(location: string, name: string) {
    return this.getParameters(location).filter({ hasText: name })
  }

  getResponse(status: string) {
    return this.page.locator(`h3:has-text("Response ${`${status}`}") + div`)
  }

  getResponseHeaders(status: string) {
    return this.page
      .locator(`h3:has-text("Response ${`${status}`}") + div`)
      .getByRole('heading', { level: 4, name: 'HEADERS' })
  }

  getResponseHeader(status: string, name: string) {
    return this.getResponse(status).getByRole('listitem').filter({ hasText: name })
  }

  getAuthorizations() {
    return this.page.locator('section:has(> h2:first-child:has-text("Authorizations"))')
  }

  getAuthentication() {
    return this.page.getByRole('heading', { level: 2, name: 'Authentication' })
  }

  getAuthenticationMethod(name: string) {
    return this.page.locator(`section:has(> h3:first-child:has-text("${name}"))`)
  }
}
