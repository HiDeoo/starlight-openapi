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

  await expect(docPage.getByText('Returns all animals')).toBeVisible()
  await expect(docPage.getByText('External Docs URL: https://example.com/more-info')).toBeVisible()
  await expect(docPage.getByText('External Docs Description: Find out more about our animals')).toBeVisible()
  await expect(docPage.getByText('Method: get')).toBeVisible()
  await expect(docPage.getByText('Path: /animals')).toBeVisible()
  await expect(docPage.getByText('OPERATION DEPRECATED')).toBeVisible()
})

test('displays the operation URL for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/findanimals/')

  await expect(docPage.getByText('URL: example.com/api/animals')).toBeVisible()
})

test('displays the operation URLs for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listdogs/')

  await expect(docPage.getByText('URL: example.com/api/dogs')).toBeVisible()
  await expect(docPage.getByText('URL description: Default server')).toBeVisible()
  await expect(docPage.getByText('URL: sandbox.example.com/api/dogs')).toBeVisible()
  await expect(docPage.getByText('URL description: Sandbox server')).toBeVisible()
})

test('displays overriden operation URLs for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listbears/')

  await expect(docPage.getByText('URL: custom.example.com/api/bears')).toBeVisible()
  await expect(docPage.getByText('URL description: Custom server')).toBeVisible()
})
