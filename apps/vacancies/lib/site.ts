const PHONE_NUMBER = "4917681376567"
const WHATSAPP_MESSAGE =
  "Hallo, ich interessiere mich für Fachkräfte aus Georgien."

export const SITE = {
  whatsappUrl: (message: string = WHATSAPP_MESSAGE) =>
    `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`,
} as const
