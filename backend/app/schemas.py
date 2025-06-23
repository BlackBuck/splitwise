from typing import Dict, List, Optional
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str

class UserOut(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class GroupCreate(BaseModel):
    name: str
    user_ids: List[int]

class GroupOut(BaseModel):
    id: int
    name: str
    user_ids: List[int]

    class Config:
        orm_mode = True

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: str  # "equal" or "percentage"
    splits: Optional[Dict[int, float]] = None  # only used for percentage

class Balance(BaseModel):
    user: int
    owes: List[dict]
