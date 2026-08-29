'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/react'
import { Button } from '@workspace/ui/components/button'
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
} from '@workspace/ui/components/alert-dialog'
import { Loader2, Trash2 } from 'lucide-react'

type DeleteButtonProps = {
    entityType: 'exam' | 'exercise'
    entityId: string
    entityName: string
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
}

export function DeleteButton({
    entityType,
    entityId,
    entityName,
    variant = 'ghost',
    size = 'icon',
    className,
}: DeleteButtonProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const trpc = useTRPC()

    const deleteExam = useMutation(
        trpc.admin.exams.delete.mutationOptions({
        onSuccess: () => {
            setOpen(false)
            router.refresh()
        },
    }))

    const mutation =
        entityType === 'exam' ? deleteExam : null

    const handleDelete = () => {
        if (entityType === 'exam') {
            deleteExam.mutate({ id: entityId })
        }
    }

    const isPending = mutation?.isPending ?? false

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <Trash2 className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {entityType}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{entityName}&quot;?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
