import * as Sentry from '@sentry/nextjs'

type LogAttributes = Record<string, unknown>

export const debug = (message: string, attributes?: Record<string, unknown>) => {
    Sentry.logger.debug(message, attributes)
}

export const info = (message: string, attributes?: LogAttributes) => {
    Sentry.logger.info(message, attributes)
}

export const warn = (message: string, attributes?: LogAttributes) => {
    Sentry.logger.warn(message, attributes)
}

export const error = (message: string, attributes?: LogAttributes) => {
    Sentry.logger.error(message, attributes)
}
export const logger = {
    debug,
    info,
    warn,
    error,
}
