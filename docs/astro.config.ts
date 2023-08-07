import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateAPI } from 'starlight-openapi'

// TODO(HiDeoo)
const { starlightOpenAPI } = await generateAPI([
  { base: 'yaml', schema: '../schemas/v3.0/petstore.yaml' },
  { base: 'json', schema: '../schemas/v3.0/petstore.json' },
])

export default defineConfig({
  integrations: [
    starlightOpenAPI(),
    starlight({
      title: '// TODO(HiDeoo)',
      // TODO(HiDeoo)
      social: {
        github: 'https://github.com/withastro/starlight',
      },
      // TODO(HiDeoo)
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', link: '/guides/example/' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
