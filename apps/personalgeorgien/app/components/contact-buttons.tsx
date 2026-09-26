import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export function ContactButtons({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className
      )}
    >
      <Button asChild size="lg" className="h-12 w-full px-5 sm:w-fit">
        <a href="#vertrieb">Sales Kontaktieren</a>
      </Button>
      <Button
        asChild
        variant="secondary"
        size="lg"
        className="h-12 w-full px-5 sm:w-fit"
      >
        <a href="#vorteile">Ihre Vorteile</a>
      </Button>
    </div>
  )
}
