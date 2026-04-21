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

    await expect(docPage.page.locator('.sl-openapi-snippet')).toHaveCount(0)
  })

  test('does not display operation snippets for webhook operations', async ({ docPage }) => {
    await docPage.goto('/v3/animals/webhooks/newanimal/')

    await expect(docPage.getOperationSnippetPicker()).not.toBeVisible()

    await expect(docPage.page.locator('.sl-openapi-snippet')).toHaveCount(0)
  })
})
