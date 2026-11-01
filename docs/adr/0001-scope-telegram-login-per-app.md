# Scope Telegram login per app

Social media content is created in a standalone app, separate from `application-admin`, so that people who make posts never get access to workers' applications. Because both apps use the shared Telegram code login in `@lazariways/verification`, verification codes and sessions carry an app scope, and each app sends codes to its own Telegram chat. Membership in that chat is what grants access to the app.

## Considered Options

- **One shared login for both apps**: rejected. Any code or session from one app would unlock the other, defeating the separation. Code requests would also share one cooldown and invalidate each other's pending codes.
- **Separate verification and session tables per app**: rejected. It duplicates security-sensitive logic for no benefit over a scope column.
