import { expect, test } from './test'

test('hides the callback section with no callbacks', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/listcats/')

  await expect(docPage.page.getByRole('heading', { level: 2, name: 'Callbacks' })).not.toBeVisible()
})

test('displays callback sections', async ({ docPage }) => {
  await docPage.goto('/v3/animals/operations/feed/')

  await expect(docPage.getCallback('onData')).toBeVisible()

  await expect(docPage.getByText('{$request.query.callbackUrl}/data')).toBeVisible()

  const requestBody = docPage.getCallbackRequestBody('onData')
  await expect(requestBody).toBeVisible()
  await expect(requestBody.getByText('Subscription payload')).toBeVisible()

  const TwoOTwoResponse = docPage.getCallbackRequestResponse('onData', '202')
  await expect(TwoOTwoResponse).toBeVisible()
  await expect(
    TwoOTwoResponse.getByText(
      'Your server implementation should return this HTTP status code if the data was received successfully',
    ),
  ).toBeVisible()

  const TwoOFourResponse = docPage.getCallbackRequestResponse('onData', '204')
  await expect(TwoOFourResponse).toBeVisible()
  await expect(
    TwoOFourResponse.getByText(
      'Your server should return this HTTP status code if no longer interested in further updates',
    ),
  ).toBeVisible()
})
