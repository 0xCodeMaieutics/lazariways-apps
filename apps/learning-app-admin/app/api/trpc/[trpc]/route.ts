import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/lib/trpc/router'
import { auth } from '@/lib/auth.server'

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => {
            return {
                auth,
                headers: req.headers,
            }
        },
        onError: ({ error, path, input }) => {
            console.error('tRPC Error:', {
                path,
                input,
                error: {
                    message: error.message,
                    code: error.code,
                    cause: error.cause,
                },
            })
        },
    })

export { handler as GET, handler as POST }
