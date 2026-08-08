import asyncio
import httpx
from app.main import app
from app.database.mongodb import connect_to_mongo, close_mongo_connection

async def test_login_flow():
    print("==================================================")
    print("  TESTING AUTHENTICATION & LOGIN FLOW")
    print("==================================================")

    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Register test user
        email = "login_verification_user@exploreme.ai"
        password = "SecurePassword123!"

        print("\n1. Registering test user:", email)
        reg_res = await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Login Verification User"
        })
        print(f"   * Status: {reg_res.status_code}")
        print(f"   * Body: {reg_res.text[:150]}...")

        # 2. Test valid login
        print("\n2. Testing VALID login credentials...")
        login_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        print(f"   * Status: {login_res.status_code}")
        print(f"   * Body: {login_res.text}")
        assert login_res.status_code == 200, f"Expected 200, got {login_res.status_code}"
        assert login_res.json()["success"] is True, "Success should be True"
        assert "access_token" in login_res.json()["data"]["tokens"], "Token should be present"
        print("   [OK] Valid login succeeded!")

        # 3. Test invalid password (401)
        print("\n3. Testing INVALID password (expecting 401)...")
        invalid_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "WrongPassword999!"
        })
        print(f"   * Status: {invalid_res.status_code}")
        print(f"   * Body: {invalid_res.text}")
        assert invalid_res.status_code == 401, f"Expected 401, got {invalid_res.status_code}"
        print("   [OK] Invalid password returned 401 Unauthorized with descriptive message!")

        # 4. Test missing field (422)
        print("\n4. Testing INVALID payload missing password (expecting 422)...")
        bad_payload_res = await client.post("/api/v1/auth/login", json={
            "email": email
        })
        print(f"   * Status: {bad_payload_res.status_code}")
        print(f"   * Body: {bad_payload_res.text}")
        assert bad_payload_res.status_code == 422, f"Expected 422, got {bad_payload_res.status_code}"
        print("   [OK] Missing payload returned 422 Unprocessable Entity!")

    await close_mongo_connection()

    print("\n==================================================")
    print("  [OK] AUTHENTICATION LOGIN TEST 100% VERIFIED")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(test_login_flow())
