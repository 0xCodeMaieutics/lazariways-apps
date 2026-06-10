const PHONE_NUMBER = "4917681376567"
const WHATSAPP_MESSAGE =
  "Hallo, ich interessiere mich für Fachkräfte aus Georgien."

export const BENEFITS = [
  {
    title: "Motivierte Fachkräfte",
    description:
      "Qualifizierte Talente aus Georgien, die zuverlässig in deutschen Unternehmen arbeiten möchten.",
  },
  {
    title: "Persönliche Betreuung",
    description:
      "Ein fester Ansprechpartner begleitet Sie von der ersten Anfrage bis zur Einstellung.",
  },
  {
    title: "Rechtssichere Vermittlung",
    description:
      "Wir kennen die Anforderungen und unterstützen Sie durch den gesamten Prozess.",
  },
  {
    title: "Schnelle Verfügbarkeit",
    description:
      "Kurze Wege vom ersten Kontakt bis zur Besetzung Ihrer offenen Stellen.",
  },
] as const

export const STEPS = [
  {
    title: "Kontakt",
    description:
      "Schreiben Sie uns per WhatsApp und schildern Sie Ihren Personalbedarf.",
  },
  {
    title: "Auswahl",
    description:
      "Wir stellen Ihnen passende Fachkräfte vor, die zu Ihren Anforderungen passen.",
  },
  {
    title: "Einstellung",
    description:
      "Sie wählen die richtigen Kandidaten — wir begleiten Sie bis zur Einstellung.",
  },
] as const

export const HERO_TITLE = {
  prefix: "Ihr Zugang zu",
  suffix: "Fachkräften aus Georgien",
  adjectives: [
    "motivierten",
    "engagierten",
    "qualifizierten",
    "zuverlässigen",
  ],
} as const

export const SITE = {
  name: "personalgeorgien",
  url: "https://personalgeorgien.de",
  title: `Ihr Zugang zu ${HERO_TITLE.adjectives[0]} Fachkräften aus Georgien`,
  slogan: "Die richtigen Menschen. Die richtigen Chancen.",
  description:
    "Personalgeorgien vermittelt motivierte Fachkräfte aus Georgien an deutsche Arbeitgeber. Persönliche Betreuung und rechtssichere Vermittlung — jetzt per WhatsApp kontaktieren.",
  email: "info@personalgeorgien.de",
  phone: "+49 176 81376567",
  phoneUrl: `tel:+${PHONE_NUMBER}`,
  whatsappUrl: `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
} as const
