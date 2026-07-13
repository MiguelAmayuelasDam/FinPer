"""Modelo MonthlyIncome (ingreso de un mes concreto).

El ingreso mensual **no es fijo**: cada (usuario, año, mes) puede tener su propio
importe (te ascienden, te despiden, un mes con extra…). Los meses que el usuario
no ajuste caen en el "ingreso habitual" por defecto (`Budget.monthly_income`).
Uno por (usuario, año, mes).
"""

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MonthlyIncome(Base):
    __tablename__ = "monthly_incomes"
    __table_args__ = (
        UniqueConstraint("user_id", "year", "month", name="uq_monthly_incomes_user_year_month"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)  # 1..12
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
