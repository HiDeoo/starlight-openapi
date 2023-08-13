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

  await expect(requestBody.getByText('Min Properties: 1')).toBeVisible()
  await expect(requestBody.getByText('Max Properties: 4')).toBeVisible()

  await expect(requestBody.getByText('Property Name: name')).toBeVisible()
  await expect(requestBody.getByText('Type: string').nth(0)).toBeVisible()
  await expect(requestBody.getByText('Property Name: tag')).toBeVisible()
  await expect(requestBody.getByText('Type: string').nth(1)).toBeVisible()
  await expect(requestBody.getByText('Additional Properties')).toBeVisible()
  await expect(requestBody.getByText('Type: number')).toBeVisible()

  await expect(requestBody.getByText('Required Properties: name')).toBeVisible()
})

test('displays the request body for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody).toBeVisible()

  await expect(requestBody.getByText('Required Request Body')).toBeVisible()

  await expect(requestBody.getByText('Description: Animal to add')).toBeVisible()

  await expect(requestBody.getByText('Media type: application/json')).toBeVisible()
  await expect(requestBody.getByText('Type: object')).toBeVisible()
})

test('supports schema object `allOf` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addcat/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Property Name: name')).toBeVisible()
  await expect(requestBody.getByText('Property Name: tag')).toBeVisible()
  await expect(requestBody.getByText('Property Name: age')).toBeVisible()
})

test('supports schema object `oneOf` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addbird/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('MULTIPLE TYPE: oneOf')).toBeVisible()

  await expect(requestBody.getByText('bird name')).toBeVisible()
  expect(await requestBody.getByText('Type: string').count()).toBe(2)
  await expect(requestBody.getByText('Type: object')).toBeVisible()
  await expect(requestBody.getByText('Property Name: name')).toBeVisible()
})

test('supports schema object `anyOf` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/adddog/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('MULTIPLE TYPE: anyOf')).toBeVisible()

  expect(await requestBody.getByText('Type: object').count()).toBe(2)

  await expect(requestBody.getByText('Property Name: tag')).toBeVisible()
  await expect(requestBody.getByText('Property Name: age')).toBeVisible()
})

test('supports schema object `not` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addwolf/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('NOT Type:')).toBeVisible()

  await expect(requestBody.getByText('Type: string')).toBeVisible()
})

test('supports schema object `discriminator` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addbear/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Discriminator: type')).toBeVisible()
})

test('displays external docs', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addcat/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('External Docs URL')).toBeVisible()
})

test('displays examples', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addbird/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Example value: "Aubrey"')).toBeVisible()
  await expect(requestBody.getByText('Example value: {"name":"Harley"}')).toBeVisible()
})

test('displays the global `consumes` property', async ({ docPage }) => {
  await docPage.goto('/v20/petstore-simple/operations/addpet/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Consumes: application/json')).toBeVisible()
})

test('overrides the global `consumes` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Consumes: application/json, application/xml')).toBeVisible()
})
