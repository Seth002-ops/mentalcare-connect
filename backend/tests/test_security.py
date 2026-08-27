import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app


client = TestClient(app)


def test_docs_are_disabled():
    response = client.get("/docs")
    assert response.status_code == 404


def test_openapi_schema_is_disabled():
    response = client.get("/openapi.json")
    assert response.status_code == 404
