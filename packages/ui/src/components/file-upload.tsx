import React, { useRef } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Upload, X, File, FileImage } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

export interface FileUploadProps {
    accept?: string
    multiple?: boolean
    value?: File | File[] | null
    onChange?: (files: File | File[] | null) => void
    placeholder?: string
    className?: string
    error?: string
    required?: boolean
    id?: string
}

const FileUpload = ({
    accept,
    multiple = false,
    value,
    onChange,
    placeholder = 'აირჩიეთ ფაილი',
    className,
    error,
    required,
    id,
    ...props
}: FileUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = inputRef

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        if (multiple) {
            const fileArray = Array.from(files)
            onChange?.(fileArray.length > 0 ? fileArray : null)
        } else {
            onChange?.(files[0] || null)
        }
    }

    const handleRemoveFile = (indexToRemove?: number) => {
        if (multiple && Array.isArray(value)) {
            const newFiles = value.filter((_, index) => index !== indexToRemove)
            onChange?.(newFiles.length > 0 ? newFiles : null)
        } else {
            onChange?.(null)
            if (
                fileInputRef &&
                'current' in fileInputRef &&
                fileInputRef.current
            ) {
                fileInputRef.current.value = ''
            }
        }
    }

    const openFileDialog = () => {
        if (fileInputRef && 'current' in fileInputRef && fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        if (extension === 'pdf') {
            return <File className="h-4 w-4" />
        } else if (
            ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
        ) {
            return <FileImage className="h-4 w-4" />
        }
        return <File className="h-4 w-4" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 ბაიტი'
        const k = 1024
        const sizes = ['ბაიტი', 'კბ', 'მბ', 'გბ']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const renderFileList = () => {
        if (!value) return null

        const files = Array.isArray(value) ? value : [value]

        return (
            <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                    <div
                        key={`${file.name}-${index}`}
                        className="bg-muted flex items-center justify-between rounded-md p-2"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            {getFileIcon(file.name)}
                            <span className="truncate text-sm">
                                {file.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                ({formatFileSize(file.size)})
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                handleRemoveFile(multiple ? index : undefined)
                            }
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={cn('space-y-2', className)}>
            <input
                type="file"
                ref={fileInputRef}
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
                id={id}
                aria-required={required}
                {...props}
            />

            {(value === undefined || value === null) && (
                <div
                    className={cn(
                        'border-input hover:border-primary/50 cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors',
                        error && 'border-destructive'
                    )}
                    role="button"
                    onClick={openFileDialog}
                >
                    <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground mb-2 text-sm">
                        {placeholder}
                    </p>
                </div>
            )}
            {renderFileList()}
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    )
}

FileUpload.displayName = 'FileUpload'

export { FileUpload }
