import asyncio
import httpx
import json

async def main():
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post("http://localhost:8000/api/v1/auth/login", json={
            "email": "tester_qa_e2e_final@exploreme.ai",
            "password": "Password123!"
        })
        print(f"Status: {r.status_code}")
        print(json.dumps(r.json(), indent=2))

asyncio.run(main())
