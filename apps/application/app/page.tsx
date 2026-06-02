import { Button } from '@workspace/ui/components/button'
import { prisma } from '@workspace/database/client'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const applications = await prisma.application.findMany({})

    return (
        <div className="flex min-h-svh p-6">
            <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                <div>
                    <Button className="mt-2">Button</Button>
                </div>
                <div className="text-muted-foreground font-mono text-xs">
                    (Press <kbd>d</kbd> to toggle dark mode)
                </div>
            </div>
        </div>
    )
}
