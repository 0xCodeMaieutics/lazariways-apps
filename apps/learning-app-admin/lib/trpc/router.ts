import { router } from './server'
import { loginRouter } from './routes/login'
import { examRouter } from './routes/exam'
import { adminRouter } from './routes/admin'
import { userRouter } from './routes/user'

export const appRouter = router({
    login: loginRouter,
    exam: examRouter,
    admin: adminRouter,
    user: userRouter,
})

export type AppRouter = typeof appRouter
