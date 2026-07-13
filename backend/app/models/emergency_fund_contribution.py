"""Modelo EmergencyFundContribution (aportación al colchón de emergencia).

El colchón es una **caja de ahorro virtual**: dinero que el usuario aparta para
cubrir de 3 a 6 meses de su gasto mensual (US-20). No es un movimiento normal —
no computa en ingresos/gastos/neto ni en el 50-30-20 — por eso vive en su propia
tabla y no en `transactions`. Cada aportación es un importe con su fecha.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmergencyFundContribution(Base):
    __tablename__ = "emergency_fund_contributions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    occurred_on: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
