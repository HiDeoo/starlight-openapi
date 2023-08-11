import type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

export function getParametersByLocation(
  operationParameters: OpenAPI.Parameters | undefined,
  pathItemParameters: OpenAPI.Parameters | undefined,
) {
  const parametersByLocation = new Map<string, Parameters>()

  for (const parameter of [...(pathItemParameters ?? []), ...(operationParameters ?? [])]) {
    if (!isParameter(parameter) || parameter.in === 'body') {
      continue
    }

    const id = getParameterId(parameter)
    const parametersById: Parameters = parametersByLocation.get(parameter.in) ?? new Map()

    parametersById.set(id, parameter)

    parametersByLocation.set(parameter.in, parametersById)
  }

  return parametersByLocation
}

export function isOpenAPIV2Parameter(parameter: Parameter): parameter is ParameterV2 {
  return 'type' in parameter
}

function getParameterId(parameter: Parameter): ParameterId {
  return `${parameter.name}:${parameter.in}`
}

function isParameter(parameter: OpenAPI.Parameter): parameter is Parameter {
  return typeof parameter === 'object' && !('$ref' in parameter)
}

export type Parameter = OpenAPIV2.Parameter | OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject
export type ParameterV2 = OpenAPIV2.GeneralParameterObject
type ParameterId = `${Parameter['name']}:${Parameter['in']}`
type Parameters = Map<ParameterId, Parameter>
