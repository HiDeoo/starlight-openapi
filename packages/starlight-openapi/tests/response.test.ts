import { expect, test } from './test'

test('displays the responses for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/adddog/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('animal response')).toBeVisible()

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('unexpected error')).toBeVisible()
})

test('displays the responses for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('animal response')).toBeVisible()

  expect(await okResponse.getByRole('combobox').inputValue()).toBe('application/json')

  const defaultResponse = docPage.getResponse('default')

  await expect(defaultResponse.getByText('unexpected error')).toBeVisible()

  expect(await defaultResponse.getByRole('combobox').inputValue()).toBe('application/json')
})

test('displays the global `produces` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/petstore-simple/operations/addpet/')

  await docPage.getResponse('200').getByRole('combobox').selectOption('application/json')
})

test('overrides the global `produces` property for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/addanimal/')

  const okResponse = docPage.getResponse('200')

  await okResponse.getByRole('combobox').selectOption('application/json')
  await okResponse.getByRole('combobox').selectOption('application/xml')
})

test('display the examples for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/findanimals/')

  const examples = docPage.getResponseExamples('200')

  await examples.getByRole('combobox').selectOption('application/json')

  await expect(
    examples.getByText(`[
  {
    "id": 1,
    "name": "Bessy"
  },
  {
    "id": 2,
    "name": "Hazel"
  }
]`),
  ).toBeVisible()

  await examples.getByRole('combobox').selectOption('application/xml')

  await expect(
    examples.getByText(`[
  {
    "id": 3,
    "name": "Cleo"
  },
  {
    "id": 4,
    "name": "Daisy"
  }
]`),
  ).toBeVisible()
})

test('displays nested objects collapsed by default', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listbears/')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('integer format: int64').first()).not.toBeVisible()

  await okResponse.getByRole('group').click()

  await expect(okResponse.getByText('integer format: int64').first()).toBeVisible()
})
