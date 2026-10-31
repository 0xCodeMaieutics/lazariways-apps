import { readFile } from "node:fs/promises"
import path from "node:path"

const FONT_FILES = [
  { name: "Manrope", weight: 400, file: "@fontsource/manrope/files/manrope-latin-400-normal.woff" },
  { name: "Manrope", weight: 700, file: "@fontsource/manrope/files/manrope-latin-700-normal.woff" },
  { name: "Manrope", weight: 800, file: "@fontsource/manrope/files/manrope-latin-800-normal.woff" },
  {
    name: "Noto Sans Georgian",
    weight: 400,
    file: "@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-400-normal.woff",
  },
  {
    name: "Noto Sans Georgian",
    weight: 700,
    file: "@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-700-normal.woff",
  },
  {
    name: "Noto Sans Georgian",
    weight: 800,
    file: "@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-800-normal.woff",
  },
] as const

export async function loadSocialPostFonts() {
  return Promise.all(
    FONT_FILES.map(async (font) => ({
      name: font.name,
      weight: font.weight,
      style: "normal" as const,
      data: await readFile(path.join(process.cwd(), "node_modules", font.file)),
    }))
  )
}
