import logging
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

# Load .env file from backend directory
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

logger = logging.getLogger(__name__)

# Email configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@kanatamusic.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Kanata Music Academy")

# Set to True to actually send emails, False to just log them
SEND_REAL_EMAILS = os.getenv("SEND_REAL_EMAILS", "false").lower() == "true"


def _send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Internal function to send an email via SMTP.
    """
    # Always log the email
    print("--- EMAIL START ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(body)
    print("--- EMAIL END ---")

    if not SEND_REAL_EMAILS:
        logger.info(f"Email simulation mode - not sending real email to {to_email}")
        return True

    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False

    try:
        msg = MIMEMultipart()
        # Gmail requires From address to match authenticated user
        from_email = SMTP_USER if SMTP_USER else SMTP_FROM_EMAIL
        msg["From"] = f"{SMTP_FROM_NAME} <{from_email}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(from_email, to_email, msg.as_string())

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_welcome_email(email: str, name: str, role: str):
    """
    Sends a welcome email with validation link.
    """
    from ..auth import create_password_reset_token

    logger.info(f"Triggering welcome email for {name} ({email}) - Role: {role}")

    # Generate a real JWT token (reusing password reset token for initial password setup)
    token = create_password_reset_token(email)
    validation_link = f"http://localhost:3000/reset-password?token={token}&email={email}"

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

    return _send_email(email, subject, body)


async def send_password_reset_email(email: str, name: str):
    """
    Sends a password reset email.
    """
    from ..auth import create_password_reset_token

    logger.info(f"Triggering password reset email for {name} ({email})")

    # Generate a real JWT token for password reset
    token = create_password_reset_token(email)
    reset_link = f"http://localhost:3000/reset-password?token={token}&email={email}"

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

    return _send_email(email, subject, body)


def validate_sin(sin: str) -> bool:
    """
    Basic SIN format validation (9 digits).
    """
    if not sin:
        return False
    clean_sin = sin.replace("-", "").replace(" ", "")
    return len(clean_sin) == 9 and clean_sin.isdigit()
