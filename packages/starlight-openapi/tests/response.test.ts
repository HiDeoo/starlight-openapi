import { expect, test } from './test'

test('displays the responses for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/adddog/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('Description: animal response')).toBeVisible()

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('Description: unexpected error')).toBeVisible()
})

test('displays the responses for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/addanimal/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('Description: animal response')).toBeVisible()
  await expect(okResponse.getByText('Media type: application/json')).toBeVisible()

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('Description: unexpected error')).toBeVisible()
  await expect(defaultResponse.getByText('Media type: application/json')).toBeVisible()
})

test('displays the global `produces` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/petstore-simple/operations/addpet/')

  const requestBody = docPage.getResponse('200')

  await expect(requestBody.getByText('Produces: application/json')).toBeVisible()
})

test('overrides the global `produces` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addanimal/')

  const requestBody = docPage.getResponse('200')

  await expect(requestBody.getByText('Produces: application/json, application/xml')).toBeVisible()
})

test('display the examples for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/findanimals/')

  const requestBody = docPage.getResponse('200')

  await expect(requestBody.getByText('Example name: application/json')).toBeVisible()
  await expect(requestBody.getByText('Example value: [{"id":1,"name":"Bessy"},{"id":2,"name":"Hazel"}]')).toBeVisible()
})
