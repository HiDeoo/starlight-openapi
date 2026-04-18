import { z } from 'astro/zod'

const snippetShellClientSchema = z.enum(['curl', 'wget'])
const snippetJavaScriptClientSchema = z.enum(['axios', 'fetch'])

const snippetReferenceSchema = z.discriminatedUnion('target', [
  z.object({
    target: z.literal('javascript'),
    client: snippetJavaScriptClientSchema,
  }),
  z.object({
    target: z.literal('shell'),
    client: snippetShellClientSchema,
  }),
])

const generatedSnippetClientsSchema = z
  .object({
    javascript: z.array(snippetJavaScriptClientSchema).optional(),
    shell: z.array(snippetShellClientSchema).optional(),
  })
  .partial()

// TODO(HiDeoo) refine list at the end when all supported clients are added
const defaultGeneratedSnippetClients = {
  javascript: ['axios', 'fetch'],
  shell: ['curl', 'wget'],
} as const satisfies z.input<typeof generatedSnippetClientsSchema>

const defaultGeneratedSnippetReference = {
  target: 'shell',
  client: 'curl',
} as const satisfies z.input<typeof snippetReferenceSchema>

const generatedSnippetsSchema = z
  .object({
    // TODO(HiDeoo)
    clients: generatedSnippetClientsSchema.default(defaultGeneratedSnippetClients),
    // TODO(HiDeoo)
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
  .object({ generated: snippetsGeneratedSchema })
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
