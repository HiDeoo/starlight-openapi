import { expect, test } from './test'

test('displays the recursive tags for a recursive category schema', async ({ docPage }) => {
  await docPage.goto('/v3/recursive/operations/listcategories')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.locator('.sl-openapi-tag').getByText('recursive', { exact: true })).toHaveCount(3)
})

test('displays the recursive tags for a recursive post schema', async ({ docPage }) => {
  await docPage.goto('/v3/recursive/operations/listposts')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.locator('.sl-openapi-tag').getByText('recursive', { exact: true })).toHaveCount(3)
})

test('displays the recursive tags for `oneOf` array items', async ({ docPage }) => {
  await docPage.goto('/v3/recursive/operations/listcategories')

  const okResponse = docPage.getResponse('200')
  const related = okResponse.locator('.sl-openapi-key').filter({
    has: docPage.page.locator('.sl-openapi-key-name').getByText('related', { exact: true }),
  })

  await expect(related.locator('.sl-openapi-schema-objects-type')).toHaveText('One of:')

  const tabLabels = await related.locator('[role="tab"]').allTextContents()
  const labels = tabLabels.map((label) => label.trim())

  expect(labels).toEqual(expect.arrayContaining(['object', 'recursive object']))
  await expect(related.locator('.sl-openapi-tag').getByText('recursive', { exact: true })).toHaveCount(2)
})

test('displays the recursive tags for nullable arrays', async ({ docPage }) => {
  await docPage.goto('/v3/recursive/operations/listcategories')

  const defaultResponse = docPage.getResponse('default')
  const causes = defaultResponse.locator('.sl-openapi-key').filter({
    has: docPage.page.locator('.sl-openapi-key-name').getByText('causes', { exact: true }),
  })

  await expect(causes.locator('.sl-openapi-key-description')).toHaveText(/Array<object>\s+recursive\s+\| null/)
})

test('displays the recursive tag for simple and array recursive schema', async ({ docPage }) => {
  await docPage.goto('/v3/recursive-simple/operations/listcategories')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('recursive')).toHaveCount(2)

  const descriptions = okResponse.locator('.sl-openapi-key-description')

  await expect(descriptions.nth(2)).toHaveText(/object\s+recursive/)
  await expect(descriptions.nth(3)).toHaveText(/Array<object>\s+recursive/)
})
