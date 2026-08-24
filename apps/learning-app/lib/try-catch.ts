export async function tryCatchAsync<T extends () => Promise<any>>(
    fn: T
): Promise<[Error | null, Awaited<ReturnType<T>> | null]> {
    try {
        const result = await fn()
        return [null, result]
    } catch (error) {
        return [error instanceof Error ? error : new Error(String(error)), null]
    }
}
