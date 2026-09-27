import esbuild from "esbuild"
import { readFile } from "node:fs/promises"

// Prisma's generated client reads import.meta.url. esbuild's default CJS
// bundle leaves that empty, so fileURLToPath throws on startup.
const prismaImportMeta = {
  name: "prisma-import-meta",
  setup(build) {
    build.onLoad({ filter: /[\\/]prisma[\\/]generated[\\/]client\.ts$/ }, async (args) => {
      const source = await readFile(args.path, "utf8")
      return {
        contents: source.replace(
          "globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))",
          "globalThis['__dirname'] = __dirname",
        ),
        loader: "ts",
      }
    })
  },
}

const watch = process.argv.includes("--watch")

const ctx = await esbuild.context({
  entryPoints: ["src/app.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outdir: "out",
  plugins: [prismaImportMeta],
})

if (watch) {
  await ctx.watch()
} else {
  await ctx.rebuild()
  await ctx.dispose()
}
