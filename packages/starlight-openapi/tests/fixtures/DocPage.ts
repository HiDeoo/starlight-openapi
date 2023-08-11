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
}
