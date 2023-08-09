import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateAPI } from 'starlight-openapi'

// TODO(HiDeoo)
const { openAPISidebarGroups, starlightOpenAPI } = await generateAPI([
  { base: 'api/v3.0/petstore/json', label: 'Petstore v3.0 (JSON)', schema: '../schemas/v3.0/petstore.json' },
  { base: 'api/v3.0/petstore/yaml', label: 'Petstore v3.0 (YAML)', schema: '../schemas/v3.0/petstore.yaml' },
  {
    base: 'api/v3.0/petstore/no-tags',
    label: 'Petstore v3.0 (no tags)',
    schema: '../schemas/v3.0/petstore-no-tags.yaml',
  },
])

export default defineConfig({
  integrations: [
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
          items: [{ label: 'Example Guide', link: '/guides/getting-started/' }],
        },
        {
          label: 'Examples',
          items: openAPISidebarGroups,
        },
      ],
    }),
    starlightOpenAPI(),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
