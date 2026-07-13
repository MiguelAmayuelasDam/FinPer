"""Tipos reutilizables de los schemas."""

from decimal import ROUND_HALF_UP, Decimal
from typing import Annotated

from pydantic import PlainSerializer

_CENTS = Decimal("0.01")

# Tope máximo para cualquier importe introducido por el usuario (importes de
# movimiento, ingreso mensual, previsto). Evita entradas absurdas/desbordes de UI.
MAX_AMOUNT = Decimal("9999999")


def _to_money_str(value: Decimal) -> str:
    return f"{value.quantize(_CENTS, rounding=ROUND_HALF_UP):.2f}"


# Decimal que se serializa en JSON como string (regla §7.1: sin pérdida).
MoneyStr = Annotated[Decimal, PlainSerializer(_to_money_str, return_type=str)]
