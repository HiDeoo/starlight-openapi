import { expect, test } from './test'

test('lists operations grouped by tag and sorted by order of appearance in the document by default', async ({
  sidebarPage,
}) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Giphy')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      collapsed: true,
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
      collapsed: true,
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

test('sorts operations alphabetically if configured to do so', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Animals v3.0')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      collapsed: true,
      label: 'places',
      items: [{ name: 'List all shelters' }],
    },
    {
      collapsed: true,
      label: 'animals',
      items: [
        { name: '/turtles' },
        { name: 'Create an animal' },
        { name: 'Creates a new hamster' },
        { name: 'Creates a new okapi' },
        { name: 'List all animals' },
        { name: 'List all bears' },
        { name: 'List all birds' },
        { name: 'List all cats' },
        { name: 'List all dogs' },
        { name: 'List all turtles' },
      ],
    },
    {
      collapsed: true,
      label: 'Operations',
      items: [{ name: 'Get a jaguar' }],
    },
    {
      collapsed: true,
      label: 'Webhooks',
      items: [{ name: 'New animal' }, { name: 'newCat' }],
    },
  ])
})

test('uses a fallback group for untagged operations', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Petstore')

  expect(items).toMatchObject([
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
})

test('uses the operationId as the label for the operation if configured to do so', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('Petstore v3.0 (simple)')

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      collapsed: true,
      label: 'pets',
      items: [{ name: 'listPets' }, { name: 'createPets' }, { name: 'showPetById' }],
    },
  ])
})

test('sorts tags by order of appearance in the document by default', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('1Password Connect')

  expect(items).toMatchObject([
    { name: 'Overview' },
    { collapsed: true, label: 'Items' },
    { collapsed: true, label: 'Vaults' },
    { collapsed: true, label: 'Activity' },
    { collapsed: true, label: 'Health' },
    { collapsed: true, label: 'Metrics' },
    { collapsed: true, label: 'Files' },
  ])
})

test('create operation tag overview page for non-minimal tags', async ({ sidebarPage }) => {
  await sidebarPage.goto()

  const items = await sidebarPage.getSidebarGroupItems('1Password Connect')

  expect(items[2]).toMatchObject({
    collapsed: true,
    label: 'Vaults',
    items: [{ name: 'Overview' }, { name: 'Get all Vaults' }, { name: 'Get Vault details and metadata' }],
  })
})
