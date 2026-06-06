import { env } from "@/env"
import { NextRequest } from "next/server"
import { uploadFileToStorage } from "@workspace/file-upload/s3-client"
import crypto from "crypto"
import { profileFormSchema, type ProfileFormData } from "@/utils/profile-schema"
import prisma from "@workspace/database/client"
import { sendPhotoToTelegram } from "@/lib/telegram"

export const POST = async (request: NextRequest) => {
  const formData = await request.formData()
  const input = profileFormDataFromFormData(formData)
  const parsed = profileFormSchema.safeParse(input)

  if (!parsed.success) {
    console.error("ZOD_VALIDATION_FAILED", parsed.error)
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const firstName = sanitizeFilenamePart(parsed.data.firstName)
  const lastName = sanitizeFilenamePart(parsed.data.lastName)

  const base = `${lastName}-${firstName}-${crypto.randomUUID()}`.replace(
    /^-+|-+$/g,
    ""
  )
  const filename = sanitizeFilenamePart(parsed.data.foto.name) || "foto.jpg"
  const fotoKey = `profiles/${base}/foto/${Date.now()}-${filename}`

  try {
    await uploadFileToStorage({
      file: parsed.data.foto,
      bucket: env.S3_BUCKET_NAME,
      fileKey: fotoKey,
    })
  } catch (error) {
    console.error("FOTO_UPLOAD_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  try {
    await prisma.profile.create({
      data: profileToPrismaCreateData(parsed.data, fotoKey),
    })
  } catch (error) {
    console.error("PROFILE_DB_INSERT_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  const prefix = process.env.NODE_ENV === "development" ? "TEST - " : ""

  const caption =
    `${prefix}Profile 🎉 ${parsed.data.firstName.trim()} ${parsed.data.lastName.trim()}`.trim()

  try {
    await sendPhotoToTelegram(parsed.data.foto, filename, caption)
  } catch (error) {
    console.error("TELEGRAM_REQUEST_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 502 })
  }

  return Response.json({ success: true }, { status: 200 })
}

function formString(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === "string" ? v : ""
}

function formStringArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v !== "")
}

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 60)
}

function optionalString(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ""
  return trimmed === "" ? null : trimmed
}

function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    throw new Error(`Invalid date: ${value}`)
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`)
  }

  return date
}

function formLanguages(formData: FormData): unknown {
  const raw = formString(formData, "languages")
  if (raw.trim() === "") {
    return []
  }

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function profileToPrismaCreateData(data: ProfileFormData, fotoS3Key: string) {
  return {
    fotoS3Key,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    birthDate: parseIsoDate(data.birthDate),
    email: data.email.trim(),
    phone: optionalString(data.phone),
    workSector: data.workSector,
    desiredSalary: data.desiredSalary,
    languages: {
      create: data.languages.map((entry) => ({
        language: entry.language.trim(),
        level: entry.level,
      })),
    },
  }
}

function profileFormDataFromFormData(formData: FormData) {
  return {
    firstName: formString(formData, "firstName"),
    lastName: formString(formData, "lastName"),
    birthDate: formString(formData, "birthDate"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    workSector: formStringArray(formData, "workSector"),
    desiredSalary: formString(formData, "desiredSalary"),
    languages: formLanguages(formData),
    foto: formData.get("foto"),
  }
}
