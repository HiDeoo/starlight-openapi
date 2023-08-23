declare module 'virtual:starlight-openapi-schemas' {
  const StarlightOpenAPISchemas: {
    [base: string]: import('./libs/schema').Schema
  }

  export default StarlightOpenAPISchemas
}
