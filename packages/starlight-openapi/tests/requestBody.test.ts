import { expect, test } from './test'

test('hides the request body section with no request body', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/findanimals/')

  await expect(docPage.getRequestBody()).not.toBeVisible()
})

test('displays the request body for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody).toBeVisible()

  await expect(requestBody.getByText('Animal to add')).toBeVisible()

  await expect(requestBody.getByText('Min Properties: 1')).toBeVisible()
  await expect(requestBody.getByText('Max Properties: 4')).toBeVisible()

  const nameParameter = docPage.getRequestBodyParameter('name')

  await expect(nameParameter.getByText('string')).toBeVisible()
  await expect(nameParameter.getByText('required')).toBeVisible()

  const tagParameter = docPage.getRequestBodyParameter('tag')

  await expect(tagParameter.getByText('string')).toBeVisible()
  await expect(tagParameter.getByText('required')).not.toBeVisible()

  await expect(requestBody.getByText('Additional Properties')).toBeVisible()
  await expect(requestBody.getByText('number')).toBeVisible()
})

test('displays the request body for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody).toBeVisible()

  await expect(requestBody.getByRole('heading', { level: 2 }).getByText('required')).toBeVisible()

  await expect(requestBody.getByText('Animal to add')).toBeVisible()

  expect(await requestBody.getByRole('combobox').inputValue()).toBe('application/json')

  // TODO(HiDeoo) test content
})

test('supports schema object `allOf` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addcat/')

  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('tag')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('age')).toBeVisible()
})

test('supports schema object `oneOf` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addbird/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('MULTIPLE TYPE: oneOf')).toBeVisible()

  await expect(requestBody.getByText('bird name')).toBeVisible()
  expect(await requestBody.getByText('string').count()).toBe(2)
  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()
})

test('supports schema object `anyOf` property', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/adddog/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('MULTIPLE TYPE: anyOf')).toBeVisible()

  await expect(docPage.getRequestBodyParameter('tag')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('age')).toBeVisible()
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

  const externalDocsLink = docPage.getRequestBody().getByRole('link', { name: 'More information' })
  await expect(externalDocsLink).toBeVisible()
  expect(await externalDocsLink.getAttribute('href')).toBe('https://example.com/more-info')
})

test('displays examples', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addbird/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Example value: "Aubrey"')).toBeVisible()
  await expect(requestBody.getByText('Example value: {"name":"Harley"}')).toBeVisible()
})

test('displays the global `consumes` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/petstore-simple/operations/addpet/')

  await docPage.getRequestBody().getByRole('combobox').selectOption('application/json')
})

test('overrides the global `consumes` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await requestBody.getByRole('combobox').selectOption('application/json')
  await requestBody.getByRole('combobox').selectOption('application/xml')
})
