from fastapi import APIRouter, Depends, status
from app.schemas.response import APIResponse
from app.schemas.auth import (
    UserRegister, 
    UserLogin, 
    RefreshTokenRequest, 
    TokenResponse, 
    ForgotPasswordRequest, 
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    GoogleAuthRequest
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    """User registration endpoint."""
    result = await AuthService.register(data)
    return APIResponse.ok(data=result)


@router.post("/login", response_model=APIResponse)
async def login(data: UserLogin):
    """User login endpoint."""
    result = await AuthService.login(data)
    return APIResponse.ok(data=result)


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_token(data: RefreshTokenRequest):
    """Refresh access token endpoint."""
    tokens = await AuthService.refresh(data.refresh_token)
    return APIResponse.ok(data=tokens)


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(current_user: dict = Depends(get_current_user)):
    """Fetch current logged-in user details."""
    return APIResponse.ok(data=current_user)


@router.post("/forgot-password", response_model=APIResponse)
async def forgot_password(data: ForgotPasswordRequest):
    """Request password reset link/token."""
    await AuthService.forgot_password(data.email)
    return APIResponse.ok(data={"message": "If an account exists with this email, password reset instructions have been sent."})


@router.post("/reset-password", response_model=APIResponse)
async def reset_password(data: ResetPasswordRequest):
    """Reset password endpoint."""
    await AuthService.reset_password(data.reset_token, data.new_password)
    return APIResponse.ok(data={"message": "Password reset successfully."})


@router.post("/verify-email", response_model=APIResponse)
async def verify_email(data: VerifyEmailRequest):
    """Verify email via 6-digit OTP."""
    result = await AuthService.verify_email(data.email, data.otp)
    return APIResponse.ok(data=result)


@router.post("/resend-verification", response_model=APIResponse)
async def resend_verification(data: ResendVerificationRequest):
    """Resend email verification OTP."""
    await AuthService.resend_verification(data.email)
    return APIResponse.ok(data={"message": "If this email is registered and unverified, a new code has been sent."})


@router.post("/google", response_model=APIResponse)
async def google_auth(data: GoogleAuthRequest):
    """Authenticate with Google OAuth."""
    result = await AuthService.google_auth(data.token)
    return APIResponse.ok(data=result)
