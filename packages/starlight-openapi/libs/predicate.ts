export function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function hasDefinedValue<T extends object, K extends string>(
  value: T | null | undefined,
  key: K,
): value is T & Record<K, unknown>
export function hasDefinedValue<K extends string>(value: unknown, key: K): value is Record<K, unknown>
export function hasDefinedValue(value: unknown, key: string): boolean {
  return isObjectLike(value) && key in value && value[key] !== undefined
}

export function getDefinedValue(value: unknown, key: string): unknown {
  return hasDefinedValue(value, key) ? value[key] : undefined
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}
