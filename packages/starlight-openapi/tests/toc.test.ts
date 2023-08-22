import { expect, test } from './test'

test('displays the toc for a basic overview', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    {
      name: 'Swagger Petstore (1.0.0)',
    },
  ])
})

test('displays the toc for an overview with authentication', async ({ docPage }) => {
  await docPage.goto('/v30/animals/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    {
      name: 'Animals (1.0.0)',
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
  await docPage.goto('/v30/animals/operations/listanimals/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    { name: 'Authorizations' },
    {
      label: 'Parameters',
      items: [{ name: 'query parameters' }, { name: 'header parameters' }],
    },
    {
      label: 'Responses',
      items: [{ name: '200' }, { name: 'default' }],
    },
  ])

  await docPage.goto('/v30/petstore-expanded/operations/deletepet/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    {
      label: 'Parameters',
      items: [{ name: 'path parameters' }],
    },
    {
      label: 'Responses',
      items: [{ name: '204' }, { name: 'default' }],
    },
  ])

  await docPage.goto('/v20/petstore-simple/operations/addpet/')

  expect(await docPage.getTocItems()).toMatchObject([
    { name: 'Overview' },
    { name: 'Request Body' },
    {
      label: 'Responses',
      items: [{ name: '200' }, { name: 'default' }],
    },
  ])
})
