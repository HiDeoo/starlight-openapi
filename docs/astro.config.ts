import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateAPI } from 'starlight-openapi'

// TODO(HiDeoo)
const { openAPISidebarGroups, starlightOpenAPI } = await generateAPI([
  {
    base: 'api/v3.0/petstore',
    label: 'Petstore v3.0',
    schema: '../schemas/v3.0/petstore.json',
  },
  {
    base: 'api/v3.0/petstore-expanded',
    label: 'Petstore v3.0 (expanded)',
    schema: '../schemas/v3.0/petstore-expanded.yaml',
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
