import {
  getSignedUrlForDownload,
  uploadToStorage,
} from "@workspace/file-upload/s3-client.ts";
import { keyBuilders } from "@workspace/file-upload/key-builder.ts";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import z from "zod";
import { generateRandomString } from "@workspace/shared/lib/random.ts";

void (async function main() {
  const s3BucketNameResult = z.string().min(1).safeParse(process.env.S3_BUCKET_NAME);
  if (!s3BucketNameResult.success) {
    console.error("S3_BUCKET_ENV_LOAD_FAILED");
    return;
  }

  const id = randomUUID();

  const photoData = readFileSync("./scripts/photo.png");

  const employeeId = generateRandomString(32);
  const fileKey = keyBuilders.employees.photo.buildKey({
    employeeId,
    filename: "photo.png",
    now: Date.now(),
  });
  console.log({ fileKey });

  try {
    await uploadToStorage({
      file: photoData,
      bucket: s3BucketNameResult.data,
      fileKey: fileKey,
    });
  } catch (error) {
    console.error(error);
    return {
      isSuccess: false,
      errorCode: "PHOTO_UPLOAD_FAILED",
      errorMessage: "Failed to upload photo",
    };
  }

  try {
    const signedUrl = await getSignedUrlForDownload({
      bucket: s3BucketNameResult.data,
      fileKey,
      expiresInSeconds: 3600,
    });
    console.log({
      signedUrl,
    });
  } catch {
    console.log("URL_GENERATION_FAILED");
  }
})();
