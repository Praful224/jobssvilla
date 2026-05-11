from fastapi import FastAPI

from app.config.database import engine, Base
from app.models.user import User

from app.routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "JobsVilla Backend Running"}