import { expect, test } from './test'

test('displays code samples', async ({ docPage }) => {
  await docPage.goto('/v3/code-samples/operations/testcodesamples/')

  await expect(docPage.getByRole('heading', { level: 2, name: 'Code Samples' })).toBeVisible()

  await expect(docPage.page.getByRole('tab', { name: 'JavaScript' })).toBeVisible()
  await expect(docPage.getByText("fetch('https://api.example.com/test')")).toBeVisible()

  await expect(docPage.page.getByRole('tab', { name: 'Python' })).toBeVisible()
  await docPage.page.getByRole('tab', { name: 'Python' }).click()
  await expect(docPage.getByText("requests.get('https://api.example.com/test')")).toBeVisible()
})
