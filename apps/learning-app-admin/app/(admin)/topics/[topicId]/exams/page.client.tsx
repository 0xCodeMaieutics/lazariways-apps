"use client"

import { useState } from "react"
import { LearningAppExam } from "@workspace/database/browser"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc/react"
import { formatSecondsAsHoursMinutes } from "@/utils/format-duration"

function SortableRow({
  exam,
  topicId,
  onNavigate,
}: {
  exam: LearningAppExam
  topicId: string
  onNavigate: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exam.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="cursor-pointer"
      onClick={onNavigate}
    >
      <TableCell className="w-10">
        <button
          className="cursor-grab touch-none"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>{exam.title}</TableCell>
      <TableCell>{exam.estimatedTimeInMinutes ?? "—"}</TableCell>
      <TableCell>{exam.minimumCorrectAnswerCount}</TableCell>
      <TableCell>{exam.minimumPassedCount}</TableCell>
      <TableCell className="tabular-nums">
        {formatSecondsAsHoursMinutes(exam.waitUntilPassAllowedInSeconds)}
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
            <DropdownMenuItem onClick={(e) => e.stopPropagation()} asChild>
              <Link href={`/topics/${topicId}/exams/${exam.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export const AdminExams = ({
  exams: examsOuter,
}: {
  exams: LearningAppExam[]
}) => {
  const router = useRouter()
  const params = useParams()
  const topicId = params.topicId as string
  const trpc = useTRPC()
  const [exams, setExams] = useState([...examsOuter])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  )

  const reorderMutation = useMutation(
    trpc.admin.exams.reorder.mutationOptions({
      onSuccess: () => router.refresh(),
    })
  )

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="link" className="flex">
          <Link href="/topics">
            <ArrowLeft />
            <span>Back</span>
          </Link>
        </Button>
        <Button asChild>
          <Link
            href={`/topics/${topicId}/exams/new`}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>Create new exam</span>
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event
            if (!over || active.id === over.id) return
            setExams((prev) => {
              const oldIndex = prev.findIndex((e) => e.id === active.id)
              const newIndex = prev.findIndex((e) => e.id === over.id)
              const reordered = arrayMove(prev, oldIndex, newIndex)

              reorderMutation.mutate(
                reordered.map((exam, i) => ({
                  id: exam.id,
                  order: i,
                }))
              )

              return reordered
            })
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]" />
                <TableHead>Title</TableHead>
                <TableHead>Est. time (min)</TableHead>
                <TableHead>Min correct answer</TableHead>
                <TableHead>Min passed</TableHead>
                <TableHead>Pass cooldown (HH:MM)</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={exams.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {exams.map((exam) => (
                  <SortableRow
                    key={exam.id}
                    exam={exam}
                    topicId={topicId}
                    onNavigate={() =>
                      router.push(
                        `/topics/${topicId}/exams/${exam.id}/exercises`
                      )
                    }
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  )
}
