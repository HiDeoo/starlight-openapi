import { expect, test } from './test'

test('hides the authorizations section with no security', async ({ docPage }) => {
  await docPage.goto('/v30/petstore-expanded/operations/findpets/')

  await expect(docPage.getAuthorizations()).not.toBeVisible()
})

test('displays the global authorizations', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  const authorizations = docPage.getAuthorizations()

  await expect(authorizations.getByText('petstore_auth (read:pets)')).toBeVisible()
})

test('overrides the global authorizations', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/addanimal/')

  const authorizations = docPage.getAuthorizations()

  await expect(authorizations.getByText('None')).toBeVisible()
  await expect(authorizations.getByText('petstore_auth (write:pets,read:pets)')).toBeVisible()
  await expect(authorizations.getByText('api_key')).toBeVisible()
})