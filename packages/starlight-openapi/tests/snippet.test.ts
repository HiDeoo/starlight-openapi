import type { PathItemOperation } from '../libs/operation'
import { getRequestBodyMediaEntries } from '../libs/requestBody'
import { getResponseMediaEntries, type Response } from '../libs/response'
import { getOperationSnippets } from '../libs/snippet'

import { expect, test } from './test'
import { getTestOperation, parseTestSchema } from './utils'

test.describe('operation', () => {
  test('decodes query placeholder values in operation snippets', async () => {
    const schema = await parseTestSchema('v3.0/query-api-key.yaml', {
      snippets: {
        operation: {
          clients: {
            javascript: ['fetch'],
            shell: ['curl'],
          },
          default: { target: 'javascript', client: 'fetch' },
        },
      },
    })
    const operation = getTestOperation(schema, { operationId: 'getRandomAnimal' })

    const snippets = getOperationSnippets(schema, operation)

    expect(snippets).toEqual({
      defaultId: 'javascript:fetch',
      items: expect.arrayContaining([
        expect.objectContaining({
          id: 'javascript:fetch',
          label: 'Fetch',
          lang: 'js',
        }),
        expect.objectContaining({
          id: 'shell:curl',
          label: 'cURL',
          lang: 'sh',
        }),
      ]),
    })

    for (const snippet of snippets?.items ?? []) {
      expect(snippet.content).toContain('<api_key>')
      expect(snippet.content).not.toContain('%3Capi_key%3E')
    }
  })

  test('uses normalized authored code samples over operation snippets when both are available', async () => {
    const schema = await parseTestSchema('v2.0/petstore-simple.yaml', {
      snippets: {
        operation: {
          clients: {
            javascript: ['fetch'],
            shell: ['curl'],
          },
          default: { target: 'javascript', client: 'fetch' },
        },
      },
    })
    const operation = getTestOperation(schema, { operationId: 'addPet' })

    expect(getOperationSnippets(schema, operation)).toEqual({
      defaultId: 'code-sample:javascript:0',
      items: [
        {
          content: `fetch('http://petstore.swagger.io/api/pets', {
  method: 'POST',
  body: JSON.stringify({ name: 'Fido' })
})
`,
          id: 'code-sample:javascript:0',
          label: 'JavaScript',
          lang: 'javascript',
        },
        {
          content: `import requests
requests.post('http://petstore.swagger.io/api/pets', json={'name': 'Fido'})
`,
          id: 'code-sample:python:1',
          label: 'python',
          lang: 'python',
        },
      ],
    })
  })

  test('generates snippets for v3.0 schema operations without explicit servers', async () => {
    const schema = await parseTestSchema('v3.0/no-servers.yaml', {
      snippets: {
        operation: {
          clients: {
            shell: ['curl'],
          },
          default: { target: 'shell', client: 'curl' },
        },
      },
    })
    const operation = getTestOperation(schema, { operationId: 'listAnimals' })

    expect(getOperationSnippets(schema, operation)).toEqual({
      defaultId: 'shell:curl',
      items: [
        expect.objectContaining({
          id: 'shell:curl',
          label: 'cURL',
          lang: 'sh',
          content: expect.stringContaining('https://example.com/animals'),
        }),
      ],
    })
  })

  test('generates snippets for x-www-form-urlencoded request bodies', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml', {
      snippets: {
        operation: {
          clients: {
            shell: ['curl'],
          },
          default: { target: 'shell', client: 'curl' },
        },
      },
    })
    const operation = getTestOperation(schema, { path: '/hamsters', method: 'post' })

    const snippets = getOperationSnippets(schema, operation)

    const curlSnippet = snippets?.items.find((snippet) => snippet.id === 'shell:curl')

    expect(curlSnippet?.content).toContain('--data id=1')
    expect(curlSnippet?.content).toContain('--data name=example')
    expect(curlSnippet?.content).not.toContain("--data ''")
  })
})

test.describe('ui', () => {
  test('displays operation snippets and updates the visible snippet when the picker changes', async ({ docPage }) => {
    await docPage.goto('/v2/animals/operations/addanimal/')

    const picker = docPage.getOperationSnippetPicker()
    await expect(picker).toBeVisible()
    await expect(picker).toHaveValue('shell:curl')

    const snippet = docPage.getVisibleOperationSnippet()

    await expect(snippet).toContainText('curl --request POST')
    await expect(snippet).toContainText('--url https://example.com/api/animals')

    await picker.selectOption('javascript:fetch')

    await expect(snippet).toContainText('fetch(')
    await expect(snippet).toContainText('https://example.com/api/animals')
  })

  test('does not display operation snippets when no operation snippets are available', async ({ docPage }) => {
    await docPage.goto('/v3/recursive/operations/listcategories')

    await expect(docPage.getOperationSnippetPicker()).not.toBeVisible()

    await expect(docPage.getOperationSnippets()).toHaveCount(0)
  })

  test('does not display operation snippets for webhook operations', async ({ docPage }) => {
    await docPage.goto('/v3/animals/webhooks/newanimal/')

    await expect(docPage.getOperationSnippetPicker()).not.toBeVisible()

    await expect(docPage.getOperationSnippets()).toHaveCount(0)
  })
})

