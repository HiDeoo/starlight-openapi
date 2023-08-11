import { test } from './test'

test('use the operation summary for title', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/operations/listpets/')

  await docPage.expectToHaveTitle('List all pets')
})

test('fallback to the operation ID for title', async ({ docPage }) => {
  await docPage.goto('/v30/petstore-expanded/operations/findpets/')

  await docPage.expectToHaveTitle('findPets')
})
