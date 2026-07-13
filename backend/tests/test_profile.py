"""Tests de actualización de perfil (cambio de nick)."""

from fastapi.testclient import TestClient

ME = "/api/v1/auth/me"
USER2 = {"email": "otro@mail.com", "nickname": "otronick", "password": "Str0ng!Pass2"}


def test_update_nick(client: TestClient, auth_headers: dict[str, str]) -> None:
    r = client.patch(ME, headers=auth_headers, json={"nickname": "nuevonick"})
    assert r.status_code == 200, r.text
    assert r.json()["nickname"] == "nuevonick"
    # Persistido.
    assert client.get(ME, headers=auth_headers).json()["nickname"] == "nuevonick"


def test_update_nick_requires_auth(client: TestClient) -> None:
    assert client.patch(ME, json={"nickname": "loquesea"}).status_code in {401, 403}


def test_update_nick_conflict(client: TestClient, auth_headers: dict[str, str]) -> None:
    client.post("/api/v1/auth/register", json=USER2)
    # El usuario por defecto intenta tomar el nick de USER2 → conflicto.
    r = client.patch(ME, headers=auth_headers, json={"nickname": "otronick"})
    assert r.status_code == 409


def test_update_nick_invalid(client: TestClient, auth_headers: dict[str, str]) -> None:
    # Espacios no permitidos por el patrón del nick.
    assert client.patch(ME, headers=auth_headers, json={"nickname": "a b"}).status_code == 422
