from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session

from app import schemas, models, utils, oauth2
from app.database import get_db


router = APIRouter(
    prefix="/users",
    tags=["users"]
)

#create user (FOR SIGNING UP IN FRONTEND)
@router.post("/", response_model=schemas.UserResponse,
             status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate,
                db: Session = Depends(get_db)):

    new_user = models.User(**user.model_dump())
    new_user.password = utils.hash_password(new_user.password)

    if not new_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="You did not put any data.")

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


#show current user (FOR SETTINGS IN FRONTEND)
@router.get("/me", response_model=schemas.UserResponse)
def show_current_user(current_user = Depends(oauth2.get_current_user)):

    return current_user


#update username (IN SETTINGS)
@router.put("/me/username", response_model=schemas.UserResponse)
def change_username(new_username: schemas.UserChangeUsername, 
                    db: Session = Depends(get_db),
                    current_user = Depends(oauth2.get_current_user)):

    user_query = db.query(models.User).filter(
        models.User.id == current_user.id)
    
    the_user = user_query.first()
    
    user_query.update({"username": new_username.username})

    db.commit()

    return the_user

#update password (IN SETTINGS)
@router.put("/me/password")
def change_password(user_credentials: schemas.UserChangePassword, 
                    db: Session = Depends(get_db),
                    current_user = Depends(oauth2.get_current_user)):

    if not utils.verify(plain_pwd= user_credentials.current_password,
                        hashed_pwd= current_user.password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                    detail= f"the current password you entered is wrong")

    hashed_new_password = utils.hash_password(user_credentials.new_password)
    current_user.password = hashed_new_password

    db.commit()
    db.refresh(current_user)

    return {"message": "The password was changed successfully"}

#DELETE CURRENT USER
@router.delete("/me/delete", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(db: Session = Depends(get_db),
                        current_user = Depends(oauth2.get_current_user)):

    db.delete(current_user)
    db.commit()

    return None




    