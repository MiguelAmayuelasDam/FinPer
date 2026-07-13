"""Endpoints del colchón de emergencia (`/api/v1/emergency-fund`)."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.emergency_fund import (
    ContributionCreate,
    ContributionRead,
    EmergencyFundSummary,
    MonthlyNeedUpdate,
    TargetUpdate,
)
from app.services import budget_service, emergency_fund_service

router = APIRouter(prefix="/emergency-fund", tags=["emergency-fund"])


@router.get("", response_model=EmergencyFundSummary)
def get_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return emergency_fund_service.summary(db, user)


@router.put("/target", response_model=EmergencyFundSummary)
def set_target(
    payload: TargetUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget_service.set_emergency_months(db, user, payload.months)
    return emergency_fund_service.summary(db, user)


@router.put("/monthly-need", response_model=EmergencyFundSummary)
def set_monthly_need(
    payload: MonthlyNeedUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget_service.set_emergency_monthly_need(db, user, payload.amount)
    return emergency_fund_service.summary(db, user)


@router.post(
    "/contributions", response_model=ContributionRead, status_code=status.HTTP_201_CREATED
)
def add_contribution(
    payload: ContributionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return emergency_fund_service.add_contribution(
        db, user, amount=payload.amount, occurred_on=payload.occurred_on
    )


@router.delete("/contributions/{contribution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contribution(
    contribution_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    if not emergency_fund_service.delete_contribution(db, user, contribution_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Aportación no encontrada"
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
