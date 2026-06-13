const PHONE_NUMBER = "4917681376567"
const WHATSAPP_MESSAGE =
  "გამარჯობა, მე მაინტერესებს სამსახურის შოვნა personalgeorgien-ის დახმარებით."

export const SITE = {
  whatsappUrl: (message: string = WHATSAPP_MESSAGE) =>
    `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`,
} as const
