import { expect, test } from './test'

test('display a basic overview', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/json/')

  await expect(docPage.getByText('OpenAPI version: 3.0.0')).toBeVisible()
  await expect(docPage.getByText('Title: Swagger Petstore')).toBeVisible()
  await expect(docPage.getByText('Version: 1.0.0')).toBeVisible()
  await expect(docPage.getByText('License name: MIT')).toBeVisible()
})

test('display advanced overviews', async ({ docPage }) => {
  await docPage.goto('/v30/petstore/expanded/')

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
