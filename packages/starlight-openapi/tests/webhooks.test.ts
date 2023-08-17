import { expect, test } from './test'

test('uses the operation summary for title', async ({ docPage }) => {
  await docPage.goto('/v30/animals/webhooks/newanimal/')

  await docPage.expectToHaveTitle('New animal')
})

test('falls back to the operation ID for title', async ({ docPage }) => {
  await docPage.goto('/v30/animals/webhooks/newcat/')

  await docPage.expectToHaveTitle('newCat')
})

test('displays the operation', async ({ docPage }) => {
  await docPage.goto('/v30/animals/webhooks/newanimal/')

  await expect(docPage.getByText('POST')).toBeVisible()
  await expect(docPage.getContent().getByRole('group')).not.toBeVisible()
  await expect(docPage.getByText('Description: New animal details')).toBeVisible()
})
