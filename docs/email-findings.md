# Email Subsystem — Findings

Review of `backend/services/email.py` and its callers, plus a root-cause
investigation into the report that **emails are not being sent**.

## How it works today

All outbound email lives in `backend/services/email.py`. There are two
messages, both plain text, both sent through raw `smtplib`.

### Transport — `_send_email()`

1. Always prints the full email (To / Subject / body) to stdout between
   `--- EMAIL START ---` / `--- EMAIL END ---` markers, so the reset link is
   recoverable from server logs even when nothing is sent.
2. **Simulation gate** — if `SEND_REAL_EMAILS` is not `"true"`, it logs and
   returns `True` without sending. This is the default.
3. **Credential gate** — missing `SMTP_USER` / `SMTP_PASSWORD` logs a warning
   and returns `False`.
4. **Send** — builds a `MIMEMultipart` with a `text/plain` part, opens
   `smtplib.SMTP(host, port)`, `starttls()`, `login()`, `sendmail()`.
5. Any exception is caught, logged, and converted to `False`.

Configuration is read from environment variables **at import time**, loaded
from `backend/.env` via `load_dotenv`. Defaults target Gmail
(`smtp.gmail.com:587`, app password required). The `From` header deliberately
uses `SMTP_USER` rather than `SMTP_FROM_EMAIL`, because Gmail rejects a
mismatched sender.

### The two messages

| Function | Subject | Trigger |
|---|---|---|
| `send_welcome_email(email, name, role)` | "Welcome… Set Up Your Password" | teacher created (`routes/people.py`), student created (`routes/people.py`) |
| `send_password_reset_email(email, name)` | "Password Reset…" | `POST /auth/forgot-password`, admin creates user (`routes/users.py`), admin "send reset link" (`routes/users.py`) |

Both mint a JWT via `create_password_reset_token(email)` (`backend/auth.py`) —
`sub=email`, `type=password_reset`, 24h expiry — and embed it in a link to the
frontend `reset-password` page. That page posts back to
`POST /auth/reset-password`, which validates the token and sets the password.
Welcome and reset share the same token type and landing page; "welcome" is just
password reset with different copy.

New users are created with a throwaway password
(`get_password_hash("TEMP_" + uuid)`) and `is_verified=False`, so the emailed
link is the only way in.

---

## Root cause: why emails are not sent

**The deployed backend never receives any SMTP configuration, so it silently
runs in simulation mode.**

Evidence gathered, layer by layer:

| Layer | Check | Result |
|---|---|---|
| Local `.env` | `SEND_REAL_EMAILS`, `SMTP_USER`, `SMTP_PASSWORD` | all set correctly |
| Network | TCP connect to `smtp.gmail.com:587` | OK |
| TLS | `EHLO` → `STARTTLS` | OK (250 / 220) |
| Auth | `SMTP.login()` with configured credentials | **OK** |
| Code path | `send_password_reset_email()` with SMTP intercepted | reaches `sendmail()`, returns `True` |
| Container image | `backend/.dockerignore` | **excludes `.env`** |
| Container env | `docker-compose.yml` / `docker-compose.prod.yml` backend `environment:` | **no `SMTP_*`, no `SEND_REAL_EMAILS`** |

So the transport itself is entirely healthy — running locally from a checkout
with `backend/.env` present, mail is really sent. But in any containerised
deployment:

1. `.dockerignore` keeps `backend/.env` out of the image.
2. Neither compose file passes `SMTP_*` or `SEND_REAL_EMAILS`; they pass only
   `DATABASE_URL`, `SECRET_KEY`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. `load_dotenv` finds no file, so `SEND_REAL_EMAILS` falls back to `"false"`.
4. `_send_email` short-circuits at the simulation gate and returns `True`.
5. Every caller discards that return value, so the API reports success.

The result is a completely silent failure: users never get mail, and the
server reports that everything worked.

---

## The three defects

### 1. Reset URL hardcoded to `http://localhost:3000`

`send_welcome_email` and `send_password_reset_email` both build the link as
`http://localhost:3000/reset-password?...`. In any deployed environment the
emailed links point at the recipient's own machine and are broken.

