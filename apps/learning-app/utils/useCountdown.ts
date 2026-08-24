import { useState, useEffect, useMemo } from 'react'

function computeRemaining(targetDate: Date): number {
    return Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000))
}

const SECOND_IN_HOUR = 60 * 60

export function useCountdown(targetDate: Date | null) {
    const [remainingSeconds, setRemainingSeconds] = useState(() =>
        targetDate ? computeRemaining(targetDate) : 0
    )

    useEffect(() => {
        if (!targetDate) return

        const interval = setInterval(() => {
            const next = computeRemaining(targetDate)
            setRemainingSeconds(next)
            if (next <= 0) clearInterval(interval)
        }, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    const { hours, minutes, seconds } = useMemo(() => {
        const h = Math.floor(remainingSeconds / SECOND_IN_HOUR)
        const m = Math.floor((remainingSeconds % SECOND_IN_HOUR) / 60)
        const s = remainingSeconds % 60
        return { hours: h, minutes: m, seconds: s }
    }, [remainingSeconds])

    return {
        remainingSeconds,
        hours,
        minutes,
        seconds,
        isComplete: remainingSeconds <= 0,
    }
}
