import { test } from './test'

test('paginates a docs page before an overview page', async ({ page, paginationPage }) => {
  await page.goto('/resources/starlight/')

  await paginationPage.expectPreviousLink('Showcase', '/resources/showcase/')
  await paginationPage.expectNextLink('Overview', '/api/petstore/')
})

test('paginates an overview page', async ({ page, paginationPage }) => {
  await page.goto('/api/petstore/')

  await paginationPage.expectPreviousLink('Plugins and Tools', '/resources/starlight/')
  await paginationPage.expectNextLink('findPets', '/api/petstore/operations/findpets/')
})

test('paginates between operation pages', async ({ page, paginationPage }) => {
  await page.goto('/api/petstore/operations/addpet/')

  await paginationPage.expectPreviousLink('findPets', '/api/petstore/operations/findpets/')
  await paginationPage.expectNextLink('find pet by id', '/api/petstore/operations/find-pet-by-id/')
})

test('paginates from an operation page to a webhook page', async ({ page, paginationPage }) => {
  await page.goto('/api/petstore/operations/deletepet/')

  await paginationPage.expectNextLink('newPet', '/api/petstore/webhooks/newpet/')
})
