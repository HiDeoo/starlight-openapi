import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightOpenAPI, { openAPISidebarGroups, createOpenAPISidebarGroup } from 'starlight-openapi'
import starlightOpenAPIDocsDemo from 'starlight-openapi-docs-demo'

const demoPetstoreSidebarGroup = createOpenAPISidebarGroup()
const demo1PasswordSidebarGroup = createOpenAPISidebarGroup()
const demoGiphySidebarGroup = createOpenAPISidebarGroup()

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
            sidebar: { collapsed: false, label: 'Petstore', group: demoPetstoreSidebarGroup },
          },
          {
            base: 'api/1password',
            schema:
              'https://raw.githubusercontent.com/APIs-guru/openapi-directory/gh-pages/v2/specs/1password.local/connect/1.5.7/openapi.yaml',
            sidebar: { label: '1Password Connect', group: demo1PasswordSidebarGroup },
          },
          {
            base: 'api/giphy',
            schema:
              'https://raw.githubusercontent.com/APIs-guru/openapi-directory/gh-pages/v2/specs/giphy.com/1.0/openapi.yaml',
            sidebar: { label: 'Giphy', group: demoGiphySidebarGroup },
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
            sidebar: { label: 'Animals v3.0', operations: { sort: 'alphabetical' }, tags: { sort: 'alphabetical' } },
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
        starlightOpenAPIDocsDemo(),
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
          items: [demoPetstoreSidebarGroup, demo1PasswordSidebarGroup, demoGiphySidebarGroup],
        },
        {
          label: 'Tests',
          items: openAPISidebarGroups,
        },
      ],
      social: [
        { href: 'https://bsky.app/profile/hideoo.dev', icon: 'blueSky', label: 'Bluesky' },
        { href: 'https://github.com/HiDeoo/starlight-openapi', icon: 'github', label: 'GitHub' },
      ],
      title: 'Starlight OpenAPI',
    }),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
