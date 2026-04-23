import { expect, test } from './test'

test('hides the request body section with no request body', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/findanimals/')

  await expect(docPage.getRequestBody()).not.toBeVisible()
})

test('displays the request body for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody).toBeVisible()
  await expect(requestBody.getByText('Animal to add')).toBeVisible()

  const panel = docPage.getVisibleRequestBodyPanel()

  await expect(panel.getByText('>= 1 properties')).toBeVisible()
  await expect(panel.getByText('<= 4 properties')).toBeVisible()

  const nameParameter = docPage.getRequestBodyParameter('name')

  await expect(nameParameter.getByText('string')).toBeVisible()
  await expect(nameParameter.getByText('required')).toBeVisible()

  const tagParameter = docPage.getRequestBodyParameter('tag')

  await expect(tagParameter.getByText('string')).toBeVisible()
  await expect(tagParameter.getByText('required')).not.toBeVisible()

  const additionalProperties = docPage.getRequestBodyParameter('key')

  await expect(additionalProperties.getByText('number')).toBeVisible()
  await expect(additionalProperties.getByText('additional properties')).toBeVisible()
})

test('displays a generated request body example for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()
  const mediaTypeSelector = docPage.getMediaTypePicker(requestBody)

  await mediaTypeSelector.selectOption('application/json')

  const example = docPage.getVisibleExample(requestBody)

  await expect(example).toBeVisible()
  await expect(example).toContainText('"name": "example"')

  await mediaTypeSelector.selectOption('application/xml')

  await expect(example).toHaveCount(0)
})

test('displays the request body for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody).toBeVisible()

  await expect(requestBody.getByRole('heading', { level: 2 }).getByText('required')).toBeVisible()

  await expect(requestBody.getByText('Animal to add')).toBeVisible()

  await expect(docPage.getMediaTypePickerValue(requestBody)).toHaveText('application/json')
})

test('displays a generated request body example for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/hamsters')

  const requestBody = docPage.getRequestBody()
  const mediaTypeSelector = docPage.getMediaTypePicker(requestBody)

  await mediaTypeSelector.selectOption('application/json')

  const example = docPage.getVisibleExample(requestBody)

  await expect(example).toBeVisible()
  await expect(example).toContainText('"id": 1')
  await expect(example).toContainText('"name": "example"')

  await mediaTypeSelector.selectOption('application/x-www-form-urlencoded')

  await expect(example).toBeVisible()
  await expect(example).toContainText('id=1&name=example')
})

test('displays authored x-www-form-urlencoded request body examples', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/rabbits')

  const requestBody = docPage.getRequestBody()
  const example = docPage.getVisibleExample(requestBody)

  await expect(example).toBeVisible()
  await expect(example).toContainText('colors=brown,white&habitat=region,meadow,type,burrow')
  await expect(example).not.toContainText('%2C')
})

test('supports schema object for implicit objects', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/hamsters')

  await expect(docPage.getRequestBodyParameter('id')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()
})

test('supports schema object `allOf` property for explicit objects', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addcat/')

  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('tag')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('age')).toBeVisible()
})

test('supports schema object `allOf` property for implicit objects', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addturtle/')

  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('tag')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('age')).toBeVisible()
})

test('supports schema object `allOf` property for non-objects', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addpig/')

  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()

  const typeParameter = docPage.getRequestBodyParameter('type')

  await expect(typeParameter).toBeVisible()
  await expect(typeParameter.getByText('Allowed values: berkshire tamworth')).toBeVisible()
})

test('supports schema object `allOf` property with nested `allOf`', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/okapi/')

  await expect(docPage.getRequestBodyParameter('id')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('country')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('coordinates')).toBeVisible()
})

test('supports schema object `allOf` property with nested schema objects like `anyOf`', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/okapi/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Any of:')).toBeVisible()

  await expect(docPage.getSchemaTabs(requestBody)).toContainText(['basic details', 'advanced details'])

  await docPage.getSchemaTab(requestBody, 'advanced details').click()

  await expect(requestBody.getByText('age')).toBeVisible()
})

