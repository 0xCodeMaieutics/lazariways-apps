import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'

export default function EditExerciseNotFound() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <h1 className="text-2xl font-semibold">Exercise not found</h1>
            <p className="text-muted-foreground max-w-md">
                The exercise you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have permission to access it.
            </p>
            <Button asChild variant="outline">
                <Link href="/topics">Back to programs</Link>
            </Button>
        </div>
    )
}
