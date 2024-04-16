import { expect, test } from './test'

test('uses the operation summary for title', async ({ docPage }) => {
  await docPage.goto('/v3/animals/webhooks/newanimal/')

  await docPage.expectToHaveTitle('New animal')
})

test('falls back to the operation ID for title', async ({ docPage }) => {
  await docPage.goto('/v3/animals/webhooks/newcat/')

  await docPage.expectToHaveTitle('newCat')
})

test('displays the operation', async ({ docPage }) => {
  await docPage.goto('/v3/animals/webhooks/newanimal/')

  await expect(docPage.getContent().getByText('POST')).toBeVisible()
  expect(await docPage.getContent().getByRole('group').count()).toBe(1)
  await expect(docPage.getContent().getByText('New animal details')).toBeVisible()
})
