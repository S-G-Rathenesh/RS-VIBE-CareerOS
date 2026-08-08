import resend
from app.core.config import settings
from app.core.logging import logger

class EmailProvider:
    @staticmethod
    def send_password_reset_email(to_email: str, raw_token: str) -> None:
        """
        Sends a password reset email to the user using Resend.
        If RESEND_API_KEY is not configured, securely logs the URL in dev mode
        instead of returning it to the frontend.
        """
        reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
        
        # Development / Missing Config Fallback
        if not settings.RESEND_API_KEY:
            if settings.APP_ENV.lower() == "development" or settings.APP_ENV.lower() == "local":
                logger.info(
                    "Resend API Key not configured. DEVELOPMENT MODE: Password Reset Link generated.",
                    to_email=to_email,
                    reset_link=reset_link
                )
                return
            else:
                from app.core.exceptions import ServiceUnavailableException
                logger.error(
                    "CRITICAL: Password reset requested in production but Resend API Key is not configured.",
                    to_email=to_email
                )
                raise ServiceUnavailableException("Password reset service is temporarily unavailable. Please try again later.")

        # Production / Resend Configured
        resend.api_key = settings.RESEND_API_KEY

        html_content = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your RS VIBE CareerOS AI account.</p>
                <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
                <p><a href="{reset_link}">{reset_link}</a></p>
                <br>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Best regards,<br>The RS VIBE CareerOS AI Team</p>
            </body>
        </html>
        """

        try:
            resend.Emails.send({
                "from": settings.EMAIL_FROM,
                "to": to_email,
                "subject": "RS VIBE CareerOS AI — Password Reset Instructions",
                "html": html_content
            })
            logger.info("Password reset email sent successfully via Resend.", to_email=to_email)
        except Exception as exc:
            logger.error("Failed to send password reset email via Resend.", error=str(exc), to_email=to_email)
            # We don't raise an exception here to ensure the API always returns a generic success response
            # regardless of whether the email actually delivered, preventing email enumeration.

    @staticmethod
    def send_email_verification_otp(to_email: str, otp: str) -> None:
        """
        Sends an email verification OTP to the user using Resend.
        """
        # Development / Missing Config Fallback
        if not settings.RESEND_API_KEY:
            if settings.APP_ENV.lower() == "development" or settings.APP_ENV.lower() == "local":
                logger.info(
                    "Resend API Key not configured. DEVELOPMENT MODE: Email Verification OTP generated.",
                    to_email=to_email,
                    otp=otp
                )
                return
            else:
                from app.core.exceptions import ServiceUnavailableException
                logger.error(
                    "CRITICAL: Email verification requested in production but Resend API Key is not configured.",
                    to_email=to_email
                )
                raise ServiceUnavailableException("Email service is temporarily unavailable. Please try again later.")

        # Production / Resend Configured
        resend.api_key = settings.RESEND_API_KEY

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0B0E14;
                    color: #E2E8F0;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #1A1F2E;
                    border: 1px solid #2D3748;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
                }}
                .header {{
                    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                    padding: 32px 40px;
                    text-align: center;
                }}
                .header h1 {{
                    color: #FFFFFF;
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }}
                .content {{
                    padding: 40px;
                }}
                .content p {{
                    font-size: 16px;
                    line-height: 1.6;
                    color: #CBD5E1;
                    margin-bottom: 24px;
                }}
                .otp-container {{
                    text-align: center;
                    margin: 32px 0;
                }}
                .otp-code {{
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 8px;
                    color: #FFFFFF;
                    background-color: #2D3748;
                    padding: 16px 24px;
                    border-radius: 8px;
                    display: inline-block;
                    border: 1px solid #4F46E5;
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.2);
                }}
                .footer {{
                    background-color: #0F172A;
                    padding: 24px 40px;
                    text-align: center;
                    border-top: 1px solid #2D3748;
                }}
                .footer p {{
                    font-size: 13px;
                    color: #94A3B8;
                    margin: 0;
                    line-height: 1.5;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to RS VIBE CareerOS AI</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for creating an account with <strong>RS VIBE CareerOS AI</strong>. To complete your registration and secure your account, please use the verification code below:</p>
                    
                    <div class="otp-container">
                        <div class="otp-code">{otp}</div>
                    </div>
                    
                    <p>This code expires in <strong>10 minutes</strong>.</p>
                    <p>If you did not create this account, you can ignore this email.</p>
                    <p>Best regards,<br>The RS VIBE CareerOS AI Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply.</p>
                    <p>&copy; RS VIBE CareerOS AI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            resend.Emails.send({
                "from": settings.EMAIL_FROM,
                "to": to_email,
                "subject": "Verify your RS VIBE CareerOS AI account",
                "html": html_content
            })
            logger.info("Email verification OTP sent successfully via Resend.", to_email=to_email)
        except Exception as exc:
            logger.error("Failed to send email verification OTP via Resend.", error=str(exc), to_email=to_email)
            raise

email_provider = EmailProvider()
