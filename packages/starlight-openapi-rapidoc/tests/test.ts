import { test as base } from '@playwright/test'

import { DocPage } from './fixtures/DocPage'
import { SidebarPage } from './fixtures/SidebarPage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  docPage: async ({ page }, use) => {
    const docPage = new DocPage(page)

    await use(docPage)
  },
  sidebarPage: async ({ page }, use) => {
    const sidebarPage = new SidebarPage(page)

    await use(sidebarPage)
  },
})

interface Fixtures {
  docPage: DocPage
  sidebarPage: SidebarPage
}
