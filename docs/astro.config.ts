import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateAPI } from 'starlight-openapi'

// TODO(HiDeoo)
const { openAPISidebarGroups, starlightOpenAPI } = await generateAPI([
  { base: '/json', label: 'Petstore v3.0 (JSON)', schema: '../schemas/v3.0/petstore.json' },
  { base: '/yaml', label: 'Petstore v3.0 (YAML)', schema: '../schemas/v3.0/petstore.yaml' },
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
      sidebar: [
        {
          label: 'Guides',
          // TODO(HiDeoo)
          items: [{ label: 'Example Guide', link: '/guides/example/' }],
        },
        {
          label: 'Examples',
          items: openAPISidebarGroups,
        },
      ],
    }),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
