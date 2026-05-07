import { expect, test } from './test'

test('displays the recursive tag for a nullable array self-reference (OpenAPI 3.1 type array)', async ({
  docPage,
}) => {
  await docPage.goto('/v3/recursive-nullable-array/operations/validate')

  const errorResponse = docPage.getResponse('400')

  await expect(errorResponse.getByText('recursive')).toHaveCount(1)
})

test('displays the recursive tag for a compound items.oneOf containing a circular ref', async ({ docPage }) => {
  await docPage.goto('/v3/recursive-compound-items/operations/getshapes')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('recursive')).toHaveCount(1)
})

test('displays the recursive tag for a compound items.anyOf containing a circular ref', async ({ docPage }) => {
  await docPage.goto('/v3/recursive-compound-items-anyof/operations/getnodes')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('recursive')).toHaveCount(1)
})

test('displays the recursive tag for a recursive category schema', async ({ docPage }) => {
  await docPage.goto('/v3/recursive/operations/listcategories')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('recursive')).toHaveCount(1)
})

test('displays the recursive tag for a recursive post schema', async ({ docPage }) => {
  await docPage.goto('/v3/recursive/operations/listposts')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('recursive')).toHaveCount(1)
})

test('displays the recursive tag for simple and array recursive schema', async ({ docPage }) => {
  await docPage.goto('/v3/recursive-simple/operations/listcategories')

  const okResponse = docPage.getResponse('200')

  await expect(okResponse.getByText('recursive')).toHaveCount(2)

  const descriptions = okResponse.locator('.sl-openapi-key-description')

  await expect(descriptions.nth(2)).toHaveText(/object\s+recursive/)
  await expect(descriptions.nth(3)).toHaveText(/Array<object>\s+recursive/)
})