**Fix:** introduce a `FRONTEND_URL` environment variable, defaulting to
`http://localhost:3000` for local development.

### 2. Blocking I/O inside async request handlers

`_send_email` is synchronous `smtplib` called directly from `async def` route
handlers. `smtplib.SMTP(...)` was also constructed without a timeout, so an
unresponsive SMTP server stalls the whole event loop indefinitely — not just
the one request.

**Fix:** run the blocking send in a worker thread via `asyncio.to_thread`, and
pass an explicit `SMTP_TIMEOUT`.

### 3. Send failures invisible to the caller

`_send_email` returns a bool that every caller discards, and swallows all
exceptions. `POST /auth/forgot-password` and the admin "send reset link"
endpoint both report success even when the email never left the box. This is
what made defect #1 and the misconfiguration above undiagnosable.

**Fix:** raise a dedicated `EmailDeliveryError` instead of returning `False`,
and handle it per endpoint:

- `POST /users/{id}/send-reset-link` — sending *is* the operation, so fail the
  request with `502`.
- Teacher / student / user creation — the record is already committed, so keep
  returning `201`, but log at `ERROR` and report `emailDelivered: false` in the
  response so the UI can warn the admin.
- `POST /auth/forgot-password` — keep the generic response to avoid account
  enumeration (a failure that only occurs for existing accounts would itself
  leak existence), but log at `ERROR`.

---

## Supporting changes

- Pass `SMTP_*`, `SEND_REAL_EMAILS` and `FRONTEND_URL` through both compose
  files and document them in `backend/.env.example`.
- Log the effective email configuration at startup (never the password) so
  simulation mode is obvious in the logs instead of silent.

---

## Follow-ups found while reviewing the fix

The first pass introduced or left behind six problems, all now fixed:

1. **`docker-compose.prod.yml` defaulted `SEND_REAL_EMAILS` to `false`**, which
   recreated the exact root cause in production. It is now required (`:?`), so a
   deployment has to state which mode it wants.
2. **Narrowing to `except EmailDeliveryError` made other errors fatal.** The
   record is committed before the send, and `expire_on_commit` defaults to
   `True`, so a post-commit attribute read can raise `sqlalchemy.exc.*`; JWT
   signing and `asyncio.to_thread` can raise too. Each call site now has an
   `except Exception` backstop. In `/auth/forgot-password` this mattered most:
   a 500 for real accounts and a 200 for unknown ones is an enumeration oracle
   in the handler specifically written to avoid one.
3. **Plus-addressed recipients could never activate.** The email was
   interpolated raw into the query string and `+` decodes to a space, so
   `ann+academy@example.com` arrived as `ann academy@example.com` and the reset
   endpoint rejected the token. The query string is now `urlencode`d.
4. **An empty env var crashed the app at import.** `os.getenv` returns `""`
   (not the default) for a variable that is set but blank, so `SMTP_TIMEOUT=`
   reached `int("")` and raised - taking down the whole API, since `main.py`
   imports the email module. Integer settings now fall back and log.
5. **`emailDelivered` had no consumer.** The UI alerted "sent successfully"
   regardless. `useUsers.sendResetLink` now returns the real outcome, the
   endpoint's message reflects simulation mode, and user creation warns when
   the activation email did not go out.
6. **Two of the three conftest email patches were inert.** The routes do
   `from ..services.email import ...`, binding the name in their own module, so
   patching the service module had no effect. Only `_send_email` - the single
   chokepoint every sender funnels through - is patched now.

Still open, and deliberately not addressed here:

- The startup diagnostic was invisible on the healthy path because uvicorn only
  configures its own `uvicorn.*` loggers and `logging.lastResort` drops INFO.
  `main.py` now calls `logging.basicConfig`, which fixes it, but the app has no
  real logging configuration and should get one.
- `backend/tests/test_classes.py` writes an on-disk `test.db` that is never torn
  down, so `test_credit_refund_when_status_changes_from_present` fails on any
  second consecutive run. Reproduces on `develop`; unrelated to email.
- `kanata_academy.db` is a tracked file at the repo root.
