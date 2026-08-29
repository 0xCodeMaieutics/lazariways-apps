"use client"

import { useState } from "react"
import { Topic } from "@workspace/database/browser"
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
import { Switch } from "@workspace/ui/components/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GripVertical, Loader2, Plus } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc/react"

const TOPIC_TYPE_LABELS: Record<Topic["type"], string> = {
  STARTER: "Starter",
  BAECKEREI: "Backärei",
  FREIZEIT_PARK: "Freizeitpark",
}

function SortableRow({
  topic,
  onNavigate,
  onToggleEnabled,
  isTogglePending,
}: {
  topic: Topic
  onNavigate: () => void
  onToggleEnabled: (enabled: boolean) => void
  isTogglePending: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id })

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
      <TableCell>{topic.name}</TableCell>
      <TableCell>{TOPIC_TYPE_LABELS[topic.type]}</TableCell>
      <TableCell className="relative flex max-w-max gap-2">
        <Switch
          onClick={(e) => e.stopPropagation()}
          checked={topic.enabled}
          onCheckedChange={onToggleEnabled}
        />
        {isTogglePending && (
          <Loader2 className="absolute -right-5 size-5 animate-spin" />
        )}
      </TableCell>
    </TableRow>
  )
}

export const TopicsList = ({
  topics: topicsOuter,
}: {
  topics: Topic[]
}) => {
  const router = useRouter()
  const trpc = useTRPC()
  const [topics, setTopics] = useState([...topicsOuter])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  )

  const {
    mutate: updateTopicEnable,
    isPending: isTogglePending,
    variables,
  } = useMutation(
    trpc.admin.topics.updateTopicEnabled.mutationOptions({
      onSuccess: (_, { id, enabled }) => {
        router.refresh()
        setTopics((previousTopics) =>
          previousTopics.map((previousTopic) => {
            if (id === previousTopic.id) {
              return {
                ...previousTopic,
                enabled,
              }
            }
            return { ...previousTopic }
          })
        )
      },
    })
  )

  const reorderMutation = useMutation(
    trpc.admin.topics.reorder.mutationOptions({
      onSuccess: () => router.refresh(),
    })
  )

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <Button asChild>
            <Link
              href={"/topics/new"}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Create exercise
            </Link>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event
            if (!over || active.id === over.id) return
            setTopics((prev) => {
              const oldIndex = prev.findIndex((t) => t.id === active.id)
              const newIndex = prev.findIndex((t) => t.id === over.id)
              const reordered = arrayMove(prev, oldIndex, newIndex)

              reorderMutation.mutate(
                reordered.map((topic, i) => ({
                  id: topic.id,
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
                <TableHead className="w-10" />
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={topics.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {topics.map((topic) => (
                  <SortableRow
                    key={topic.id}
                    topic={topic}
                    onNavigate={() =>
                      router.push(`/topics/${topic.id}/exams`)
                    }
                    onToggleEnabled={(enabled) =>
                      updateTopicEnable({
                        id: topic.id,
                        enabled,
                      })
                    }
                    isTogglePending={
                      isTogglePending && variables?.id === topic.id
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
