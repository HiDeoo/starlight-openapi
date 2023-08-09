import { expect, test } from './test'

test('should list operations grouped by tag', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Petstore v3.0 (JSON)')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      label: 'pets',
      items: [{ name: 'List all pets' }, { name: 'Create a pet' }, { name: 'Info for a specific pet' }],
    },
  ])
})

test('should use a fallback group for untagged operations', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Petstore v3.0 (no tags)')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      label: 'Operations',
      items: [{ name: 'List all pets' }, { name: 'Create a pet' }, { name: 'Info for a specific pet' }],
    },
  ])
})
