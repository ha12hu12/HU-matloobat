from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models, utils, oauth2
from app.database import get_db

router = APIRouter(
    prefix="/orders_list",
    tags=["orders_list"]
)

# -------------------------------
#---------- ORDERS LIST ----------
# -------------------------------

#-----CREATE LIST----------
@router.post("/", response_model=schemas.OrdersListResponseAfterCreate,
            status_code=201)
def create_list(credentials: schemas.OrdersListCreate,
                db: Session = Depends(get_db),
                current_user = Depends(oauth2.get_current_user)):

    new_list = models.OrdersList(**credentials.model_dump())

    new_list.applicant_id = current_user.id
    new_list.applicant_name = current_user.username

    db.add(new_list)
    db.commit()

    return new_list

#-----SHOW ALL LISTS----------
@router.get("/", response_model=List[schemas.OrdersListResponseAfterCreate])
def show_all_lists(db: Session = Depends(get_db),
                current_user = Depends(oauth2.get_current_user)):

    lists = db.query(models.OrdersList).filter(
        models.OrdersList.is_took == False
    ).all()

    if not lists:
        raise HTTPException(404,
                        detail="There is no lists right now")
    
    return lists


#--------GET ONE LIST WITH ITS ORDERS-------
@router.get("/specific_list/{id}", 
            response_model=schemas.OrdersListWithOrdersResponse)
def show_specific_list(id: int,
                       db: Session = Depends(get_db),
                       current_user = Depends(oauth2.get_current_user)):

    list = db.query(models.OrdersList).filter(
        models.OrdersList.id == id
    ).first()

    if not list:
        raise HTTPException(404,
                        detail=f"The list with id: {id} does not exist")

    orders = db.query(models.OrdersListItems).filter(
        models.OrdersListItems.list_id == list.id
    ).all()

    if not orders:
        return {"list": list,
                "orders": "no orders"}

    return {"list": list,
            "items": orders}

#-----SHOW ALL MY LISTS----------
@router.get("/my_lists", response_model=List[schemas.OrdersListResponseAfterCreate])
def show_all_my_lists(db: Session = Depends(get_db),
                current_user = Depends(oauth2.get_current_user)):

    lists = db.query(models.OrdersList).filter(
        models.OrdersList.applicant_id == current_user.id,
        models.OrdersList.is_took == False
    ).all()

    if not lists:
        raise HTTPException(404,
                        detail="You dont have any lists")
    
    return lists

#--------GET ONE OF YOUR LISTS WITH ITS ORDERS-------
@router.get("/my_lists/{id}", 
            response_model=schemas.OrdersListWithOrdersResponse)
def show_specific_my_list(id: int,
                       db: Session = Depends(get_db),
                       current_user = Depends(oauth2.get_current_user)):

    list = db.query(models.OrdersList).filter(
        models.OrdersList.id == id,
        models.OrdersList.applicant_id == current_user.id
    ).first()

    if not list:
        raise HTTPException(404,
                        detail=f"The list with id: {id} does not exist")

    orders = db.query(models.OrdersListItems).filter(
        models.OrdersListItems.list_id == list.id
    ).all()

    if not orders:
        return {"list": list,
                "orders": "no orders"}

    return {"list": list,
            "items": orders}

#------DELETE LIST--------
@router.delete("/specific_list/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(id: int,
                current_user = Depends(oauth2.get_current_user),
                db: Session = Depends(get_db)):

    list = db.query(models.OrdersList).filter(
        models.OrdersList.id == id,
        models.OrdersList.applicant_id == current_user.id
    ).first()

    if not list:
        raise HTTPException(404,
                    detail=f"The id you entered: {id} does not exist or the list is not yours")

    db.delete(list)
    db.commit()

    return None

#------UPDATE LIST--------
@router.patch("/specific_list/{id}")
def update_list(id: int,
                credentials: schemas.OrdersListUpdate,
                current_user = Depends(oauth2.get_current_user),
                db: Session = Depends(get_db)):

    list_query = db.query(models.OrdersList).filter(
        models.OrdersList.id == id,
        models.OrdersList.applicant_id == current_user.id
    )

    list = list_query.first()
    
    if not list:
        raise HTTPException(404,
                    detail=f"The id you entered: {id} does not exist or the list is not yours")

    list_query.update({"list_name": credentials.list_name},
                      synchronize_session=False)

    db.commit()
    db.refresh(list)

    return list

# -------------------------------
#---------- LIST ITEMS ----------
# -------------------------------

#-----ADD ITEM (ORDER) IN LIST----------
@router.post("/add_order", response_model=schemas.OrderListItemsResponse)
def add_item_in_list(credentials: schemas.OrdersListItemAdd,
                db: Session = Depends(get_db),
                current_user = Depends(oauth2.get_current_user)):

    new_order = models.OrdersListItems(**credentials.model_dump())

    db.add(new_order)
    db.commit()

    return new_order

