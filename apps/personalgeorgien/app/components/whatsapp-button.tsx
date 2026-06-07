import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SITE } from "../../lib/site"
import { WhatsappIcon } from "./whatsapp-icon"

export function WhatsappButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "h-12 bg-[#25D366] text-white hover:bg-[#20bd5a]",
        className
      )}
    >
      <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
        <WhatsappIcon className="size-4" />
        WhatsApp
      </a>
    </Button>
  )
}
