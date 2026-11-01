"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@lazariways/ui/components/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@lazariways/ui/components/field"
import { Input } from "@lazariways/ui/components/input"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { useTRPC } from "@/lib/trpc/react"

const INVALID_LINK_MESSAGE = "ბმულს ვადა გაუვიდა ან უკვე გამოყენებულია — მიმართეთ ადმინისტრატორს"

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "პაროლი უნდა შედგებოდეს მინიმუმ 8 სიმბოლოსგან" })
      .max(128, { message: "პაროლი უნდა შედგებოდეს მაქსიმუმ 128 სიმბოლოსგან" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "პაროლები არ ემთხვევა",
    path: ["confirmPassword"],
  })

type SetPasswordForm = z.infer<typeof setPasswordSchema>

export function SetPasswordClient({ token }: { token: string | null }) {
  const router = useRouter()
  const trpc = useTRPC()

  const form = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const setPasswordMutation = useMutation(
    trpc.login.setPassword.mutationOptions({
      onSuccess: () => {
        router.push("/topics")
      },
    })
  )

  if (token === null) {
    return (
      <div className="flex h-dvh items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {INVALID_LINK_MESSAGE}
        </div>
      </div>
    )
  }

  const onSubmit = async (data: SetPasswordForm) => {
    await setPasswordMutation.mutateAsync({ token, password: data.password })
  }

  const isLoading = setPasswordMutation.isPending || setPasswordMutation.isSuccess

  return (
    <div className="flex h-dvh items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center justify-center space-y-4">
        <h1 className="text-xl font-semibold">პაროლის დაყენება</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">ახალი პაროლი</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">გაიმეორეთ პაროლი</FieldLabel>
                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          {setPasswordMutation.isError ? (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {setPasswordMutation.error.message === "INVALID_TOKEN"
                ? INVALID_LINK_MESSAGE
                : "პაროლის დაყენება ვერ მოხერხდა, სცადეთ თავიდან"}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading} size={"lg"}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                შენახვა...
              </>
            ) : (
              "პაროლის შენახვა"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
