import { SnippetsSchema } from '../../libs/schemas/snippet'
import { expect, test } from '../test'

test.describe('operation', () => {
  const defaultClients = {
    javascript: ['fetch'],
    shell: ['curl'],
  }

  const expectedDefaultClients = Object.entries(defaultClients).flatMap(([target, clients]) =>
    clients.map((client) => ({ target, client })),
  )

  const expectedDefaultClient = { target: 'shell', client: 'curl' }

  const expectedDefaultConfig = {
    operation: {
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

  test('normalizes `{ operation: {} }` snippets config to the default config', () => {
    expect(SnippetsSchema.parse({ operation: {} })).toEqual(expectedDefaultConfig)
  })

  test('normalizes `{ operation: true }` snippets config to the default config', () => {
    expect(SnippetsSchema.parse({ operation: true })).toEqual(expectedDefaultConfig)
  })

  test('parses `{ operation: false }` snippets config', () => {
    expect(SnippetsSchema.parse({ operation: false })).toEqual({ operation: false })
  })

  test('uses default clients with a custom default client', () => {
    expect(
      SnippetsSchema.parse({
        operation: {
          default: { target: 'javascript', client: 'fetch' },
        },
      }),
    ).toEqual({
      operation: {
        clients: expectedDefaultClients,
        default: { target: 'javascript', client: 'fetch' },
      },
    })
  })

  test('uses default client when available with custom clients', () => {
    expect(
      SnippetsSchema.parse({
        operation: {
          clients: {
            javascript: ['fetch'],
            shell: ['curl', 'wget'],
          },
        },
      }),
    ).toEqual({
      operation: {
        clients: [
          { target: 'javascript', client: 'fetch' },
          { target: 'shell', client: 'curl' },
          { target: 'shell', client: 'wget' },
        ],
        default: expectedDefaultClient,
      },
    })
  })

  test('throws with a custom default snippet client that is not included in custom clients', () => {
    expect(() =>
      SnippetsSchema.parse({
        operation: {
          clients: {
            shell: ['curl'],
          },
          default: {
            target: 'shell',
            client: 'wget',
          },
        },
      }),
    ).toThrow('The default operation snippet client must be one of the enabled operation snippet clients.')
  })

  test('uses the single enabled client when custom clients enable a single client', () => {
    expect(
      SnippetsSchema.parse({
        operation: {
          clients: {
            shell: ['wget'],
          },
        },
      }),
    ).toEqual({
      operation: {
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
        operation: {
          clients: {
            javascript: ['axios'],
            shell: ['wget'],
          },
        },
      }),
    ).toEqual({
      operation: {
        clients: [
          { target: 'javascript', client: 'axios' },
          { target: 'shell', client: 'wget' },
        ],
        default: {
          target: 'javascript',
          client: 'axios',
        },
      },
    })
  })

  test('throws when no operation clients are enabled', () => {
    expect(() =>
      SnippetsSchema.parse({
        operation: {
          clients: {},
        },
      }),
    ).toThrow('At least one operation snippet client must be enabled.')
  })

  test('throws when operation clients contain only an empty client list', () => {
    expect(() =>
      SnippetsSchema.parse({
        operation: {
          clients: {
            shell: [],
          },
        },
      }),
    ).toThrow('At least one operation snippet client must be enabled.')
  })

  test('throws when operation clients contain duplicates', () => {
    expect(() =>
      SnippetsSchema.parse({
        operation: {
          clients: {
            shell: ['curl', 'curl'],
          },
        },
      }),
    ).toThrow('Operation snippet clients must be unique.')
  })
})
