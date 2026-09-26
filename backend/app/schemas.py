from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

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
    desc: Optional[str] = None
    applicant_name: str
    created_at: datetime
    
class OrderResponse(OrderResponseAfterCreate):
    is_took: bool
    taken_by_id: Optional[int] = None
    payed_to_taker: bool
    received: bool
    done: bool
    created_at: datetime

class OrderResponseAfterTake(BaseModel):
    message: str
    order: OrderResponse

class OrderCreate(BaseModel):
    order_name: str
    desc: Optional[str] = None

class OrderUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    order_name: Optional[str] = None
    desc: Optional[str] = None
    payed_to_taker: Optional[bool] = False
    received: Optional[bool] = False


#-------------ORDERS_LIST SCHEMAS----------
class OrdersListResponseAfterCreate(BaseModel):
    id: int
    list_name: str
    applicant_name: str
    created_at: datetime

class OrdersListShowOrdersITook(BaseModel):
    orders: List[OrderResponse]
    orders_lists: List[OrdersListResponseAfterCreate]

class OrdersListCreate(BaseModel):
    list_name: str

class BaseForList(BaseModel):
    id: int
    list_name: str
    applicant_name: str
    is_took: bool
    taken_by_id: Optional[int]
    created_at: datetime

class BaseForItem(BaseModel):
    id: int
    order_name: str
    done: bool
    price: Optional[float]
    created_at: datetime

class OrdersListWithOrdersResponse(BaseModel):
    list: BaseForList
    items: Optional[List[BaseForItem]] = None

class OrdersListUpdate(BaseModel):
    list_name: Optional[str]

#-------------ORDERS_LIST_ITEMS SCHEMAS----------
class OrderListItemsResponse(BaseModel):
    id: int
    order_name: str
    list_id: int
    price: float
    created_at: datetime

class OrdersListItemAdd(BaseModel):
    list_id: int
    order_name: str
    price: float

class OrdersListItemDelete(BaseModel):
    list_id: int

class BaseForList(BaseModel):
    id: int
    list_name: str
    applicant_name: str
    is_took: bool
    taken_by_id: Optional[int]
    created_at: datetime

class BaseForItem(BaseModel):
    id: int
    order_name: str
    done: bool
    price: Optional[float]
    created_at: datetime

class OrdersListWithItemsResponse(BaseModel):
    list: BaseForList
    items: Optional[List[BaseForItem]] = None

class UpdateItem(BaseModel):
    order_name: Optional[str]

class DoneItem(BaseModel):
    done: bool






