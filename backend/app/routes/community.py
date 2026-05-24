from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.community import PostCreate, CommentCreate
from app.services.market_service import create_post, like_post, list_posts, create_comment, list_comments

router = APIRouter(tags=["community"])


@router.get("/community/posts")
def community_posts(db: Session = Depends(get_db)):
    return list_posts(db)


@router.post("/community/posts")
def add_community_post(
    payload: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_post(db, current_user, payload)


@router.post("/community/posts/{post_id}/like")
def add_like_to_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return like_post(db, current_user, post_id)


@router.get("/community/posts/{post_id}/comments")
def get_post_comments(
    post_id: int,
    db: Session = Depends(get_db)
):
    return list_comments(db, post_id)


@router.post("/community/posts/{post_id}/comments")
def add_comment_to_post(
    post_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_comment(db, current_user, post_id, payload.body)
