import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"
import "@workspace/ui/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
