# Project Description

Using this project Content Editors create Social Posts for Lazari Ways' social media channels. See the Content Studio section of the root CONTEXT.md for the domain language.

Login uses the shared Telegram code login with scope `CONTENT`; codes go to the Content Editors' Telegram group, not the consultants' group. See docs/adr/0001-scope-telegram-login-per-app.md.

Social Posts are rendered on the server. See docs/adr/0002-render-social-posts-on-the-server.md.

# Language

The Content Studio UI and Social Posts are in Georgian (Kartvelian). Manrope has no Georgian glyphs, so it is paired with Noto Sans Georgian.

# References

- See docs/UI.md for UI conventions.
