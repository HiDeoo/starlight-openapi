import { expect, type Locator, type Page } from '@playwright/test'

export class PaginationPage {
  public readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async expectPreviousLink(label: string, href: string) {
    await this.#expectNavigationLink(this.#getPreviousLink(), label, href)
  }

  async expectNextLink(label: string, href: string) {
    await this.#expectNavigationLink(this.#getNextLink(), label, href)
  }

  async #expectNavigationLink(link: Locator, label: string, href: string) {
    await expect(link).toBeVisible()
    await expect(link).toContainText(label)
    await expect(link).toHaveAttribute('href', href)
  }

  #getPreviousLink() {
    return this.page.locator('.pagination-links a[rel="prev"]')
  }

  #getNextLink() {
    return this.page.locator('.pagination-links a[rel="next"]')
  }
}
