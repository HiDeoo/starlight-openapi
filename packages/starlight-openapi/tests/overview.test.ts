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

test('displays server informations for a v2.0 schema', async ({ docPage }) => {
  await docPage.goto('/v20/petstore-simple/')

  await expect(docPage.getByText('Host: petstore.swagger.io')).toBeVisible()
  await expect(docPage.getByText('Base Path: /api')).toBeVisible()
  await expect(docPage.getByText('Schemes: http')).toBeVisible()
})
