import { test as teardown } from "@playwright/test"
import { promisify } from "util"
import { exec } from "child_process"
const execAsync = promisify(exec)
import "dotenv/config"

teardown("reset database", async ({}) => {
  console.log("reset database...", process.env.DATABASE_URL)

  await execAsync(
    "pnpm --filter @workspace/database exec prisma migrate reset --force"
  )
})