test.describe('request body', () => {
  test('generates request body examples for supported request body media types when no example is authored', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml')
    const operation = getTestOperation(schema, { path: '/hamsters', method: 'post' })

    const entries = getRequestBodyMediaEntries(schema, operation.operation)

    const jsonEntry = entries.find((entry) => entry.mediaType === 'application/json')
    expect(jsonEntry?.example).toEqual({
      id: 1,
      name: 'example',
    })
    expect(jsonEntry?.generated).toBe(true)

    const formEntry = entries.find((entry) => entry.mediaType === 'application/x-www-form-urlencoded')
    expect(formEntry?.example).toBe('id=1&name=example')
    expect(formEntry?.generated).toBe(true)
  })

  test('does not generate request body examples when disabled', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml', {
      snippets: { operation: false, requestBody: false },
    })
    const operation = getTestOperation(schema, { path: '/hamsters', method: 'post' })

    const entries = getRequestBodyMediaEntries(schema, operation.operation)

    const jsonEntry = entries.find((entry) => entry.mediaType === 'application/json')
    expect(jsonEntry?.example).toBeUndefined()
    expect(jsonEntry?.generated).toBeUndefined()
  })

  test('preserves authored request body examples', async () => {
    const schema = await parseTestSchema('v2.0/animals.yaml')
    const operation = getTestOperation(schema, { operationId: 'addBird' })

    const [entry] = getRequestBodyMediaEntries(schema, operation.operation)

    expect(entry?.example).toBeUndefined()
    expect(entry?.generated).toBeUndefined()
  })

  test('preserves recursive explicit schema values for request bodies without marking them as generated', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml')
    const operation = getTestOperation(schema, { path: '/elephant', method: 'post' })

    const [entry] = getRequestBodyMediaEntries(schema, operation.operation)

    expect(entry?.example).toBeUndefined()
    expect(entry?.generated).toBeUndefined()
  })

  test('serializes authored x-www-form-urlencoded request body examples', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml')
    const operation = getTestOperation(schema, { path: '/rabbits', method: 'post' })

    const [entry] = getRequestBodyMediaEntries(schema, operation.operation)

    expect(entry?.example).toBe('colors=brown,white&habitat=region,meadow,type,burrow')
    expect(entry?.generated).toBeUndefined()
  })
})

test.describe('response', () => {
  test('generates a response example for JSON responses when no example is authored', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml')
    const operation = getTestOperation(schema, { operationId: 'addAnimal' })
    const response = getTestResponse(operation, 'default')

    const [entry] = getResponseMediaEntries(schema, operation.operation, response)

    expect(entry?.example).toEqual({
      code: 1,
      message: 'example',
    })
    expect(entry?.generated).toBe(true)
  })

  test('uses recursive explicit schema values for response examples without marking them as generated', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml')
    const operation = getTestOperation(schema, { path: '/feed', method: 'post' })
    const response = getTestResponse(operation, '201')

    const [entry] = getResponseMediaEntries(schema, operation.operation, response)

    expect(entry?.example).toEqual({
      subscriptionId: '2531329f-fb09-4ef7-887e-84e648214436',
    })
    expect(entry?.generated).toBeUndefined()
  })

  test('does not generate response examples when disabled', async () => {
    const schema = await parseTestSchema('v3.0/animals.yaml', {
      snippets: { operation: false, response: false },
    })
    const operation = getTestOperation(schema, { operationId: 'addAnimal' })
    const response = getTestResponse(operation, 'default')

    const [entry] = getResponseMediaEntries(schema, operation.operation, response)

    expect(entry?.example).toBeUndefined()
    expect(entry?.generated).toBeUndefined()
  })

  test('preserves authored response examples and skips non-JSON fallback generation', async () => {
    const schema = await parseTestSchema('v2.0/animals.yaml')
    const operation = getTestOperation(schema, { operationId: 'findAnimals' })
    const response = getTestResponse(operation, '200')

    const entries = getResponseMediaEntries(schema, operation.operation, response)

    const jsonEntry = entries.find((entry) => entry.mediaType === 'application/json')
    expect(jsonEntry?.example).toEqual([
      { id: 1, name: 'Bessy' },
      { id: 2, name: 'Hazel' },
    ])
    expect(jsonEntry?.generated).toBeUndefined()

    const xmlEntry = entries.find((entry) => entry.mediaType === 'application/xml')
    expect(xmlEntry?.example).toEqual([
      { id: 3, name: 'Cleo' },
      { id: 4, name: 'Daisy' },
    ])
    expect(xmlEntry?.generated).toBeUndefined()

    const textXmlEntry = entries.find((entry) => entry.mediaType === 'text/xml')
    expect(textXmlEntry?.example).toBeUndefined()
    expect(textXmlEntry?.generated).toBeUndefined()

    const textHtmlEntry = entries.find((entry) => entry.mediaType === 'text/html')
    expect(textHtmlEntry?.example).toBeUndefined()
    expect(textHtmlEntry?.generated).toBeUndefined()
  })
})

function getTestResponse(operation: PathItemOperation, status: string): Response {
  const response = operation.operation.responses?.[status]

  if (!response || '$ref' in response) {
    throw new Error(`Expected a dereferenced '${status}' response.`)
  }

  return response
}
