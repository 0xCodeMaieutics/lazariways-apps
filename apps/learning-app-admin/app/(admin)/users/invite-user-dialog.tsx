"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Button } from "@lazariways/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lazariways/ui/components/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@lazariways/ui/components/field"
import { Input } from "@lazariways/ui/components/input"
import { NativeSelect, NativeSelectOption } from "@lazariways/ui/components/native-select"
import { useMutation } from "@tanstack/react-query"
import { Loader2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { useTRPC } from "@/lib/trpc/react"

const inviteSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email address").trim(),
  role: z.enum(["USER", "ADMIN"]),
})

type InviteFormValues = z.infer<typeof inviteSchema>

const DEFAULT_VALUES: InviteFormValues = { name: "", email: "", role: "USER" }

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const trpc = useTRPC()

  const form = useForm<InviteFormValues>({
    resolver: standardSchemaResolver(inviteSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const inviteMutation = useMutation(
    trpc.admin.users.invite.mutationOptions({
      onSuccess: (_data, variables) => {
        setOpen(false)
        form.reset(DEFAULT_VALUES)
        toast.success(`Invitation sent to ${variables.email}`)
        router.refresh()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  const { register, formState } = form
  const isPending = inviteMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return
        setOpen(nextOpen)
        if (!nextOpen) form.reset(DEFAULT_VALUES)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Invite user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={form.handleSubmit((data) => inviteMutation.mutate(data))}
          noValidate
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
            <DialogDescription>
              They will receive an email with a link to set their password. The link expires after 72 hours.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="invite-name">Name</FieldLabel>
              <Input id="invite-name" autoComplete="off" disabled={isPending} {...register("name")} />
              <FieldError errors={[formState.errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                autoComplete="off"
                disabled={isPending}
                {...register("email")}
              />
              <FieldError errors={[formState.errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <NativeSelect id="invite-role" className="w-full" disabled={isPending} {...register("role")}>
                <NativeSelectOption value="USER">Learner</NativeSelectOption>
                <NativeSelectOption value="ADMIN">Admin</NativeSelectOption>
              </NativeSelect>
              <FieldError errors={[formState.errors.role]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
