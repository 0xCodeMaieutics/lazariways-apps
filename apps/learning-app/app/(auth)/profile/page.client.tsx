"use client"

import { Card, CardContent } from "@lazariways/ui/components/card"
import { Separator } from "@lazariways/ui/components/separator"
import { useMutation } from "@tanstack/react-query"
import { Award, Calendar, Flame, Plus, Target, Trophy, User, Zap } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { useTRPC } from "@/lib/trpc/react"
import { cn } from "@/lib/utils"

import { AvatarCropDialog } from "./avatar-crop-dialog"

const ProfileAvatar = ({
  image,
  previewUrl,
  name,
  onAvatarPick,
}: {
  image: string | null
  previewUrl: string | null
  name: string
  onAvatarPick?: (file: File) => void
}) => {
  const displaySrc = previewUrl ?? image

  return (
    <label htmlFor="picture" className="flex cursor-pointer justify-center">
      <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-primary bg-accent shadow-sm transition-shadow hover:shadow-md">
        {displaySrc !== null ? (
          previewUrl !== null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={name} className="size-full rounded-full object-cover" />
          ) : (
            <Image
              src={displaySrc}
              alt={name}
              sizes="100px"
              fill
              className="size-full rounded-full object-cover"
            />
          )
        ) : (
          <User className="size-12 text-primary" />
        )}
        <div className="absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full bg-primary ring-2 ring-background">
          <Plus className="size-4 stroke-primary-foreground"></Plus>
        </div>
      </div>
      <input
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file !== undefined) onAvatarPick?.(file)
        }}
        className="invisible absolute"
        aria-label="Avatar Picker"
        accept="image/*"
        id="picture"
        type="file"
      />
    </label>
  )
}

function ProfileHeader({
  profile,
}: {
  profile: {
    name: string
    email: string
    image: string | null
    joinedAt: string
    totalXP: number
    classification: "bronze" | "silver" | "gold"
    streakDays: number
    totalExamsPassed: number
    totalExamsAttempted: number
  }
}) {
  const [joinedAtFormatted] = useState(() =>
    new Date(profile.joinedAt).toLocaleDateString("ka-GE", {
      month: "long",
      year: "numeric",
    })
  )

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingImage, setPendingImage] = useState<{ src: string; fileName: string } | null>(null)
  const prevUrlRef = useRef<string | null>(null)
  const pendingUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current)
    }
  }, [])

  const trpc = useTRPC()
  const uploadImage = useMutation(trpc.user.uploadImage.mutationOptions())

  const clearPendingImage = () => {
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current)
    pendingUrlRef.current = null
    setPendingImage(null)
  }

  const handleAvatarPick = (file: File) => {
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current)
    const src = URL.createObjectURL(file)
    pendingUrlRef.current = src
    setPendingImage({ src, fileName: file.name })
  }

  const handleAvatarCropped = async (file: File) => {
    clearPendingImage()

    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
    const url = URL.createObjectURL(file)
    prevUrlRef.current = url
    setPreviewUrl(url)

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    uploadImage.mutate({ base64, contentType: file.type })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <ProfileAvatar
        image={profile.image}
        previewUrl={previewUrl}
        name={profile.name}
        onAvatarPick={handleAvatarPick}
      />
      {pendingImage !== null && (
        <AvatarCropDialog
          key={pendingImage.src}
          imageSrc={pendingImage.src}
          fileName={pendingImage.fileName}
          onCancel={clearPendingImage}
          onCropped={handleAvatarCropped}
        />
      )}
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <p className="text-sm text-muted-foreground">{profile.email}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          შემოერთდა {joinedAtFormatted}
        </p>
      </div>
    </div>
  )
}

const StatCard = ({
  icon: Icon,
  value,
  label,
  iconColor,
  iconBg,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string
  iconColor?: string
  iconBg?: string
}) => (
  <Card className="gap-0 py-4 shadow-xs">
    <CardContent className="flex items-center gap-3 px-4">
      <div
        className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", iconBg ?? "bg-muted")}
      >
        <Icon className={cn("size-4", iconColor ?? "text-muted-foreground")} />
      </div>
      <div className="min-w-0">
        <p className="text-lg leading-tight font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
)

function ProfileStats({
  profile,
}: {
  profile: {
    name: string
    email: string
    image: string | null
    joinedAt: string
    totalXP: number
    classification: "bronze" | "silver" | "gold"
    streakDays: number
    totalExamsPassed: number
    totalExamsAttempted: number
  }
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">სტატისტიკა</h2>
      <div className="flex flex-col gap-3">
        <StatCard
          icon={Flame}
          value={profile.streakDays}
          label="სერიის დღეები"
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
        <StatCard
          icon={Zap}
          value={profile.totalXP}
          label="XP სულ"
          iconColor="text-yellow-700"
          iconBg="bg-yellow-100"
        />
        <StatCard
          icon={
            {
              gold: Trophy,
              silver: Award,
              bronze: Award,
            }[profile.classification]
          }
          value={
            {
              gold: "ოქრო",
              silver: "ვერცხლი",
              bronze: "ბრინჯაო",
            }[profile.classification]
          }
          label="საფეხური"
          iconColor={
            {
              gold: "text-yellow-700",
              silver: "text-slate-600",
              bronze: "text-amber-700",
            }[profile.classification]
          }
          iconBg={
            {
              gold: "bg-yellow-100",
              silver: "bg-slate-100",
              bronze: "bg-amber-100",
            }[profile.classification]
          }
        />
        <StatCard
          icon={Target}
          value={profile.totalExamsPassed}
          label="ჩაბარებული გამოცდები"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
      </div>
    </div>
  )
}

export const ProfileClient = ({
  profile,
}: {
  profile: {
    name: string
    email: string
    image: string | null
    joinedAt: string
    totalXP: number
    classification: "bronze" | "silver" | "gold"
    streakDays: number
    totalExamsPassed: number
    totalExamsAttempted: number
  }
}) => (
  <div className="mx-auto flex flex-col gap-6 px-4 py-8">
    <ProfileHeader profile={profile} />
    <Separator />
    <ProfileStats profile={profile} />
  </div>
)
