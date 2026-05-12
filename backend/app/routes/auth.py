from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import (
    UserCreate,
    
)
from app.schemas.user import UserCreate
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)
from app.models.user import User
from fastapi.security import OAuth2PasswordBearer
from app.config.database import get_db
from fastapi import Header
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)

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
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        return {
            "error": "Invalid email"
        }

    if not verify_password(
        form_data.password,
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
@router.get("/profile")
def profile(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    email = verify_token(token)

    if not email:
        return {
            "error": "Invalid token"
        }

    user = db.query(User).filter(
        User.email == email
    ).first()
    if not user:
        return {
            "error": "User not found"
        }
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }