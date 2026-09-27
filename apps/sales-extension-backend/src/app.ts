import "dotenv/config"
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express"
import prisma from "@workspace/database/client"
import { env } from "./env"
import {
  createAndSendVerificationCode,
  verifyCodeAndCreateSession,
} from "@workspace/verification"
import { extractCompanyFromHtml, type ExtractedCompany } from "./ai"

const app: Express = express()
app.use(express.json())

type AbstractInfoBody = {
  input: string
}

type AbstractInfoResponse =
  | {
      result: ExtractedCompany
      success: true
    }
  | {
      success: false
      error: string
    }

type LoginRequestCodeResponse =
  | {
      success: false
      error: string
    }
  | {
      success: true
    }

type LoginCodeVerificationBody = {
  code?: string
}

type LoginCodeVerificationResponse =
  | {
      success: false
      error: string
    }
  | {
      success: true
      token: string
    }

app.post(
  "/login/request-code",
  async (req: Request, res: Response<LoginRequestCodeResponse>) => {
    try {
      const result = await createAndSendVerificationCode({
        chatId: env.TELEGRAM_CHAT_ID,
        token: env.TELEGRAM_BOT_TOKEN,
      })
      if (result.success === false)
        return res
          .json({
            error: "Bad request",
            success: false,
          })
          .sendStatus(400)
      return res.send({
        success: true,
      })
    } catch (error) {
      return res
        .send({
          error: "Internal server error",
          success: false,
        })
        .sendStatus(500)
    }
  }
)

app.post(
  "/login/verfication",
  async (
    req: Request<{}, LoginCodeVerificationResponse, LoginCodeVerificationBody>,
    res: Response<LoginCodeVerificationResponse>
  ) => {
    const { code = null } = req.body ?? {}
    console.log(req.body)
    if (code === null)
      return res
        .json({
          error: "Bad Request",
          success: false,
        })
        .sendStatus(400)
    try {
      const token = await verifyCodeAndCreateSession(code)
      if (token === null)
        return res
          .json({
            error: "Bad Request",
            success: false,
          })
          .sendStatus(400)
      return res.send({
        success: true,
        token: token,
      })
    } catch (error) {
      return res
        .send({
          error: "Internal server error",
          success: false,
        })
        .sendStatus(500)
    }
  }
)

app.post(
  "/abstract-info",
  async (
    req: Request<{}, AbstractInfoResponse, AbstractInfoBody>,
    res: Response<AbstractInfoResponse>,
    next: NextFunction
  ) => {
    const authorization = req.headers.authorization ?? null
    if (authorization === null)
      return res.json({ success: false, error: "401" }).sendStatus(401)
    const [, token] = authorization.split(" ")
    if (token === undefined || token.length === 0)
      return res.json({ success: false, error: "401" }).sendStatus(401)

    try {
      const session = await prisma.adminSession.findUnique({
        where: { token },
      })
      if (session === null)
        return res.json({ success: false, error: "401" }).sendStatus(401)
      return next()
    } catch {
      return res
        .send({
          success: false,
          error: "Internal server error",
        })
        .sendStatus(500)
    }
  },
  async (
    req: Request<{}, AbstractInfoResponse, AbstractInfoBody>,
    res: Response<AbstractInfoResponse>
  ) => {
    const { input = null } = req.body
    if (input === null) {
      return res
        .json({
          success: false,
          error: "Bad request",
        })
        .sendStatus(400)
    }

    try {
      return res.json({
        result: (
          await extractCompanyFromHtml({
            html: input,
            apiKey: env.OPENAI_API_KEY,
          })
        ).company,
        success: true,
      })
    } catch (error) {
      return res
        .send({
          success: false,
          error: "Internal server error",
        })
        .sendStatus(500)
    }
  }
)

app.get("/", (req: Request<{}>, res: Response) => {
  res.send({
    health: "ok",
    status: 200,
  })
})

app.listen(3000)
