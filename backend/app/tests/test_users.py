import pytest
from fastapi import status

#-----------TEST CREATE USER--------------

def test_create_user(client):
    data = {
        "username": "test hussein",
        "password": "test_password123"
    }

    res = client.post("/users/", json=data)

    assert res.status_code == 201


@pytest.mark.parametrize("username, password", [
    (None, "testing_password123"),
    ("testing_username", None)
])
def test_create_user_incomplete_inputs(client, username, password):
    data = {
        "username": username,
        "password": password
    }

    res = client.post("/users/", json=data)

    assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

#------------TEST SHOW CURRENT USER------------

def test_show_current_user(authorized_client):
    res = authorized_client.get("/users/me")

    res_data = res.json()

    assert res.status_code == 200

#------------TEST UPDATE USERNAME-----------

def test_update_username(authorized_client):
    res = authorized_client.put("users/me/username", 
                                json={"username": "husam"})

    res_data = res.json()

    assert res.status_code == 200
    assert res_data["username"] == "husam"


def test_update_username_incomplete_data(authorized_client):
    res = authorized_client.put("users/me/username", 
                                json={"username": None})

    assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

#---------TEST UPDATE PASSWORD---------

def test_change_password(authorized_client):
    data = {
        "current_password": "LetsTest!!",
        "new_password": "new_44password123"
    }

    res = authorized_client.put("users/me/password", json=data)

    res_data = res.json()

    assert res.status_code == 200
    assert res_data["message"] == 'The password was changed successfully'


@pytest.mark.parametrize("current_password, new_password", [
    (None, "new_44password123"),
    ("LetsTest!!", None),
    (None, None)
])
def test_change_password_incomplete_data(authorized_client, current_password, 
                                         new_password):

    data = {
        "current_password": current_password,
        "new_password": new_password
    }

    res = authorized_client.put("users/me/password", json=data)

    assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_password_wrong_current_password(authorized_client):
    data = {
        "current_password": "wrong_current_password",
        "new_password": "new_44password123"
    }

    res = authorized_client.put("users/me/password", json=data)

    assert res.status_code == status.HTTP_400_BAD_REQUEST




