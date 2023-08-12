import { expect, test } from './test'

test('hides the request body section with no request body', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/findanimals/')

  await expect(docPage.getRequestBody()).not.toBeVisible()
})

test('displays the request body for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody).toBeVisible()

  await expect(requestBody.getByText('Description: Animal to add')).toBeVisible()

  await expect(requestBody.getByText('Type: object')).toBeVisible()

  await expect(requestBody.getByText('Property Name: name')).toBeVisible()
  await expect(requestBody.getByText('Type: string').nth(0)).toBeVisible()
  await expect(requestBody.getByText('Property Name: tag')).toBeVisible()
  await expect(requestBody.getByText('Type: string').nth(1)).toBeVisible()
})
