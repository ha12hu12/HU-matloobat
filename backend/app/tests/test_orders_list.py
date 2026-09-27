import pytest
from fastapi import status

#-----------TEST CREATE LIST--------------
def test_create_list(authorized_client):
    res = authorized_client.post("/orders_list/", json={"list_name": "Monthly groceries"})

    assert res.status_code == status.HTTP_201_CREATED
    res_data = res.json()
    assert res_data["list_name"] == "Monthly groceries"
    assert res_data["applicant_name"] == "hussein_testing"

#-----------TEST UNAUTHORIZED CREATE LIST--------------
def test_unauthorized_create_list(client):
    res = client.post("/orders_list/", json={"list_name": "Monthly groceries"})

    assert res.status_code == status.HTTP_401_UNAUTHORIZED

#-----------TEST SHOW ALL LISTS--------------
def test_show_all_lists(authorized_client):
    created = authorized_client.post(
        "/orders_list/", json={"list_name": "Monthly groceries"}
    )
    list_id = created.json()["id"]
    authorized_client.post(
        "/orders_list/add_order",
        json={"list_id": list_id, "order_name": "milk", "price": 12.5},
    )

    res = authorized_client.get("/orders_list/")

    assert res.status_code == status.HTTP_200_OK
    matching_list = next(
        item for item in res.json() if item["list_name"] == "Monthly groceries"
    )
    assert matching_list["total_price"] == 12.5

#-----------TEST SHOW SPECIFIC LIST--------------
def test_show_specific_list(authorized_client):
    created = authorized_client.post("/orders_list/", json={"list_name": "Family list"})
    list_id = created.json()["id"]

    res = authorized_client.get(f"/orders_list/specific_list/{list_id}")

    assert res.status_code == status.HTTP_200_OK
    assert res.json()["list"]["id"] == list_id
    assert res.json()["list"]["list_name"] == "Family list"
    assert res.json()["list"]["total_price"] == 0

#-----------TEST ADD AND DELETE ITEM IN LIST--------------
def test_add_and_delete_item_in_list(authorized_client):
    created = authorized_client.post("/orders_list/", json={"list_name": "Family list"})
    list_id = created.json()["id"]

    add_item = authorized_client.post(
        "/orders_list/add_order",
        json={"list_id": list_id, "order_name": "milk", "price": 12.5},
    )
    assert add_item.status_code == status.HTTP_200_OK

    item_id = add_item.json()["id"]
    specific = authorized_client.get(f"/orders_list/specific_list/{list_id}")
    assert specific.status_code == status.HTTP_200_OK
    assert specific.json()["items"][0]["order_name"] == "milk"
    assert specific.json()["list"]["total_price"] == 12.5

    delete_item = authorized_client.delete(
        f"/orders_list/specific_list/{list_id}/specific_order/{item_id}"
    )
    assert delete_item.status_code == status.HTTP_204_NO_CONTENT

    after_delete = authorized_client.get(f"/orders_list/specific_list/{list_id}")
    assert after_delete.status_code == status.HTTP_200_OK
    assert after_delete.json()["list"]["total_price"] == 0


#-----------TEST TOTAL PRICE FOR MULTIPLE ITEMS--------------
def test_total_price_for_multiple_items(authorized_client):
    created = authorized_client.post("/orders_list/", json={"list_name": "Family list"})
    list_id = created.json()["id"]

    for order_name, price in (("milk", 12.5), ("bread", 5.0)):
        res = authorized_client.post(
            "/orders_list/add_order",
            json={"list_id": list_id, "order_name": order_name, "price": price},
        )
        assert res.status_code == status.HTTP_200_OK

    res = authorized_client.get(f"/orders_list/specific_list/{list_id}")

    assert res.status_code == status.HTTP_200_OK
    assert res.json()["list"]["total_price"] == 17.5

#-----------TEST UPDATE LIST NAME--------------
def test_update_list_name(authorized_client):
    created = authorized_client.post("/orders_list/", json={"list_name": "Family list"})
    list_id = created.json()["id"]

    res = authorized_client.patch(
        f"/orders_list/specific_list/{list_id}",
        json={"list_name": "Updated family list"},
    )

    assert res.status_code == status.HTTP_200_OK
    assert res.json()["list_name"] == "Updated family list"

#-----------TEST MARK ITEM AS DONE--------------
def test_done_item_in_list(authorized_client, authorized_client2):
    created = authorized_client.post("/orders_list/", json={"list_name": "Family list"})
    list_id = created.json()["id"]

    add_item = authorized_client.post(
        "/orders_list/add_order",
        json={"list_id": list_id, "order_name": "milk", "price": 12.5},
    )
    assert add_item.status_code == status.HTTP_200_OK

    take_list = authorized_client2.put(f"/orders_list/{list_id}")
    assert take_list.status_code == status.HTTP_200_OK

    item_id = add_item.json()["id"]

    res = authorized_client2.patch(
        f"/orders_list/orders_i_took/list/{list_id}/item/{item_id}",
        json={"done": True},
    )

    assert res.status_code == status.HTTP_200_OK
    assert res.json()["id"] == item_id
    assert res.json()["done"] is True

#-----------TEST UNAUTHORIZED MARK ITEM AS DONE--------------
def test_unauthorized_done_item_in_list(client):
    res = client.patch(
        "/orders_list/orders_i_took/list/1/item/1",
        json={"done": True},
    )

    assert res.status_code == status.HTTP_401_UNAUTHORIZED

#-----------TEST MARK ITEM AS DONE FOR A LIST THAT DOES NOT EXIST--------------
def test_done_item_in_list_list_not_found(authorized_client):
    res = authorized_client.patch(
        "/orders_list/orders_i_took/list/999999/item/1",
        json={"done": True},
    )

    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert res.json()["detail"] == "This list doesn't exist"

#-----------TEST MARK ITEM AS DONE FOR AN ITEM THAT DOES NOT EXIST--------------
def test_done_item_in_list_item_not_found(authorized_client, authorized_client2):
    created = authorized_client.post("/orders_list/", json={"list_name": "Family list"})
    list_id = created.json()["id"]

    take_list = authorized_client2.put(f"/orders_list/{list_id}")
    assert take_list.status_code == status.HTTP_200_OK

    res = authorized_client2.patch(
        f"/orders_list/orders_i_took/list/{list_id}/item/999999",
        json={"done": True},
    )

    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert res.json()["detail"] == "The order with the id: 999999 does not exist"

#-----------TEST MARK ITEM AS DONE FOR OTHER USER'S LIST--------------
def test_done_item_in_list_not_taker(authorized_client, authorized_client2):
    created = authorized_client.post("/orders_list/", json={"list_name": "Family list"})
    list_id = created.json()["id"]

    add_item = authorized_client.post(
        "/orders_list/add_order",
        json={"list_id": list_id, "order_name": "milk", "price": 12.5},
    )
    assert add_item.status_code == status.HTTP_200_OK

    res = authorized_client2.patch(
        f"/orders_list/orders_i_took/list/{list_id}/item/{add_item.json()['id']}",
        json={"done": True},
    )

    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert res.json()["detail"] == "This list doesn't exist"
