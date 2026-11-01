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
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { useTRPC } from "@/lib/trpc/react"

type DeleteUserButtonProps = {
  userId: string
  email: string
  disabled?: boolean
}

export function DeleteUserButton({ userId, email, disabled = false }: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const trpc = useTRPC()

  const deleteUser = useMutation(
    trpc.admin.users.delete.mutationOptions({
      onSuccess: () => {
        setOpen(false)
        toast.success(`${email} was deleted`)
        router.refresh()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (deleteUser.isPending) return
        setOpen(nextOpen)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} aria-label={`Delete ${email}`}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription>
            {`${email} will be permanently deleted along with their sessions and exam progress. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault()
              deleteUser.mutate({ id: userId })
            }}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete user"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
