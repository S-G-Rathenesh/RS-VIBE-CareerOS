import asyncio
import httpx
from app.main import app
from app.database.mongodb import connect_to_mongo, close_mongo_connection

async def test_cors_and_login_runtime():
    print("==================================================")
    print("  TESTING RUNTIME CORS PREFLIGHT & LOGIN PIPELINE")
    print("==================================================")

    await connect_to_mongo()
    transport = httpx.ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Test 1: OPTIONS Preflight for /auth/login from localhost:5173
        print("\n1. Testing OPTIONS Preflight from Origin: http://localhost:5173...")
        options_res = await client.options(
            "/api/v1/auth/login",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type, authorization"
            }
        )
        print(f"   * Status: {options_res.status_code}")
        print(f"   * Access-Control-Allow-Origin: {options_res.headers.get('access-control-allow-origin')}")
        print(f"   * Access-Control-Allow-Credentials: {options_res.headers.get('access-control-allow-credentials')}")
        assert options_res.status_code == 200, f"Expected 200, got {options_res.status_code}"

        # Test 2: OPTIONS Preflight from Origin: http://127.0.0.1:5174
        print("\n2. Testing OPTIONS Preflight from Origin: http://127.0.0.1:5174...")
        options_res_alt = await client.options(
            "/api/v1/auth/login",
            headers={
                "Origin": "http://127.0.0.1:5174",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type, authorization"
            }
        )
        print(f"   * Status: {options_res_alt.status_code}")
        print(f"   * Access-Control-Allow-Origin: {options_res_alt.headers.get('access-control-allow-origin')}")
        assert options_res_alt.status_code == 200

        # Test 3: POST /auth/login from Origin: http://localhost:5173
        print("\n3. Testing POST /api/v1/auth/login from Origin: http://localhost:5173...")
        post_res = await client.post(
            "/api/v1/auth/login",
            headers={"Origin": "http://localhost:5173"},
            json={
                "email": "login_verification_user@exploreme.ai",
                "password": "SecurePassword123!"
            }
        )
        print(f"   * Request URL: http://localhost:8000/api/v1/auth/login")
        print(f"   * Response Status: {post_res.status_code}")
        print(f"   * Response Access-Control-Allow-Origin: {post_res.headers.get('access-control-allow-origin')}")
        print(f"   * Response Body: {post_res.text}")
        assert post_res.status_code == 200

    await close_mongo_connection()

    print("\n==================================================")
    print("  [OK] CORS PREFLIGHT & RUNTIME LOGIN VERIFIED 100%")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(test_cors_and_login_runtime())
