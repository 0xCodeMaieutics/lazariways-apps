# Project Description

Using this project Content Editors create Social Posts for Lazari Ways' social media channels. See the Content Studio section of the root CONTEXT.md for the domain language.

Login uses the shared Telegram code login with scope `CONTENT`; codes go to the Content Editors' Telegram group, not the consultants' group. See docs/adr/0001-scope-telegram-login-per-app.md.

Social Posts are rendered on the server. See docs/adr/0002-render-social-posts-on-the-server.md.

- `lib/social-posts/vacancy-templates.ts`: Vacancy Templates. Add new job types here.
- `lib/social-posts/georgian-copy.ts`: shared Georgian wording for Vacancy Details. Fix grammar here so every template gets it.
- `lib/social-posts/story.tsx`: the Story layout (1080×1920). Satori supports flexbox only, and every element with more than one child needs `display: "flex"`.

# Language

The Content Studio UI and Social Posts are in Georgian (Kartvelian). Manrope has no Georgian glyphs, so it is paired with Noto Sans Georgian.

# References

- See docs/UI.md for UI conventions.
