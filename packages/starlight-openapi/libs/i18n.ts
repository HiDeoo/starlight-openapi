/**
 * Default UI translation strings for the starlight-openapi plugin.
 *
 * These strings are injected into Starlight's i18n system via the `i18n:setup` hook.
 * Users can override any of these translations in their `src/content/i18n/{locale}.json` files.
 *
 * @example Overriding translations in your project
 * ```json
 * // src/content/i18n/ja.json
 * {
 *   "starlight-openapi.overview": "概要",
 *   "starlight-openapi.authorizations": "認証"
 * }
 * ```
 *
 * @see https://starlight.astro.build/guides/i18n/#using-ui-translations
 */
export const UIStrings = {
  en: {
    'starlight-openapi.overview': 'Overview',
    'starlight-openapi.authorizations': 'Authorizations',
    'starlight-openapi.authentication': 'Authentication',
    'starlight-openapi.contact': 'Contact',
    'starlight-openapi.license': 'License',
    'starlight-openapi.termsOfService': 'Terms of Service',
    'starlight-openapi.openApiVersion': 'OpenAPI version',
    'starlight-openapi.parameters': 'Parameters',
    'starlight-openapi.pathParameters': 'Path Parameters',
    'starlight-openapi.queryParameters': 'Query Parameters',
    'starlight-openapi.headerParameters': 'Header Parameters',
    'starlight-openapi.cookieParameters': 'Cookie Parameters',
    'starlight-openapi.requestBody': 'Request Body',
    'starlight-openapi.mimeTypesConsumesLabel': 'The list of MIME types the operation can consume',
    'starlight-openapi.mimeTypesProducesLabel': 'The list of MIME types the operation can produce',
    'starlight-openapi.required': 'required',
    'starlight-openapi.deprecated': 'deprecated',
    'starlight-openapi.deprecatedBadge': 'Deprecated',
    'starlight-openapi.additionalProperties': 'additional properties',
    'starlight-openapi.allowedValues': 'Allowed values:',
    'starlight-openapi.callbacks': 'Callbacks',
    'starlight-openapi.responses': 'Responses',
    'starlight-openapi.headers': 'Headers',
    'starlight-openapi.example': 'Example',
    'starlight-openapi.examples': 'Examples',
    'starlight-openapi.selectExample': 'Select example',
    'starlight-openapi.selectResponseExample': 'Select response example',
    'starlight-openapi.selectMediaType': 'Select media type',
    'starlight-openapi.webhooks': 'Webhooks',
    'starlight-openapi.securitySchemeType': 'Security scheme type',
    'starlight-openapi.bearerFormat': 'Bearer format',
    'starlight-openapi.openIdConnectUrl': 'OpenID Connect URL',
    'starlight-openapi.parameterNameSuffix': ' parameter name',
    'starlight-openapi.flowType': 'Flow type',
    'starlight-openapi.authorizationUrl': 'Authorization URL',
    'starlight-openapi.tokenUrl': 'Token URL',
    'starlight-openapi.refreshUrl': 'Refresh URL',
    'starlight-openapi.scopes': 'Scopes',
    'starlight-openapi.none': 'None',
  },
  ja: {
    // Default `ja` translations are intentionally kept identical to English.
    // Users can override any of these keys in their project.
    'starlight-openapi.overview': 'Overview',
    'starlight-openapi.authorizations': 'Authorizations',
    'starlight-openapi.authentication': 'Authentication',
    'starlight-openapi.contact': 'Contact',
    'starlight-openapi.license': 'License',
    'starlight-openapi.termsOfService': 'Terms of Service',
    'starlight-openapi.openApiVersion': 'OpenAPI version',
    'starlight-openapi.parameters': 'Parameters',
    'starlight-openapi.pathParameters': 'Path Parameters',
    'starlight-openapi.queryParameters': 'Query Parameters',
    'starlight-openapi.headerParameters': 'Header Parameters',
    'starlight-openapi.cookieParameters': 'Cookie Parameters',
    'starlight-openapi.requestBody': 'Request Body',
    'starlight-openapi.mimeTypesConsumesLabel': 'The list of MIME types the operation can consume',
    'starlight-openapi.mimeTypesProducesLabel': 'The list of MIME types the operation can produce',
    'starlight-openapi.required': 'required',
    'starlight-openapi.deprecated': 'deprecated',
    'starlight-openapi.deprecatedBadge': 'Deprecated',
    'starlight-openapi.additionalProperties': 'additional properties',
    'starlight-openapi.allowedValues': 'Allowed values:',
    'starlight-openapi.callbacks': 'Callbacks',
    'starlight-openapi.responses': 'Responses',
    'starlight-openapi.headers': 'Headers',
    'starlight-openapi.example': 'Example',
    'starlight-openapi.examples': 'Examples',
    'starlight-openapi.selectExample': 'Select example',
    'starlight-openapi.selectResponseExample': 'Select response example',
    'starlight-openapi.selectMediaType': 'Select media type',
    'starlight-openapi.webhooks': 'Webhooks',
    'starlight-openapi.securitySchemeType': 'Security scheme type',
    'starlight-openapi.bearerFormat': 'Bearer format',
    'starlight-openapi.openIdConnectUrl': 'OpenID Connect URL',
    'starlight-openapi.parameterNameSuffix': ' parameter name',
    'starlight-openapi.flowType': 'Flow type',
    'starlight-openapi.authorizationUrl': 'Authorization URL',
    'starlight-openapi.tokenUrl': 'Token URL',
    'starlight-openapi.refreshUrl': 'Refresh URL',
    'starlight-openapi.scopes': 'Scopes',
    'starlight-openapi.none': 'None',
  },
} as const

export type UIStringKey = keyof (typeof UIStrings)['en']

/**
 * Parameter location to translation key mapping.
 */
export const parameterLocationKeys: Record<string, UIStringKey> = {
  path: 'starlight-openapi.pathParameters',
  query: 'starlight-openapi.queryParameters',
  header: 'starlight-openapi.headerParameters',
  cookie: 'starlight-openapi.cookieParameters',
}

