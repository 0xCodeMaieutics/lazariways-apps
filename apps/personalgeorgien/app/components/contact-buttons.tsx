import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SITE } from "../../lib/site"
import { MailIcon } from "./mail-icon"
import { PhoneIcon } from "./phone-icon"
import { WhatsappButton } from "./whatsapp-button"

export function ContactButtons({
  className,
  variant = "default",
  iconOnlyOnMobile = false,
}: {
  className?: string
  variant?: "default" | "on-primary"
  iconOnlyOnMobile?: boolean
}) {
  const outlineClassName =
    variant === "on-primary"
      ? "h-12 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
      : "h-12 text-primary"

  const widthClassName = iconOnlyOnMobile
    ? "flex-1 lg:flex-none lg:w-fit"
    : "w-full lg:w-fit"

  return (
    <div
      className={cn(
        "flex gap-2",
        iconOnlyOnMobile
          ? "flex-row lg:flex-row lg:flex-wrap lg:items-center"
          : "flex-col lg:flex-row lg:flex-wrap lg:items-center",
        className
      )}
    >
      <WhatsappButton
        iconOnlyOnMobile={iconOnlyOnMobile}
        className={widthClassName}
      />
      <Button
        asChild
        variant="outline"
        size="lg"
        className={cn(outlineClassName, widthClassName)}
      >
        <a
          href={`mailto:${SITE.email}`}
          aria-label={`E-Mail an ${SITE.email}`}
        >
          {iconOnlyOnMobile ? (
            <MailIcon className="size-5 lg:hidden" />
          ) : null}
          <span className={cn(iconOnlyOnMobile && "sr-only lg:not-sr-only")}>
            {SITE.email}
          </span>
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className={cn(outlineClassName, widthClassName)}
      >
        <a href={SITE.phoneUrl} aria-label={`Anrufen: ${SITE.phone}`}>
          {iconOnlyOnMobile ? (
            <PhoneIcon className="size-5 lg:hidden" />
          ) : null}
          <span className={cn(iconOnlyOnMobile && "sr-only lg:not-sr-only")}>
            {SITE.phone}
          </span>
        </a>
      </Button>
    </div>
  )
}
