import type { OpenAPIV2 } from 'openapi-types'

import type { Operation } from './operation'
import type { Parameter } from './parameter'

export function getOpenAPIV2RequestBodyParameter(operation: Operation): OpenAPIV2.InBodyParameterObject | undefined {
  if ('requestBody' in operation || operation.parameters === undefined) {
    return
  }

  return (operation.parameters as Parameter[]).find(isOpenAPIV2RequestBodyParameter)
}

function isOpenAPIV2RequestBodyParameter(parameter: Parameter): parameter is OpenAPIV2.InBodyParameterObject {
  return parameter.in === 'body'
}
