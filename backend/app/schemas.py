from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

#-------------USER SCHEMAS----------

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

class UserChangeUsername(BaseModel):
    username: str

class UserChangePassword(BaseModel):
    new_password: str
    current_password: str


#-------------LOGIN/TOKEN SCHEMAS----------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None


#-------------ORDER SCHEMAS----------

class OrderResponseAfterCreate(BaseModel):
    id: int
    order_name: str
    desc: str
    applicant_id: int
    applicant_name: str
    
class OrderResponse(OrderResponseAfterCreate):
    is_took: bool
    taken_by_id: Optional[int] = None
    payed_to_taker: bool
    received: bool
    done: bool

class OrderResponseAfterTake(BaseModel):
    message: str
    order: OrderResponse

class OrderCreate(BaseModel):
    order_name: str
    desc:  str

class OrderUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    order_name: str = None
    desc: str = None
    payed_to_taker: bool = None
    received: bool = None