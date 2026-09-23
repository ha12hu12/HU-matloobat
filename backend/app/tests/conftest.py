import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.oauth2 import create_access_token

from fastapi.testclient import TestClient

SQL_TEST_DATABASE_URL = f'''postgresql://{settings.database_username}:{settings.
database_password}@{settings.database_hostname}:{settings.
database_port}/{settings.database_name}_test'''

engine = create_engine(SQL_TEST_DATABASE_URL)

TestSessionLocal = sessionmaker(bind=engine, autoflush=False, 
                                autocommit=False)

@pytest.fixture
def session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    try:
        db = TestSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture
def client(session):
    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)


@pytest.fixture
def user_for_testing(client):

    user_data = {
        "username": "hussein_testing",
        "password": "LetsTest!!"
    }

    res = client.post("/users/", json=user_data)
    assert res.status_code == 201

    new_user = res.json()

    new_user["password"] = user_data["password"]

    return new_user


@pytest.fixture
def token(user_for_testing):
    return create_access_token({"user_id": user_for_testing["id"]})


@pytest.fixture
def authorized_client(token):
    client = TestClient(app)
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {token}"
    }

    return client


@pytest.fixture
def order_for_testing(authorized_client):

    order_data = {
        "order_name": "Testing book",
        "desc": "this is from testing"
    }

    res = authorized_client.post("/orders/", json=order_data)
    assert res.status_code == 201

    new_order = res.json() #applicant name hussein

    return new_order


#--------2---------

@pytest.fixture
def user_for_testing2(client):

    user_data = {
        "username": "hassan_testing",
        "password": "LetsTest!!"
    }

    res = client.post("/users/", json=user_data)
    assert res.status_code == 201

    new_user = res.json()

    new_user["password"] = user_data["password"]

    return new_user

@pytest.fixture
def token2(user_for_testing2):
    return create_access_token({"user_id": user_for_testing2["id"]})

@pytest.fixture
def authorized_client2(client, token2):
    client2 = TestClient(app)
    client2.headers = {
        **client.headers,
        "Authorization": f"Bearer {token2}"
    }

    return client2

@pytest.fixture
def order_for_testing2(authorized_client2):

    order_data = {
        "order_name": "Testing book",
        "desc": "this is from testing"
    }

    res = authorized_client2.post("/orders/", json=order_data)
    assert res.status_code == 201

    new_order = res.json() #applicant name hassan

    return new_order

