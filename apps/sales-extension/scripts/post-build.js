import { copyFileSync, rmdirSync, rmSync } from "node:fs"
import { exec } from "child_process"
import { promisify } from "util"
const execAsync = promisify(exec)

void (async function () {
  copyFileSync("manifest.json", "build/manifest.json")
  await execAsync(
    "pnpm exec esbuild --bundle src/content.ts --outdir=dist --minify"
  )
  copyFileSync("dist/content.js", "build/content.js")
  rmSync("dist", { force: true, recursive: true })
})()
