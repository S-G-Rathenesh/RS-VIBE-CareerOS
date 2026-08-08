from pydantic import BaseModel, Field
from typing import Optional


class AddDomainRequest(BaseModel):
    portfolio_id: str
    domain: str  # e.g., "myportfolio.com" or "resume.johndoe.dev"


class CustomDomainItem(BaseModel):
    id: str
    portfolio_id: str
    portfolio_slug: str
    domain: str
    verified: bool
    ssl_status: str  # "active", "pending", "failed"
    dns_record_type: str = "CNAME"
    target_value: str = "cname.exploreme.ai"
    created_at: str


class VerifyDomainResponse(BaseModel):
    id: str
    domain: str
    verified: bool
    ssl_status: str
    message: str
