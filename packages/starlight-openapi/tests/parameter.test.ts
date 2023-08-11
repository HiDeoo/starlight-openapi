import { expect, test } from './test'

test('hides the parameters section with no parameters', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listcats/')

  await expect(docPage.page.getByRole('heading', { level: 2, name: 'Parameters' })).not.toBeVisible()
})

test('displays all parameters grouped by location', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  await expect(docPage.getParameters('query')).toHaveCount(2)
  await expect(docPage.getParameters('query')).toContainText(['limit', 'tags'])

  await expect(docPage.getParameters('header')).toHaveCount(1)
  await expect(docPage.getParameters('header')).toContainText('offset')
})

test('overrides path item level parameters', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  await expect(docPage.getParameters('query').getByText('The path item level limit parameter')).not.toBeVisible()
  await expect(
    docPage.getParameters('query').getByText('How many animals to return at one time (max 100)'),
  ).toBeVisible()
})

test('displays basic parameters', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  const limitParameter = docPage.getParameters('query').filter({ hasText: 'limit' })

  await expect(limitParameter.getByText('How many animals to return at one time (max 100)')).toBeVisible()
  await expect(limitParameter.getByText('NOT REQUIRED')).toBeVisible()
  await expect(limitParameter.getByText('DEPRECATED')).toBeVisible()
  await expect(limitParameter.getByText('ALLOW EMPTY VALUE', { exact: true })).not.toBeVisible()

  const tagsParameter = docPage.getParameters('query').filter({ hasText: 'tags' })

  await expect(tagsParameter.getByText('REQUIRED')).toBeVisible()
  await expect(tagsParameter.getByText('NOT REQUIRED')).not.toBeVisible()
  await expect(tagsParameter.getByText('DEPRECATED')).not.toBeVisible()
  await expect(tagsParameter.getByText('ALLOW EMPTY VALUE')).toBeVisible()
})

test('does not display the body parameter for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/petstore-simple/operations/addpet/')

  await expect(docPage.getParameters('body')).not.toBeVisible()
})

test('displays type informations for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/findanimals/')

  const tagsParameter = docPage.getParameters('query').filter({ hasText: 'tags' })

  await expect(tagsParameter.getByText('Type: array')).toBeVisible()
  await expect(tagsParameter.getByText('Max Items: 10')).toBeVisible()
  await expect(tagsParameter.getByText('Min Items: 1')).toBeVisible()
  await expect(tagsParameter.getByText('ONLY UNIQUE ITEMS')).toBeVisible()
  await expect(tagsParameter.getByText('Items: Type: string')).toBeVisible()

  const limitParameter = docPage.getParameters('query').filter({ hasText: 'limit' })

  await expect(limitParameter.getByText('Format: int32')).toBeVisible()
  await expect(limitParameter.getByText('Default Value: 10')).toBeVisible()
  await expect(limitParameter.getByText('Maximum: 100')).toBeVisible()
  await expect(limitParameter.getByText('Exclusive Maximum')).toBeVisible()
  await expect(limitParameter.getByText('Minimum: 1')).toBeVisible()
  await expect(limitParameter.getByText('Exclusive Minimum')).not.toBeVisible()
  await expect(limitParameter.getByText('Multiple Of: 2')).toBeVisible()

  const filterParameter = docPage.getParameters('query').filter({ hasText: 'filter' })

  await expect(filterParameter.getByText('Max Length: 100')).toBeVisible()
  await expect(filterParameter.getByText('Min Length: 3')).toBeVisible()
  await expect(filterParameter.getByText('Pattern: ^[a-zA-Z0-9]+$')).toBeVisible()

  const sortParameter = docPage.getParameters('query').filter({ hasText: 'sort' })

  await expect(sortParameter.getByText('Enum: asc,desc')).toBeVisible()
})
