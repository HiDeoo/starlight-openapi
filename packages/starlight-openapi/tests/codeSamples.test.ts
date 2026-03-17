import { expect, test } from './test'

test('displays code samples', async ({ docPage }) => {
  await docPage.goto('/v2/petstore-simple/operations/addpet/')

  await expect(docPage.getByRole('heading', { level: 2, name: 'Code Samples' })).toBeVisible()

  await expect(docPage.getByRole('tab', { name: 'JavaScript' })).toBeVisible()

  await expect(docPage.getByRole('tabpanel')).toContainText("fetch('http://petstore.swagger.io/api/pets', {")

  await docPage.getByRole('tab', { name: 'python' }).click()

  await expect(docPage.getByRole('tabpanel')).toContainText(
    "requests.post('http://petstore.swagger.io/api/pets', json={'name': 'Fido'})",
  )
})
