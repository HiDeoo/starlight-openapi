import { expect, test } from './test'

test('lists operations grouped by tag', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Giphy')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      label: 'gifs',
      items: [
        { name: 'Get GIFs by ID' },
        { name: 'Random GIF' },
        { name: 'Search GIFs' },
        { name: 'Translate phrase to GIF' },
        { name: 'Trending GIFs' },
        { name: 'Get GIF by Id' },
      ],
    },
    {
      label: 'stickers',
      items: [
        { name: 'Random Sticker' },
        { name: 'Search Stickers' },
        { name: 'Translate phrase to Sticker' },
        { name: 'Trending Stickers' },
      ],
    },
  ])
})

test('uses a fallback group for untagged operations', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Petstore')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      label: 'Operations',
      items: [{ name: 'findPets' }, { name: 'addPet' }, { name: 'find pet by id' }, { name: 'deletePet' }],
    },
    {
      label: 'Webhooks',
      items: [{ name: 'newPet' }],
    },
  ])
})

test('respects tags order', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('1Password Connect')

  expect(items).toMatchObject([
    { name: 'Overview' },
    { label: 'Items' },
    { label: 'Vaults' },
    { label: 'Activity' },
    { label: 'Health' },
    { label: 'Metrics' },
    { label: 'Files' },
  ])
})
