import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../server'
import { auth } from '@/lib/auth.server'
import { tryCatchAsync } from '@/lib/try-catch'

const signInSchema = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
    rememberMe: z.boolean().optional().default(false),
})

const signUpSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(128, { message: 'Password must be at most 128 characters' }),
    image: z.url({ message: 'Invalid image URL' }).optional(),
    callbackURL: z.string().url({ message: 'Invalid callback URL' }).optional(),
})

const signInSocial = z.object({
    provider: z.enum(['google']),
})

export const loginRouter = router({
    signInEmail: publicProcedure
        .input(signInSchema)
        .mutation(async ({ input, ctx }) => {
            const [error, result] = await tryCatchAsync(
                async () =>
                    await auth.api.signInEmail({
                        body: {
                            email: input.email,
                            password: input.password,
                            rememberMe: input.rememberMe,
                        },
                        headers: ctx.headers,
                    })
            )

            if (error) {
                console.error(error)
                // Handle better-auth errors
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to sign in',
                    cause: error,
                })
            }

            if (result === null) {
                console.error('SIGN_IN_EMAIL_RESULT_NULL')
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to sign in',
                })
            }

            return {
                success: true,
                data: result,
            }
        }),
    signInSocial: publicProcedure
        .input(signInSocial)
        .mutation(async ({ ctx, input }) => {
            const [error, result] = await tryCatchAsync(
                async () =>
                    await auth.api.signInSocial({
                        body: {
                            provider: input.provider,
                        },
                        headers: ctx.headers,
                    })
            )

            if (error) {
                console.error(error)
                // Handle better-auth errors
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to sign in',
                    cause: error,
                })
            }

            if (result === null) {
                console.error('SIGN_IN_SOCIAL_RESULT_NULL')
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to sign in',
                })
            }

            return {
                success: true,
                data: result,
            }
        }),
    signUpEmail: publicProcedure
        .input(signUpSchema)
        .mutation(async ({ input, ctx }) => {
            const [error, result] = await tryCatchAsync(
                async () =>
                    await auth.api.signUpEmail({
                        body: {
                            name: input.name,
                            email: input.email,
                            password: input.password,
                            image: input.image,
                            callbackURL: input.callbackURL,
                        },
                        headers: ctx.headers,
                    })
            )

            if (error) {
                console.error(error)
                // Handle better-auth errors
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to sign up',
                    cause: error,
                })
            }

            if (result === null) {
                console.error('SIGN_UP_EMAIL_RESULT_NULL')
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to sign up',
                })
            }

            return {
                success: true,
                data: result,
            }
        }),
})
