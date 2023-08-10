import { expect, test } from './test'

test('list operations grouped by tag', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Petstore v3.0')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      label: 'pets',
      items: [{ name: 'List all pets' }, { name: 'Create a pet' }, { name: 'Info for a specific pet' }],
    },
  ])
})

test('use a fallback group for untagged operations', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Petstore v3.0 (expanded)')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      label: 'Operations',
      items: [{ name: 'findPets' }, { name: 'addPet' }, { name: 'find pet by id' }, { name: 'deletePet' }],
    },
  ])
})
