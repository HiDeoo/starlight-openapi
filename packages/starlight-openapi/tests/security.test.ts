import { expect, test } from './test'

test('hides the authorizations section with no security', async ({ docPage }) => {
  await docPage.goto('/petstore/operations/findpets/')

  await expect(docPage.getAuthorizations()).not.toBeVisible()
})

test('displays the global authorizations', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listanimals/')

  const authorizations = docPage.getAuthorizations()

  await expect(authorizations.getByText('animals_auth')).toBeVisible()
  await expect(authorizations.getByText('read:animals')).toBeVisible()
})

test('overrides the global authorizations', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const authorizations = docPage.getAuthorizations()

  await expect(authorizations.getByText('None')).toBeVisible()
  await expect(authorizations.getByText('animals_auth')).toBeVisible()
  await expect(authorizations.getByText('write:animals')).toBeVisible()
  await expect(authorizations.getByText('read:animals')).toBeVisible()
  await expect(authorizations.getByText('api_key')).toBeVisible()
})

test('links to overview authentications', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const authorizations = docPage.getAuthorizations()

  const animalsAuthLink = authorizations.getByRole('link', { name: 'animals_auth' })
  await expect(animalsAuthLink).toBeVisible()
  expect(await animalsAuthLink.getAttribute('href')).toBe('/api/v3/animals/#animals_auth')

  const apiKeyLink = authorizations.getByRole('link', { name: 'api_key' })
  await expect(apiKeyLink).toBeVisible()
  expect(await apiKeyLink.getAttribute('href')).toBe('/api/v3/animals/#api_key')
})
