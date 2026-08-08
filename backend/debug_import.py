import asyncio
import io
import traceback
import pypdf
import httpx
from app.main import app
from app.database.mongodb import connect_to_mongo, close_mongo_connection

async def debug_resume_import():
    print("==================================================")
    print("  DEBUGGING RESUME IMPORT PIPELINE")
    print("==================================================")

    # 1. Connect MongoDB
    print("\n1. Connecting MongoDB via connect_to_mongo()...")
    await connect_to_mongo()

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 2. Register / Login test user
        print("\n2. Authenticating user for token...")
        login_payload = {
            "email": "debug_import_user@exploreme.ai",
            "password": "Password123!",
            "full_name": "Debug User"
        }
        reg_res = await client.post("/api/v1/auth/register", json=login_payload)
        if reg_res.status_code == 200:
            token = reg_res.json()["data"]["tokens"]["access_token"]
            print("   [OK] Registered & retrieved access token.")
        else:
            login_res = await client.post("/api/v1/auth/login", json={"email": login_payload["email"], "password": login_payload["password"]})
            token = login_res.json()["data"]["tokens"]["access_token"]
            print("   [OK] Logged in & retrieved access token.")

        # 3. Create Sample PDF
        print("\n3. Creating PDF document bytes...")
        pdf_writer = pypdf.PdfWriter()
        page = pdf_writer.add_blank_page(width=612, height=792)
        buf = io.BytesIO()
        pdf_writer.write(buf)
        pdf_bytes = buf.getvalue()
        print(f"   [OK] PDF bytes generated ({len(pdf_bytes)} bytes)")

        # 4. Perform POST /api/v1/resumes/import
        url = "/api/v1/resumes/import"
        headers = {"Authorization": f"Bearer {token}"}
        files = {"file": ("test_candidate_resume.pdf", pdf_bytes, "application/pdf")}

        print("\n4. Executing POST /api/v1/resumes/import...")
        print(f"   * Request URL: http://testserver{url}")
        print(f"   * Request Headers: {headers}")
        print(f"   * Payload File: test_candidate_resume.pdf ({len(pdf_bytes)} bytes)")

        res = await client.post(url, headers=headers, files=files)

        print("\n5. Response Results:")
        print(f"   * Status Code: {res.status_code}")
        print(f"   * Response Headers: {dict(res.headers)}")
        print(f"   * Response Body: {res.text}")

        if res.status_code == 200:
            print("\n==================================================")
            print("  SUCCESS: RESUME IMPORT PIPELINE VERIFIED 100%")
            print("==================================================")
        else:
            print("\n==================================================")
            print(f"  FAILURE DETECTED WITH STATUS {res.status_code}")
            print("==================================================")

    await close_mongo_connection()

if __name__ == "__main__":
    try:
        asyncio.run(debug_resume_import())
    except Exception as e:
        print("\n[EXCEPTIONAL TRACEBACK]:")
        traceback.print_exc()
