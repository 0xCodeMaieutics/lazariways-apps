import fs from "fs"
import path from "path"

const IMAGE_EXTENSIONS = /\.(webp|jpe?g|png|avif)$/i

export type EmployeeImage = {
  src: string
  alt: string
}

export function getEmployeeImages(): EmployeeImage[] {
  const directory = path.join(process.cwd(), "public/employees")

  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory)
    .filter((filename) => IMAGE_EXTENSIONS.test(filename))
    .sort()
    .map((filename, index) => ({
      src: `/employees/${filename}`,
      alt: `Fachkraft aus Georgien ${index + 1}`,
    }))
}
