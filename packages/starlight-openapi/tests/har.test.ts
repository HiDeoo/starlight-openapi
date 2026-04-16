import { expect, test } from '@playwright/test'
import type { AstroIntegrationLogger } from 'astro'

import { ensureSchemaDereference } from '../libs/dereference'
import { getOperationHarRequest, type HarRequest } from '../libs/har'
import {
  getOperationsByTag,
  getWebhooksOperations,
  type OperationHttpMethod,
  type PathItemOperation,
} from '../libs/operation'
import { parseSchema } from '../libs/parser'
import type { Schema } from '../libs/schema'

const schemasRoot = new URL('../../../schemas/', import.meta.url)

test('builds a basic HAR request for a GET operation', async () => {
  const schema = await parseTestSchema('v3.0/petstore-expanded.yaml')
  const operation = getTestOperation(schema, { operationId: 'findPets' })

  expectOperationHarRequest(schema, operation, {
    method: 'GET',
    url: 'https://petstore.swagger.io/v2/pets',
  })
})

test('builds a HAR request for a GET operation with a required path parameter', async () => {
  const schema = await parseTestSchema('v3.0/petstore-expanded.yaml')
  const operation = getTestOperation(schema, { path: '/pets/{id}', method: 'get' })

  expectOperationHarRequest(schema, operation, {
    method: 'GET',
    url: 'https://petstore.swagger.io/v2/pets/1',
  })
})

test('builds a HAR request for a POST operation with a JSON request body', async () => {
  const schema = await parseTestSchema('v3.0/petstore-expanded.yaml')
  const operation = getTestOperation(schema, { operationId: 'addPet' })

  expectOperationHarRequest(schema, operation, {
    method: 'POST',
    url: 'https://petstore.swagger.io/v2/pets',
    headers: [{ name: 'Content-Type', value: 'application/json' }],
    postData: {
      mimeType: 'application/json',
      text: `{
  "name": "example",
  "tag": "example"
}`,
    },
  })
})

test('builds a HAR request for an authenticated GET operation with query parameters', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { operationId: 'listAnimals' })

  expectOperationHarRequest(schema, operation, {
    method: 'GET',
    url: 'https://example.com/api/animals?tags=fish',
    headers: [{ name: 'Authorization', value: 'Bearer <token>' }],
    queryString: [{ name: 'tags', value: 'fish' }],
  })
})

test('builds a HAR request for a POST operation with operation-level security overriding inherited authorization', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { operationId: 'addAnimal' })

  expectOperationHarRequest(schema, operation, {
    method: 'POST',
    url: 'https://example.com/api/animals?tags=fish',
    headers: [{ name: 'Content-Type', value: 'application/json' }],
    queryString: [{ name: 'tags', value: 'fish' }],
    postData: {
      mimeType: 'application/json',
      text: `{
  "id": 1,
  "name": "dog",
  "tag": "pet"
}`,
    },
  })
})

test('builds a HAR request for a GET operation with an operation-level server override', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { operationId: 'listBears' })

  expectOperationHarRequest(schema, operation, {
    method: 'GET',
    url: 'https://custom.example.com/api/bears',
    headers: [{ name: 'Authorization', value: 'Bearer <token>' }],
  })
})

test('builds a HAR request for a multipart POST operation with a file, file array, and text field', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { path: '/turtles', method: 'post' })

  expectOperationHarRequest(schema, operation, {
    method: 'POST',
    url: 'https://example.com/api/turtles',
    headers: [
      { name: 'Authorization', value: 'Bearer <token>' },
      { name: 'Content-Type', value: 'multipart/form-data' },
    ],
    postData: {
      mimeType: 'multipart/form-data',
      params: [
        {
          name: 'image',
          fileName: 'file',
          contentType: 'image/png',
        },
        {
          name: 'gallery',
          fileName: 'front.png',
          contentType: 'application/octet-stream',
        },
        {
          name: 'gallery',
          fileName: 'back.png',
          contentType: 'application/octet-stream',
        },
        {
          name: 'name',
          value: 'example',
          contentType: 'text/plain',
        },
      ],
    },
  })
})

