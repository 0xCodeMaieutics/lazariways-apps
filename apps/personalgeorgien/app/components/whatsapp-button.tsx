import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SITE } from "../../lib/site"
import { WhatsappIcon } from "./whatsapp-icon"

export function WhatsappButton({
  className,
  iconOnlyOnMobile = false,
}: {
  className?: string
  iconOnlyOnMobile?: boolean
}) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "h-12 bg-[#25D366] text-white hover:bg-[#20bd5a]",
        className
      )}
    >
      <a
        href={SITE.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Per WhatsApp kontaktieren"
      >
        <WhatsappIcon
          className={cn("size-4", iconOnlyOnMobile && "size-5 lg:size-4")}
        />
        <span className={cn(iconOnlyOnMobile && "sr-only lg:not-sr-only")}>
          WhatsApp
        </span>
      </a>
    </Button>
  )
}
