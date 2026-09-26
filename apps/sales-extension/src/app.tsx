"use client"
import { useEffect, useEffectEvent, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { resumeToPipeableStream } from "react-dom/server"

const TOKEN_KEY = "personalgeorgien.token"

export const App = () => {
  const [token, setToken] = useState<null | string>(null)
  const [error, setError] = useState<null | string>(null)
  const [isCodeSent, setIsCodeSent] = useState<null | boolean>(null)
  const tokenResult = chrome.storage.local.get(TOKEN_KEY)

  useEffect(() => {
    tokenResult.then((result) => {
      if (TOKEN_KEY in result) {
        const token = result[TOKEN_KEY]
        setToken(token)
      }
    })
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      {token === null ? (
        <>
          {isCodeSent === null && (
            <Button
              onClick={async () => {
                const token = "12345-token"
                try {
                  // request code api request
                  const result = await fetch("")
                  if (result.ok === false || result.status !== 200)
                    return setError("Failed requesting code")
                  setIsCodeSent(true)
                } catch (error) {
                  setError("Failed to login")
                }
              }}
            >
              Send code
            </Button>
          )}

          {isCodeSent !== null && (
            <div className="flex flex-col gap-y-6">
              <input />
              <Button
                onClick={async () => {
                  const token = "12345-token"
                  try {
                    // TODO: implement verify code api request
                    const result = await fetch("")
                    if (result.ok === false || result.status !== 200)
                      return setError("Failed verifying code")
                    await chrome.storage.local.set({
                      [TOKEN_KEY]: token,
                    })
                    setToken(token)
                  } catch (error) {
                    setError("Failed to login")
                  }
                }}
              >
                Enter code
              </Button>
            </div>
          )}

          {error !== null && (
            <div className="absolute inset-0">
              <div className="relative z-50 flex h-full w-full flex-col items-center justify-center">
                <span>Error title</span>
                <span>{error}</span>
                <Button
                  onClick={() => {
                    setError(null)
                  }}
                >
                  Close
                </Button>
              </div>
              <div className="absolute inset-0 bg-black opacity-30" />
            </div>
          )}
        </>
      ) : (
        <>
          <LoggedIn />
          <Button
            onClick={() => {
              chrome.storage.local.remove(TOKEN_KEY, () => {
                setToken(null)
              })
            }}
          >
            Logout
          </Button>
        </>
      )}
    </div>
  )
}

const LoggedIn = () => {
  const [isInspecting, setisInspecting] = useState(false)
  const [selectedElement, setSelectedElement] = useState<{
    innerHtml: string
  } | null>(null)

  const onEvent = useEffectEvent(
    (message: {
      action: "ELEMENT_SELECTED"
      element: {
        innerHtml: string
      }
    }): undefined => {
      if (message.action !== "ELEMENT_SELECTED") return
      setisInspecting(false)
      setSelectedElement(message.element)
    }
  )

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onEvent)
    return () => {
      chrome.runtime.onMessage.removeListener(onEvent)
    }
  }, [])

  return (
    <>
      <Button
        disabled={isInspecting}
        onClick={async () => {
          setSelectedElement(null)

          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          })

          if (tab.id === undefined) return

          console.log("Sending to:", tab?.id, tab?.url)
          try {
            await chrome.tabs.sendMessage(tab.id, { action: "START_PICKER" })
            setisInspecting(true)
          } catch (error) {
            console.error("No content script in this tab:", error)
          }
        }}
      >
        {isInspecting ? "Inspecting..." : "Start inspecting"}
      </Button>
      {selectedElement !== null && <span>{selectedElement.innerHtml}</span>}
      {selectedElement !== null && (
        <Button
          onClick={() => {
            console.log("API Request")
          }}
        >
          Abstact info
        </Button>
      )}
    </>
  )
}
