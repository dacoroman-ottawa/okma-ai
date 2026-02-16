import logging

logger = logging.getLogger(__name__)

async def send_welcome_email(email: str, name: str, role: str):
    """
    Simulates sending a welcome email with validation link.
    In production, this would use an SMTP server or email API.
    """
    logger.info(f"Triggering welcome email for {name} ({email}) - Role: {role}")
    
    # Simulate validation link generation
    validation_link = f"http://localhost:3000/verify-email?token=placeholder-token&email={email}"
    
    email_body = f"""
    Welcome to Kanata Music Academy, {name}!
    
    You have been registered as a {role}. 
    Please click the link below to validate your email and set up your password:
    {validation_link}
    """
    
    # Log the email for verification in dev
    print("--- EMAIL START ---")
    print(f"To: {email}")
    print(f"Subject: Welcome to Kanata Music Academy")
    print(email_body)
    print("--- EMAIL END ---")
    
    return True

def validate_sin(sin: str) -> bool:
    """
    Basic SIN format validation (9 digits).
    """
    if not sin:
        return False
    clean_sin = sin.replace("-", "").replace(" ", "")
    return len(clean_sin) == 9 and clean_sin.isdigit()
