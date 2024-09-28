import { expect, test } from './test'

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

test('displays the recursive tag for a simpler recursive category schema', async ({ docPage }) => {
  await docPage.goto('/v3/recursive-simple/operations/listcategories')
  const okResponse = docPage.getResponse('200')
  await expect(okResponse.getByText('recursive')).toHaveCount(1)
})
