import { expect, test } from '@playwright/test'

import { SidebarPage } from './fixtures/SidebarPage'
import { TestApp } from './fixtures/TestApp'

test.describe('SSR', () => {
  const app = new TestApp(new URL('apps/ssr/', import.meta.url))

  test.beforeAll(async () => {
    await app.start()
  })

  test.afterAll(async () => {
    await app.stop()
  })

  test('serves Starlight content', async ({ page }) => {
    await page.goto(app.url('/guides/example/'))

    await expect(page.getByRole('heading', { level: 1, name: 'Starlight content' })).toBeVisible()
    await expect(page.getByText('A Starlight documentation page example.')).toBeVisible()
  })

  test('serves an OpenAPI overview page', async ({ page }) => {
    await page.goto(app.url('/tests/petstore/'))

    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Swagger Petstore (1.0.0)' })).toBeVisible()
  })

  test('serves an OpenAPI operation page', async ({ page }) => {
    await page.goto(app.url('/tests/petstore-simple/operations/listpets/'))

    await expect(page.getByRole('heading', { level: 1, name: 'List all pets' })).toBeVisible()
  })

  test('renders the expected sidebar', async ({ page }) => {
    const sidebarPage = new SidebarPage(page)

    await page.goto(app.url('/guides/example/'))

    expect(await sidebarPage.getSidebarGroupItems('Starlight')).toMatchObject([{ name: 'Example' }])

    expect(await sidebarPage.getSidebarGroupItems('Petstore')).toMatchObject([
      { name: 'Overview' },
      {
        collapsed: false,
        label: 'Operations',
        items: [{ name: 'findPets' }, { name: 'addPet' }, { name: 'find pet by id' }, { name: 'deletePet' }],
      },
      {
        collapsed: false,
        label: 'Webhooks',
        items: [{ name: 'newPet' }],
      },
    ])

    expect(await sidebarPage.getSidebarGroupItems('Petstore v3.0 (simple)')).toMatchObject([
      { name: 'Overview' },
      {
        collapsed: false,
        label: 'pets',
        items: [{ name: 'List all pets' }, { name: 'Create a pet' }, { name: 'Info for a specific pet' }],
      },
    ])
  })
})
