import {
    type LearningAppExam,
    type LearningAppUserExamAggregation,
} from '@workspace/database/browser'
import { useState } from 'react'

export const useExamLogic = ({
    exam,
    userExamAggregation,
}: {
    exam: LearningAppExam
    userExamAggregation: LearningAppUserExamAggregation | null
}) => {
    const [now] = useState(() => Date.now())
    const passedCount = userExamAggregation?.passedCount ?? 0
    const hasPassed = passedCount >= exam.minimumPassedCount

    const lastPassedMillisecondns =
        userExamAggregation?.lastPassedAt === undefined ||
        userExamAggregation?.lastPassedAt === null
            ? null
            : new Date(userExamAggregation.lastPassedAt).getTime()

    const waitUntilPassedAllowedAt =
        hasPassed === false && lastPassedMillisecondns !== null
            ? new Date(
                  lastPassedMillisecondns +
                      exam.waitUntilPassAllowedInSeconds * 1000
              )
            : null

    return {
        hasExamPassed: hasPassed,
        examPassedCount: passedCount,
        countdownTarget:
            waitUntilPassedAllowedAt === undefined ||
            waitUntilPassedAllowedAt === null
                ? null
                : waitUntilPassedAllowedAt.getTime() > now
                  ? waitUntilPassedAllowedAt
                  : null,
    }
}