#------DELETE ORDER IN LIST--------
@router.delete("/specific_list/{list_id}/specific_order/{id}", 
               status_code=status.HTTP_204_NO_CONTENT)
def delete_order_in_list(list_id: int,
                        id: int,
                        current_user = Depends(oauth2.get_current_user),
                        db: Session = Depends(get_db)):

    order = db.query(models.OrdersListItems).filter(
        models.OrdersListItems.id == id,
        models.OrdersListItems.list_id == list_id
    ).first()

    list = db.query(models.OrdersList).filter(
    models.OrdersList.id == list_id,
    models.OrdersList.applicant_id == current_user.id
    ).first()

    if not list:
        raise HTTPException(404,
                        detail="This list is not yours or it doesn't exist")

    if not order:
        raise HTTPException(404,
                    detail=f"The order with the id: {id} does not exist")

    db.delete(order)
    db.commit()

    return None

#------UPDATE ORDER IN LIST--------
@router.patch("/specific_list/{list_id}/specific_order/{id}", 
              response_model=schemas.BaseForItem)
def update_order_in_list(list_id: int,
                        id: int,
                        credentials: schemas.UpdateItem,
                        current_user = Depends(oauth2.get_current_user),
                        db: Session = Depends(get_db)):

    order_query = db.query(models.OrdersListItems).filter(
        models.OrdersListItems.id == id,
        models.OrdersListItems.list_id == list_id
    )

    order = order_query.first()

    list = db.query(models.OrdersList).filter(
    models.OrdersList.id == list_id,
    models.OrdersList.applicant_id == current_user.id
    ).first()

    if not list:
        raise HTTPException(404,
                        detail="This list is not yours or it doesn't exist")

    if not order:
        raise HTTPException(404,
                    detail=f"The order with the id: {id} does not exist")

    dumped_credentials = credentials.model_dump(exclude_unset=True)

    for key, value in dumped_credentials.items():
        setattr(order, key, dumped_credentials[f"{key}"])

    db.commit()
    db.refresh(order)

    return order

# ----DONE ONE ITEM ORDERS LIST-----
@router.patch("/orders_i_took/list/{list_id}/item/{id}", response_model=schemas.BaseForItem)
def done_item_in_list(credentials: schemas.DoneItem,
                 id: int,
                 list_id: int,
                 db: Session = Depends(get_db),
                 current_user = Depends(oauth2.get_current_user)):

    item_query = db.query(models.OrdersListItems).filter(
        models.OrdersListItems.id == id,
        models.OrdersListItems.list_id == list_id)

    item = item_query.first()

    list = db.query(models.OrdersList).filter(
    models.OrdersList.id == list_id,
    models.OrdersList.applicant_id == current_user.id).first()

    if not list:
        raise HTTPException(404,
                    detail="This list is not yours or it doesn't exist")

    if not item:
        raise HTTPException(404,
                    detail=f"The order with the id: {id} does not exist")

    item_query.update({"done": credentials.done})

    db.commit()
    db.refresh(item)

    return item

#----------TAKE ORDERS LIST------
@router.put("/{id}", response_model=schemas.BaseForList)
def take_orders_list(id: int, db: Session = Depends(get_db),
               current_user = Depends(oauth2.get_current_user)):

    # 1. جلب استعلام الطلب بناءً على الـ ID
    orders_list_query = db.query(models.OrdersList).filter(models.OrdersList.id == id)
    orders_list = orders_list_query.first()

    # 2. التحقق من وجود الطلب في قاعدة البيانات
    if not orders_list:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail="You entered a wrong id")

    # 3. منع المستخدم من أخذ أو التعديل على طلباته الشخصية
    if orders_list.applicant_id == current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                            detail="You cant take your own orders list")

    # --- الحالة الأولى: إلغاء أخذ الطلب (UNTAKE ORDER) ---
    if orders_list.is_took == True:
        if orders_list.taken_by_id == current_user.id:
            orders_list_query.update({"is_took": False, "taken_by_id": None}, 
                                     synchronize_session=False)
            db.commit()
            db.refresh(orders_list)
            
            # نُرجع كائن الطلب مباشرة ليتوافق مع schemas.BaseForList
            return orders_list
        else:
            raise HTTPException(status.HTTP_403_FORBIDDEN,
                                detail="this orders list is taken by another user")

    # --- الحالة الثانية: أخذ الطلب (TAKE ORDER) ---
    else:
        orders_list_query.update({"is_took": True, "taken_by_id": current_user.id}, 
                                 synchronize_session=False)
        db.commit()
        db.refresh(orders_list)
        
        # نُرجع كائن الطلب المحدث ليتوافق مع schemas.BaseForList
        return orders_list


    



    


