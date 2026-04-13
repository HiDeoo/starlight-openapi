import { expect, test } from './test'

test('displays an operation tag overview', async ({ docPage }) => {
  await docPage.goto('/1password/operations/tags/items/')

  await docPage.expectToHaveTitle('Overview')

  await expect(docPage.getByRole('heading', { level: 2, name: 'Items' })).toBeVisible()

  await expect(docPage.getByText('Access and manage items inside 1Password Vaults')).toBeVisible()

  await expect(docPage.getByRole('heading', { level: 2, name: 'Operations' })).toBeVisible()

  const operations = docPage.getOperations()
  await expect(operations).toHaveCount(6)

  await expect(operations.nth(0).getByText('GET', { exact: true })).toBeVisible()
  await expect(operations.nth(0).getByRole('link', { name: '/vaults/{vaultUuid}/items' })).toHaveAttribute(
    'href',
    '/api/1password/operations/getvaultitems/',
  )

  await expect(operations.nth(5).getByText('PATCH', { exact: true })).toBeVisible()
  await expect(operations.nth(5).getByRole('link', { name: '/vaults/{vaultUuid}/items/{itemUuid}' })).toHaveAttribute(
    'href',
    '/api/1password/operations/patchvaultitem/',
  )
})
