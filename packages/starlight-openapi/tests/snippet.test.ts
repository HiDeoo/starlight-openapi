import { SnippetsSchema } from '../libs/schemas/snippet'
import { getOperationSnippets } from '../libs/snippet'

import { expect, test } from './test'
import { getTestOperation, parseTestSchema } from './utils'

// FIXME(HiDeoo)
test.describe.skip('schema', () => {
  const defaultClients = {
    javascript: ['fetch'],
    shell: ['curl', 'wget'],
  }

  const expectedDefaultClients = Object.entries(defaultClients).flatMap(([target, clients]) =>
    clients.map((client) => ({ target, client })),
  )

  const expectedDefaultClient = { target: 'javascript', client: 'fetch' }

  const expectedDefaultConfig = {
    generated: {
      clients: expectedDefaultClients,
      default: expectedDefaultClient,
    },
  }

  test('normalizes `undefined` snippets config to the default config', () => {
    expect(SnippetsSchema.parse(undefined)).toEqual(expectedDefaultConfig)
  })

  test('normalizes `{}` snippets config to the default config', () => {
    expect(SnippetsSchema.parse({})).toEqual(expectedDefaultConfig)
  })

  test('normalizes `{ generated: {} }` snippets config to the default config', () => {
    expect(SnippetsSchema.parse({ generated: {} })).toEqual(expectedDefaultConfig)
  })

  test('normalizes `{ generated: true }` snippets config to the default config', () => {
    expect(SnippetsSchema.parse({ generated: true })).toEqual(expectedDefaultConfig)
  })

  test('parses `{ generated: false }` snippets config', () => {
    expect(SnippetsSchema.parse({ generated: false })).toEqual({ generated: false })
  })

  test('uses default clients with a custom default client', () => {
    expect(
      SnippetsSchema.parse({
        generated: {
          default: { target: 'shell', client: 'wget' },
        },
      }),
    ).toEqual({
      generated: {
        clients: expectedDefaultClients,
        default: { target: 'shell', client: 'wget' },
      },
    })
  })

  test('uses default client when available with custom clients', () => {
    expect(
      SnippetsSchema.parse({
        generated: {
          clients: {
            javascript: ['fetch'],
            shell: ['wget'],
          },
        },
      }),
    ).toEqual({
      generated: {
        clients: [
          { target: 'javascript', client: 'fetch' },
          { target: 'shell', client: 'wget' },
        ],
        default: expectedDefaultClient,
      },
    })
  })

  test('throws with a custom default snippet client that is not included in custom clients', () => {
    expect(() =>
      SnippetsSchema.parse({
        generated: {
          clients: {
            shell: ['curl'],
          },
          default: {
            target: 'shell',
            client: 'wget',
          },
        },
      }),
    ).toThrow('The default generated snippet client must be one of the enabled clients.')
  })

  test('uses the single enabled client when custom clients enable a single client', () => {
    expect(
      SnippetsSchema.parse({
        generated: {
          clients: {
            shell: ['wget'],
          },
        },
      }),
    ).toEqual({
      generated: {
        clients: [{ target: 'shell', client: 'wget' }],
        default: {
          target: 'shell',
          client: 'wget',
        },
      },
    })
  })

  test('uses the first enabled client when the built-in default client is not enabled', () => {
    expect(
      SnippetsSchema.parse({
        generated: {
          clients: {
            javascript: ['axios'],
            shell: ['curl'],
          },
        },
      }),
    ).toEqual({
      generated: {
        clients: [
          { target: 'javascript', client: 'axios' },
          { target: 'shell', client: 'curl' },
        ],
        default: {
          target: 'javascript',
          client: 'axios',
        },
      },
    })
  })

  test('throws when no generated clients are enabled', () => {
    expect(() =>
      SnippetsSchema.parse({
        generated: {
          clients: {},
        },
      }),
    ).toThrow('At least one generated snippet client must be enabled.')
  })

  test('throws when generated clients contain only an empty client list', () => {
    expect(() =>
      SnippetsSchema.parse({
        generated: {
          clients: {
            shell: [],
          },
        },
      }),
    ).toThrow('At least one generated snippet client must be enabled.')
  })

  test('throws when generated clients contain duplicates', () => {
    expect(() =>
      SnippetsSchema.parse({
        generated: {
          clients: {
            shell: ['curl', 'curl'],
          },
        },
      }),
    ).toThrow('Generated snippet clients must be unique.')
  })
})

test.describe('generation', () => {
  test('decodes query placeholder values in generated snippets', async () => {
    const schema = await parseTestSchema('v3.0/query-api-key.yaml', {
      snippets: {
        generated: {
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
          lang: 'shell',
        }),
      ]),
    })

    for (const snippet of snippets?.items ?? []) {
      expect(snippet.content).toContain('<api_key>')
      expect(snippet.content).not.toContain('%3Capi_key%3E')
    }
  })

  test('uses normalized authored code samples over generated snippets when both are available', async () => {
    const schema = await parseTestSchema('v2.0/petstore-simple.yaml', {
      snippets: {
        generated: {
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
        generated: {
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
          lang: 'shell',
          content: expect.stringContaining('https://example.com/animals'),
        }),
      ],
    })
  })
})

test.describe('ui', () => {
  test('displays generated snippets and updates the visible snippet when the picker changes', async ({ docPage }) => {
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

  test('does not display snippets when no snippets are available', async ({ docPage }) => {
    await docPage.goto('/v3/recursive/operations/listcategories')

    await expect(docPage.getOperationSnippetPicker()).not.toBeVisible()

    await expect(docPage.page.locator('.sl-openapi-snippet')).toHaveCount(0)
  })

  test('does not display generated snippets for webhook operations', async ({ docPage }) => {
    await docPage.goto('/v3/animals/webhooks/newanimal/')

    await expect(docPage.getOperationSnippetPicker()).not.toBeVisible()

    await expect(docPage.page.locator('.sl-openapi-snippet')).toHaveCount(0)
  })
})
