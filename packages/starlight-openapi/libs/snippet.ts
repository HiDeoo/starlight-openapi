import { HTTPSnippet, type HarRequest as HTTPSnippetHarRequest } from 'httpsnippet'

import { getOperationHarRequest, type HarRequest } from './har'
import type { OperationCodeSample, PathItemOperation } from './operation'
import type { Schema } from './schemas/schema'
import type { SnippetReference } from './schemas/snippet'

const snippetPlaceholderRegex = /^<[^<>]+>$/

export const GeneratedSnippetTargetMetadata: Record<SnippetReference['target'], { label: string }> = {
  c: { label: 'C' },
  csharp: { label: 'C#' },
  go: { label: 'Go' },
  java: { label: 'Java' },
  javascript: { label: 'JavaScript' },
  kotlin: { label: 'Kotlin' },
  rust: { label: 'Rust' },
  shell: { label: 'Shell' },
}

export const GeneratedSnippetClientMetadata: GeneratedSnippetClientMetadata = {
  c: {
    libcurl: { label: 'libcurl', lang: 'c' },
  },
  csharp: {
    httpclient: { label: 'HttpClient', lang: 'cs' },
  },
  go: {
    nethttp: { label: 'net/http', lang: 'go', httpsnippetClient: 'native' },
  },
  java: {
    okhttp: { label: 'OkHttp', lang: 'java' },
    nethttp: { label: 'net.http', lang: 'java' },
  },
  javascript: {
    axios: { label: 'Axios', lang: 'js' },
    fetch: { label: 'Fetch', lang: 'js' },
  },
  kotlin: {
    okhttp: { label: 'OkHttp', lang: 'kt' },
  },
  rust: {
    reqwest: { label: 'Reqwest', lang: 'rs' },
  },
  shell: {
    curl: { label: 'cURL', lang: 'sh' },
    wget: { label: 'Wget', lang: 'sh' },
  },
}

export function getOperationSnippets(schema: Schema, operation: PathItemOperation): OperationSnippets | undefined {
  return (
    normalizeOperationCodeSamples(operation.operation['x-codeSamples']) ?? generateOperationSnippets(schema, operation)
  )
}

function normalizeOperationCodeSamples(codeSamples: OperationCodeSample[] | undefined): OperationSnippets | undefined {
  if (!codeSamples || codeSamples.length === 0) return

  const items: OperationSnippet[] = codeSamples.map((sample, index) => ({
    content: sample.source,
    id: `code-sample:${sample.lang}:${index}`,
    label: sample.label ?? sample.lang,
    lang: sample.lang,
  }))

  const defaultSnippet = items[0]
  if (!defaultSnippet) return

  return {
    defaultId: defaultSnippet.id,
    items,
  }
}

function generateOperationSnippets(schema: Schema, operation: PathItemOperation): OperationSnippets | undefined {
  if (!operation.path) return
  if (!schema.config.snippets.generated) return

  const harRequest = getOperationHarRequest(schema, operation)
  let items: OperationSnippet[] = []

  for (const reference of schema.config.snippets.generated.clients) {
    const content = generateOperationSnippet(harRequest, reference)
    if (!content) continue

    const clientMetadata = getGeneratedSnippetClientMetadata(reference)

    items.push({
      content,
      groupLabel: GeneratedSnippetTargetMetadata[reference.target].label,
      id: `${reference.target}:${reference.client}`,
      label: clientMetadata.label,
      lang: clientMetadata.lang,
    })
  }

  const firstItemId = items[0]?.id
  if (items.length === 0 || !firstItemId) return

  items = items.toSorted(sortOperationSnippets)

  const configuredDefaultId = `${schema.config.snippets.generated.default.target}:${schema.config.snippets.generated.default.client}`
  const defaultId = items.some((item) => item.id === configuredDefaultId) ? configuredDefaultId : firstItemId

  return { defaultId, items }
}

function generateOperationSnippet(harRequest: HarRequest, reference: SnippetReference): string | undefined {
  try {
    const httpSnippet = new HTTPSnippet(toHTTPSnippetHarRequest(harRequest))
    const httpSnippetReference = toHTTPSnippetReference(reference)

    const snippet = httpSnippet.convert(httpSnippetReference.target, httpSnippetReference.client)
    if (typeof snippet !== 'string' || !snippet) return

    return normalizeSnippetPlaceholders(snippet, harRequest)
  } catch {
    return
  }
}

function getGeneratedSnippetClientMetadata(reference: SnippetReference): GeneratedSnippetClientMetadataValue {
  return GeneratedSnippetClientMetadata[reference.target][
    reference.client as keyof (typeof GeneratedSnippetClientMetadata)[typeof reference.target]
  ]
}

function normalizeSnippetPlaceholders(snippet: string, harRequest: HarRequest): string {
  let normalizedSnippet = snippet
  for (const placeholder of getSnippetPlaceholders(harRequest)) {
    normalizedSnippet = normalizedSnippet.split(encodeURIComponent(placeholder)).join(placeholder)
  }
  return normalizedSnippet
}

function getSnippetPlaceholders(harRequest: HarRequest): string[] {
  const placeholders = new Set<string>()

  for (const { value } of [
    ...harRequest.queryString,
    ...harRequest.headers,
    ...harRequest.cookies,
    ...(harRequest.postData && 'params' in harRequest.postData
      ? harRequest.postData.params.filter(
          (param): param is typeof param & { value: string } => typeof param.value === 'string',
        )
      : []),
  ]) {
    if (snippetPlaceholderRegex.test(value)) placeholders.add(value)
  }

  return [...placeholders]
}

function toHTTPSnippetHarRequest(harRequest: HarRequest): HTTPSnippetHarRequest {
  return {
    ...harRequest,
    /**
     * HTTPSnippet requires `postData` in its TypeScript `HarRequest` type definition even though a default value is
     * automatically added when missing. We mirror that fallback here to avoid any casting.
     *
     * @see https://github.com/Kong/httpsnippet/blob/795d98e7f853701396240bcf2e66965a149d8b6b/src/httpsnippet.ts#L111-L113
     */
    postData: harRequest.postData ?? {
      mimeType: 'application/octet-stream',
    },
  }
}

function toHTTPSnippetReference(reference: SnippetReference) {
  const metadata = getGeneratedSnippetClientMetadata(reference)

  return { target: reference.target, client: metadata.httpsnippetClient ?? reference.client }
}

function sortOperationSnippets(a: OperationSnippet, b: OperationSnippet): number {
  return (a.groupLabel ?? '').localeCompare(b.groupLabel ?? '') || a.label.localeCompare(b.label)
}

interface GeneratedSnippetClientMetadataValue {
  httpsnippetClient?: string
  label: string
  lang: string
}

type GeneratedSnippetClientMetadata = {
  [Target in SnippetReference['target']]: Record<
    Extract<SnippetReference, { target: Target }>['client'],
    GeneratedSnippetClientMetadataValue
  >
}

interface OperationSnippet {
  content: string
  groupLabel?: string
  id: string
  label: string
  lang: string
}

export interface OperationSnippets {
  defaultId: OperationSnippet['id']
  items: OperationSnippet[]
}
