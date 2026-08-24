export function formatSecondsAsHoursMinutes(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function parseHoursMinutesToSeconds(value: string): number {
    const [hoursStr = '0', minutesStr = '0'] = value.split(':')
    const hours = parseInt(hoursStr, 10)
    const minutes = parseInt(minutesStr, 10)
    return hours * 3600 + minutes * 60
}
