import pytest
from fastapi import status
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
def test_take_order(order_for_testing, authorized_client2):
    res = authorized_client2.put("/orders/1")

    res_json = res.json()

    assert res.status_code == 200
    assert res_json["message"] == "took order successfully"


def test_unauthorized_take_order(order_for_testing, client):
    res = client.put("/orders/1")

    res_json = res.json()

    assert res.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_my_order(authorized_client, order_for_testing):
    data = {
    "order_name": "book",
    "desc": "sahih albukhary",
    "payed_to_taker": "True",
    "received": "false"
    }

    res = authorized_client.patch("/orders/my_orders/1", json=data)

    res_json = res.json()

    assert res.status_code == 200
    assert res_json["order_name"] == data["order_name"]
    assert res_json["desc"] == data["desc"]


def test_update_other_human_order(authorized_client, order_for_testing2):
    data = {
    "order_name": "book",
    "desc": "sahih albukhary",
    "payed_to_taker": "True",
    "received": "false"
    }

    res = authorized_client.patch("/orders/my_orders/1", json=data)

    res_json = res.json()

    assert res.status_code == 404

def test_unauthorized_update_my_order(client, order_for_testing):
    data = {
    "order_name": "book",
    "desc": "sahih albukhary",
    "payed_to_taker": "True",
    "received": "false"
    }

    res = client.patch("/orders/my_orders/1", json=data)

    assert res.status_code == 401

