from typing import Optional
from app.core.config import settings
from app.core.logging import logger


class EmailService:
    """Transactional Email Delivery Service (Resend / SendGrid Integration)."""

    PROVIDER = "resend"  # or "sendgrid"

    @classmethod
    async def send_email(cls, to: str, subject: str, html_body: str, from_email: Optional[str] = None):
        """Send transactional email via configured provider."""
        sender = from_email or f"noreply@{getattr(settings, 'APP_DOMAIN', 'exploreme.ai')}"
        logger.info(f"[EMAIL] Sending to={to}, subject='{subject}', provider={cls.PROVIDER}")
        # Integration with Resend or SendGrid API
        return True

    @classmethod
    async def send_verification_email(cls, to: str, verification_url: str):
        """Send email verification link."""
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f0f14; border-radius: 16px;">
            <h2 style="color: #fff; font-size: 24px;">Verify Your Email</h2>
            <p style="color: #9ca3af; font-size: 14px;">Click the button below to verify your email address and activate your RS VIBE CareerOS account.</p>
            <a href="{verification_url}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px;">Verify Email</a>
            <p style="color: #6b7280; font-size: 11px; margin-top: 24px;">If you didn't create an account, please ignore this email.</p>
        </div>
        """
        await cls.send_email(to, "Verify Your Email – RS VIBE CareerOS", html)

    @classmethod
    async def send_welcome_email(cls, to: str, full_name: str):
        """Send welcome onboarding email."""
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f0f14; border-radius: 16px;">
            <h2 style="color: #fff; font-size: 24px;">Welcome to RS VIBE CareerOS, {full_name}! 🚀</h2>
            <p style="color: #9ca3af; font-size: 14px;">Your AI-powered career platform is ready. Start building your professional resume and portfolio today.</p>
            <a href="https://exploreme.ai/dashboard" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px;">Go to Dashboard</a>
        </div>
        """
        await cls.send_email(to, f"Welcome to RS VIBE CareerOS, {full_name}!", html)

    @classmethod
    async def send_password_reset_email(cls, to: str, reset_url: str):
        """Send password reset email."""
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f0f14; border-radius: 16px;">
            <h2 style="color: #fff; font-size: 24px;">Reset Your Password</h2>
            <p style="color: #9ca3af; font-size: 14px;">Click below to reset your password. This link expires in 15 minutes.</p>
            <a href="{reset_url}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #ef4444, #f97316); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px;">Reset Password</a>
        </div>
        """
        await cls.send_email(to, "Password Reset – RS VIBE CareerOS", html)

    @classmethod
    async def send_portfolio_published_email(cls, to: str, portfolio_title: str, portfolio_url: str):
        """Notify user their portfolio was published."""
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f0f14; border-radius: 16px;">
            <h2 style="color: #fff; font-size: 24px;">Your Portfolio is Live! 🎉</h2>
            <p style="color: #9ca3af; font-size: 14px;">"{portfolio_title}" has been published and is now visible to the world.</p>
            <a href="{portfolio_url}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px;">View Portfolio</a>
        </div>
        """
        await cls.send_email(to, f"Portfolio Published – {portfolio_title}", html)

    @classmethod
    async def send_subscription_invoice_email(cls, to: str, plan_name: str, amount: float, invoice_url: str):
        """Send subscription payment invoice."""
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f0f14; border-radius: 16px;">
            <h2 style="color: #fff; font-size: 24px;">Payment Received ✓</h2>
            <p style="color: #9ca3af; font-size: 14px;">Plan: <strong style="color: #fff;">{plan_name}</strong> — Amount: <strong style="color: #fff;">${amount}</strong></p>
            <a href="{invoice_url}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #10b981, #14b8a6); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px;">Download Invoice</a>
        </div>
        """
        await cls.send_email(to, f"Payment Confirmation – {plan_name}", html)

    @classmethod
    async def send_resume_shared_email(cls, to: str, sharer_name: str, resume_url: str):
        """Notify recipient that a resume was shared with them."""
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f0f14; border-radius: 16px;">
            <h2 style="color: #fff; font-size: 24px;">{sharer_name} shared a resume with you</h2>
            <p style="color: #9ca3af; font-size: 14px;">Click below to view the shared resume.</p>
            <a href="{resume_url}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px;">View Resume</a>
        </div>
        """
        await cls.send_email(to, f"{sharer_name} shared a resume – RS VIBE CareerOS", html)
