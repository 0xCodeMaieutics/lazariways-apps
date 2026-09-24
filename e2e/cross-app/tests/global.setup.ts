import { test as setup } from "@playwright/test"
import { promisify } from "util"
import { exec } from "child_process"
const execAsync = promisify(exec)
import "dotenv/config"

setup("create new database", async ({}) => {
  console.log("creating new database...", process.env.DATABASE_URL)
  await execAsync("pnpm --filter @workspace/database exec prisma migrate")
  await execAsync("pnpm --filter @workspace/database exec prisma generate")
  await execAsync("pnpm --filter @workspace/database exec prisma db seed")
})
