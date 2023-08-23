import { expect, test } from './test'

test('hides the parameters section with no parameters', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listcats/')

  await expect(docPage.page.getByRole('heading', { level: 2, name: 'Parameters' })).not.toBeVisible()
})

test('displays all parameters grouped by location', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listanimals/')

  await expect(docPage.getParameters('query')).toHaveCount(2)
  await expect(docPage.getParameters('query')).toContainText(['limit', 'tags'])

  await expect(docPage.getParameters('header')).toHaveCount(1)
  await expect(docPage.getParameters('header')).toContainText('offset')
})

test('overrides path item level parameters', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listanimals/')

  await expect(docPage.getParameters('query').getByText('The path item level limit parameter')).not.toBeVisible()
  await expect(
    docPage.getParameters('query').getByText('How many animals to return at one time (max 100)'),
  ).toBeVisible()
})

test('displays basic parameters', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listanimals/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('required')).not.toBeVisible()
  await expect(limitParameter.getByText('deprecated')).toBeVisible()
  await expect(limitParameter.getByText('How many animals to return at one time (max 100)')).toBeVisible()

  const tagsParameter = docPage.getParameter('query', 'tags')

  await expect(tagsParameter.getByText('required')).toBeVisible()
  await expect(tagsParameter.getByText('deprecated')).not.toBeVisible()
})

test('does not display the body parameter for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/petstore-simple/operations/addpet/')

  await expect(docPage.getParameters('body')).not.toBeVisible()
})

test('displays type informations for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/operations/findanimals/')

  const tagsParameter = docPage.getParameter('query', 'tags')

  await expect(tagsParameter.getByText('Array<string>')).toBeVisible()
  await expect(tagsParameter.getByText('>= 1 items')).toBeVisible()
  await expect(tagsParameter.getByText('<= 10 items')).toBeVisible()
  await expect(tagsParameter.getByText('unique items')).toBeVisible()

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

  await expect(sortParameter.getByText('Allowed values: asc desc')).toBeVisible()
})

test('hides various header parameters', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  await expect(docPage.getParameters('header')).not.toBeVisible()
})

test('displays type informations for a v3.0 schema shared with a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/addanimal/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('integer')).toBeVisible()
})

test('displays type informations for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listanimals/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('NULLABLE')).toBeVisible()
})

test('overrides a schema example by a parameter example', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listbirds/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByText('Example')).toBeVisible()
  await expect(limitParameter.getByText('10', { exact: true })).not.toBeVisible()
  await expect(limitParameter.getByText('20', { exact: true })).toBeVisible()
})

test('displays multiple examples', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listdogs/')

  const limitParameter = docPage.getParameter('query', 'limit')

  await expect(limitParameter.getByRole('heading', { level: 5, name: 'Examples' })).toBeVisible()

  await limitParameter.getByRole('combobox').selectOption('single')

  await expect(limitParameter.getByText('A single dog')).toBeVisible()
  await expect(limitParameter.getByText('A unique dog')).toBeVisible()
  expect(await limitParameter.getByRole('link', { name: 'https://example.com/dogs/1' }).getAttribute('href')).toBe(
    'https://example.com/dogs/1',
  )

  await limitParameter.getByRole('combobox').selectOption('multiple')

  await expect(limitParameter.getByText('30')).toBeVisible()
})

test('uses the `content` property over a schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listbears/')

  const limitParameter = docPage.getParameter('query', 'limit')
  const mediaTypeSelector = limitParameter.getByRole('combobox')

  await limitParameter.highlight()
  await docPage.page.pause()

  await expect(mediaTypeSelector).toBeVisible()

  await mediaTypeSelector.selectOption('application/json')
  await expect(limitParameter.getByText('integer').first()).toBeVisible()
  await expect(limitParameter.getByText('integer').last()).not.toBeVisible()
  await expect(limitParameter.getByRole('heading', { level: 5, name: 'Example' })).toBeVisible()
  await expect(limitParameter.getByText('20')).toBeVisible()

  await mediaTypeSelector.selectOption('application/xml')
  await expect(limitParameter.getByText('integer').first()).not.toBeVisible()
  await expect(limitParameter.getByText('integer').last()).toBeVisible()
  await expect(limitParameter.getByRole('heading', { level: 5, name: 'Example' })).toBeVisible()
  await expect(limitParameter.getByText('30')).toBeVisible()

  expect(await docPage.getResponse('200').getByRole('combobox').inputValue()).toBe('application/json')
})

test('displays path parameters first then other parameters', async ({ docPage }) => {
  await docPage.goto('/petstore/operations/find-pet-by-id/')

  await expect(
    docPage.page.locator(
      'section:has(> h3:first-child:text-is("Path Parameters")) + section:has(> h3:first-child:text-is("Query Parameters"))',
    ),
  ).toBeVisible()
})
