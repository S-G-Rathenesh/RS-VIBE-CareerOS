import os
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

def test_production_sitemap_url():
    # Force APP_ENV to production for the test
    original_env = os.environ.get("APP_ENV")
    original_frontend = os.environ.get("FRONTEND_URL")
    
    os.environ["APP_ENV"] = "production"
    os.environ["FRONTEND_URL"] = "http://localhost:5173" # Should be rejected
    
    # Reload settings validation logic (mocking the validation behavior)
    test_url = settings.validate_frontend_url("http://localhost:5173", type("Info", (), {"data": {"APP_ENV": "production"}})())
    assert test_url == "https://rsvibecareer.rathenesh.dev"

    client = TestClient(app)
    response = client.get("/api/v1/public/sitemap.xml")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/xml"
    
    # The actual response depends on the current settings instance,
    # which might have been initialized before we set the env.
    # But we can verify the text doesn't contain localhost if it's properly mocked.
    # In integration it should use the actual domain.
    # Wait, the TestClient uses the existing `settings` instance which was initialized at module load.
    # We can patch it directly for the test.
    original_setting_url = settings.FRONTEND_URL
    settings.FRONTEND_URL = "https://rsvibecareer.rathenesh.dev"
    
    try:
        response = client.get("/api/v1/public/sitemap.xml")
        content = response.text
        
        assert "http://localhost" not in content
        assert "http://127.0.0.1" not in content
        assert "https://rsvibecareer.rathenesh.dev/" in content
    finally:
        # Restore environment
        settings.FRONTEND_URL = original_setting_url
        if original_env is not None:
            os.environ["APP_ENV"] = original_env
        else:
            del os.environ["APP_ENV"]
            
        if original_frontend is not None:
            os.environ["FRONTEND_URL"] = original_frontend
        else:
            del os.environ["FRONTEND_URL"]
