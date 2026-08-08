from pydantic import BaseModel, Field
from typing import List, Optional


class CreditActionCost(BaseModel):
    action_type: str
    cost_credits: int
    description: str


class CreditTransactionItem(BaseModel):
    id: str
    action_type: str
    credits_deducted: int
    balance_after: int
    prompt_summary: str
    timestamp: str


class UserCreditBalanceResponse(BaseModel):
    credits_remaining: int
    monthly_limit: int
    daily_credits_used: int = 0
    daily_credits_limit: int = 20
    tier: str
    recent_transactions: List[CreditTransactionItem]
