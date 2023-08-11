import { expect, test } from './test'

test('displays all parameters grouped by location', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  await expect(docPage.getParameters('query')).toHaveCount(2)
  await expect(docPage.getParameters('query')).toContainText(['limit', 'tags'])

  await expect(docPage.getParameters('header')).toHaveCount(1)
  await expect(docPage.getParameters('header')).toContainText('offset')
})

test('overrides path item level parameters', async ({ docPage }) => {
  await docPage.goto('/v30/animals/operations/listanimals/')

  await expect(docPage.getParameters('query').getByText('The path item level limit parameter')).not.toBeVisible()
  await expect(
    docPage.getParameters('query').getByText('How many animals to return at one time (max 100)'),
  ).toBeVisible()
})
