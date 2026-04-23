import { expect, type Locator, type Page } from '@playwright/test'

import { slug } from '../../libs/path'
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
    await expect(this.getSectionHeading(title, 1)).toBeVisible()
  }

  getOperations() {
    return this.page.locator('.sl-openapi-overview-navigation-link')
  }

  getOperationUrlToggle() {
    return this.#getOperationDescription().getByRole('button', { name: 'Toggle operation URLs' })
  }

  getOperationMethod() {
    return this.#getOperationDescription().locator('.sl-openapi-operation-method')
  }

  getOperationSnippetPicker() {
    return this.page.getByRole('combobox', { name: 'Select code sample' })
  }

  getOperationSnippets() {
    return this.page.locator('[data-openapi-snippet-id]')
  }

  getVisibleOperationSnippet() {
    return this.page.locator('[data-openapi-snippet-id]:not([hidden])')
  }

  getSectionHeading(name: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 2) {
    return this.page.getByRole('heading', { exact: true, level, name })
  }

  getMediaTypePicker(container: Locator) {
    return container.locator('starlight-openapi-content-picker').first().getByRole('combobox')
  }

  getMediaTypePickerValue(container: Locator) {
    return container
      .locator('starlight-openapi-content-picker')
      .first()
      .locator('.sl-openapi-content-picker-select-value')
  }

  getVisibleMediaPanel(container: Locator) {
    return this.#getSectionPanel(container).locator(
      ':scope > starlight-openapi-content-picker > [role="tabpanel"]:not([hidden])',
    )
  }

  getSchemaTabs(container: Locator) {
    return container.getByRole('tab')
  }

  getSchemaTab(container: Locator, name: string) {
    return container.getByRole('tab', { exact: true, name })
  }

  getVisibleExample(container: Locator) {
    return this.getVisibleMediaPanel(container).locator(
      ':scope > .sl-openapi-examples > .sl-openapi-example, :scope > .sl-openapi-examples [role="tabpanel"]:not([hidden]) .sl-openapi-example',
    )
  }

  getAuthentication() {
    return this.getSectionHeading('Authentication', 2)
  }

  getAuthenticationMethod(name: string) {
    return this.#getSectionByTitle(name)
  }

  getAuthorizations() {
    return this.#getSectionByTitle('Authorizations')
  }

  getParameters(location: string) {
    return this.#getSectionPanel(this.#getSectionByTitle(`${capitalize(location)} Parameters`)).locator(
      ':scope > .sl-openapi-keys > .sl-openapi-key',
    )
  }

  getParameter(location: string, name: string) {
    return this.#getKeyByName(this.getParameters(location), name)
  }

  getRequestBody() {
    return this.#getSectionByTitle('Request Body')
  }

  getVisibleRequestBodyPanel() {
    return this.getVisibleMediaPanel(this.getRequestBody())
  }

  getRequestBodyParameter(name: string) {
    return this.#getKeyByName(this.getVisibleRequestBodyPanel().locator('.sl-openapi-key:visible'), name)
  }

  getCallback(identifier: string) {
    return this.getSectionHeading(identifier, 3)
  }

  getCallbackRequestBody(identifier: string) {
    return this.#getSectionByHeadingId(`${slug(identifier)}-request-body`)
  }

  getCallbackRequestResponse(identifier: string, status: string) {
    return this.#getSectionByHeadingId(`${slug(identifier)}-responses-${slug(status)}`)
  }

  getResponse(status: string) {
    return this.#getSectionByTitle(status)
  }

  getResponseHeaders(status: string) {
    return this.getResponse(status)
      .locator('section')
      .filter({ has: this.getSectionHeading('Headers', 4) })
      .first()
  }

  getResponseHeader(status: string, name: string) {
    return this.#getKeyByName(this.#getSectionPanel(this.getResponseHeaders(status)).locator('.sl-openapi-key'), name)
  }

  getTocItems() {
    return this.#getTocChildrenItems(this.page.getByRole('complementary').locator('starlight-toc > nav > ul'))
  }

  #getSectionByTitle(title: string) {
    return this.#getSectionByHeadingId(slug(title))
  }

  #getSectionByHeadingId(id: string) {
    return this.page
      .locator('section')
      .filter({ has: this.page.locator(`[id="${id}"]`) })
      .first()
  }

  #getSectionPanel(section: Locator) {
    return section.locator(':scope > .sl-openapi-section-panel')
  }

  #getOperationDescription() {
    return this.page.locator('.sl-openapi-operation-description')
  }

  #getKeyByName(rows: Locator, name: string) {
    return rows.filter({
      has: this.page.locator('.sl-openapi-key-name').getByText(name, { exact: true }),
    })
  }

  async #getTocChildrenItems(list: Locator): Promise<TocItem[]> {
    const items: TocItem[] = []

    for (const item of await list.locator('> li').all()) {
      const link = await item.locator('> a').textContent()
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
