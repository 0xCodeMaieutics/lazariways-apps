"use client"

import type { ExerciseMatchingPair, UserExamAggregation } from "@lazariways/database/browser"
import { type Exercise as ExerciseRow, ExerciseType } from "@lazariways/database/browser"
import { type Exam } from "@lazariways/database/browser"
import { Button } from "@lazariways/ui/components/button"
import { Input } from "@lazariways/ui/components/input"
import { useMutation } from "@tanstack/react-query"
import type { inferRouterInputs } from "@trpc/server"
import { Volume2, ChevronRight, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import type { ComponentProps, PropsWithChildren, ReactNode, RefObject } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react"

import { ProgressBar } from "@/components/ui/progress-bar"
import { useTRPC } from "@/lib/trpc/react"
import type { AppRouter } from "@/lib/trpc/router"
import { cn } from "@/lib/utils"
import { useExamLogic } from "@/utils/use-exam-logic"
import { useCountdown } from "@/utils/useCountdown"

function ExamTimer({ hasPassed, countdownTarget }: { hasPassed: boolean; countdownTarget: Date | null }) {
  const { isComplete } = useCountdown(countdownTarget)

  if (!hasPassed && isComplete && countdownTarget !== null) {
    return <span className="text-xxs text-emerald-400">ჩაგეთვლება</span>
  }

  return (
    !hasPassed &&
    !isComplete &&
    countdownTarget && (
      <span className={cn("text-xxs min-w-14 text-center font-semibold text-destructive")}>
        არ ჩაგეთვლება
      </span>
    )
  )
}

type Exercise = ExerciseRow & { matchingPairs: ExerciseMatchingPair[] }

type CompleteExamInput = inferRouterInputs<AppRouter>["exam"]["completeExam"]

type CompleteExamMutation = {
  mutate: (input: CompleteExamInput) => void
  isSuccess: boolean
}

const context = createContext<{
  correctCount: number
  increaseCorrectCount: () => void
  currentExerciseIndex: number
  increaseCurrentExerciseIndex: () => void
  completeExamMutation: CompleteExamMutation
  isChooseExercise: boolean | null
  isInputExercise: boolean | null
}>({
  correctCount: 0,
  increaseCorrectCount: () => {},
  currentExerciseIndex: 0,
  increaseCurrentExerciseIndex: () => {},
  completeExamMutation: {
    mutate: () => {},
    isSuccess: false,
  },
  isChooseExercise: null,
  isInputExercise: null,
})

export function Exam({
  exercises,
  userCompletions,
  exam,
}: {
  exercises: Exercise[]
  userCompletions: UserExamAggregation[]
  exam: Exam
}) {
  const { topicId } = useParams()
  const router = useRouter()
  const trpc = useTRPC()
  const completeExamMutation = useMutation(
    trpc.exam.completeExam.mutationOptions({
      onSuccess: (result) => {
        router.push(`/topics/${topicId}/exams/${exam.id}/completions/${result.completionId}`)
      },
    })
  )
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  if (exercises.length === 0) {
    return <div>სავარჯიშოები არ არის</div>
  }

  if (completeExamMutation.isSuccess) {
    return null
  }

  const currentExercise = exercises[currentExerciseIndex]
  if (currentExercise === undefined) {
    return <div>სავარჯიშოები არ არის</div>
  }

  const type = currentExercise.type

  const isChooseExercise = type === ExerciseType.CHOOSE_FROM_AUDIO || type === ExerciseType.CHOOSE_FROM_TEXT

  const isInputExercise =
    type === ExerciseType.INPUT_FROM_AUDIO ||
    type === ExerciseType.INPUT_FROM_TEXT ||
    type === ExerciseType.INPUT_SENTENCE_FROM_TEXT

  return (
    <context.Provider
      value={{
        correctCount,
        increaseCorrectCount: () => {
          setCorrectCount((c) => c + 1)
        },
        currentExerciseIndex,
        increaseCurrentExerciseIndex: () => {
          setCurrentExerciseIndex((oldIndex) => oldIndex + 1)
        },
        completeExamMutation,
        isInputExercise,
        isChooseExercise,
      }}
    >
      <ExamTraining userCompletions={userCompletions} exercises={exercises} exam={exam} />
    </context.Provider>
  )
}

function ExamTraining({
  exercises,
  exam,
  userCompletions,
}: {
  exercises: Exercise[]
  exam: Exam
  userCompletions: UserExamAggregation[]
}) {
  const {
    correctCount,
    increaseCorrectCount,
    currentExerciseIndex,
    increaseCurrentExerciseIndex,
    completeExamMutation,
    isChooseExercise,
    isInputExercise,
  } = useContext(context)

  const { examId } = useParams<{ examId: string }>()
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [isOptionRevealed, setIsOptionRevealed] = useState(false)
  const [isInputCorrect, setIsInputCorrect] = useState<boolean | null>(null)
  const [input, setInput] = useState("")
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const playAudio = () => {
    if (audioRef.current === null) return
    audioRef.current.currentTime = 0
    audioRef.current.play()
  }

  const isLastExercise = currentExerciseIndex >= exercises.length - 1

  const onNextExercise = () => {
    if (audioRef.current && audioRef.current.paused === false) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (isAudioPlaying) setIsAudioPlaying(false)
    if (!isLastExercise) {
      increaseCurrentExerciseIndex()
    }
  }

  const currentExercise = exercises[currentExerciseIndex]

  const userExamAggregation = userCompletions.find((userExam) => userExam.examId === exam.id) ?? null

  const { countdownTarget, hasExamPassed } = useExamLogic({
    exam,
    userExamAggregation,
  })

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const continueButtonRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const setOptionRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      optionRefs.current[index] = el
    },
    []
  )

  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (currentExercise === undefined) return
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key) === false) return

    if (
      (
        [
          ExerciseType.CHOOSE_FROM_AUDIO,
          ExerciseType.CHOOSE_FROM_TEXT,
          ExerciseType.CHOOSE_MATCHING_PATTERNS,
        ] as ExerciseType[]
      ).includes(currentExercise.type)
    ) {
      const optionElements = (optionRefs.current.filter(Boolean) as HTMLButtonElement[]).filter(
        (element) => !element.disabled
      )

      if (optionElements.length !== 0) {
        if (["ArrowDown", "ArrowUp"].includes(e.key)) {
          const currentOptionElementIndex = optionElements.findIndex((el) => el === document.activeElement)
          let nextIndex: number | null = null
          if (e.key === "ArrowDown") {
            nextIndex =
              currentOptionElementIndex < optionElements.length - 1 ? currentOptionElementIndex + 1 : 0
          } else if (e.key === "ArrowUp") {
            nextIndex =
              currentOptionElementIndex > 0 ? currentOptionElementIndex - 1 : optionElements.length - 1
          }
          if (nextIndex !== null && optionElements[nextIndex] !== document.activeElement)
            optionElements[nextIndex]?.focus()
        } else if (e.key === "Escape")
          optionElements.find((optionElement) => optionElement === document.activeElement)?.blur()
      }

      if (continueButtonRef.current?.disabled === false && e.key === "Enter")
        continueButtonRef.current?.click()
    } else if (
      (
        [
          ExerciseType.INPUT_FROM_AUDIO,
          ExerciseType.INPUT_FROM_TEXT,
          ExerciseType.INPUT_SENTENCE_FROM_TEXT,
        ] as ExerciseType[]
      ).includes(currentExercise.type)
    ) {
      if (continueButtonRef.current?.disabled === false && e.key === "Enter")
        continueButtonRef.current?.click()
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") inputRef.current?.focus()
      else if (inputRef.current === document.activeElement && e.key === "Escape") inputRef.current?.blur()
    }
  })

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (currentExercise === undefined) {
    return <div>სავარჯიშოები არ არის</div>
  }

  const type = currentExercise.type
  const correctAnswerIndex = currentExercise.correctOptionIndex[0]
  const isOptionCorrect = selectedOptionIndex === correctAnswerIndex

  const exerciseHeader = (
    <>
      <div className="flex items-center gap-3">
        <ProgressBar value={currentExerciseIndex} max={exercises.length - 1} className="flex-1" />
        <ExamTimer countdownTarget={countdownTarget} hasPassed={hasExamPassed} />
        <Button asChild variant={"ghost"} size={"icon"}>
          <Link href={`/topics/${exam.topicId}/exams`}>
            <X className="size-6" />
          </Link>
        </Button>
      </div>
      <span className="text-2xl font-medium">{currentExercise.prompt}</span>
    </>
  )

  if (type === ExerciseType.CHOOSE_MATCHING_PATTERNS) {
    return (
      <MatchingExercise
        key={currentExercise.id}
        exerciseId={currentExercise.id}
        pairs={currentExercise.matchingPairs}
        header={exerciseHeader}
        isLastExercise={isLastExercise}
        continueButtonRef={continueButtonRef}
        onContinue={(isCorrect) => {
          if (isLastExercise && examId) {
            completeExamMutation.mutate({
              examId,
              correctCount: correctCount + (isCorrect ? 1 : 0),
            })
          }
          if (isCorrect) increaseCorrectCount()
          onNextExercise()
        }}
      />
    )
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-1 flex-col gap-4 px-4 sm:px-6 lg:px-8">
        {exerciseHeader}
        <div className="flex-1 space-y-16">
          {(type === ExerciseType.CHOOSE_FROM_AUDIO || type === ExerciseType.INPUT_FROM_AUDIO) && (
            <>
              {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- captions would reveal the answer to the listening exercise */}
              <audio
                ref={audioRef}
                src={currentExercise.audioUrl ?? undefined}
                preload="auto"
                onPlay={() => setIsAudioPlaying(true)}
                onEnded={() => setIsAudioPlaying(false)}
                onPause={() => setIsAudioPlaying(false)}
                onError={() => {
                  // report the error using a tool I need to think about.
                }}
                className="p-0."
              />
              <button
                onClick={playAudio}
                disabled={isAudioPlaying || currentExercise.audioUrl === undefined}
                className={cn(
                  "group mx-auto flex size-24 items-center justify-center rounded-2xl bg-gray-600 transition-transform",
                  isAudioPlaying && "opacity-70"
                )}
              >
                <span
                  className={cn(
                    "flex size-24 -translate-y-1.5 items-center justify-center rounded-2xl bg-primary",
                    {
                      "group-active:-translate-y-0.5": !isAudioPlaying,
                    }
                  )}
                >
                  <Volume2 className="size-12 text-primary-foreground" />
                </span>
              </button>
            </>
          )}
          {(type === ExerciseType.CHOOSE_FROM_TEXT ||
            type === ExerciseType.INPUT_FROM_TEXT ||
            type === ExerciseType.INPUT_SENTENCE_FROM_TEXT) && (
            <p className="text-center text-4xl">{currentExercise.text}</p>
          )}
          <div className="flex w-full flex-col gap-4">
            {isChooseExercise &&
              currentExercise.options.map((option, index) => (
                <button
                  ref={setOptionRef(index)}
                  onClick={() => setSelectedOptionIndex(index)}
                  disabled={isOptionRevealed}
                  key={index}
                  className={cn(
                    "h-12 w-full rounded-2xl border-2 bg-card py-2 font-medium",
                    isOptionRevealed
                      ? {
                          "border-green-300 bg-green-300/20 text-green-300":
                            selectedOptionIndex === index && isOptionCorrect,
                          "border-red-300 bg-red-300/20 text-red-300":
                            selectedOptionIndex === index && !isOptionCorrect,
                          "opacity-70": selectedOptionIndex !== index && selectedOptionIndex !== null,
                        }
                      : {
                          "border-primary bg-primary/10": selectedOptionIndex === index,
                        }
                  )}
                >
                  {option}
                </button>
              ))}

            {isInputExercise && (
              <Input
                ref={inputRef}
                onChange={(e) => {
                  setInput(e.target.value)
                }}
                disabled={isInputCorrect !== null}
                value={input}
                placeholder="აკრიფეთ რას გესმით..."
                className="h-14"
              />
            )}
          </div>
        </div>
      </div>

      {isChooseExercise && (
        <ExerciseFeedback
          buttonProps={{
            ref: continueButtonRef,
            disabled: selectedOptionIndex === null && !isOptionRevealed,
          }}
          isAnswered={isOptionRevealed}
          isCorrect={isOptionCorrect}
          onContinue={() => {
            if (!isOptionRevealed) {
              setIsOptionRevealed(true)
              return
            }
            if (isLastExercise && examId) {
              const finalCount = correctCount + (isOptionCorrect ? 1 : 0)
              completeExamMutation.mutate({
                examId,
                correctCount: finalCount,
              })
            }
            if (isOptionCorrect) increaseCorrectCount()
            setSelectedOptionIndex(null)
            setIsOptionRevealed(false)
            onNextExercise()
          }}
        >
          {isOptionRevealed ? (
            <div className="flex items-center gap-2.5">
              {isLastExercise ? "ნახე შედეგები" : "გაგრძელება"}
              {isLastExercise && <ChevronRight className="animate-bounce-left" />}
            </div>
          ) : (
            "შემოწმება"
          )}
        </ExerciseFeedback>
      )}
      {isInputExercise && (
        <ExerciseFeedback
          buttonProps={{
            ref: continueButtonRef,
            disabled: input.length <= 0,
          }}
          isAnswered={isInputCorrect !== null}
          isCorrect={isInputCorrect ?? false}
          onContinue={() => {
            if (isInputCorrect === null) {
              const isAnswerCorrect = currentExercise.correctInputs.includes(input)
              setIsInputCorrect(isAnswerCorrect)
              if (isAnswerCorrect) increaseCorrectCount()
            } else {
              if (isLastExercise && examId) {
                completeExamMutation.mutate({
                  examId,
                  correctCount,
                })
              }
              setInput("")
              setIsInputCorrect(null)
              onNextExercise()
            }
          }}
        >
          {isInputCorrect !== null ? "გაგრძელება" : "შემოწმება"}
        </ExerciseFeedback>
      )}
    </div>
  )
}

