from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import (
    UserCreate,
    UserLogin
)

from app.models.user import User

from app.config.database import get_db

from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter()

@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        return {
            "error": "Invalid email"
        }

    if not verify_password(
        user.password,
        db_user.password
    ):
        return {
            "error": "Invalid password"
        }

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }