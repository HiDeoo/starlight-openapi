import { expect, test } from './test'

test('displays the toc for a basic overview', async ({ docPage }) => {
  await docPage.goto('/v3/petstore-simple/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    {
      name: 'Swagger Petstore (1.0.0)',
    },
    {
      name: 'Operations',
    },
  ])
})

test('displays the toc for an overview with authentication', async ({ docPage }) => {
  await docPage.goto('/v3/animals/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    {
      name: 'Animals (1.0.0)',
    },
    {
      name: 'Operations',
    },
    {
      label: 'Authentication',
      items: [
        { name: 'basic_auth' },
        { name: 'bearer_auth' },
        { name: 'api_key' },
        { name: 'mutual_tls_auth' },
        { name: 'animals_auth' },
        { name: 'openIdConnect' },
      ],
    },
  ])
})

test('displays the toc for an operation', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listanimals/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    { name: 'Authorizations' },
    {
      label: 'Parameters',
      items: [{ name: 'Query Parameters' }, { name: 'Header Parameters' }],
    },
    {
      label: 'Responses',
      items: [{ name: '200' }, { name: 'default' }],
    },
  ])

  await docPage.goto('/petstore/operations/deletepet/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    {
      label: 'Parameters',
      items: [{ name: 'Path Parameters' }],
    },
    {
      label: 'Responses',
      items: [{ name: '204' }, { name: 'default' }],
    },
  ])

  await docPage.goto('/v2/petstore-simple/operations/addpet/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    { name: 'Code Samples' },
    { name: 'Request Body' },
    {
      label: 'Responses',
      items: [{ name: '200' }, { name: 'default' }],
    },
  ])
})

test('displays the toc for an operation tag overview', async ({ docPage }) => {
  await docPage.goto('/1password/operations/tags/items/')

  expect(await docPage.getTocItems()).toMatchObject([
    {
      name: 'Overview',
    },
    { name: 'Items' },
    { name: 'Operations' },
  ])
})