const MISMATCH_FLASH_IN_MS = 600

function hashText(text: string) {
  let hash = 2166136261
  for (const character of text) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// Seeded instead of random so the server-rendered and hydrated orders match.
function shuffleBySeed<Item extends { id: string }>(items: Item[], seed: string) {
  return [...items].sort(
    (first, second) => hashText(`${seed}:${first.id}`) - hashText(`${seed}:${second.id}`)
  )
}

function MatchingExercise({
  exerciseId,
  pairs,
  header,
  isLastExercise,
  continueButtonRef,
  onContinue,
}: {
  exerciseId: string
  pairs: ExerciseMatchingPair[]
  header: ReactNode
  isLastExercise: boolean
  continueButtonRef: RefObject<HTMLButtonElement | null>
  onContinue: (isCorrect: boolean) => void
}) {
  const terms = useMemo(() => shuffleBySeed(pairs, `${exerciseId}:terms`), [pairs, exerciseId])
  const meanings = useMemo(() => {
    const shuffledMeanings = shuffleBySeed(pairs, `${exerciseId}:meanings`)
    const isAlignedWithTerms = shuffledMeanings.every((pair, index) => pair.id === terms[index]?.id)
    return isAlignedWithTerms ? shuffledMeanings.reverse() : shuffledMeanings
  }, [pairs, exerciseId, terms])

  const [selectedTermId, setSelectedTermId] = useState<string | null>(null)
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null)
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([])
  const [mismatch, setMismatch] = useState<{ termId: string; meaningId: string } | null>(null)
  const [hasMistake, setHasMistake] = useState(false)

  const isComplete = pairs.length > 0 && matchedPairIds.length === pairs.length

  const tryMatch = (termId: string, meaningId: string) => {
    setSelectedTermId(null)
    setSelectedMeaningId(null)
    if (termId === meaningId) {
      setMatchedPairIds((pairIds) => [...pairIds, termId])
      return
    }
    setHasMistake(true)
    setMismatch({ termId, meaningId })
    setTimeout(() => setMismatch(null), MISMATCH_FLASH_IN_MS)
  }

  const selectTerm = (termId: string) => {
    if (selectedMeaningId !== null) {
      tryMatch(termId, selectedMeaningId)
      return
    }
    setSelectedTermId((currentTermId) => (currentTermId === termId ? null : termId))
  }

  const selectMeaning = (meaningId: string) => {
    if (selectedTermId !== null) {
      tryMatch(selectedTermId, meaningId)
      return
    }
    setSelectedMeaningId((currentMeaningId) => (currentMeaningId === meaningId ? null : meaningId))
  }

  const pairButtonClassName = ({
    pairId,
    isSelected,
    isMismatched,
  }: {
    pairId: string
    isSelected: boolean
    isMismatched: boolean
  }) =>
    cn("min-h-12 w-full rounded-2xl border-2 bg-card px-2 py-2 text-sm font-medium break-words", {
      "border-primary bg-primary/10": isSelected,
      "border-red-300 bg-red-300/20 text-red-300": isMismatched,
      "border-green-300 bg-green-300/20 text-green-300 opacity-70": matchedPairIds.includes(pairId),
    })

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-1 flex-col gap-4 px-4 sm:px-6 lg:px-8">
        {header}
        <div className="grid flex-1 grid-cols-2 content-start gap-3">
          <div className="flex flex-col gap-3">
            {terms.map((pair) => (
              <button
                key={pair.id}
                onClick={() => selectTerm(pair.id)}
                disabled={matchedPairIds.includes(pair.id) || mismatch !== null}
                className={pairButtonClassName({
                  pairId: pair.id,
                  isSelected: selectedTermId === pair.id,
                  isMismatched: mismatch?.termId === pair.id,
                })}
              >
                {pair.term}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {meanings.map((pair) => (
              <button
                key={pair.id}
                onClick={() => selectMeaning(pair.id)}
                disabled={matchedPairIds.includes(pair.id) || mismatch !== null}
                className={pairButtonClassName({
                  pairId: pair.id,
                  isSelected: selectedMeaningId === pair.id,
                  isMismatched: mismatch?.meaningId === pair.id,
                })}
              >
                {pair.meaning}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ExerciseFeedback
        buttonProps={{ ref: continueButtonRef, disabled: !isComplete }}
        isAnswered={isComplete}
        isCorrect={!hasMistake}
        onContinue={() => onContinue(!hasMistake)}
      >
        <div className="flex items-center gap-2.5">
          {isLastExercise ? "ნახე შედეგები" : "გაგრძელება"}
          {isLastExercise && <ChevronRight className="animate-bounce-left" />}
        </div>
      </ExerciseFeedback>
    </div>
  )
}

function ExerciseFeedback({
  isAnswered,
  isCorrect = false,
  onContinue,
  buttonProps,
  children,
}: PropsWithChildren<{
  isAnswered: boolean
  isCorrect?: boolean
  onContinue: () => void
  buttonProps: ComponentProps<"button">
}>) {
  return (
    <div
      className={cn("space-y-8 bg-background p-4", {
        "bg-green-200": isAnswered && isCorrect,
        "bg-red-200": isAnswered && isCorrect === false,
      })}
    >
      <p className="text-lg font-bold text-foreground dark:text-black">
        {isAnswered && isCorrect && "სწორია"}
        {isAnswered && !isCorrect && "არასწორია"}
      </p>
      <ContinueButton onClick={onContinue} {...buttonProps}>
        {children}
      </ContinueButton>
    </div>
  )
}

function ContinueButton({
  prefix,
  children,
  className,
  ...props
}: PropsWithChildren<
  ComponentProps<"button"> & {
    prefix?: ReactNode
  }
>) {
  return (
    <button
      className={cn("group h-12 w-full rounded-2xl bg-gray-600", {
        "opacity-50": props.disabled,
      })}
      {...props}
    >
      <span
        className={cn(
          "flex h-12 w-full -translate-y-1.5 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground outline-offset-4",
          {
            "group-active:-translate-y-0.5": !props.disabled,
          },
          className
        )}
      >
        {prefix}
        {children}
      </span>
    </button>
  )
}
