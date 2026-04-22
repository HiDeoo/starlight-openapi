import { expect, test } from './test'

test('displays the responses for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/adddog/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('animal response')).toBeVisible()

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('unexpected error')).toBeVisible()
})

test('displays a generated response example for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addanimal/')

  const okResponse = docPage.getResponse('200')
  const example = docPage.getVisibleExample(okResponse)
  const mediaTypeSelector = docPage.getMediaTypePicker(okResponse)

  await mediaTypeSelector.selectOption('application/json')

  await expect(example).toBeVisible()

  await mediaTypeSelector.selectOption('application/xml')

  await expect(example).toHaveCount(0)
})

test('displays the responses for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('animal response')).toBeVisible()

  expect(await docPage.getMediaTypePicker(okResponse).inputValue()).toBe('application/json')

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('unexpected error')).toBeVisible()

  expect(await docPage.getMediaTypePicker(defaultResponse).inputValue()).toBe('application/json')

  const example = docPage.getVisibleExample(defaultResponse)

  await expect(example).toBeVisible()
  await expect(example).toContainText('"code": 1')
  await expect(example).toContainText('"message": "example"')
})

test('hides nested schema examples when a response example is displayed', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listbirds/')

  const okResponse = docPage.getResponse('200')

  const panel = docPage.getVisibleMediaPanel(okResponse)

  await expect(panel.locator('.sl-openapi-examples')).toHaveCount(1)

  const example = docPage.getVisibleExample(okResponse)

  await expect(example).toContainText('"id": 1')
  await expect(example).toContainText('"name": "dog"')
  await expect(example).toContainText('"tag": "pet"')
})

test('displays the global `produces` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/petstore-simple/operations/addpet/')

  await docPage.getMediaTypePicker(docPage.getResponse('200')).selectOption('application/json')
})

test('overrides the global `produces` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addanimal/')

  const okResponse = docPage.getResponse('200')
  const mediaTypeSelector = docPage.getMediaTypePicker(okResponse)

  await mediaTypeSelector.selectOption('application/json')
  await mediaTypeSelector.selectOption('application/xml')
})

test('display the examples for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/findanimals/')

  const okResponse = docPage.getResponse('200')
  const mediaTypeSelector = docPage.getMediaTypePicker(okResponse)

  await expect(okResponse.getByText('animal response')).toBeVisible()

  await mediaTypeSelector.selectOption('application/json')

  const example = docPage.getVisibleExample(okResponse)

  await expect(example).toBeVisible()
  await expect(example.getByText(`[ { "id": 1, "name": "Bessy" }, { "id": 2, "name": "Hazel" }]`)).toBeVisible()

  await mediaTypeSelector.selectOption('application/xml')

  await expect(example).toBeVisible()
  await expect(example.getByText(`[ { "id": 3, "name": "Cleo" }, { "id": 4, "name": "Daisy" }]`)).toBeVisible()

  await mediaTypeSelector.selectOption('text/xml')

  await expect(example).toHaveCount(0)

  await mediaTypeSelector.selectOption('text/html')

  await expect(example).toHaveCount(0)
})

test('displays nested objects collapsed by default', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listbears/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('integer format: int64').first()).not.toBeVisible()

  await okResponse.getByRole('group').click()

  await expect(okResponse.getByText('integer format: int64').first()).toBeVisible()
})
