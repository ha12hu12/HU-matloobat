from jose import jwt, JWTError
from datetime import datetime, timedelta

from fastapi.security.oauth2 import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.config import settings
from app import schemas
from app import database
from app import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/")

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
EXPIRE_TIME_MINUTES = settings.access_token_expire_minutes

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now() + timedelta(minutes=EXPIRE_TIME_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)

    return encoded_jwt

def verify_access_token(token: str, input_exception):

    try:
        payload = jwt.decode(token, SECRET_KEY, [ALGORITHM])
        payload_id = payload.get("user_id")

        if not payload_id:
            raise input_exception

        token_data = schemas.TokenData(id=payload_id)

    except JWTError:
        raise input_exception

    return token_data

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(database.get_db)):
    
    input_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authentication": "bearer"}
    )

    token = verify_access_token(token, input_exception)

    user = db.query(models.User).filter(
        models.User.id == token.id).first()

    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail="User not found")

    return user
