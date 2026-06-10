import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SITE } from "../../lib/site"
import { WhatsappButton } from "./whatsapp-button"

export function ContactButtons({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center",
        className
      )}
    >
      <Button
        asChild
        variant="outline"
        size="lg"
        className={"h-12 w-full text-primary lg:w-fit"}
      >
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className={"h-12 w-full text-primary lg:w-fit"}
      >
        <a href={SITE.phoneUrl}>{SITE.phone}</a>
      </Button>
      <WhatsappButton className="h-12 w-full lg:w-fit" />
    </div>
  )
}
