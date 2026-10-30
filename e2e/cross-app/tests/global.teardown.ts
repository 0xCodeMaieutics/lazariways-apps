import { exec } from "child_process"
import { promisify } from "util"

import { test as teardown } from "@playwright/test"
const execAsync = promisify(exec)
import "dotenv/config"

teardown("reset database", async () => {
  console.log("reset database...", process.env.DATABASE_URL)

  await execAsync("pnpm --filter @workspace/database exec prisma migrate reset --force")
})
