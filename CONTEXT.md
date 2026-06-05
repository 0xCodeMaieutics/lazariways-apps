# Lazari Ways Glossary

Recruitment operations for importing workers into employment in Germany.

## Terms

### Admin

A Lazari Ways consultant who works in worker administration. Manages submitted applications and corrects worker-provided data.

**Also called:** consultant (in app descriptions).

**Not:** the worker who submitted the application.

**Related:** Application, Worker

### Application

A worker's submission of personal, contact, education, and employment-preference data to Lazari Ways. Once submitted, it is stored as a persistent record that admins can view and update.

**Related:** Worker, Admin

### Admin dashboard

The authenticated home screen where admins browse submitted applications. Layout is mobile-first, desktop-second. Applications are sorted by submission date, newest first, and shown 50 per page with previous/next navigation; there is no search in this scope. Each application appears as a clickable card showing the worker's full name, submission date, and a read-only photo thumbnail; selecting a card opens that application's edit page.

**Related:** Application, Admin session, Application update

### Application edit page

The screen at `/applications/<application-id>/edit` where an admin views and changes a stored application. All stored application fields are editable except the worker's photo, which is shown read-only. The save action stays disabled until at least one field has changed. When the admin saves, the system updates the application, generates a new PDF, and sends it to the Lazari Ways Telegram chat, then returns the admin to the dashboard.

**Related:** Application update, Admin dashboard

### Application PDF

The official application document generated from a worker's application data and photo. Worker submission and admin updates both produce this PDF using the remote template format.

**Related:** Application, Application update

### Application update

When an admin corrects application data on the application edit page and saves, the system persists the changes to the stored application, generates a new application PDF, sends it to the Lazari Ways Telegram chat, and returns the admin to the dashboard — all in one action.

**Related:** Application, Admin, Application edit page, Application PDF

### Worker

Someone who wants to be employed in Germany and contacts Lazari Ways to apply.

**Also called:** employee (same meaning in this domain).

**Related:** Application

### Admin access

How an admin reaches the application dashboard. An admin opens a shared website link, requests a one-time verification code, receives it in the Lazari Ways Telegram group, and enters it on the login screen to gain access. Without a valid admin session, private pages redirect to the login screen; after successful verification, the admin is sent to the page they originally requested.

**Related:** Admin, Verification code, Admin session

### Verification code

A short-lived, single-use code sent to the Lazari Ways Telegram group when an admin requests access. The system stores the code in `TelegramVerification` with a 10-minute expiration. The admin must enter the matching, unexpired, unused code to sign in; a successful login invalidates that code. After requesting a code, the admin must wait 1 minute before requesting another. A new code request invalidates any previous unused code; only the latest code is valid.

**Related:** Admin access, Admin, Admin session

### Admin session

Proof that an admin has passed verification. After entering a valid verification code, the system creates an admin session record holding an opaque token. The browser carries the token in an HTTP-only cookie on private requests. Admin sessions do not expire.

The system does not yet identify which consultant holds a session — only that someone passed verification. Admin sessions do not expire and there is no logout; a session remains valid until its record is removed from the database by other means.

**Related:** Admin access, Verification code, Admin
