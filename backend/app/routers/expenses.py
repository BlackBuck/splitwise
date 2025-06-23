from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(prefix="/groups/{group_id}/expenses", tags=["expenses"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def add_expense(group_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if expense.split_type not in ["equal", "percentage"]:
        raise HTTPException(status_code=400, detail="Invalid split type")

    if expense.paid_by not in [user.id for user in group.users]:
        raise HTTPException(status_code=400, detail="Payer not part of group")

    if expense.split_type == "percentage":
        if not expense.splits:
            raise HTTPException(status_code=400, detail="Missing splits")
        total = sum(expense.splits.values())
        if total != 100:
            raise HTTPException(status_code=400, detail="Percentage splits must add up to 100")

    new_expense = models.Expense(
        group_id=group_id,
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        split_type=expense.split_type,
        splits=expense.splits if expense.split_type == "percentage" else None
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return {"message": "Expense added", "expense_id": new_expense.id}
