import { expect, test } from './test'

test('hides the response headers section with no headers', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addwolf/')

  await expect(docPage.getResponseHeaders('200')).not.toBeVisible()
})

test('displays response headers in v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addbear/')

  const limitHeader = docPage.getResponseHeader('200', 'X-Rate-Limit-Limit')

  await expect(limitHeader).toBeVisible()
  await expect(limitHeader.getByText('integer')).toBeVisible()
  await expect(limitHeader.getByText('The number of allowed requests in the current period')).toBeVisible()

  await expect(docPage.getResponseHeader('200', 'X-Rate-Limit-Reset')).toBeVisible()
})

test('displays response headers in v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listbears/')

  const limitHeader = docPage.getResponseHeader('200', 'X-Rate-Limit-Limit')

  await expect(limitHeader).toBeVisible()
  await expect(limitHeader.getByText('integer')).toBeVisible()
  await expect(limitHeader.getByText('The number of allowed requests in the current period')).toBeVisible()

  await expect(docPage.getResponseHeader('200', 'X-Rate-Limit-Reset')).toBeVisible()
})
