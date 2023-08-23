import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateAPI } from 'starlight-openapi'

const { openAPISidebarGroups, starlightOpenAPI } = await generateAPI([
  {
    base: 'api/v3.0/petstore',
    label: 'Petstore',
    schema: '../schemas/v3.0/petstore-expanded.yaml',
  },
  {
    base: 'api/v3.0/1password',
    label: '1Password Connect',
    schema: 'https://api.apis.guru/v2/specs/1password.local/connect/1.5.7/openapi.yaml',
  },
  {
    base: 'api/v3.0/giphy',
    label: 'Giphy',
    schema: 'https://api.apis.guru/v2/specs/giphy.com/1.0/openapi.yaml',
  },
  {
    base: 'api/v3.0/petstore-simple',
    label: 'Petstore v3.0 (simple)',
    schema: '../schemas/v3.0/petstore.json',
  },
  {
    base: 'api/v2.0/petstore-simple',
    label: 'Petstore v2.0 (simple)',
    schema: '../schemas/v2.0/petstore-simple.yaml',
  },
  {
    base: 'api/v3.0/animals',
    label: 'Animals v3.0',
    schema: '../schemas/v3.0/animals.yaml',
  },
  {
    base: 'api/v2.0/animals',
    label: 'Animals v2.0',
    schema: '../schemas/v2.0/animals.yaml',
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
          items: openAPISidebarGroups.slice(0, 3),
        },
      ],
    }),
    starlightOpenAPI(),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
