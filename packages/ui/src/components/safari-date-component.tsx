import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { Calendar } from 'lucide-react'
import type {
    ControllerRenderProps,
    FieldPath,
    FieldValues,
} from 'react-hook-form'

export function SafariInputDate<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    field,
    id,
    'aria-invalid': ariaInvalid,
    placeholder,
}: {
    field: ControllerRenderProps<TFieldValues, TName>
    id: string
    'aria-invalid'?: boolean
    placeholder?: string
}) {
    return (
        <div
            className={cn('relative w-full overflow-hidden rounded-md border')}
        >
            <Input
                {...field}
                id={id}
                type="date"
                aria-invalid={ariaInvalid}
                className={cn(
                    'box-border h-7 border-none pl-3 text-sm transition-colors'
                )}
            />
            <Calendar className="absolute top-1/2 right-3 size-4 -translate-y-1/2 md:hidden" />
            {field.value === '' && (
                <span className="text-muted-foreground absolute top-1/2 left-2 -translate-y-1/2 md:hidden">
                    {placeholder ?? 'ამოირჩიე თარიღი'}
                </span>
            )}
        </div>
    )
}
