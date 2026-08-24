import {
    LearningAppExerciseType,
    LearningAppTopicType,
    PrismaClient,
} from '../../../prisma/generated/client'
import { uploadFilePathToStorage } from '@workspace/file-upload/s3-client'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import topicsJson from './assets/dev/topics.json'

const SEED_AUDIO_FILES = [
    {
        filename: 'hallo-welt-1772436520376.m4a',
        key: 'learning-app-platform/audios/hallo-welt-1772436520376.m4a',
    },
]

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS_DEV_PATH = join(__dirname, 'assets', 'dev')
const PROGRAMS_PATH = join(ASSETS_DEV_PATH, 'programs')

async function uploadSeedAudios() {
    const bucket = process.env.S3_BUCKET_NAME
    if (bucket === undefined || bucket === '') {
        throw new Error(
            'S3_BUCKET_NAME is required to seed learning app audio files'
        )
    }

    for (const audio of SEED_AUDIO_FILES) {
        const filePath = join(__dirname, audio.filename)
        await uploadFilePathToStorage({
            filePath,
            bucket,
            fileKey: audio.key,
        })
        console.log(`Uploaded ${audio.filename} → ${audio.key}`)
    }
}

export const insertLearningData = async ({
    prisma,
    userId,
}: {
    prisma: PrismaClient
    userId: string
}) => {
    console.log('Uploading seed audio files to S3...')
    await uploadSeedAudios()
    console.log('Inserting programs...')

    let totalExams = 0
    let totalExercises = 0

    const programDirs = await readdir(PROGRAMS_PATH, { withFileTypes: true })
    const programFolderNames = programDirs
        .filter((d) => d.isDirectory() && d.name.startsWith('program-'))
        .map((d) => d.name)

    const topicIdByNumber = new Map<number, string>()

    let topicIndex = 0
    for (const topic of topicsJson) {
        const created = await prisma.learningAppTopic.create({
            data: {
                name: topic.name,
                type: topic.type as LearningAppTopicType,
                enabled: topic.enabled,
                order: topicIndex,
            },
        })
        topicIdByNumber.set(topicIndex, created.id)
        topicIndex++
    }

    for (const programFolderName of programFolderNames) {
        const programNumber = parseInt(
            programFolderName.replace('program-', '')
        )
        if (isNaN(programNumber)) continue

        const topicId = topicIdByNumber.get(programNumber)
        if (!topicId) {
            console.warn(
                `No program found for ${programFolderName} (number ${programNumber}), skipping`
            )
            continue
        }

        const programPath = join(PROGRAMS_PATH, programFolderName)
        const examsPath = join(programPath, 'exams.json')

        let examsJson: Array<{
            id: string
            title: string
            description: string
            category: string
            estimatedTimeInMinutes?: number
            minimumCorrectAnswerCount?: number
            minimumPassedCount?: number
            relativeExercisePath: string
            waitUntilPassAllowedInSeconds?: number
            userPassCount?: number
            userAttemptedCount: number
            unlocksExams?: string[]
        }>

        try {
            const content = await readFile(examsPath, 'utf-8')
            examsJson = JSON.parse(content) as typeof examsJson
        } catch {
            console.warn(
                `Could not read ${examsPath}, skipping program ${programNumber}`
            )
            continue
        }

        const examIds = []
        let currentExamIndex = 0
        for (const exam of examsJson) {
            const {
                userPassCount = 0,
                minimumPassedCount = 0,
                waitUntilPassAllowedInSeconds = 3,
            } = exam ?? {}
            const createdExam = await prisma.learningAppExam.create({
                data: {
                    id: exam.id,
                    topicId: topicId,
                    title: exam.title,
                    description: exam.description,
                    order: currentExamIndex,
                    enable: true,
                    estimatedTimeInMinutes: exam.estimatedTimeInMinutes ?? null,
                    minimumPassedCount: exam.minimumPassedCount ?? 1,
                    minimumCorrectAnswerCount: exam.minimumCorrectAnswerCount,
                    waitUntilPassAllowedInSeconds:
                        waitUntilPassAllowedInSeconds,
                },
            })

            examIds.push(createdExam.id)

            totalExams++

            const attemptedCount = exam.userAttemptedCount
            const passedCount = Math.min(userPassCount, attemptedCount)
            const failedCount = attemptedCount - passedCount
            const completions = Array.from(
                { length: attemptedCount },
                (_, i) => {
                    const hasPassed = i < passedCount
                    return {
                        userId,
                        examId: createdExam.id,
                        correctCount: hasPassed ? 3 : 1,
                        hasPassed,
                        passCounted: hasPassed,
                    }
                }
            )

            await prisma.learningAppUserExam.createMany({ data: completions })

            await prisma.learningAppUserExamAggregation.create({
                data: {
                    userId,
                    examId: createdExam.id,
                    attemptedCount,
                    passedCount,
                    failedCount,
                },
            })

            // if (userPassCount >= minimumPassedCount || currentExamIndex === 0)
            await prisma.learningAppUserUnlockedExam.create({
                data: {
                    userId,
                    examId: exam.id,
                },
            })

            const exercisePath = join(
                programPath,
                exam.relativeExercisePath.replace(/^\.\//, '')
            )

            let exercisesJson: Array<{
                type: string
                prompt?: string
                text?: string
                options: string[]
                correctOptionIndex: number[]
                allowsMultipleCorrectOptions?: boolean
                correctInputs: string[]
                audioUrl?: string
                slowAudioUrl?: string
            }>

            try {
                const content = await readFile(exercisePath, 'utf-8')
                exercisesJson = JSON.parse(content) as typeof exercisesJson
            } catch {
                console.warn(
                    `Could not read exercises from ${exercisePath}, skipping`
                )
                continue
            }

            let currentExerciseIndex = 0
            for (const exercise of exercisesJson) {
                await prisma.learningAppExercise.create({
                    data: {
                        type: exercise.type as LearningAppExerciseType,
                        prompt: exercise.prompt ?? null,
                        text: exercise.text ?? null,
                        options: exercise.options,
                        correctOptionIndex: exercise.correctOptionIndex,
                        allowsMultipleCorrectOptions:
                            exercise.allowsMultipleCorrectOptions ?? false,
                        correctInputs: exercise.correctInputs,
                        audioUrl: exercise.audioUrl ?? null,
                        slowAudioUrl: exercise.slowAudioUrl ?? null,
                        order: currentExerciseIndex,
                        examId: createdExam.id,
                    },
                })
                totalExercises++
                currentExerciseIndex++
            }
            currentExamIndex++
        }

        for (const exam of examsJson) {
            const promises = (exam.unlocksExams ?? []).map((unlockedId) =>
                prisma.learningAppExam.update({
                    where: { id: unlockedId },
                    data: { unlockedId: exam.id },
                })
            )
            await Promise.all([...promises])
        }
    }

    console.log(`Inserted ${totalExams} exams and ${totalExercises} exercises.`)
}
