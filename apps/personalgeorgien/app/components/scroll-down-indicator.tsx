export function ScrollDownIndicator() {
  return (
    <a
      href="#vorteile"
      aria-label="Nach unten scrollen"
      className="scroll-down-indicator absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:flex"
    >
      <span className="scroll-down-mouse" aria-hidden="true">
        <span className="scroll-down-wheel" />
      </span>
    </a>
  )
}
