import type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

export function getParametersByLocation(
  operationParameters: OpenAPI.Parameters | undefined,
  pathItemParameters: OpenAPI.Parameters | undefined,
) {
  const parametersByLocation = new Map<string, Parameters>()

  for (const parameter of [...(pathItemParameters ?? []), ...(operationParameters ?? [])]) {
    if (!isParameter(parameter)) {
      continue
    }

    const id = getParameterId(parameter)
    const parametersById: Parameters = parametersByLocation.get(parameter.in) ?? new Map()

    parametersById.set(id, parameter)

    parametersByLocation.set(parameter.in, parametersById)
  }

  return parametersByLocation
}

function getParameterId(parameter: Parameter): ParameterId {
  return `${parameter.name}:${parameter.in}`
}

function isParameter(parameter: OpenAPI.Parameter): parameter is Parameter {
  return typeof parameter === 'object' && !('$ref' in parameter)
}

export type Parameter = OpenAPIV2.Parameter | OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject
type ParameterId = `${Parameter['name']}:${Parameter['in']}`
type Parameters = Map<ParameterId, Parameter>
