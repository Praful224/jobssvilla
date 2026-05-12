from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine

from app.models.user import User
from app.models.job import Job

from app.routes.auth import router as auth_router
from app.routes.job import router as job_router


Base.metadata.create_all(bind=engine)

app = FastAPI()


# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ROOT API

@app.get("/")
def home():

    return {
        "message": "JobsVilla Backend Running"
    }


# ROUTERS

app.include_router(auth_router)

app.include_router(job_router)