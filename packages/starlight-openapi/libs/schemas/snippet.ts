import { z } from 'astro/zod'

const snippetCClientSchema = z.enum(['libcurl'])
const snippetCSharpClientSchema = z.enum(['httpclient'])
const snippetGoClientSchema = z.enum(['nethttp'])
const snippetJavaClientSchema = z.enum(['nethttp', 'okhttp'])
const snippetJavaScriptClientSchema = z.enum(['axios', 'fetch'])
const snippetKotlinClientSchema = z.enum(['okhttp'])
const snippetRustClientSchema = z.enum(['reqwest'])
const snippetShellClientSchema = z.enum(['curl', 'wget'])

const snippetReferenceSchema = z.discriminatedUnion('target', [
  z.object({ target: z.literal('c'), client: snippetCClientSchema }),
  z.object({ target: z.literal('csharp'), client: snippetCSharpClientSchema }),
  z.object({ target: z.literal('go'), client: snippetGoClientSchema }),
  z.object({ target: z.literal('java'), client: snippetJavaClientSchema }),
  z.object({ target: z.literal('javascript'), client: snippetJavaScriptClientSchema }),
  z.object({ target: z.literal('kotlin'), client: snippetKotlinClientSchema }),
  z.object({ target: z.literal('rust'), client: snippetRustClientSchema }),
  z.object({ target: z.literal('shell'), client: snippetShellClientSchema }),
])

const generatedSnippetClientsSchema = z
  .object({
    c: z.array(snippetCClientSchema).optional(),
    csharp: z.array(snippetCSharpClientSchema).optional(),
    go: z.array(snippetGoClientSchema).optional(),
    java: z.array(snippetJavaClientSchema).optional(),
    javascript: z.array(snippetJavaScriptClientSchema).optional(),
    kotlin: z.array(snippetKotlinClientSchema).optional(),
    rust: z.array(snippetRustClientSchema).optional(),
    shell: z.array(snippetShellClientSchema).optional(),
  })
  .partial()

const defaultGeneratedSnippetClients = {
  javascript: ['fetch'],
  shell: ['curl'],
} as const satisfies z.input<typeof generatedSnippetClientsSchema>

const defaultGeneratedSnippetReference = {
  target: 'shell',
  client: 'curl',
} as const satisfies z.input<typeof snippetReferenceSchema>

const generatedSnippetsSchema = z
  .object({
    /**
     * Defines the enabled clients for which snippets should be generated.
     */
    clients: generatedSnippetClientsSchema.default(defaultGeneratedSnippetClients),
    /**
     * Defines the generated snippet that should be used by default on operation pages among the enabled generated
     * snippet clients.
     */
    default: snippetReferenceSchema.optional(),
  })
  .transform((value, ctx) => {
    for (const [target, clients] of Object.entries(value.clients)) {
      if (!clients) continue

      if (new Set(clients).size !== clients.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'Generated snippet clients must be unique.',
          path: ['clients', target],
        })

        return z.NEVER
      }
    }

    if (value.default && !includesSnippetReference(value.clients, value.default)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The default generated snippet client must be one of the enabled clients.',
        path: ['default'],
      })

      return z.NEVER
    }

    const defaultReference = getDefaultSnippetReference(value.clients, value.default)

    if (!defaultReference) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one generated snippet client must be enabled.',
        path: ['clients'],
      })

      return z.NEVER
    }

    return {
      clients: Object.entries(value.clients).flatMap(([target, clients]) =>
        (clients ?? []).map((client) => ({ target: target, client }) as SnippetReference),
      ),
      default: defaultReference,
    }
  })

const defaultGeneratedSnippetsConfig = generatedSnippetsSchema.parse({})

const snippetsGeneratedSchema = z
  .union([z.literal(true), z.literal(false), generatedSnippetsSchema])
  .transform((value) => (value === true ? defaultGeneratedSnippetsConfig : value))
  .default(defaultGeneratedSnippetsConfig)

export const SnippetsSchema = z
  .object({
    /**
     * Controls whether generated snippets are available on operation pages.
     */
    generated: snippetsGeneratedSchema,
  })
  .default({ generated: defaultGeneratedSnippetsConfig })

function includesSnippetReference(clients: GeneratedSnippetClients, reference: SnippetReference): boolean {
  return clients[reference.target]?.includes(reference.client as never) ?? false
}

function getDefaultSnippetReference(
  clients: GeneratedSnippetClients,
  reference: SnippetReference | undefined,
): SnippetReference | undefined {
  if (reference) return reference
  if (includesSnippetReference(clients, defaultGeneratedSnippetReference)) return defaultGeneratedSnippetReference

  for (const [target, targetClients] of Object.entries(clients)) {
    const [client] = targetClients ?? []
    if (client) return { target, client } as SnippetReference
  }

  return
}

type GeneratedSnippetClients = z.output<typeof generatedSnippetClientsSchema>

export type SnippetReference = z.output<typeof snippetReferenceSchema>
