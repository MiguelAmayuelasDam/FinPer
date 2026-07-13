"""create emergency_fund_contributions + budgets.emergency_fund_months

Revision ID: 0010_emergency_fund
Revises: 0009_create_monthly_incomes
Create Date: 2026-07-13
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0010_emergency_fund"
down_revision: str | None = "0009_create_monthly_incomes"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "budgets",
        sa.Column(
            "emergency_fund_months", sa.Integer(), nullable=False, server_default="6"
        ),
    )
    op.create_table(
        "emergency_fund_contributions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("occurred_on", sa.Date(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_emergency_fund_contributions_user_id"),
        "emergency_fund_contributions",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_emergency_fund_contributions_user_id"),
        table_name="emergency_fund_contributions",
    )
    op.drop_table("emergency_fund_contributions")
    op.drop_column("budgets", "emergency_fund_months")
