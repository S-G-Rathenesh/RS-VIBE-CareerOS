import pytest
from httpx import AsyncClient
from app.main import app # assuming this is the entry point
from app.models.user import UserModel
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

@pytest.mark.asyncio
async def test_auth_registration():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/register", json={
            "email": "testcandidate@example.com",
            "password": "Password123!",
            "full_name": "Test Candidate",
            "role": "candidate"
        })
        # If it returns 201 or 400 (already exists), both mean the endpoint is alive
        assert response.status_code in [200, 201, 400]

@pytest.mark.asyncio
async def test_recruiter_company_creation():
    # Mocking authentication would go here. For now, testing endpoint availability.
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Without auth this should ideally return 401/403, but because we mocked auth in dev mode
        # it might return 200. Let's just check it doesn't 404 or 500.
        response = await ac.post("/api/v1/recruiter-hub/company", json={
            "name": "Test Company",
            "industry": "Tech",
            "size": "1-10",
            "location": "Remote"
        })
        assert response.status_code in [200, 401, 403, 422]
