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
            schema: '../schemas/v3.0/petstore-expanded.yaml',
            sidebar: { collapsed: false, label: 'Petstore' },
          },
          {
            base: 'api/1password',
            schema:
              'https://raw.githubusercontent.com/APIs-guru/openapi-directory/gh-pages/v2/specs/1password.local/connect/1.5.7/openapi.yaml',
            sidebar: { label: '1Password Connect' },
          },
          {
            base: 'api/giphy',
            schema:
              'https://raw.githubusercontent.com/APIs-guru/openapi-directory/gh-pages/v2/specs/giphy.com/1.0/openapi.yaml',
            sidebar: { label: 'Giphy' },
          },
          {
            base: 'api/v3/petstore-simple',
            schema: '../schemas/v3.0/petstore.json',
            sidebar: { label: 'Petstore v3.0 (simple)', operations: { labels: 'operationId' } },
          },
          {
            base: 'api/v2/petstore-simple',
            schema: '../schemas/v2.0/petstore-simple.yaml',
            sidebar: { label: 'Petstore v2.0 (simple)' },
          },
          {
            base: 'api/v3/animals',
            schema: '../schemas/v3.0/animals.yaml',
            sidebar: { label: 'Animals v3.0' },
          },
          {
            base: 'api/v2/animals',
            schema: '../schemas/v2.0/animals.yaml',
            sidebar: { label: 'Animals v2.0' },
          },
          {
            base: 'api/v3/recursive',
            schema: '../schemas/v3.0/recursive.yaml',
            sidebar: { label: 'Recursion v3.0' },
          },
          {
            base: 'api/v3/recursive-simple',
            schema: '../schemas/v3.0/recursive-simple.yaml',
            sidebar: { label: 'Simple Recursion v3.0' },
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
          label: 'Resources',
          items: [
            { label: 'Showcase', link: '/resources/showcase/' },
            { label: 'Plugins and Tools', link: '/resources/starlight/' },
          ],
        },
        {
          label: 'Demo',
          items: openAPISidebarGroups,
        },
      ],
      social: {
        blueSky: 'https://bsky.app/profile/hideoo.dev',
        github: 'https://github.com/HiDeoo/starlight-openapi',
      },
      title: 'Starlight OpenAPI',
    }),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
