import asyncio
import httpx
from app.database.mongodb import db_manager, connect_to_mongo, close_mongo_connection

async def run_tests():
    print("--- STARTING AUTH TESTS ---")
    await connect_to_mongo()
    
    API_URL = "http://localhost:8000/api/v1"
    TEST_EMAIL = "delivered@resend.dev"
    TEST_PASS = "securepassword"

    # Cleanup before test
    await db_manager.db["users"].delete_many({"email": TEST_EMAIL})
    await db_manager.db["email_verifications"].delete_many({"email": TEST_EMAIL})

    async with httpx.AsyncClient() as client:
        # 1. Register
        res_reg = await client.post(f"{API_URL}/auth/register", json={
            "email": TEST_EMAIL,
            "full_name": "OTP Test User",
            "password": TEST_PASS
        })
        if res_reg.status_code != 201:
            print("Register failed:", res_reg.json())
        assert res_reg.status_code == 201
        data = res_reg.json()["data"]
        assert "tokens" not in data
        print("Registration successful, no tokens returned")

        # 1.5. Duplicate Register
        res_dup = await client.post(f"{API_URL}/auth/register", json={
            "email": TEST_EMAIL,
            "full_name": "OTP Test User",
            "password": TEST_PASS
        })
        assert res_dup.status_code == 409
        assert res_dup.json()["error"]["code"] == "EMAIL_ALREADY_REGISTERED"
        print("Duplicate registration blocked")

        # 2. Login fails because unverified
        res2 = await client.post(f"{API_URL}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASS
        })
        assert res2.status_code == 401
        assert res2.json()["error"]["code"] == "EMAIL_UNVERIFIED"
        print("Login blocked for unverified user")

        # 2.5 Login non-existent user
        res_no = await client.post(f"{API_URL}/auth/login", json={
            "email": "doesnotexist22@resend.dev",
            "password": TEST_PASS
        })
        assert res_no.status_code == 401
        assert res_no.json()["error"]["code"] == "EMAIL_NOT_REGISTERED"
        print("Non-existent user login rejected")

        # 2.6 Login bad password
        res_bad = await client.post(f"{API_URL}/auth/login", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword123"
        })
        assert res_bad.status_code == 401
        assert res_bad.json()["error"]["code"] == "INVALID_CREDENTIALS"
        print("Wrong password login rejected")

        # 3. Check DB for OTP
        ver = await db_manager.db["email_verifications"].find_one({"email": TEST_EMAIL})
        assert ver is not None
        assert "otp_hash" in ver
        print("✅ OTP hash stored in DB")

        # 4. Verify with wrong OTP
        res3 = await client.post(f"{API_URL}/auth/verify-email", json={
            "email": TEST_EMAIL,
            "otp": "000000"
        })
        assert res3.status_code == 401
        print("✅ Wrong OTP rejected")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_tests())
