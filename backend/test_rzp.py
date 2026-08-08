import os
import sys
sys.path.append(os.getcwd())
import asyncio

from app.core.config import settings
from app.providers.payments.razorpay_provider import razorpay_provider

def test_credentials():
    print("--- RAZORPAY CREDENTIAL DIAGNOSTIC ---")
    kid = settings.RAZORPAY_KEY_ID
    ksec = settings.RAZORPAY_KEY_SECRET
    whsec = settings.RAZORPAY_WEBHOOK_SECRET
    
    print(f"RAZORPAY_KEY_ID: {'PRESENT' if kid else 'MISSING'}")
    if kid:
        print(f"RAZORPAY_KEY_ID mode: {'TEST MODE' if kid.startswith('rzp_test_') else 'LIVE MODE / UNKNOWN'}")
        
    print(f"RAZORPAY_KEY_SECRET: {'PRESENT' if ksec else 'MISSING'}")
    print(f"RAZORPAY_WEBHOOK_SECRET: {'PRESENT' if whsec else 'MISSING'}")
    print("--------------------------------------")

async def test_ensure_plan():
    print("--- RAZORPAY PLAN CREATION DIAGNOSTIC ---")
    try:
        plan_id = await razorpay_provider.ensure_plan_id()
        print(f"ensure_plan_id() SUCCESS! Returned plan_id: {plan_id}")
    except Exception as exc:
        print(f"ensure_plan_id() FAILED with exception: {repr(exc)}")
    print("-----------------------------------------")

if __name__ == "__main__":
    test_credentials()
    asyncio.run(test_ensure_plan())
