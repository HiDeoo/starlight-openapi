import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateAPI } from 'starlight-openapi'

// TODO(HiDeoo)
const openAPISidebarGroups = await generateAPI([
  { label: 'Petstore v3.0 (JSON)', output: 'api/v3.0/petstore/json', schema: '../schemas/v3.0/petstore.json' },
  { label: 'Petstore v3.0 (YAML)', output: 'api/v3.0/petstore/yaml', schema: '../schemas/v3.0/petstore.yaml' },
  {
    label: 'Petstore v3.0 (no tags)',
    output: 'api/v3.0/petstore/no-tags',
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
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
