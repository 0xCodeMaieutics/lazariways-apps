import { createLearningAppAuth } from "@workspace/learning-app-auth"
import { prisma } from "../../client"
import { insertLearningData } from "./learning-seed"
import { UserRole } from "../../../prisma/generated/enums"

const DEV_EMAIL = "dev@lazaryways.ge"
const DEV_PASSWORD = "!Dev$LazaryIsAwesome"

const auth = createLearningAppAuth(prisma)

export const learningAppSeed = async function () {
  console.log("Creating user...")
  const session = await auth.api.signUpEmail({
    body: {
      email: DEV_EMAIL,
      name: "TEST DEV",
      password: DEV_PASSWORD,
    },
  })

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      role: UserRole.ADMIN,
    },
  })

  const userId = session.user.id
  await insertLearningData({ prisma, userId })
  console.log("Created user.")
}
