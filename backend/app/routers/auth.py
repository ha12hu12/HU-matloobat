from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app import utils
from app import oauth2

router = APIRouter(
    prefix="/login",
    tags=["login"]
)

@router.post("/")
def login(user_input: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    user = db.query(models.User).filter(
        models.User.username == user_input.username).first()

    if not user:
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                        detail= "Invalid input")

    if not utils.verify(user_input.password, user.password):
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                        detail= "Invalid input")

    return {"access_token": oauth2.create_access_token({
        "user_id": user.id}),
        "token_type": "bearer"}

