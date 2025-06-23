from http.client import HTTPException
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database

router = APIRouter(tags=["balances"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/users/{user_id}/balances")
def get_user_balances(user_id: int, db: Session = Depends(get_db)):
    groups = db.query(models.Group).join(models.Group.users).filter(models.User.id == user_id).all()
    result = []

    for group in groups:
        # fetch all expenses in this group
        expenses = db.query(models.Expense).filter(models.Expense.group_id == group.id).all()
        user_ids = [u.id for u in group.users]

        balances = {uid: 0 for uid in user_ids}
        for exp in expenses:
            amt = exp.amount
            paid_by = exp.paid_by

            if exp.split_type == "equal":
                share = amt / len(user_ids)
                for uid in user_ids:
                    balances[uid] -= share
                balances[paid_by] += amt
            elif exp.split_type == "percentage":
                splits = exp.splits or {}
                for uid, percent in splits.items():
                    share = exp.amount * (percent / 100)
                    balances[int(uid)] -= share
                balances[exp.paid_by] += exp.amount


        owes = []
        for other_id, net in balances.items():
            if other_id != user_id and net < 0:
                owes.append({"group": group.name, "to": other_id, "amount": round(-net, 2)})
            elif other_id != user_id and net > 0:
                owes.append({"group": group.name, "from": other_id, "amount": round(net, 2)})

        result.extend(owes)

    return result

@router.get("/groups/{group_id}/balances")
def get_group_balances(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    users = group.users
    expenses = db.query(models.Expense).filter(models.Expense.group_id == group_id).all()

    balances = {user.id: 0.0 for user in users}
    for exp in expenses:
        if exp.split_type == "equal":
            share = exp.amount / len(users)
            for u in users:
                balances[u.id] -= share
            balances[exp.paid_by] += exp.amount
        elif exp.split_type == "percentage":
            splits = exp.splits or {}
            for uid, percent in splits.items():
                balances[int(uid)] -= exp.amount * (percent / 100)
            balances[exp.paid_by] += exp.amount

    result = []
    for uid in balances:
        owes = []
        for other_id in balances:
            if uid != other_id:
                diff = balances[uid] - balances[other_id]
                if diff < 0:
                    owes.append({"user": other_id, "amount": round(-diff / 2, 2)})
        result.append({"user": uid, "owes": owes})

    return result
