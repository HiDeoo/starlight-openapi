import { expect, test } from './test'

test('displays authored code samples in the snippet picker', async ({ docPage }) => {
  await docPage.goto('/v2/petstore-simple/operations/addpet/')

  const picker = docPage.getOperationSnippetPicker()

  await expect(picker).toBeVisible()
  await expect(picker.locator('option')).toHaveText(['JavaScript', 'python'])

  const snippet = docPage.getVisibleOperationSnippet()

  await expect(snippet).toContainText("fetch('http://petstore.swagger.io/api/pets', {")

  await picker.selectOption({ label: 'python' })

  await expect(snippet).toContainText("requests.post('http://petstore.swagger.io/api/pets', json={'name': 'Fido'})")
})
