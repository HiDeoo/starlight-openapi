import { test as base } from '@playwright/test'

import { SidebarPage } from './fixtures/SidebarPage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  sidebarPage: async ({ page }, use) => {
    const sidebarPage = new SidebarPage(page)

    await use(sidebarPage)
  },
})

interface Fixtures {
  sidebarPage: SidebarPage
}
