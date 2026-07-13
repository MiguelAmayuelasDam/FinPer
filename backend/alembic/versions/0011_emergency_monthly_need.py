"""add budgets.emergency_monthly_need

Revision ID: 0011_emergency_monthly_need
Revises: 0010_emergency_fund
Create Date: 2026-07-13
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0011_emergency_monthly_need"
down_revision: str | None = "0010_emergency_fund"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "budgets",
        sa.Column("emergency_monthly_need", sa.Numeric(precision=12, scale=2), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("budgets", "emergency_monthly_need")
