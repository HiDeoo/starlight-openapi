import { expect, test } from './test'

test('use the operation summary for title', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/operations/listpets/')

  await docPage.expectToHaveTitle('List all pets')
})

test('fallback to the operation ID for title', async ({ docPage }) => {
  await docPage.goto('/v30/petstore-expanded/operations/findpets/')

  await docPage.expectToHaveTitle('findPets')
})

test('display basic informations', async ({ docPage }) => {
  await docPage.goto('/v30/petstore-custom/operations/listpets/')

  await expect(
    docPage.getByText('Description in MARKDOWN: Returns all pets from the system that the user has access to'),
  ).toBeVisible()
  await expect(docPage.getByText('External Docs URL: http://swagger.io')).toBeVisible()
  await expect(docPage.getByText('External Docs Description: Find out more about our store')).toBeVisible()
  await expect(docPage.getByText('Method: get')).toBeVisible()
  await expect(docPage.getByText('Method: get')).toBeVisible()
  await expect(docPage.getByText('Path: /pets')).toBeVisible()
  await expect(docPage.getByText('DEPRECATED')).toBeVisible()
})
