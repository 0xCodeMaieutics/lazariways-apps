import Link from 'next/link'
import { BookX } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="bg-muted mb-6 flex size-20 items-center justify-center rounded-full">
                <BookX className="text-muted-foreground size-10" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
                გამოცდა ვერ მოიძებნა
            </h2>

            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                გამოცდა, რომელსაც ეძებთ, არ არსებობს ან წაშლილია.
            </p>

            <Button asChild className="mt-8" size="lg">
                <Link href="/">გამოცდებზე დაბრუნება</Link>
            </Button>
        </div>
    )
}
