import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/lib/auth.server'

const t = initTRPC.context<{ auth: typeof auth; headers: Headers }>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const authedProcedure = t.procedure.use(async (opts) => {
    // Add authentication check here
    const headers = opts.ctx.headers
    const session = await auth.api.getSession({ headers })
    if (session === null) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        })
    }
    return opts.next({
        ctx: {
            ...opts.ctx,
            session,
        },
    })
})

export const adminProcedure = authedProcedure.use(async (opts) => {
    if (opts.ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' })
    }
    return opts.next(opts)
})
