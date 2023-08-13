import { expect, test } from './test'

test('displays the responses for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/adddog/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('Description: animal response')).toBeVisible()
  await expect(okResponse.getByText('Type: object')).toBeVisible()

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('Description: unexpected error')).toBeVisible()
  await expect(defaultResponse.getByText('Type: object')).toBeVisible()
})

test('displays the responses for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/addanimal/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('Description: animal response')).toBeVisible()
  await expect(okResponse.getByText('Media type: application/json')).toBeVisible()
  await expect(okResponse.getByText('Type: object')).toBeVisible()

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('Description: unexpected error')).toBeVisible()
  await expect(defaultResponse.getByText('Media type: application/json')).toBeVisible()
  await expect(defaultResponse.getByText('Type: object')).toBeVisible()
})
