from app.database import SessionLocal, engine
from app import models

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create Users
users = [
    models.User(name="Alice"),
    models.User(name="Bob"),
    models.User(name="Charlie"),
]
db.add_all(users)
db.commit()

# Create Group
group = models.Group(name="Goa Trip", users=users)
db.add(group)
db.commit()
db.refresh(group)

# Add Equal Expense
db.add(models.Expense(
    group_id=group.id,
    description="Dinner",
    amount=1500.0,
    paid_by=users[0].id,
    split_type="equal",
    splits=None
))

# Add Percentage Expense
db.add(models.Expense(
    group_id=group.id,
    description="Hotel",
    amount=3000.0,
    paid_by=users[1].id,
    split_type="percentage",
    splits={str(users[0].id): 40, str(users[1].id): 40, str(users[2].id): 20}
))

db.commit()
print("🌱 Database seeded with users, group, and expenses.")

db.close()
