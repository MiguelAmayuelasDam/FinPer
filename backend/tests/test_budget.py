"""Tests del presupuesto 50-30-20 configurable e ingreso mensual variable."""

from fastapi.testclient import TestClient

BUDGET = "/api/v1/budget"
INCOME = "/api/v1/budget/income"


def _overview(client, headers, *, granularity="month", year=2026, month=7):
    url = f"/api/v1/analytics/overview?granularity={granularity}&year={year}&month={month}"
    return client.get(url, headers=headers).json()


def _set_budget(client, headers, income="1000.00", pcts=(50, 30, 20)):
    return client.put(
        BUDGET,
        headers=headers,
        json={
            "monthly_income": income,
            "living_pct": pcts[0],
            "monthly_pct": pcts[1],
            "investment_pct": pcts[2],
        },
    )


def test_requires_auth(client: TestClient) -> None:
    assert client.get(BUDGET).status_code in {401, 403}


def test_get_default_budget(client: TestClient, auth_headers: dict[str, str]) -> None:
    body = client.get(BUDGET, headers=auth_headers).json()
    assert body["monthly_income"] == "0.00"
    assert (body["living_pct"], body["monthly_pct"], body["investment_pct"]) == (50, 30, 20)


def test_update_budget(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.put(
        BUDGET,
        headers=auth_headers,
        json={
            "monthly_income": "2000.00",
            "living_pct": 65,
            "monthly_pct": 25,
            "investment_pct": 10,
        },
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["monthly_income"] == "2000.00"
    assert body["living_pct"] == 65
    # Persistido.
    assert client.get(BUDGET, headers=auth_headers).json()["living_pct"] == 65


def test_percentages_must_sum_100(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.put(
        BUDGET,
        headers=auth_headers,
        json={
            "monthly_income": "2000.00",
            "living_pct": 50,
            "monthly_pct": 30,
            "investment_pct": 10,  # suma 90 ≠ 100
        },
    )
    assert response.status_code == 422


def test_update_without_income_keeps_default(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    _set_budget(client, auth_headers, income="1200.00")
    # Actualizar solo los porcentajes (sin monthly_income) no debe tocar el ingreso.
    client.put(
        BUDGET,
        headers=auth_headers,
        json={"living_pct": 60, "monthly_pct": 30, "investment_pct": 10},
    )
    assert client.get(BUDGET, headers=auth_headers).json()["monthly_income"] == "1200.00"


def test_income_defaults_to_habitual(
    client: TestClient, auth_headers: dict[str, str], seed_categories: None
) -> None:
    # Sin ajuste del mes, el ingreso base del mes = ingreso habitual por defecto.
    _set_budget(client, auth_headers, income="1500.00")
    assert _overview(client, auth_headers, month=3)["income_base"] == "1500.00"


def test_income_override_per_month(
    client: TestClient, auth_headers: dict[str, str], seed_categories: None
) -> None:
    _set_budget(client, auth_headers, income="1500.00")
    # Marzo distinto (un ascenso, por ejemplo).
    r = client.put(
        INCOME, headers=auth_headers, json={"year": 2026, "month": 3, "amount": "2500.00"}
    )
    assert r.status_code == 204
    assert _overview(client, auth_headers, month=3)["income_base"] == "2500.00"
    # Abril sigue en el habitual.
    assert _overview(client, auth_headers, month=4)["income_base"] == "1500.00"


def test_year_income_is_sum_not_times_12(
    client: TestClient, auth_headers: dict[str, str], seed_categories: None
) -> None:
    _set_budget(client, auth_headers, income="1000.00")
    client.put(
        INCOME, headers=auth_headers, json={"year": 2026, "month": 3, "amount": "3000.00"}
    )
    ov = _overview(client, auth_headers, granularity="year")
    # 11 meses * 1000 (habitual) + 3000 (marzo) = 14000, NO 12 * 1000.
    assert ov["income_base"] == "14000.00"


def test_income_amount_limit_enforced(client: TestClient, auth_headers: dict[str, str]) -> None:
    r = client.put(
        INCOME, headers=auth_headers, json={"year": 2026, "month": 1, "amount": "10000000"}
    )
    assert r.status_code == 422
