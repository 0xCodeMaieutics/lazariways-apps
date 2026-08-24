'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@workspace/ui/components/field'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DEV_EMAIL, DEV_PASSWORD } from '@/lib/constants'

const signInSchema = z.object({
    email: z.email({ message: 'არასწორი ელფოსტის მისამართი' }),
    password: z.string().min(1, { message: 'პაროლი აუცილებელია' }),
})

type SignInForm = z.infer<typeof signInSchema>

export default function LoginPage() {
    const router = useRouter()
    const trpc = useTRPC()

    const signInForm = useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: process.env.NODE_ENV === 'development' ? DEV_EMAIL : '',
            password:
                process.env.NODE_ENV === 'development' ? DEV_PASSWORD : '',
        },
    })

    const signInMutation = useMutation(
        trpc.login.signInEmail.mutationOptions({
            onSuccess: () => {
                router.push('/topics')
            },
        })
    )

    const onSignIn = async (data: SignInForm) => {
        await signInMutation.mutateAsync({
            email: data.email,
            password: data.password,
        })
    }

    const isLoading = signInMutation.isPending

    return (
        <div className="flex h-dvh items-center justify-center px-4 py-12">
            <div className="flex w-full max-w-md flex-col items-center justify-center space-y-4">
                <form
                    onSubmit={signInForm.handleSubmit(onSignIn)}
                    className="w-full space-y-4"
                >
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={signInForm.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">
                                        ელფოსტა
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        disabled={isLoading}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={signInForm.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="password">
                                        პაროლი
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    {signInMutation.isError ? (
                        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                            {signInMutation.error.message}
                        </div>
                    ) : null}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                        size={'lg'}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                შესვლა...
                            </>
                        ) : (
                            'შესვლა'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
