import asyncio
import logging
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from urllib.parse import urlencode

# Load .env file from backend directory
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

logger = logging.getLogger(__name__)


def _int_env(name: str, default: int) -> int:
    """Read an integer setting, falling back to the default if it is unusable.

    These are read at import time and main.py imports this module, so raising
    here would take the whole API down. A blank or malformed value is a
    misconfiguration worth shouting about, not worth refusing to boot over -
    note that os.getenv returns "" (not the default) for a var that is set but
    empty, which is exactly what an unset ``SMTP_TIMEOUT=`` in compose yields.
    """
    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        logger.error(
            "%s=%r is not an integer; falling back to %s", name, raw, default
        )
        return default


# Email configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = _int_env("SMTP_PORT", 587)
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@kanatamusic.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Kanata Music Academy")

# Seconds to wait on the SMTP socket. Without this smtplib blocks forever on an
# unresponsive server.
SMTP_TIMEOUT = _int_env("SMTP_TIMEOUT", 15)

# Base URL of the frontend, used to build the links we email out. Must be set
# in any deployed environment or recipients get links to their own machine.
# Treat an empty value as unset: a bare "/reset-password?..." link is useless.
FRONTEND_URL = (os.getenv("FRONTEND_URL", "").strip() or "http://localhost:3000").rstrip("/")

# Set to True to actually send emails, False to just log them
SEND_REAL_EMAILS = os.getenv("SEND_REAL_EMAILS", "false").lower() == "true"


class EmailDeliveryError(Exception):
    """Raised when an email could not be delivered.

    Callers must handle this explicitly; it exists so that a failed send can
    never be mistaken for a successful one.
    """


def log_email_configuration():
    """Log the effective email configuration (never the password).

    Called at startup so that simulation mode and missing credentials are
    visible in the logs instead of silently swallowing every message.
    """
    if not SEND_REAL_EMAILS:
        logger.warning(
            "Email is in SIMULATION mode - messages are logged, not sent. "
            "Set SEND_REAL_EMAILS=true to deliver mail."
        )
    elif not SMTP_USER or not SMTP_PASSWORD:
        logger.error(
            "SEND_REAL_EMAILS is true but SMTP_USER/SMTP_PASSWORD are not set. "
            "Every send will fail."
        )
    else:
        logger.info(
            "Email enabled via %s:%s as %s", SMTP_HOST, SMTP_PORT, SMTP_USER
        )
    logger.info("Emailed links will point at %s", FRONTEND_URL)


def _deliver(to_email: str, subject: str, body: str) -> bool:
    """Send one email over SMTP. Blocking - always call via ``_send_email``.

    Returns True when the message was handed to the SMTP server, False when
    simulation mode is on. Raises EmailDeliveryError if delivery fails.
    """
    # Always log the email so the link is recoverable from the server logs
    print("--- EMAIL START ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(body)
    print("--- EMAIL END ---")

    if not SEND_REAL_EMAILS:
        logger.info(f"Email simulation mode - not sending real email to {to_email}")
        return False

    if not SMTP_USER or not SMTP_PASSWORD:
        raise EmailDeliveryError(
            "SMTP credentials are not configured (SMTP_USER / SMTP_PASSWORD)"
        )

    msg = MIMEMultipart()
    # Gmail requires From address to match authenticated user
    from_email = SMTP_USER if SMTP_USER else SMTP_FROM_EMAIL
    msg["From"] = f"{SMTP_FROM_NAME} <{from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(from_email, to_email, msg.as_string())
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        raise EmailDeliveryError(f"Failed to send email to {to_email}: {e}") from e

    logger.info(f"Email sent successfully to {to_email}")
    return True


async def _send_email(to_email: str, subject: str, body: str) -> bool:
    """Send an email without blocking the event loop.

    smtplib is synchronous, so it runs in a worker thread. Returns True when
    delivered, False in simulation mode. Raises EmailDeliveryError on failure.
    """
    return await asyncio.to_thread(_deliver, to_email, subject, body)


def _password_link(email: str) -> str:
    """Build the tokenised reset/activation link for a recipient.

    The query string is percent-encoded: a plus-addressed recipient such as
    ``a+b@example.com`` would otherwise arrive at the frontend as ``a b@...``,
    because a raw ``+`` in a query string decodes to a space - and the reset
    endpoint checks the email against the token, so the link would always fail.
    """
    from ..auth import create_password_reset_token

    token = create_password_reset_token(email)
    base = FRONTEND_URL.rstrip("/")
    query = urlencode({"token": token, "email": email})
    return f"{base}/reset-password?{query}"


async def send_welcome_email(email: str, name: str, role: str) -> bool:
    """
    Sends a welcome email with validation link.
    """
    logger.info(f"Triggering welcome email for {name} ({email}) - Role: {role}")

    validation_link = _password_link(email)

    subject = "Welcome to Kanata Music Academy - Set Up Your Password"
    body = f"""Welcome to Kanata Music Academy, {name}!

You have been registered as a {role}.
Please click the link below to set up your password and activate your account:

{validation_link}

This link will expire in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
Kanata Music Academy Team
"""

    return await _send_email(email, subject, body)


async def send_password_reset_email(email: str, name: str) -> bool:
    """
    Sends a password reset email.
    """
    logger.info(f"Triggering password reset email for {name} ({email})")

    reset_link = _password_link(email)

    subject = "Password Reset - Kanata Music Academy"
    body = f"""Hello {name},

A password reset has been requested for your Kanata Music Academy account.
Please click the link below to set a new password:

{reset_link}

This link will expire in 24 hours.

If you did not request this reset, please ignore this email.

Best regards,
Kanata Music Academy Team
"""

    return await _send_email(email, subject, body)


def validate_sin(sin: str) -> bool:
    """
    Basic SIN format validation (9 digits).
    """
    if not sin:
        return False
    clean_sin = sin.replace("-", "").replace(" ", "")
    return len(clean_sin) == 9 and clean_sin.isdigit()
