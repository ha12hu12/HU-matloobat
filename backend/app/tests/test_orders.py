import pytest
from fastapi import status
from app import models
from fastapi.exceptions import ResponseValidationError

def test_create_order(authorized_client):

    data = {
        "order_name": "testing machine",
        "desc": "this is from testing"
    }

    res = authorized_client.post("/orders/", json=data)

    res_data = res.json()

    assert res.status_code == 201
    assert res_data["order_name"] == data["order_name"]
    assert res_data["desc"] == data["desc"]

#Unauthorized
def test_unauthorized_create_order(client):

    data = {
        "order_name": "testing machine",
        "desc": "this is from testing"
    }

    res = client.post("/orders/", json=data)

    assert res.status_code == status.HTTP_401_UNAUTHORIZED

#-----TEST SHOW ALL ORDERS--------
def test_show_all_orders(authorized_client):
    res = authorized_client.get("/orders/")

    assert res.status_code == 200

def test_unauthorized_show_all_orders(client):
    res = client.get("/orders/")
    
    assert res.status_code == 401
    
#-----TEST SHOW ALL MY ORDERS--------
def test_show_all_my_orders(authorized_client, order_for_testing):
    res = authorized_client.get("/orders/my_orders")

    assert res.status_code == 200

def test_unauthorized_show_all_my_orders(client):
    res = client.get("/orders/my_orders")

    assert res.status_code == 401
    
#-----TEST TAKE ORDER--------
def test_take_order(order_for_testing, authorized_client2, session, user_for_testing2):
    session.query(models.Orders).filter(
        models.Orders.id == order_for_testing["id"]
    ).update({
        "is_took": True,
        "taken_by_id": user_for_testing2["id"],
    })
    session.commit()

    res = authorized_client2.put(f"/orders/{order_for_testing['id']}")

    res_json = res.json()

    assert res.status_code == 200
    assert res_json["message"] == "untook order successfully"


def test_unauthorized_take_order(order_for_testing, client):
    res = client.put(f"/orders/{order_for_testing['id']}")

    res_json = res.json()

    assert res.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_my_order(authorized_client, order_for_testing):
    data = {
    "order_name": "book",
    "desc": "sahih albukhary"
    }

    res = authorized_client.patch(
        f"/orders/my_orders/{order_for_testing['id']}", json=data
    )

    res_json = res.json()

    assert res.status_code == 200
    assert res_json["order_name"] == data["order_name"]
    assert res_json["desc"] == data["desc"]


def test_update_other_human_order(authorized_client, order_for_testing2):
    data = {
    "order_name": "book",
    "desc": "sahih albukhary"
    }

    res = authorized_client.patch(
        f"/orders/my_orders/{order_for_testing2['id']}", json=data
    )

    res_json = res.json()

    assert res.status_code == 404

def test_unauthorized_update_my_order(client, order_for_testing):
    data = {
    "order_name": "book",
    "desc": "sahih albukhary"
    }

    res = client.patch(
        f"/orders/my_orders/{order_for_testing['id']}", json=data
    )

    assert res.status_code == 401


def test_make_payed_true(authorized_client2, order_for_testing, session, user_for_testing2):
    order_id = order_for_testing["id"]
    session.query(models.Orders).filter(
        models.Orders.id == order_id
    ).update({
        "is_took": True,
        "taken_by_id": user_for_testing2["id"],
    })
    session.commit()

    res = authorized_client2.patch(
        f"/orders/orders_i_took/{order_id}",
        json={"payed_to_taker": True},
    )

    assert res.status_code == status.HTTP_200_OK
    assert res.json()["id"] == order_id
    assert res.json()["payed_to_taker"] is True


def test_unauthorized_make_payed_true(client, order_for_testing):
    res = client.patch(
        f"/orders/orders_i_took/{order_for_testing['id']}",
        json={"payed_to_taker": True},
    )

    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_make_received_true(authorized_client, order_for_testing):
    order_id = order_for_testing["id"]

    res = authorized_client.patch(
        f"/orders/my_orders/received/{order_id}",
        json={"received": True},
    )

    assert res.status_code == status.HTTP_200_OK
    assert res.json()["id"] == order_id
    assert res.json()["received"] is True


def test_unauthorized_make_received_true(client, order_for_testing):
    res = client.patch(
        f"/orders/my_orders/received/{order_for_testing['id']}",
        json={"received": True},
    )

    assert res.status_code == status.HTTP_401_UNAUTHORIZED


