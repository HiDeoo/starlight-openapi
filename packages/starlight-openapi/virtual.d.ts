declare module 'virtual:starlight-openapi-schemas' {
  const StarlightOpenAPISchemas: Record<string, import('./libs/schemas/schema').Schema>

  export default StarlightOpenAPISchemas
}

declare module 'virtual:starlight-openapi-context' {
  const Context: {
    pagination: import('@astrojs/starlight/types').StarlightConfig['pagination']
    trailingSlash: import('astro').AstroConfig['trailingSlash']
    build: {
      format: import('astro').AstroConfig['build']['format']
    }
  }

  export default Context
}
