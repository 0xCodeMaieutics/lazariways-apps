import { test, expect } from "@playwright/test"
import { prisma } from "@workspace/database/client"

const DEV_EMAIL = "dev@lazaryways.ge"
const DEV_PASSWORD = "!Dev$LazaryIsAwesome"

const adminURL = "http://localhost:3008"
const appURL = "http://localhost:3007"

test("Create topic by admin and is displayed in the learning-app", async ({
  page,
}) => {
  await page.goto(`${appURL}/login`)
  await page.getByLabel("ელფოსტა").fill(DEV_EMAIL)
  await page.getByLabel("პაროლი").fill(DEV_PASSWORD)
  await page.getByRole("button", { name: "შესვლა" }).click()
  await expect(page).toHaveURL(/\/topics$/)

  await page.goto(`${adminURL}/login`)
  await page.getByLabel("ელფოსტა").fill(DEV_EMAIL)
  await page.getByLabel("პაროლი").fill(DEV_PASSWORD)
  await page.getByRole("button", { name: "შესვლა" }).click()
  await expect(page).toHaveURL(/\/topics$/)
  await page.getByRole("link", { name: "Create topic" }).click()
  const TOPIC_NAME = "Test Topic 1"
  await page.getByRole("textbox", { name: "Name" }).click()
  await page.getByRole("textbox", { name: "Name" }).fill(TOPIC_NAME)
  await page.getByLabel("Type").selectOption("HOTEL")
  await page.getByRole("checkbox", { name: "Enable topic" }).click()
  await page.getByLabel("Unlocked by").selectOption("PLf3qkDXC9FYkANh5rkcB")
  await page
    .getByRole("spinbutton", { name: "Minimum completed exams to" })
    .fill("6")
  await page.getByRole("button", { name: "Create topic" }).click()
  const createdTopic = await prisma.topic.findFirstOrThrow({
    where: { name: TOPIC_NAME },
  })
  const cell = await page.getByRole("cell", { name: TOPIC_NAME })
  await expect(cell).toBeVisible()

  await page.goto(`${appURL}/topics`)
  await expect(await page.getByRole("link", { name: TOPIC_NAME })).toBeVisible()

  await page.goto(`${adminURL}/topics`)
  await page.getByRole("cell", { name: TOPIC_NAME }).click()
  await page.getByRole("link", { name: "Create new exam" }).click()
  const EXAM_NAME = "Test Exam 1"
  await page.getByRole("textbox", { name: "Title" }).click()
  await page.getByRole("textbox", { name: "Title" }).fill(EXAM_NAME)
  await page.getByRole("textbox", { name: "Description" }).click()
  await page.getByRole("textbox", { name: "Description" }).fill("Exam 1 desc")
  await page
    .getByRole("spinbutton", { name: "Minimum correct answers" })
    .fill("1")
  await page.getByRole("checkbox", { name: "Enable exam" }).click()
  await page.getByRole("button", { name: "Create exam" }).click()
  await expect(page).toHaveURL(/\/exams$/)
  await prisma.exam.findFirstOrThrow({
    where: { title: EXAM_NAME, topicId: createdTopic.id },
  })

  await page.getByRole("cell", { name: EXAM_NAME }).click()
  await expect(page).toHaveURL(/\/exercises$/)
  expect(await page.getByRole("heading", { name: EXAM_NAME })).toBeVisible()
  await page.getByRole("link", { name: "Create exercise" }).click()
  await expect(page).toHaveURL(/\/exercises\/new$/)
  await page.getByRole("textbox", { name: "Prompt" }).click()
  await page.getByRole("textbox", { name: "Prompt" }).fill("airchie dzma")
  const exerciseText = "test hallo"
  await page.getByRole("textbox", { name: "Text" }).click()
  await page.getByRole("textbox", { name: "Text" }).fill(exerciseText)
  await page.getByRole("textbox", { name: "Options (one per line)" }).click()
  await page
    .getByRole("textbox", { name: "Options (one per line)" })
    .fill("Hey\nHallo\nHillo")
  await page
    .getByRole("textbox", { name: "Correct option index (0-based" })
    .click()
  await page
    .getByRole("textbox", { name: "Correct option index (0-based" })
    .fill("0")
  await page.getByRole("button", { name: "Create exercise" }).click()
  await expect(page).toHaveURL(/\/exercises$/)

  expect(await page.getByRole("cell", { name: "airchie dzma" })).toBeVisible()
  const createdExam = await prisma.exam.findFirstOrThrow({
    where: { title: EXAM_NAME, topicId: createdTopic.id },
    include: {
      _count: {
        select: {
          exercises: true,
        },
      },
    },
  })
  expect(createdExam._count.exercises).toBe(1)

  await page.goto(`${appURL}/topics`)
  await page.getByRole("link", { name: TOPIC_NAME }).click()
  await expect(page).toHaveURL(/\/exams$/)
  await page.getByRole("link", { name: `${EXAM_NAME} 0%` }).click()
  await expect(page).toHaveURL(/\/exercises$/)
  await page.getByRole("button", { name: "Hey" }).click()
  await page.getByRole("button", { name: "შემოწმება" }).click()
  await expect(page.getByText("სწორია")).toBeVisible()
  await page.getByRole("button", { name: "ნახე შედეგები" }).click()
  await expect(page.getByText("სავარჯიშო წარმატებით ჩააბარეთ!")).toBeVisible()
})
