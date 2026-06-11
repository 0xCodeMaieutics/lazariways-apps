import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface BackLinkProps {
  href: string
  label: string
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
      <Link href={href}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  )
}
