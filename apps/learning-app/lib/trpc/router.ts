import { examRouter } from "./routes/exam"
import { loginRouter } from "./routes/login"
import { userRouter } from "./routes/user"
import { router } from "./server"

export const appRouter = router({
  login: loginRouter,
  exam: examRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
