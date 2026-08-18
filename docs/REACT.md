## React Conventions

### Keep code as close as possible to where it is used

If you create a component form with zod validation object, don't abstract the validation in a separate file, but rather define the object in the same component file.

### avoiding premature abstraction

Colocation — components used only by page.client.tsx stay in page.client.tsx or layout.client.tsx
YAGNI — don't create a components/ abstraction because it might become reusable later.
Locality of behavior — related code should be easy to understand without jumping across several files.

### Client-Side Request Error Feedback

Rule: Every failed client-side API request in React must provide visible feedback to the user.

When a client-side request fails:

- Always display an error toast or equivalent user-visible error notification.
- Don't log error using console.error.
- Use the application's existing toast/notification system rather than introducing a new one.

```tsx
try {
  await fetch("/api/auth/logout", { method: "POST" })

  startTransition(() => {
    router.push("/login")
    router.refresh()
  })
} catch (error) {
  console.error("Logout request failed:", error)
  toast.error("Failed to log out. Please try again.")
}
```
