import { test } from './test'

test('uses the operation summary for title', async ({ docPage }) => {
  await docPage.goto('/v3/animals/webhooks/newanimal/')

  await docPage.expectToHaveTitle('New animal')
})

test('falls back to the operation ID for title', async ({ docPage }) => {
  await docPage.goto('/v3/animals/webhooks/newcat/')

  await docPage.expectToHaveTitle('newCat')
})
