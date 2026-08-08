"""Payment API endpoints — Razorpay checkout, verification, webhooks, invoices."""
from fastapi import APIRouter, Depends, Request
from typing import List
from app.schemas.response import APIResponse
from app.schemas.payment import (
    CreateCheckoutRequest,
    RazorpayCheckoutResponse,
    RazorpayVerifyRequest,
    InvoiceItem,
)
from app.services.payment_service import PaymentService
from app.providers.payments.razorpay_provider import razorpay_provider
from app.security.dependencies import get_current_user
from app.core.logging import logger

router = APIRouter()


@router.post("/create-checkout", response_model=APIResponse[RazorpayCheckoutResponse])
async def create_checkout(
    data: CreateCheckoutRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a real Razorpay subscription for Golden Membership checkout."""
    res = await PaymentService.create_checkout(
        user_id=current_user["id"],
        user_email=current_user["email"],
        request=data,
    )
    return APIResponse.ok(data=res)


@router.post("/verify-razorpay", response_model=APIResponse)
async def verify_razorpay_payment(
    data: RazorpayVerifyRequest,
    current_user: dict = Depends(get_current_user),
):
    """Server-side Razorpay payment signature verification.

    Called by the frontend after Razorpay checkout completes.
    Activates Golden Membership only if signature is valid.
    """
    result = await PaymentService.verify_razorpay_payment(
        user_id=current_user["id"],
        verify_data=data,
    )
    return APIResponse.ok(data=result)


@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request):
    """Razorpay Webhook Callback — verified via HMAC SHA256 signature.

    Handles subscription lifecycle events:
    - subscription.activated
    - subscription.charged (renewals)
    - subscription.cancelled
    - subscription.completed / expired
    - payment.failed / subscription.halted
    """
    payload_body = await request.body()
    signature = request.headers.get("x-razorpay-signature", "")

    # Verify webhook signature
    if not razorpay_provider.verify_webhook_signature(payload_body, signature):
        logger.warning("Razorpay webhook signature verification failed")
        return {"success": False, "error": {"code": "INVALID_SIGNATURE", "message": "Webhook signature invalid."}}

    try:
        payload = await request.json()
    except Exception:
        return {"success": False, "error": {"code": "INVALID_PAYLOAD", "message": "Could not parse webhook payload."}}

    event = payload.get("event", "")
    logger.info("Razorpay webhook received", event=event)

    result = await PaymentService.process_webhook_event(event, payload)
    return {"success": True, "data": result}


@router.get("/invoices", response_model=APIResponse[List[InvoiceItem]])
async def get_invoices(current_user: dict = Depends(get_current_user)):
    """Fetch user billing history & downloadable invoices."""
    invoices = await PaymentService.get_user_invoices(current_user["id"])
    return APIResponse.ok(data=invoices)


@router.post("/cancel", response_model=APIResponse)
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel subscription at end of current billing period."""
    await PaymentService.cancel_subscription(current_user["id"])
    return APIResponse.ok(data={"message": "Subscription set to cancel at end of billing cycle."})
