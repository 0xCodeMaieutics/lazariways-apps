import {
  APPLY_CALL_TO_ACTION,
  JOB_TITLE_LABEL,
  WAGE_LABEL,
  formatEmploymentDuration,
  formatGermanLevel,
  formatWage,
} from "./georgian-copy"
import type { VacancyDetails } from "./vacancy-details"
import type { VacancyTemplate } from "./vacancy-templates"

export const STORY_WIDTH = 1080
export const STORY_HEIGHT = 1920

// Instagram covers roughly this much of a story's top (profile row) and bottom (reply bar).
const INSTAGRAM_SAFE_ZONE = 250
const LINK_STICKER_AREA_HEIGHT = 220

const BRAND_PRIMARY = "#6E8CFC"
const BRAND_SURFACE = "#F1F3FF"

interface StoryProps {
  template: VacancyTemplate
  details: VacancyDetails
}

export function Story({ template, details }: StoryProps) {
  return (
    <div
      style={{
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${INSTAGRAM_SAFE_ZONE}px 80px`,
        background: "linear-gradient(180deg, #0B0E24 0%, #1A2266 100%)",
        color: "#FFFFFF",
        fontFamily: "Manrope, Noto Sans Georgian",
      }}
    >
      <Logo />

      <div
        style={{
          marginTop: 64,
          flexShrink: 0,
          fontSize: 68,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {formatEmploymentDuration(details.employmentDuration)}
      </div>

      {details.highlight !== "" ? (
        <div
          style={{
            marginTop: 32,
            flexShrink: 0,
            padding: "16px 40px",
            borderRadius: 999,
            backgroundColor: BRAND_PRIMARY,
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          {details.highlight}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 64,
          flexShrink: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 40,
          padding: 48,
          borderRadius: 48,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <DetailRow icon={template.icon} label={JOB_TITLE_LABEL} value={template.jobTitle} />
        <DetailRow icon="💶" label={WAGE_LABEL} value={formatWage(details.wageAmount, details.wagePeriod)} />
        <DetailRow icon="🗣️" value={formatGermanLevel(details.germanLevel)} />
      </div>

      <div style={{ flexGrow: 1 }} />

      <div style={{ marginTop: 48, flexShrink: 0, fontSize: 42, fontWeight: 700, textAlign: "center" }}>
        {`📌 ${APPLY_CALL_TO_ACTION}`}
      </div>

      {/* Link Sticker Area: left empty for Instagram's link sticker. */}
      <div style={{ flexShrink: 0, width: "100%", height: LINK_STICKER_AREA_HEIGHT }} />
    </div>
  )
}

function Logo() {
  return (
    <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 28 }}>
      <svg width="120" height="120" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="30" fill={BRAND_SURFACE} />
        <path
          d="M18.0039 26.0039C20.2152 23.7926 23.8003 23.7926 26.0116 26.0039L30.0155 30.0078L26.0116 34.0117C23.8003 36.2229 20.2152 36.2229 18.0039 34.0117C15.7926 31.8004 15.7926 28.2152 18.0039 26.0039Z"
          stroke={BRAND_PRIMARY}
          strokeWidth="3"
        />
        <path
          d="M41.9961 34.0479C39.7848 36.2592 36.1997 36.2592 33.9884 34.0479L29.9845 30.044L33.9884 26.0401C36.1997 23.8288 39.7848 23.8288 41.9961 26.0401C44.2074 28.2514 44.2074 31.8366 41.9961 34.0479Z"
          stroke={BRAND_PRIMARY}
          strokeWidth="3"
        />
      </svg>
      <div style={{ fontSize: 56, fontWeight: 800 }}>Lazari Ways</div>
    </div>
  )
}

interface DetailRowProps {
  icon: string
  label?: string
  value: string
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
      <div style={{ fontSize: 56, lineHeight: 1 }}>{icon}</div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
        {label !== undefined ? <div style={{ fontSize: 30, opacity: 0.7 }}>{label}</div> : null}
        <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.3 }}>{value}</div>
      </div>
    </div>
  )
}
