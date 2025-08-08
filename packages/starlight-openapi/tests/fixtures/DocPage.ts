import { expect, type Locator, type Page } from '@playwright/test'

import { capitalize } from '../../libs/utils'

export class DocPage {
  public readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

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
    return this.page.locator('.sl-markdown-content')
  }

  async expectToHaveTitle(title: string) {
    await expect(this.page).toHaveTitle(`${title} | Starlight OpenAPI`)
    await expect(this.page.getByRole('heading', { exact: true, level: 1, name: title })).toBeVisible()
  }

  getOperation() {
    return this.getContent().getByRole('group').first()
  }

  getParameters(location: string) {
    return this.page.locator(`.sl-heading-wrapper:has(> h3:text-is("${capitalize(location)} Parameters")) + div > div`)
  }

  getRequestBody() {
    return this.page.locator('section:has(> .sl-heading-wrapper h2:first-child:text-is("Request Body"))')
  }

  getRequestBodyParameter(name: string) {
    return this.getRequestBody().locator('.key').filter({ hasText: name })
  }

  getCallback(identifier: string, siblingLocator?: string) {
    return this.page.locator(
      `.sl-heading-wrapper:has(> h2:text-is("Callbacks")) + .sl-heading-wrapper:has(> h3:first-child:has-text("${identifier}"))${
        siblingLocator ? ` ${siblingLocator}` : ''
      }`,
    )
  }

  getCallbackRequestBody(identifier: string) {
    return this.getCallback(identifier, '~ section:has(> .sl-heading-wrapper h4:first-child:has-text("Request Body"))')
  }

  getCallbackRequestResponse(identifier: string, status: string) {
    return this.getCallback(identifier, `~ section:has(> .sl-heading-wrapper h5:first-child:text-is("${status}"))`)
  }

  getParameter(location: string, name: string) {
    return this.getParameters(location).filter({ hasText: name })
  }

  getResponse(status: string) {
    return this.page.locator(`section:has(> .sl-heading-wrapper h3:first-child:text-is("${status}"))`)
  }

  getResponseHeaders(status: string) {
    return this.getResponse(status).locator(`.sl-heading-wrapper:has(> h4:text-is("Headers"))`)
  }

  getResponseHeader(status: string, name: string) {
    return this.getResponseHeaders(status).locator('+ div > div').filter({ hasText: name })
  }

  getResponseExamples(status: string) {
    return this.getResponse(status).locator('section:has(> .sl-heading-wrapper h4:first-child:text-is("Examples"))')
  }

  getAuthorizations() {
    return this.page.locator('section:has(> .sl-heading-wrapper h2:first-child:text-is("Authorizations"))')
  }

  getAuthentication() {
    return this.page.getByRole('heading', { level: 2, name: 'Authentication' })
  }

  getAuthenticationMethod(name: string) {
    return this.page.locator(`section:has(> .sl-heading-wrapper h3:first-child:text-is("${name}"))`)
  }

  getTocItems() {
    return this.#getTocChildrenItems(this.page.getByRole('complementary').locator('starlight-toc > nav > ul'))
  }

  async #getTocChildrenItems(list: Locator): Promise<TocItem[]> {
    const items: TocItem[] = []

    for (const item of await list.locator('> li').all()) {
      const link = await item.locator(`> a`).textContent()
      const name = link?.trim() ?? null

      if ((await item.locator('> ul').count()) > 0) {
        items.push({
          label: name,
          items: await this.#getTocChildrenItems(item.locator('> ul')),
        })
      } else {
        items.push({ name })
      }
    }

    return items
  }
}

type TocItem = TocItemGroup | TocItemLink

interface TocItemLink {
  name: string | null
}

interface TocItemGroup {
  items: (TocItemGroup | TocItemLink)[]
  label: string | null
}
