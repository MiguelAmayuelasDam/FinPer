"""Schemas de analítica (resumen, cubos 50-30-20, categorías, series)."""

import uuid
from datetime import date
from typing import Literal

from pydantic import BaseModel

from app.schemas.common import MoneyStr

# `unset` = no hay ingreso configurado, así que no hay contra qué comparar. Es
# distinto de `ok`: no es que el usuario vaya bien, es que **no se puede saber**.
BucketStatus = Literal["unset", "ok", "warning", "over"]


class Summary(BaseModel):
    income: MoneyStr
    expense: MoneyStr
    net: MoneyStr


class BucketStat(BaseModel):
    bucket: str  # living | monthly | investment
    label: str
    budget: MoneyStr
    spent: MoneyStr
    pct: int  # % del presupuesto consumido (0..∞)
    status: BucketStatus


class CategoryStat(BaseModel):
    category_id: uuid.UUID | None
    name: str
    emoji: str | None
    bucket: str | None
    spent: MoneyStr
    forecast: MoneyStr | None  # previsto (solo en el mes en curso)


class AnalyticsOverview(BaseModel):
    period_label: str
    date_from: date
    date_to: date
    is_current: bool  # el periodo es el mes actual (permite previsión)
    income_base: MoneyStr  # ingreso base del periodo (mes, o suma de los 12 en año)
    summary: Summary
    buckets: list[BucketStat]
    categories: list[CategoryStat]


class SeriesPoint(BaseModel):
    label: str
    year: int
    month: int | None
    income: MoneyStr
    expense: MoneyStr