test('supports schema object `oneOf` property', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addbird/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('One of:')).toBeVisible()

  await expect(docPage.getSchemaTabs(requestBody)).toContainText(['string', 'object'])

  await expect(requestBody.getByText('Aubrey')).toBeVisible()

  await docPage.getSchemaTab(requestBody, 'object').click()

  await expect(requestBody.getByText(`{ "name": "Harley"}`)).toBeVisible()
})

test('supports schema object `anyOf` property', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/adddog/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Any of:')).toBeVisible()

  await expect(docPage.getSchemaTabs(requestBody)).toContainText(['object', 'object'])

  await expect(requestBody.getByText('A representation of an animal')).toBeVisible()

  await docPage.getSchemaTab(requestBody, 'object').nth(1).click()

  await expect(requestBody.getByText('integer format: int32')).toBeVisible()
})

test('supports array using the `oneOf` or `anyOf` property', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addfish/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('One of:')).toBeVisible()

  await expect(docPage.getSchemaTabs(requestBody)).toContainText(['object', 'object'])
})

test('sanitizes schema object used with the `oneOf` or `anyOf` property', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addhorse/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('One of:')).toBeVisible()

  await expect(docPage.getSchemaTabs(requestBody)).toContainText(['object', 'object'])

  await expect(docPage.getRequestBodyParameter('name')).toBeVisible()
  await expect(docPage.getRequestBodyParameter('age')).toHaveCount(0)

  await docPage.getSchemaTab(requestBody, 'object').nth(1).click()

  await expect(docPage.getRequestBodyParameter('name')).toHaveCount(0)
  await expect(docPage.getRequestBodyParameter('age')).toBeVisible()
})

test('supports schema object `not` property', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addwolf/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('not string')).toBeVisible()
})

test('supports schema object `discriminator` property', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addbear/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('One of: discriminator: type')).toBeVisible()
})

test('displays external docs', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addcat/')

  const externalDocsLink = docPage.getRequestBody().getByRole('link', { name: 'More information' })
  await expect(externalDocsLink).toBeVisible()
  expect(await externalDocsLink.getAttribute('href')).toBe('https://example.com/more-info')
})

test('displays examples', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addbird/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Aubrey')).toBeVisible()

  await docPage.getSchemaTab(requestBody, 'object').click()

  await expect(requestBody.getByText(`{ "name": "Harley"}`)).toBeVisible()
})

test('displays the global `consumes` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/petstore-simple/operations/addpet/')

  const requestBody = docPage.getRequestBody()

  await expect(docPage.getMediaTypePicker(requestBody)).toHaveCount(0)
  await expect(docPage.getMediaTypePickerValue(requestBody)).toHaveText('application/json')
})

test('overrides the global `consumes` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()
  const mediaTypeSelector = docPage.getMediaTypePicker(requestBody)

  await mediaTypeSelector.selectOption('application/json')
  await mediaTypeSelector.selectOption('application/xml')
})

test('displays property titles when provided', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('Name of the animal')).toBeVisible()
  await expect(requestBody.getByText('A friendly name for the animal.')).toBeVisible()
})

test('supports the `const` property in schemas', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/elephant/')

  const requestBody = docPage.getRequestBody()

  await expect(requestBody.getByText('One of:')).toBeVisible()

  await expect(docPage.getSchemaTabs(requestBody)).toContainText(['string', 'string'])

  await expect(requestBody.getByText('Allowed value: large')).toBeVisible()

  await docPage.getSchemaTab(requestBody, 'string').nth(1).click()

  await expect(requestBody.getByText('Allowed value: small')).toBeVisible()
})

test('does not render a request body media type picker when there is only one media type', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const requestBody = docPage.getRequestBody()

  await expect(docPage.getMediaTypePicker(requestBody)).toHaveCount(0)
  await expect(docPage.getMediaTypePickerValue(requestBody)).toHaveText('application/json')
})
