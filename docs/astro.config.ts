import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi'

import { starlightOpenAPIDocsDemoPlugin } from './src/libs/sidebar'

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-openapi/edit/main/docs/',
      },
      plugins: [
        starlightOpenAPI([
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
        ]),
        starlightOpenAPIDocsDemoPlugin(),
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Getting Started', link: '/getting-started/' },
            { label: 'Configuration', link: '/configuration/' },
          ],
        },
        {
          label: 'Demo',
          items: openAPISidebarGroups,
        },
      ],
      social: {
        github: 'https://github.com/HiDeoo/starlight-openapi',
      },
      title: 'Starlight OpenAPI',
    }),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
