import { adminRouter } from "./routes/admin"
import { examRouter } from "./routes/exam"
import { loginRouter } from "./routes/login"
import { userRouter } from "./routes/user"
import { router } from "./server"

export const appRouter = router({
  login: loginRouter,
  exam: examRouter,
  admin: adminRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
