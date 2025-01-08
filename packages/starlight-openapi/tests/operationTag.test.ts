import { expect, test } from './test'

test('displays an operation tag overview', async ({ docPage }) => {
  await docPage.goto('/1password/operations/tags/items/')

  await docPage.expectToHaveTitle('Overview')

  await expect(docPage.getByRole('heading', { level: 2, name: 'Items' })).toBeVisible()

  await expect(docPage.getByText('Access and manage items inside 1Password Vaults')).toBeVisible()
})
