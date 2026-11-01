"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@lazariways/ui/components/alert-dialog"
import { Button } from "@lazariways/ui/components/button"
import { useMutation } from "@tanstack/react-query"
import { KeyRound, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { useTRPC } from "@/lib/trpc/react"

type ResetPasswordButtonProps = {
  userId: string
  email: string
  disabled?: boolean
}

export function ResetPasswordButton({ userId, email, disabled = false }: ResetPasswordButtonProps) {
  const [open, setOpen] = useState(false)
  const trpc = useTRPC()

  const sendPasswordReset = useMutation(
    trpc.admin.users.sendPasswordReset.mutationOptions({
      onSuccess: () => {
        setOpen(false)
        toast.success(`Password reset email sent to ${email}`)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <KeyRound className="size-4" />
          Reset password
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send password reset email?</AlertDialogTitle>
          <AlertDialogDescription>
            {email} will receive a link to set a new password. The link expires after 72 hours, and their
            current sessions are signed out once the new password is set.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={sendPasswordReset.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              sendPasswordReset.mutate({ id: userId })
            }}
            disabled={sendPasswordReset.isPending}
          >
            {sendPasswordReset.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send email"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
