declare module 'virtual:starlight-openapi-rapidoc-schemas' {
  const StarlightOpenAPISchemas: Record<string, import('./libs/schema').Schema>

  export default StarlightOpenAPISchemas
}
