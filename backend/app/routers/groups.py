from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import queries, schemas, database

router = APIRouter(prefix="/groups", tags=["groups"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/groups", response_model=schemas.GroupOut)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    return queries.create_group(db, group)

@router.get("/{group_id}", response_model=schemas.GroupOut)
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = queries.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {
        "id": group.id,
        "name": group.name,
        "user_ids": [user.id for user in group.users]
    }
