"""Tests del colchón de emergencia (aportaciones + progreso)."""

from fastapi.testclient import TestClient

EF = "/api/v1/emergency-fund"
BUDGET = "/api/v1/budget"


def _set_income(client, headers, income="1000.00"):
    return client.put(
        BUDGET,
        headers=headers,
        json={
            "monthly_income": income,
            "living_pct": 50,
            "monthly_pct": 30,
            "investment_pct": 20,
        },
    )


def _add(client, headers, amount, date_="2026-07-01"):
    return client.post(
        f"{EF}/contributions",
        headers=headers,
        json={"amount": amount, "occurred_on": date_},
    )


def test_requires_auth(client: TestClient) -> None:
    assert client.get(EF).status_code in {401, 403}


def test_default_summary(client: TestClient, auth_headers: dict[str, str]) -> None:
    body = client.get(EF, headers=auth_headers).json()
    assert body["target_months"] == 6
    assert body["saved"] == "0.00"
    assert body["contributions"] == []


def test_target_from_income_and_months(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    _set_income(client, auth_headers, "1000.00")
    # 6 meses por defecto → objetivo 6000 (ingreso habitual × meses).
    assert client.get(EF, headers=auth_headers).json()["target"] == "6000.00"
    r = client.put(f"{EF}/target", headers=auth_headers, json={"months": 3})
    assert r.status_code == 200
    assert r.json()["target"] == "3000.00"


def test_target_months_bounds(client: TestClient, auth_headers: dict[str, str]) -> None:
    assert client.put(f"{EF}/target", headers=auth_headers, json={"months": 2}).status_code == 422
    assert client.put(f"{EF}/target", headers=auth_headers, json={"months": 7}).status_code == 422


def test_add_and_progress(client: TestClient, auth_headers: dict[str, str]) -> None:
    _set_income(client, auth_headers, "1000.00")  # objetivo 6000
    _add(client, auth_headers, "1500.00", "2026-07-01")
    _add(client, auth_headers, "500.00", "2026-06-01")
    body = client.get(EF, headers=auth_headers).json()
    assert body["saved"] == "2000.00"
    assert body["remaining"] == "4000.00"
    assert body["pct"] == 33  # 2000 / 6000
    # Ordenadas reciente → antiguo.
    assert [c["occurred_on"] for c in body["contributions"]] == ["2026-07-01", "2026-06-01"]


def test_remaining_never_negative(client: TestClient, auth_headers: dict[str, str]) -> None:
    _set_income(client, auth_headers, "1000.00")
    client.put(f"{EF}/target", headers=auth_headers, json={"months": 3})  # objetivo 3000
    _add(client, auth_headers, "5000.00")
    body = client.get(EF, headers=auth_headers).json()
    assert body["remaining"] == "0.00"
    assert body["pct"] >= 100


def test_delete_contribution(client: TestClient, auth_headers: dict[str, str]) -> None:
    cid = _add(client, auth_headers, "100.00").json()["id"]
    assert client.delete(f"{EF}/contributions/{cid}", headers=auth_headers).status_code == 204
    assert client.get(EF, headers=auth_headers).json()["saved"] == "0.00"
    # Borrar de nuevo → 404.
    assert client.delete(f"{EF}/contributions/{cid}", headers=auth_headers).status_code == 404


def test_contribution_amount_limit(client: TestClient, auth_headers: dict[str, str]) -> None:
    assert _add(client, auth_headers, "10000000").status_code == 422


def test_monthly_need_override(client: TestClient, auth_headers: dict[str, str]) -> None:
    _set_income(client, auth_headers, "1000.00")  # ingreso habitual
    # El usuario define su propio gasto mensual (800) → objetivo 800 × 6 = 4800.
    r = client.put(f"{EF}/monthly-need", headers=auth_headers, json={"amount": "800.00"})
    assert r.status_code == 200
    assert r.json()["monthly_need"] == "800.00"
    assert r.json()["target"] == "4800.00"
