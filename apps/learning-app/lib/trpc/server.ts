import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/lib/auth.server'

export async function createContext(opts: { headers: Headers }) {
    return {
        headers: opts.headers,
    }
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

const enforceAuth = t.middleware(async ({ ctx, next }) => {
    const session = await auth.api.getSession({ headers: ctx.headers })
    if (session === null) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        })
    }
    return next({
        ctx: {
            session,
        },
    })
})

export const authedProcedure = publicProcedure.use(enforceAuth)

export const adminProcedure = authedProcedure.use(async ({ ctx, next }) => {
    if (ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' })
    }
    return next()
})
