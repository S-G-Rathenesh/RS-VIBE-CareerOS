import asyncio
import httpx
from app.database.mongodb import db_manager, connect_to_mongo, close_mongo_connection
from app.core.config import settings

async def run_tests():
    print("--- STARTING SECURITY TESTS ---")
    await connect_to_mongo()
    
    API_URL = "http://localhost:8000/api/v1"
    TEST_EMAIL = "test_reset_user@example.com"
    FAKE_EMAIL = "does_not_exist@example.com"

    # Ensure test user exists
    user = await db_manager.db["users"].find_one({"email": TEST_EMAIL})
    if not user:
        from app.security.password import hash_password
        await db_manager.db["users"].insert_one({
            "email": TEST_EMAIL,
            "full_name": "Test Reset User",
            "hashed_password": hash_password("oldpassword123"),
            "role": "user"
        })
        user = await db_manager.db["users"].find_one({"email": TEST_EMAIL})

    async with httpx.AsyncClient() as client:
        # 1. Non-existing email generic response
        res1 = await client.post(f"{API_URL}/auth/forgot-password", json={"email": FAKE_EMAIL})
        # Note: Depending on whether APP_ENV=production or development, this returns 503 or 200.
        # Since APP_ENV defaults to production, and we have no SMTP config in test, it will return 503.
        if res1.status_code == 503:
            assert "temporarily unavailable" in res1.json()["detail"]
            print("OK: Fake email returns 503 (Production safety mode)")
        else:
            assert res1.status_code == 200
            data1 = res1.json()
            assert "If an account exists" in data1["data"]["message"]
            assert "reset_token" not in data1["data"]
            print("OK: Fake email returns generic response without token")

        # 2. Existing email generic response
        res2 = await client.post(f"{API_URL}/auth/forgot-password", json={"email": TEST_EMAIL})
        if res2.status_code == 503:
            assert "temporarily unavailable" in res2.json()["detail"]
            print("OK: Existing email returns 503 (Production safety mode)")
        else:
            assert res2.status_code == 200
            data2 = res2.json()
            assert "If an account exists" in data2["data"]["message"]
            assert "reset_token" not in data2["data"]
            assert data1["data"]["message"] == data2["data"]["message"]
            print("OK: Existing email returns identical generic response without token")

        # Check DB for hash
        user_after = await db_manager.db["users"].find_one({"email": TEST_EMAIL})
        assert "reset_token" not in user_after
        assert "reset_token_hash" in user_after
        print("OK: MongoDB stores hash, not raw token")
        
        # Test 3: Invalid token rejection
        res3 = await client.post(f"{API_URL}/auth/reset-password", json={"reset_token": "fake_token", "new_password": "newpassword123"})
        assert res3.status_code == 401
        print("OK: Invalid token rejected")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_tests())
