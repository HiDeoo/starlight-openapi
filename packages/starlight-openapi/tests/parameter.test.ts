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

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('required')).not.toBeVisible()
  await expect(limitParameter.getByText('deprecated')).toBeVisible()
  await expect(limitParameter.getByText('How many animals to return at one time (max 100)')).toBeVisible()

  const tagsParameter = docPage.getParameter('query', 'tags')

  await expect(tagsParameter.getByText('required')).toBeVisible()
  await expect(tagsParameter.getByText('deprecated')).not.toBeVisible()
})

test('does not display the body parameter for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/petstore-simple/operations/addpet/')

  await expect(docPage.getParameters('body')).not.toBeVisible()
})

test('displays type informations for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/operations/findanimals/')

  const tagsParameter = docPage.getParameter('query', 'tags')

  await expect(tagsParameter.getByText('array')).toBeVisible()
  await expect(tagsParameter.getByText('>= 1 items')).toBeVisible()
  await expect(tagsParameter.getByText('<= 10 items')).toBeVisible()
  await expect(tagsParameter.getByText('unique items')).toBeVisible()
  await expect(tagsParameter.getByText('Items: string')).toBeVisible()

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('format: int32')).toBeVisible()
  await expect(limitParameter.getByText('default: 10')).toBeVisible()
  await expect(limitParameter.getByText('>= 1')).toBeVisible()
  await expect(limitParameter.getByText('< 100')).toBeVisible()
  await expect(limitParameter.getByText('multiple of 2')).toBeVisible()

  const filterParameter = docPage.getParameter('query', 'filter')

  await expect(filterParameter.getByText('>= 3 characters')).toBeVisible()
  await expect(filterParameter.getByText('<= 100 characters')).toBeVisible()
  await expect(filterParameter.getByText('/^[a-zA-Z0-9]+$/')).toBeVisible()

  const sortParameter = docPage.getParameter('query', 'sort')

  await expect(sortParameter.getByText('Enum: asc,desc')).toBeVisible()
})

test('hides various header parameters', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/addanimal/')

  await expect(docPage.getParameters('header')).not.toBeVisible()
})

test('displays type informations for a v3.0 schema shared with a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/addanimal/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('integer')).toBeVisible()
})

test('displays type informations for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('NULLABLE')).toBeVisible()
})

test('overrides a schema example by a parameter example', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listbirds/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('Example value: 10')).not.toBeVisible()
  await expect(limitParameter.getByText('Example value: 20')).toBeVisible()
})

test('displays multiple examples', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listdogs/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('Example name: single')).toBeVisible()
  await expect(limitParameter.getByText('Example Summary: A single dog')).toBeVisible()
  await expect(limitParameter.getByText('Example Description IN MARKDOWN: A unique dog')).toBeVisible()
  await expect(limitParameter.getByText('Example external value (LINK): https://example.com/dogs/1')).toBeVisible()

  await expect(limitParameter.getByText('Example name: multiple')).toBeVisible()
  await expect(limitParameter.getByText('Example value: 30')).toBeVisible()
})

test('uses the `content` property over a schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listbears/')

  const limitParameter = docPage.getParameter('query', 'limit')
  const mediaTypeSelector = limitParameter.getByRole('combobox')

  await expect(limitParameter.getByRole('combobox')).toBeVisible()

  await mediaTypeSelector.selectOption('application/json')
  await mediaTypeSelector.selectOption('application/xml')

  // TODO(HiDeoo) test content
})
