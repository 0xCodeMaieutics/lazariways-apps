import Image from "next/image"
import { Button } from "@workspace/ui/components/button"

import { SALES_CONTACT } from "../../lib/site"
import { MailIcon } from "./mail-icon"
import { PhoneIcon } from "./phone-icon"
import { WhatsappButton } from "./whatsapp-button"

export function SalesContact() {
  return (
    <section
      id="vertrieb"
      className="border-t border-border px-6 py-16 lg:px-16 lg:py-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row lg:gap-10">
        <div
          style={{
            width: 184,
            height: 250,
          }}
          className="relative mx-auto h-[320px] w-[236px] sm:h-[250px] sm:w-[184px]"
        >
          <Image
            src={SALES_CONTACT.image}
            alt={`Portrait von ${SALES_CONTACT.name}`}
            fill
            loading="eager"
            className="mx-auto max-w-[200px] rounded-lg border border-border object-cover lg:max-w-none"
            sizes="(max-width: 1024px) 320px, 288px"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">
            {SALES_CONTACT.role}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Vertrieb kontaktieren
          </h2>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {SALES_CONTACT.name}
          </p>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {SALES_CONTACT.description}
          </p>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <WhatsappButton
              href={SALES_CONTACT.whatsappUrl}
              className="w-full sm:w-fit"
            />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full text-primary sm:w-fit"
            >
              <a
                href={`mailto:${SALES_CONTACT.email}`}
                aria-label={`E-Mail an ${SALES_CONTACT.email}`}
              >
                <MailIcon className="size-4" />
                {SALES_CONTACT.email}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full text-primary sm:w-fit"
            >
              <a
                href={SALES_CONTACT.phoneUrl}
                aria-label={`Anrufen: ${SALES_CONTACT.phone}`}
              >
                <PhoneIcon className="size-4" />
                {SALES_CONTACT.phone}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
