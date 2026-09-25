from fastapi import FastAPI
from . routers import users, auth, orders, orders_list

app = FastAPI()

@app.get("root")
def root():
    return {"message": "hello from root"}

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(orders_list.router)
