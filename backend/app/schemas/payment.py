from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class PaymentProvider(str, Enum):
    STRIPE = "stripe"
    RAZORPAY = "razorpay"


class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


class CreateCheckoutRequest(BaseModel):
    plan_tier: str = "golden"  # Only "golden" for this launch
    provider: PaymentProvider = PaymentProvider.RAZORPAY


class RazorpayCheckoutResponse(BaseModel):
    """Returned to frontend so it can open Razorpay inline checkout."""
    subscription_id: str
    razorpay_key_id: str
    plan_name: str = "Golden Membership"
    amount: int  # In paise (6900 = ₹69)
    currency: str = "INR"


class RazorpayVerifyRequest(BaseModel):
    """Sent by frontend after Razorpay checkout succeeds."""
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str


class InvoiceItem(BaseModel):
    id: str
    transaction_id: str
    amount: float
    currency: str
    plan_tier: str
    billing_cycle: str
    provider: str
    status: str
    invoice_url: Optional[str] = None
    created_at: str
