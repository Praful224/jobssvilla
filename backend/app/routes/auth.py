from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)
from app.models.user import User
from app.models.user_role import UserRole
from app.config.database import get_db
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)

router = APIRouter(tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if user.role == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked by the administrator.",
        )

    return user


@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered",
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role="student"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Dynamic UserRole Relational mapping
    requested_role = (user.role or "student").lower()
    
    if requested_role in ["student", "admin"] or user.email.lower() == "praful@gmail.com":
        role_entry = UserRole(
            user_id=new_user.id,
            role="admin" if user.email.lower() == "praful@gmail.com" else requested_role,
            status="active"
        )
        db.add(role_entry)
        db.commit()
    else:
        student_role = UserRole(
            user_id=new_user.id,
            role="student",
            status="active"
        )
        pending_role = UserRole(
            user_id=new_user.id,
            role=requested_role,
            status="pending",
            verification_details=user.verification_details or "Selected during registration."
        )
        db.add(student_role)
        db.add(pending_role)
        db.commit()

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
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if db_user.role == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked by the administrator."
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
