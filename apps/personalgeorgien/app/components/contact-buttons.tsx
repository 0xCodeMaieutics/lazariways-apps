import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SITE } from "../../lib/site"
import { WhatsappButton } from "./whatsapp-button"

export function ContactButtons({
  className,
  variant = "default",
}: {
  className?: string
  variant?: "default" | "on-primary"
}) {
  const outlineClassName =
    variant === "on-primary"
      ? "h-12 w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 lg:w-fit"
      : "h-12 w-full lg:w-fit"

  return (
    <div
      className={cn(
        "flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center",
        className
      )}
    >
      <WhatsappButton className="h-12 w-full lg:w-fit" />
      <Button asChild variant="outline" size="lg" className={outlineClassName}>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </Button>
      <Button asChild variant="outline" size="lg" className={outlineClassName}>
        <a href={SITE.phoneUrl}>{SITE.phone}</a>
      </Button>
    </div>
  )
}
