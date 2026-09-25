from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models, utils, oauth2
from app.database import get_db


router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

#--------CREATE ORDER------------

@router.post("/", response_model=schemas.OrderResponseAfterCreate, status_code=201)
def create_order(credentials: schemas.OrderCreate,
                 db: Session = Depends(get_db),
                 current_user = Depends(oauth2.get_current_user)):

    new_order = models.Orders(order_name=credentials.order_name,
                              desc=credentials.desc)

    new_order.applicant_id = current_user.id
    new_order.applicant_name = current_user.username

    db.add(new_order)
    db.commit()

    return new_order


#--------SHOW ALL ORDERS------------

@router.get("/", response_model=List[schemas.OrderResponse])
def show_all_orders(db: Session = Depends(get_db),
                    current_user: int = Depends(oauth2.get_current_user),
                    search_order_name: str = ""):
    
    orders = db.query(models.Orders).filter(
        models.Orders.order_name.contains(search_order_name)
    ).all()

    return orders


#--------SHOW ALL MY ORDERS------------

@router.get("/my_orders", response_model=List[schemas.OrderResponse])
def show_all_my_orders(db: Session = Depends(get_db),    
                    current_user = Depends(oauth2.get_current_user),
                    search_order_name: str = ""):
    
    orders = db.query(models.Orders).filter(
        models.Orders.applicant_id == current_user.id).filter(
            models.Orders.order_name.contains(search_order_name)
        ).all()

    if not orders:
        raise HTTPException(404,
                        detail="You dont  have anyorders")

    return orders
 

#----------TAKE ORDER------
@router.put("/{id}", response_model= schemas.OrderResponseAfterTake)
def take_order(id: int, db: Session = Depends(get_db),
               current_user = Depends(oauth2.get_current_user)):

    order_query = db.query(models.Orders).filter(
        models.Orders.id == id
    )

    order = order_query.first()

    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                        detail="You entered a wrong id")

    if order.applicant_id == current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                            detail="You cant take your own order")

    #UNTAKE ORDER:
    #bc if taken_by_id has a value so is_took is True, so if you want to
    #untake the order its gonna check if its taken and if you are the taker
    if order.is_took == True:
        if order.taken_by_id == current_user.id:
            order_query.update({"is_took": False, "taken_by_id": None}, 
                    synchronize_session=False)
            
            db.commit()
            db.refresh(order)
            
            return {"message": "untook order successfully",
                "order": order}

        else:
            raise HTTPException(status.HTTP_403_FORBIDDEN,
                        detail="this order is taken")

    #TAKE ORDER
    
    order_query.update({"is_took": True, "taken_by_id": current_user.id}, 
                    synchronize_session=False)

    db.commit()
    db.refresh(order)

    return {"message": "took order successfully",
            "order": order}

#--------SHOW ALL THE ORDERS I HAVE TAKEN------------

@router.get("/orders_i_took", 
            response_model=schemas.OrdersListShowOrdersITook)
def show_all_taken_orders_by_me(db: Session = Depends(get_db),    
                    current_user = Depends(oauth2.get_current_user),
                    search_order_name: str = ""):
    
    orders = db.query(models.Orders).filter(
        models.Orders.taken_by_id == current_user.id).filter(
            models.Orders.order_name.contains(search_order_name)
        ).all()

    orders_lists = db.query(models.OrdersList).filter(
        models.OrdersList.taken_by_id == current_user.id).filter(
            models.OrdersList.list_name.contains(search_order_name)
        ).all()
    
    if not orders and not orders_lists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="You didn't take anything")

    return {"orders": orders,
            "orders_lists": orders_lists}

# ----UPDATE MY ORDER-----
@router.patch("/my_orders/{id}", response_model=schemas.OrderResponse)
def update_order(order_credentials: schemas.OrderUpdate,
                 id: int,
                 db: Session = Depends(get_db),
                 current_user = Depends(oauth2.get_current_user)):

    order = db.query(models.Orders).filter(
        models.Orders.id == id,
        models.Orders.applicant_id == current_user.id).first()

    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail="wrong id")
    
    dumped_credentials = order_credentials.model_dump(exclude_unset=True)

    for key, value in dumped_credentials.items():
        setattr(order, key, dumped_credentials[f"{key}"])

    if order.payed_to_taker == True and order.received == True:
        order.done = True

    else:
        order.done = False
    
    db.commit()
    db.refresh(order)

    return order





    