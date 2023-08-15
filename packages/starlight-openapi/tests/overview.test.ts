import { expect, test } from './test'

test('displays a basic overview', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/')

  await docPage.expectToHaveTitle('Overview')

  await expect(docPage.getByText('OpenAPI version: 3.0.0')).toBeVisible()
  await expect(docPage.getByText('Title: Swagger Petstore')).toBeVisible()
  await expect(docPage.getByText('Version: 1.0.0')).toBeVisible()
  await expect(docPage.getByText('License name: MIT')).toBeVisible()
})

test('displays advanced overviews', async ({ docPage }) => {
  await docPage.goto('/v30/petstore-expanded/')

  await docPage.expectToHaveTitle('Overview')

  await expect(docPage.getByText('OpenAPI version: 3.0.0')).toBeVisible()
  await expect(docPage.getByText('Title: Swagger Petstore')).toBeVisible()
  await expect(
    docPage.getByText(
      'Description in MARKDOWN: A sample API that uses a petstore as an example to demonstrate features in the OpenAPI 3.0 specification',
    ),
  ).toBeVisible()
  await expect(docPage.getByText('TOS: http://swagger.io/terms/')).toBeVisible()
  await expect(docPage.getByText('Contact name: Swagger API Team')).toBeVisible()
  await expect(docPage.getByText('Contact email: apiteam@swagger.io')).toBeVisible()
  await expect(docPage.getByText('Contact URL: http://swagger.io')).toBeVisible()
  await expect(docPage.getByText('License name: Apache 2.0')).toBeVisible()
  await expect(docPage.getByText('License URL: https://www.apache.org/licenses/LICENSE-2.0.html')).toBeVisible()
})

test('displays external docs link in the overview', async ({ docPage }) => {
  await docPage.goto('/v30/animals/')

  await expect(docPage.getByText('External Docs URL: https://example.com/more-info')).toBeVisible()
  await expect(docPage.getByText('External Docs Description: Find out more about our animals')).toBeVisible()
})

test('does not display the authentication section if not required', async ({ docPage }) => {
  await docPage.goto('/v20/petstore-simple/')

  await expect(docPage.getAuthentication()).not.toBeVisible()
})

test('displays the authentication section for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/animals/')

  const basicAuth = docPage.getAuthenticationMethod('basic_auth')

  await expect(basicAuth.getByText('Scheme description: HTTP Basic Authentication')).toBeVisible()
  await expect(basicAuth.getByText('Scheme type: basic')).toBeVisible()

  const apiKey = docPage.getAuthenticationMethod('api_key')

  await expect(apiKey.getByText('Scheme description: API Key Authentication')).toBeVisible()
  await expect(apiKey.getByText('Scheme type: apiKey')).toBeVisible()
  await expect(apiKey.getByText('header parameter name: api_key')).toBeVisible()

  const oAuth2 = docPage.getAuthenticationMethod('animals_auth')

  await expect(oAuth2.getByText('Scheme type: oauth2')).toBeVisible()
  await expect(oAuth2.getByText('Flow type: implicit')).toBeVisible()
  await expect(oAuth2.getByText('Authorization URL: https://example.com/api/oauth/dialog')).toBeVisible()
  await expect(oAuth2.getByText('Token URL: https://example.com/api/oauth/token')).toBeVisible()
  await expect(oAuth2.getByText('Scopes:')).toBeVisible()
  await expect(oAuth2.getByText('write:animals -write animals')).toBeVisible()
  await expect(oAuth2.getByText('read:animals -read animals')).toBeVisible()
})

test('displays the authentication section for a v3.0 schema', async ({ docPage }) => {
  await docPage.goto('/v30/animals/')

  const basicAuth = docPage.getAuthenticationMethod('basic_auth')

  await expect(basicAuth.getByText('Scheme type: http')).toBeVisible()

  const bearer = docPage.getAuthenticationMethod('bearer_auth')

  await expect(bearer.getByText('Scheme type: http')).toBeVisible()
  await expect(bearer.getByText('Bearer Format: JWT')).toBeVisible()

  const apiKey = docPage.getAuthenticationMethod('api_key')

  await expect(apiKey.getByText('Scheme type: apiKey')).toBeVisible()
  await expect(apiKey.getByText('cookie parameter name: api_key')).toBeVisible()

  const mutualTLS = docPage.getAuthenticationMethod('mutual_tls_auth')

  await expect(mutualTLS.getByText('Scheme type: mutualTLS')).toBeVisible()

  const oAuth2 = docPage.getAuthenticationMethod('animals_auth')

  await expect(oAuth2.getByText('Scheme type: oauth2')).toBeVisible()
  await expect(oAuth2.getByText('Flow type: implicit')).toBeVisible()
  await expect(oAuth2.getByText('Authorization URL: https://example.com/api/oauth/dialog')).toBeVisible()
  await expect(oAuth2.getByText('Token URL: https://example.com/api/oauth/token')).toBeVisible()
  await expect(oAuth2.getByText('Refresh URL: https://example.com/api/oauth/refresh')).toBeVisible()
  await expect(oAuth2.getByText('Scopes:')).toBeVisible()
  await expect(oAuth2.getByText('write:animals -write animals')).toBeVisible()
  await expect(oAuth2.getByText('read:animals -read animals')).toBeVisible()

  const openID = docPage.getAuthenticationMethod('openIdConnect')

  await expect(openID.getByText('Scheme type: openIdConnect')).toBeVisible()
  await expect(
    openID.getByText('OpenID Connect URL: https://example.com/.well-known/openid-configuration'),
  ).toBeVisible()
})
