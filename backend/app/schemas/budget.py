"""Schemas de presupuesto (50-30-20 configurable) y previsto por categoría."""

import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.common import MAX_AMOUNT, MoneyStr


class ForecastUpdate(BaseModel):
    category_id: uuid.UUID
    amount: Decimal = Field(ge=0, le=MAX_AMOUNT, max_digits=12, decimal_places=2)


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    monthly_income: MoneyStr  # ingreso "habitual" por defecto
    living_pct: int
    monthly_pct: int
    investment_pct: int


class BudgetUpdate(BaseModel):
    # El ingreso habitual solo se toca si viene (None = no cambiarlo).
    monthly_income: Decimal | None = Field(
        default=None, ge=0, le=MAX_AMOUNT, max_digits=12, decimal_places=2
    )
    living_pct: int = Field(ge=0, le=100)
    monthly_pct: int = Field(ge=0, le=100)
    investment_pct: int = Field(ge=0, le=100)

    @model_validator(mode="after")
    def _check_percentages(self) -> "BudgetUpdate":
        total = self.living_pct + self.monthly_pct + self.investment_pct
        if total != 100:
            raise ValueError(f"Los porcentajes deben sumar 100 (suman {total})")
        return self


class MonthlyIncomeUpdate(BaseModel):
    """Ingreso de un (año, mes) concreto."""

    year: int = Field(ge=1900, le=2200)
    month: int = Field(ge=1, le=12)
    amount: Decimal = Field(ge=0, le=MAX_AMOUNT, max_digits=12, decimal_places=2)
