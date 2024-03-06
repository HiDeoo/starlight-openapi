import { expect, test } from './test'

test('hides the response headers section with no headers', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addwolf/')

  await expect(docPage.getResponseHeaders('200')).not.toBeVisible()
})
