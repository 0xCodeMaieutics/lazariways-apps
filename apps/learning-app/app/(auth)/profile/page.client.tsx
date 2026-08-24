'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { cn } from '@/lib/utils'
import {
    Award,
    Calendar,
    Flame,
    Plus,
    Target,
    Trophy,
    User,
    Zap,
} from 'lucide-react'
import Image from 'next/image'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/react'

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
        <label htmlFor="picture" className="flex justify-center">
            <div className="bg-muted border-primary relative flex size-24 items-center justify-center rounded-full border-2">
                {displaySrc !== null ? (
                    previewUrl !== null ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={previewUrl}
                            alt={name}
                            className="size-full rounded-full object-cover"
                        />
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
                    <User className="text-primary-foreground size-12" />
                )}
                <div className="bg-primary absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full">
                    <Plus className="stroke-primary-foreground size-4"></Plus>
                </div>
            </div>
            <input
                onChange={(event) => {
                    const file = event.target.files?.[0]
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
        classification: 'bronze' | 'silver' | 'gold'
        streakDays: number
        totalExamsPassed: number
        totalExamsAttempted: number
    }
}) {
    const [joinedAtFormatted] = useState(() =>
        new Date(profile.joinedAt).toLocaleDateString('ka-GE', {
            month: 'long',
            year: 'numeric',
        })
    )

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const prevUrlRef = useRef<string | null>(null)

    useEffect(() => {
        return () => {
            if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
        }
    }, [])

    const trpc = useTRPC()
    const uploadImage = useMutation(trpc.user.uploadImage.mutationOptions())

    const handleAvatarPick = async (file: File) => {
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
        const url = URL.createObjectURL(file)
        prevUrlRef.current = url
        setPreviewUrl(url)

        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
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
            <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
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
    <Card className="gap-0 py-4">
        <CardContent className="flex items-center gap-3 px-4">
            <div
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    iconBg ?? 'bg-muted'
                )}
            >
                <Icon
                    className={cn(
                        'size-4',
                        iconColor ?? 'text-muted-foreground'
                    )}
                />
            </div>
            <div className="min-w-0">
                <p className="text-lg leading-tight font-bold">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
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
        classification: 'bronze' | 'silver' | 'gold'
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
                    iconColor="text-orange-500 dark:text-orange-400"
                    iconBg="bg-orange-100 dark:bg-orange-900/30"
                />
                <StatCard
                    icon={Zap}
                    value={profile.totalXP}
                    label="XP სულ"
                    iconColor="text-yellow-500 dark:text-yellow-400"
                    iconBg="bg-yellow-100 dark:bg-yellow-900/30"
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
                            gold: 'ოქრო',
                            silver: 'ვერცხლი',
                            bronze: 'ბრინჯაო',
                        }[profile.classification]
                    }
                    label="საფეხური"
                    iconColor={
                        {
                            gold: 'text-yellow-600 dark:text-yellow-400',
                            silver: 'text-slate-500 dark:text-slate-300',
                            bronze: 'text-amber-700 dark:text-amber-500',
                        }[profile.classification]
                    }
                    iconBg={
                        {
                            gold: 'bg-yellow-100 dark:bg-yellow-900/30',
                            silver: 'bg-slate-100 dark:bg-slate-800/50',
                            bronze: 'bg-amber-100 dark:bg-amber-900/30',
                        }[profile.classification]
                    }
                />
                <StatCard
                    icon={Target}
                    value={profile.totalExamsPassed}
                    label="ჩაბარებული გამოცდები"
                    iconColor="text-emerald-500 dark:text-emerald-400"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
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
        classification: 'bronze' | 'silver' | 'gold'
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