test('builds a HAR request for a POST operation with an x-www-form-urlencoded body', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { path: '/hamsters', method: 'post' })

  expectOperationHarRequest(schema, operation, {
    method: 'POST',
    url: 'https://example.com/api/hamsters',
    headers: [
      { name: 'Authorization', value: 'Bearer <token>' },
      { name: 'Content-Type', value: 'application/x-www-form-urlencoded' },
    ],
    postData: {
      mimeType: 'application/x-www-form-urlencoded',
      text: 'id=1&name=example',
    },
  })
})

async function parseTestSchema(schemaPath: string) {
  const schema = await parseSchema(
    { info: () => undefined, error: () => undefined } as unknown as AstroIntegrationLogger,
    schemasRoot,
    {
      base: 'test',
      schema: schemaPath,
      sidebar: {
        collapsed: true,
        operations: { badges: false, labels: 'summary', sort: 'document' },
        tags: { sort: 'document' },
      },
    },
  )

  await ensureSchemaDereference(schema)

  return schema
}

test('builds a HAR request for a GET operation with deepObject query serialization', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { path: '/jaguar', method: 'get' })

  expectOperationHarRequest(schema, operation, {
    method: 'GET',
    url: 'https://example.com/api/jaguar?age=1,2,3&weight=100&weight=200&weight=300&name=Mona&name=Lisa&surname=Butch,Cassidy&limit%5Blimit%5D=50&limit%5Boffset%5D=100',
    headers: [{ name: 'Authorization', value: 'Bearer <token>' }],
    queryString: [
      { name: 'age', value: '1,2,3' },
      { name: 'weight', value: '100' },
      { name: 'weight', value: '200' },
      { name: 'weight', value: '300' },
      { name: 'name', value: 'Mona' },
      { name: 'name', value: 'Lisa' },
      { name: 'surname', value: 'Butch,Cassidy' },
      { name: 'limit[limit]', value: '50' },
      { name: 'limit[offset]', value: '100' },
    ],
  })
})

test('builds a HAR request for a GET operation with cookie-based authorization', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { operationId: 'listShelters' })

  expectOperationHarRequest(schema, operation, {
    method: 'GET',
    url: 'https://example.com/api/shelters',
    cookies: [{ name: 'api_key', value: '<api_key>' }],
  })
})

test('builds a HAR request for a GET operation with a relative server URL', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { operationId: 'listCats' })

  expectOperationHarRequest(schema, operation, {
    method: 'GET',
    url: 'https://example.com/relative-api/cats',
    headers: [{ name: 'Authorization', value: 'Bearer <token>' }],
  })
})

test('builds a HAR request for a POST operation with a JSON string request body', async () => {
  const schema = await parseTestSchema('v3.0/animals.yaml')
  const operation = getTestOperation(schema, { path: '/elephant', method: 'post' })

  expectOperationHarRequest(schema, operation, {
    method: 'POST',
    url: 'https://example.com/api/elephant',
    headers: [
      { name: 'Authorization', value: 'Bearer <token>' },
      { name: 'Content-Type', value: 'application/json' },
    ],
    postData: {
      mimeType: 'application/json',
      text: '"large"',
    },
  })
})

function getTestOperation(
  schema: Schema,
  selector: { operationId: string } | { path: string; method: OperationHttpMethod },
): PathItemOperation {
  const operations = [
    ...[...getOperationsByTag(schema).values()].flatMap((group) => group.entries),
    ...getWebhooksOperations(schema),
  ]

  const operation =
    'operationId' in selector
      ? operations.find((entry) => entry.operation.operationId === selector.operationId)
      : operations.find((entry) => entry.path === selector.path && entry.method === selector.method)

  if (operation) return operation

  const description =
    'operationId' in selector
      ? `with ID '${selector.operationId}'`
      : `for ${selector.method.toUpperCase()} at ${selector.path}`

  throw new Error(`Could not find test operation ${description}.`)
}

function expectOperationHarRequest(schema: Schema, operation: PathItemOperation, expected: Partial<HarRequest>): void {
  expect(getOperationHarRequest(schema, operation)).toEqual({
    httpVersion: 'HTTP/1.1',
    cookies: [],
    headers: [],
    queryString: [],
    headersSize: -1,
    bodySize: -1,
    ...expected,
  })
}
