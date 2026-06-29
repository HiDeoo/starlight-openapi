import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri'

const processor = await createSatteriMarkdownProcessor()

export async function transformMarkdown(markdown: string) {
  const result = await processor.render(markdown)

  return result.code
}
