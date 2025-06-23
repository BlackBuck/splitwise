from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import groups, balances, expenses
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Splitwise Clone API")

# Allow frontend CORS (port 5173)
origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)