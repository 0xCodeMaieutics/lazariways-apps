const UMLAUT_SPELLINGS: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" }

function normalizeAnswer(answer: string) {
  return answer
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*[.!?]+$/, "")
    .toLowerCase()
    .replace(/[äöüß]/g, (letter) => UMLAUT_SPELLINGS[letter] ?? letter)
}

export function isAnswerAccepted(input: string, correctInputs: string[]) {
  const normalizedInput = normalizeAnswer(input)
  return correctInputs.some((correctInput) => normalizeAnswer(correctInput) === normalizedInput)
}
