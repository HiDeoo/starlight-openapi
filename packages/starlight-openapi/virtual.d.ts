declare module 'virtual:starlight-openapi-schemas' {
  const StarlightOpenAPISchemas: Record<string, import('./libs/schema').Schema>

  export default StarlightOpenAPISchemas
}
