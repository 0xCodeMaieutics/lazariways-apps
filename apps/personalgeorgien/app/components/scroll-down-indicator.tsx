export function ScrollDownIndicator() {
  return (
    <a
      href="#vorteile"
      aria-label="Nach unten scrollen"
      className="scroll-down-indicator absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center lg:bottom-8"
    >
      <span className="scroll-down-mouse hidden lg:block" aria-hidden="true">
        <span className="scroll-down-wheel" />
      </span>
    </a>
  )
}
