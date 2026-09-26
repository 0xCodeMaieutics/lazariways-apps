chrome.runtime.onMessage.addListener((message): undefined => {
  if (message.action !== "START_PICKER") return

  const highlight = document.createElement("div")
  highlight.style.cssText = [
    "position: fixed",
    "pointer-events: none",
    "z-index: 2147483647",
    "border: 2px solid #2563eb",
    "background: rgba(37, 99, 235, 0.15)",
    "box-sizing: border-box",
  ].join(";")
  document.documentElement.appendChild(highlight)

  function onMove(event: Event) {
    const hovered = event.target
    if (!(hovered instanceof Element) || hovered === highlight) return

    const bounding = hovered.getBoundingClientRect()
    highlight.style.top = `${bounding.top}px`
    highlight.style.left = `${bounding.left}px`
    highlight.style.width = `${bounding.width}px`
    highlight.style.height = `${bounding.height}px`
  }

  function onClick(event: PointerEvent) {
    event.preventDefault()
    event.stopImmediatePropagation()

    const el = event.target
    if (!(el instanceof Element)) return
    cleanup()

    chrome.runtime.sendMessage({
      action: "ELEMENT_SELECTED",
      element: {
        innerHtml: el.innerHTML,
      },
    })
  }

  function cleanup() {
    document.removeEventListener("mousemove", onMove, true)
    document.removeEventListener("click", onClick, true)
    highlight.remove()
  }

  document.addEventListener("mousemove", onMove, true)
  document.addEventListener("click", onClick, true)
})

document.addEventListener("DOMContentLoaded", (event) => {
  // append sidebar toggle <- This
})
