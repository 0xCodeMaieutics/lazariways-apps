'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import {
    Loader2,
    MoreHorizontal,
    Pencil,
    Trash2,
    GripVertical,
} from 'lucide-react'
import type { LearningAppExercise } from '@workspace/database/browser'

function formatExerciseType(type: string) {
    return type
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ')
}

function SortableRow({
    exercise,
    topicId: topicId,
    examId,
    onRequestDelete,
}: {
    exercise: LearningAppExercise
    topicId: string
    examId: string
    onRequestDelete: (target: { id: string; label: string }) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: exercise.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell className="w-[40px]">
                <button
                    className="cursor-grab touch-none"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="text-muted-foreground size-4" />
                </button>
            </TableCell>
            <TableCell className="font-medium">{exercise.order}</TableCell>
            <TableCell>
                <Badge variant="secondary">
                    {formatExerciseType(exercise.type)}
                </Badge>
            </TableCell>
            <TableCell>
                <span className="line-clamp-2">
                    {exercise.prompt || exercise.text || '—'}
                </span>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/topics/${topicId}/exams/${examId}/exercises/${exercise.id}/edit`}
                            >
                                <Pencil className="mr-2 size-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                                e.preventDefault()
                                onRequestDelete({
                                    id: exercise.id,
                                    label:
                                        exercise.prompt ||
                                        exercise.text ||
                                        `Exercise ${exercise.order}`,
                                })
                            }}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

export function ExamExercisesTable({
    exercises,
    topicId,
    examId,
}: {
    exercises: LearningAppExercise[]
    topicId: string
    examId: string
}) {
    const router = useRouter()
    const trpc = useTRPC()
    const [items, setItems] = useState(exercises)
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string
        label: string
    } | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        })
    )

    const reorderMutation = useMutation(
        trpc.admin.exercises.reorder.mutationOptions({
        onSuccess: () => router.refresh(),
    }))

    const deleteMutation = useMutation(
        trpc.admin.exercises.delete.mutationOptions({
        onSuccess: () => {
            setDeleteTarget(null)
            setItems((prev) => prev.filter((e) => e.id !== deleteTarget?.id))
            router.refresh()
        },
    }))

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setItems((prev) => {
            const oldIndex = prev.findIndex((e) => e.id === active.id)
            const newIndex = prev.findIndex((e) => e.id === over.id)
            const reordered = arrayMove(prev, oldIndex, newIndex)

            reorderMutation.mutate(
                reordered.map((ex, i) => ({ id: ex.id, order: i }))
            )

            return reordered
        })
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]" />
                            <TableHead>Order</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Prompt / Text</TableHead>
                            <TableHead className="w-[50px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableContext
                            items={items.map((e) => e.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((exercise) => (
                                <SortableRow
                                    key={exercise.id}
                                    exercise={exercise}
                                    topicId={topicId}
                                    examId={examId}
                                    onRequestDelete={setDeleteTarget}
                                />
                            ))}
                        </SortableContext>
                    </TableBody>
                </Table>
            </DndContext>

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete exercise?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;
                            {deleteTarget?.label}&quot;? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                if (deleteTarget) {
                                    deleteMutation.mutate({
                                        id: deleteTarget.id,
                                    })
                                }
                            }}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? (
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
        </>
    )
}
