import type { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'

export const metadata: Metadata = {
    title: 'განაცხადი გაგზავნილია',
    description: 'თქვენი განაცხადი წარმატებით გაიგზავნა.',
}

const WHATSAPP_NUMBER = '+4917632983291'
const WHATSAPP_MESSAGE =
    'გამარჯობა! Lazari Ways-ის ვებსაიტიდან განაცხადი წარმატებით გავაგზავნე. ❤️'
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export default function SuccessPage() {
    return (
        <main className="flex min-h-full flex-1 items-center justify-center p-6">
            <div className="mx-auto flex w-full flex-col items-center gap-4 text-center">
                <Image
                    src="/consultant.webp"
                    alt="Lazari Ways კონსულტანტი"
                    width={1080}
                    height={1080}
                    priority
                    className="ring-primary/10 mt-8 size-40 rounded-full object-cover ring-4"
                />
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        განაცხადი წარმატებით გაიგზავნა
                    </h1>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                        თქვენი განაცხადი მივიღეთ. განხილვის შემდეგ
                        დაგიკავშირდებით.
                    </p>
                </div>
                <Button asChild size={'lg'}>
                    <a
                        href={WHATSAPP_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        შემატყობინეთ <b>Whatsapp-ზე</b>
                    </a>
                </Button>
            </div>
        </main>
    )
}
