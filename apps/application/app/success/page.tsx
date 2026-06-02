import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'განაცხადი გაგზავნილია',
    description: 'თქვენი განაცხადი წარმატებით გაიგზავნა.',
}

export default function SuccessPage() {
    return (
        <main className="flex min-h-full flex-1 items-center justify-center p-6">
            <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
                <div className="bg-primary/10 text-primary mb-6 flex size-16 items-center justify-center rounded-full">
                    <CheckCircle2 className="size-9" aria-hidden />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    განაცხადი წარმატებით გაიგზავნა
                </h1>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    თქვენი განაცხადი მივიღეთ. განხილვის შემდეგ დაგიკავშირდებით.
                </p>
            </div>
        </main>
    )
}
