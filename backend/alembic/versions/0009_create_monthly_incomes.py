"""create monthly_incomes table

Revision ID: 0009_create_monthly_incomes
Revises: 0008_create_category_forecasts
Create Date: 2026-07-12
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0009_create_monthly_incomes"
down_revision: str | None = "0008_create_category_forecasts"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "monthly_incomes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "year", "month", name="uq_monthly_incomes_user_year_month"),
    )
    op.create_index(
        op.f("ix_monthly_incomes_user_id"), "monthly_incomes", ["user_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_monthly_incomes_user_id"), table_name="monthly_incomes")
    op.drop_table("monthly_incomes")
