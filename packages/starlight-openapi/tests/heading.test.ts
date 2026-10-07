import { expect, test } from './test'

for (const url of [
  '/v3/animals/operations/feed/',
  '/petstore/operations/addpet/',
  '/1password/operations/getapiactivity/',
]) {
  test(`uses consecutive heading levels (${url})`, async ({ docPage }) => {
    await docPage.goto(url)

    const levels = await docPage.page
      .locator('main :is(h1, h2, h3, h4, h5, h6)')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName[1])))

    const skips = levels.filter((level, index) => index > 0 && level > (levels[index - 1] ?? 0) + 1)

    expect(skips).toEqual([])
  })
}
