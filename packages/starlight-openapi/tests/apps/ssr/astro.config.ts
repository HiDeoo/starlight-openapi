import node from '@astrojs/node'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi'

export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    starlight({
      plugins: [
        starlightOpenAPI([
          {
            base: 'tests/petstore',
            schema: '../../../../../schemas/v3.0/petstore-expanded.yaml',
            sidebar: { collapsed: false, label: 'Petstore' },
          },
          {
            base: 'tests/petstore-simple',
            schema: '../../../../../schemas/v3.0/petstore.json',
            sidebar: { collapsed: false, label: 'Petstore v3.0 (simple)' },
          },
        ]),
      ],
      prerender: false,
      sidebar: [
        {
          label: 'Starlight',
          items: [{ label: 'Example', link: 'guides/example' }],
        },
        ...openAPISidebarGroups,
      ],
      title: 'Starlight OpenAPI Tests - SSR',
    }),
  ],
  output: 'server',
})
