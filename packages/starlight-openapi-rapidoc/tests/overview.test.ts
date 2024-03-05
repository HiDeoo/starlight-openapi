import { expect, test } from './test'

test('displays a basic overview', async ({ docPage }) => {
  await docPage.goto('/v3/petstore-simple/')

  await docPage.expectToHaveTitle('Overview')

  await expect(docPage.getByRole('heading', { level: 2, name: 'Swagger Petstore (1.0.0)' })).toBeVisible()

  const details = docPage.getByRole('listitem')

  await expect(details.getByText('License: MIT')).toBeVisible()
  await expect(details.getByText('OpenAPI version: 3.0.0')).toBeVisible()
})

test('displays advanced overviews', async ({ docPage }) => {
  await docPage.goto('/petstore/')

  await docPage.expectToHaveTitle('Overview')

  await expect(docPage.getByRole('heading', { level: 2, name: 'Swagger Petstore (1.0.0)' })).toBeVisible()

  await expect(
    docPage.getByText(
      'A sample API that uses a petstore as an example to demonstrate features in the OpenAPI 3.0 specification',
    ),
  ).toBeVisible()

  const details = docPage.getByRole('list')

  await expect(details.getByText('Swagger API Team')).toBeVisible()
  expect(await details.getByRole('link', { name: 'http://swagger.io' }).getAttribute('href')).toBe('http://swagger.io')
  expect(await details.getByRole('link', { name: 'apiteam@swagger.io' }).getAttribute('href')).toBe(
    'mailto:apiteam@swagger.io',
  )

  await expect(details.getByText('License: Apache 2.0')).toBeVisible()
  expect(await details.getByRole('link', { name: 'Apache 2.0' }).getAttribute('href')).toBe(
    'https://www.apache.org/licenses/LICENSE-2.0.html',
  )

  expect(await details.getByRole('link', { name: 'Terms of Service' }).getAttribute('href')).toBe(
    'http://swagger.io/terms/',
  )

  await expect(details.getByText('OpenAPI version: 3.1.0')).toBeVisible()
})

test('displays external docs link in the overview', async ({ docPage }) => {
  await docPage.goto('/v3/animals/')

  const externalDocsLink = docPage.getByRole('link', { name: 'Find out more about our animals' })
  await expect(externalDocsLink).toBeVisible()
  expect(await externalDocsLink.getAttribute('href')).toBe('https://example.com/more-info')
})

test('does not display the authentication section if not required', async ({ docPage }) => {
  await docPage.goto('/v2/petstore-simple/')

  await expect(docPage.getAuthentication()).not.toBeVisible()
})

test('displays the authentication section for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v2/animals/')

  const basicAuth = docPage.getAuthenticationMethod('basic_auth')

  await expect(basicAuth.getByText('HTTP Basic Authentication')).toBeVisible()
  await expect(basicAuth.getByText('Security scheme type: basic')).toBeVisible()

  const apiKey = docPage.getAuthenticationMethod('api_key')

  await expect(apiKey.getByText('API Key Authentication')).toBeVisible()
  await expect(apiKey.getByText('Security scheme type: apiKey')).toBeVisible()
  await expect(apiKey.getByText('Header parameter name: api_key')).toBeVisible()

  const oAuth2 = docPage.getAuthenticationMethod('animals_auth')

  await expect(oAuth2.getByText('Security scheme type: oauth2')).toBeVisible()
  await expect(oAuth2.getByText('Flow type: implicit')).toBeVisible()
  await expect(oAuth2.getByText('Authorization URL: ')).toBeVisible()
  expect(
    await oAuth2.getByRole('link').filter({ hasText: 'https://example.com/api/oauth/dialog' }).getAttribute('href'),
  ).toBe('https://example.com/api/oauth/dialog')
  await expect(oAuth2.getByText('Token URL: ')).toBeVisible()
  expect(
    await oAuth2.getByRole('link').filter({ hasText: 'https://example.com/api/oauth/token' }).getAttribute('href'),
  ).toBe('https://example.com/api/oauth/token')
  await expect(oAuth2.getByText('Scopes:')).toBeVisible()
  await expect(oAuth2.getByRole('listitem').getByText('write:animals - write animals')).toBeVisible()
  await expect(oAuth2.getByRole('listitem').getByText('read:animals - read animals')).toBeVisible()
})

test('displays the authentication section for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v3/animals/')

  const basicAuth = docPage.getAuthenticationMethod('basic_auth')

  await expect(basicAuth.getByText('Security scheme type: http')).toBeVisible()

  const bearer = docPage.getAuthenticationMethod('bearer_auth')

  await expect(bearer.getByText('Security scheme type: http')).toBeVisible()
  await expect(bearer.getByText('Bearer format: JWT')).toBeVisible()

  const apiKey = docPage.getAuthenticationMethod('api_key')

  await expect(apiKey.getByText('Security scheme type: apiKey')).toBeVisible()
  await expect(apiKey.getByText('Cookie parameter name: api_key')).toBeVisible()

  const mutualTLS = docPage.getAuthenticationMethod('mutual_tls_auth')

  await expect(mutualTLS.getByText('Security scheme type: mutualTLS')).toBeVisible()

  const oAuth2 = docPage.getAuthenticationMethod('animals_auth')

  await expect(oAuth2.getByText('Security scheme type: oauth2')).toBeVisible()
  await expect(oAuth2.getByText('Flow type: implicit')).toBeVisible()
  await expect(oAuth2.getByText('Authorization URL: ')).toBeVisible()
  expect(
    await oAuth2.getByRole('link').filter({ hasText: 'https://example.com/api/oauth/dialog' }).getAttribute('href'),
  ).toBe('https://example.com/api/oauth/dialog')
  await expect(oAuth2.getByText('Token URL: ')).toBeVisible()
  expect(
    await oAuth2.getByRole('link').filter({ hasText: 'https://example.com/api/oauth/token' }).getAttribute('href'),
  ).toBe('https://example.com/api/oauth/token')
  await expect(oAuth2.getByText('Refresh URL: ')).toBeVisible()
  expect(
    await oAuth2.getByRole('link').filter({ hasText: 'https://example.com/api/oauth/refresh' }).getAttribute('href'),
  ).toBe('https://example.com/api/oauth/refresh')
  await expect(oAuth2.getByText('Scopes:')).toBeVisible()
  await expect(oAuth2.getByRole('listitem').getByText('write:animals - write animals')).toBeVisible()
  await expect(oAuth2.getByRole('listitem').getByText('read:animals - read animals')).toBeVisible()

  const openID = docPage.getAuthenticationMethod('openIdConnect')

  await expect(openID.getByText('Security scheme type: openIdConnect')).toBeVisible()
  await expect(openID.getByText('OpenID Connect URL: ')).toBeVisible()
  expect(
    await openID
      .getByRole('link')
      .filter({ hasText: 'https://example.com/.well-known/openid-configuration' })
      .getAttribute('href'),
  ).toBe('https://example.com/.well-known/openid-configuration')
})
