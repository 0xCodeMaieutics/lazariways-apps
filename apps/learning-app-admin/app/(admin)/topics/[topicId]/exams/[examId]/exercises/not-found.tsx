import Link from 'next/link'
import { FolderX } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="bg-muted mb-6 flex size-20 items-center justify-center rounded-full">
                <FolderX className="text-muted-foreground size-10" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
                Exam not found
            </h2>

            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                The exam you are looking for does not exist or has been removed.
            </p>

            <Button asChild className="mt-8" size="lg">
                <Link href="/topics">Back to programs</Link>
            </Button>
        </div>
    )
}
