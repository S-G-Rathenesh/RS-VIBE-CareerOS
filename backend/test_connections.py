import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq

from app.core.config import settings

mongo_uri = settings.MONGODB_URL
groq_key = settings.GROQ_API_KEY

async def test_mongo():
    try:
        client = AsyncIOMotorClient(mongo_uri)
        res = await client.admin.command("ping")
        print("[SUCCESS] MongoDB Atlas Ping Response:", res)
    except Exception as e:
        print("[ERROR] MongoDB Atlas ping failed:", e)

def test_groq():
    try:
        client = Groq(api_key=groq_key)
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Hello RS VIBE CareerOS"}]
        )
        print("[SUCCESS] Groq API Response:", res.choices[0].message.content[:50])
    except Exception as e:
        print("[ERROR] Groq API call failed:", e)

if __name__ == "__main__":
    asyncio.run(test_mongo())
    test_groq()
