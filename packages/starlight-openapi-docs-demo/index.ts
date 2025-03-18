import type { StarlightPlugin } from '@astrojs/starlight/types'

export default function starlightOpenAPIDocsDemoPlugin(): StarlightPlugin {
  return {
    name: 'starlight-openapi-docs-demo-plugin',
    hooks: {
      'config:setup': ({ addRouteMiddleware }) => {
        if (process.env['TEST']) return

        addRouteMiddleware({ entrypoint: 'starlight-openapi-docs-demo/middleware', order: 'post' })
      },
    },
  }
}
