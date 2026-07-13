"""Schemas del colchón de emergencia (aportaciones + resumen de progreso)."""

import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import MAX_AMOUNT, MoneyStr


class ContributionCreate(BaseModel):
    amount: Decimal = Field(gt=0, le=MAX_AMOUNT, max_digits=12, decimal_places=2)
    occurred_on: date


class ContributionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    amount: MoneyStr
    occurred_on: date


class TargetUpdate(BaseModel):
    months: int = Field(ge=3, le=6)


class MonthlyNeedUpdate(BaseModel):
    amount: Decimal = Field(ge=0, le=MAX_AMOUNT, max_digits=12, decimal_places=2)


class EmergencyFundSummary(BaseModel):
    monthly_need: MoneyStr  # gasto mensual de referencia (ingreso habitual: vida+mes+inversión)
    target_months: int  # meses objetivo (3–6)
    target: MoneyStr  # monthly_need * target_months
    saved: MoneyStr  # total aportado
    remaining: MoneyStr  # lo que falta hasta el objetivo (nunca negativo)
    pct: int  # % del objetivo cubierto (0..∞)
    contributions: list[ContributionRead]
