import { expect, test } from './test'

test('displays the toc for a basic overview', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/')

  const items = await docPage.getTocItems()

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      name: 'Swagger Petstore (1.0.0)',
    },
  ])
})

test('displays the toc for an overview with authentication', async ({ docPage }) => {
  await docPage.goto('/v30/animals/')

  const items = await docPage.getTocItems()

  expect(items).toMatchObject([
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
