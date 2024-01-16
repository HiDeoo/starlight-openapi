import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateAPI } from 'starlight-openapi'

const { openAPISidebarGroups, starlightOpenAPI } = await generateAPI([
  {
    base: 'api/petstore',
    collapsed: false,
    label: 'Petstore',
    schema: '../schemas/v3.0/petstore-expanded.yaml',
  },
  {
    base: 'api/1password',
    label: '1Password Connect',
    schema:
      'https://raw.githubusercontent.com/APIs-guru/openapi-directory/gh-pages/v2/specs/1password.local/connect/1.5.7/openapi.yaml',
  },
  {
    base: 'api/giphy',
    label: 'Giphy',
    schema:
      'https://raw.githubusercontent.com/APIs-guru/openapi-directory/gh-pages/v2/specs/giphy.com/1.0/openapi.yaml',
  },
  {
    base: 'api/v3/petstore-simple',
    label: 'Petstore v3.0 (simple)',
    schema: '../schemas/v3.0/petstore.json',
  },
  {
    base: 'api/v2/petstore-simple',
    label: 'Petstore v2.0 (simple)',
    schema: '../schemas/v2.0/petstore-simple.yaml',
  },
  {
    base: 'api/v3/animals',
    label: 'Animals v3.0',
    schema: '../schemas/v3.0/animals.yaml',
  },
  {
    base: 'api/v2/animals',
    label: 'Animals v2.0',
    schema: '../schemas/v2.0/animals.yaml',
  },
])

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-openapi/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Getting Started', link: '/guides/getting-started/' },
            { label: 'Configuration', link: '/guides/configuration/' },
          ],
        },
        {
          label: 'Examples',
          items: openAPISidebarGroups.slice(0, 3),
        },
      ],
      social: {
        github: 'https://github.com/HiDeoo/starlight-openapi',
      },
      title: 'Starlight OpenAPI',
    }),
    starlightOpenAPI(),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
