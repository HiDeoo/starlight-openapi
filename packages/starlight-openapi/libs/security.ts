import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import type { Operation } from './operation'
import type { Schema } from './schema'

export function getSecurityRequirements(schema: Schema, operation: Operation): SecurityRequirement[] | undefined {
  if ('security' in operation) {
    return operation.security
  } else if ('security' in schema.document) {
    return schema.document.security
  }

  return
}

type SecurityRequirement =
  | OpenAPIV2.SecurityRequirementObject
  | OpenAPIV3.SecurityRequirementObject
  | OpenAPIV3_1.SecurityRequirementObject
