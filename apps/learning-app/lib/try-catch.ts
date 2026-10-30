export async function tryCatchAsync<R>(fn: () => Promise<R>): Promise<[Error | null, R | null]> {
  try {
    const result = await fn()
    return [null, result]
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
