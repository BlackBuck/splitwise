from sqlalchemy import select
from sqlalchemy.orm import Session
from . import models, schemas

def create_group(db: Session, group_data: schemas.GroupCreate):
    group = models.Group(name=group_data.name)
    group.users = db.query(models.User).filter(models.User.id.in_(group_data.user_ids)).all()
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

def get_group(db: Session, group_id: int):
    return db.query(models.Group).filter(models.Group.id == group_id).first()

def create_expense(db: Session, group_id: int, data: schemas.ExpenseCreate):
    expense = models.Expense(
        group_id=group_id,
        description=data.description,
        amount=data.amount,
        paid_by=data.paid_by,
        split_type=data.split_type,
        splits=data.splits if data.split_type == "percentage" else None
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def get_expenses(db: Session):
    return db.query(models.Expense).all()

def get_user_balances(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).all()

def get_expenses_for_group(db: Session, group_id: int):
    return db.query(models.Expense).filter(models.Expense.group_id == group_id).all()