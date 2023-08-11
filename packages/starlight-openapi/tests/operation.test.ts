import { expect, test } from './test'

test('uses the operation summary for title', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/operations/listpets/')

  await docPage.expectToHaveTitle('List all pets')
})

test('falls back to the operation ID for title', async ({ docPage }) => {
  await docPage.goto('/v30/petstore-expanded/operations/findpets/')

  await docPage.expectToHaveTitle('findPets')
})

test('displays basic informations', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  await expect(docPage.getByText('Description in MARKDOWN: Returns all animals')).toBeVisible()
  await expect(docPage.getByText('External Docs URL: https://example.com/more-info')).toBeVisible()
  await expect(docPage.getByText('External Docs Description: Find out more about our animals')).toBeVisible()
  await expect(docPage.getByText('Method: get')).toBeVisible()
  await expect(docPage.getByText('Path: /animals')).toBeVisible()
  await expect(docPage.getByText('OPERATION DEPRECATED')).toBeVisible()
})
