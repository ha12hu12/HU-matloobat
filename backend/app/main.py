from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . routers import users, auth, orders, orders_list

app = FastAPI()

origins = [
    "http://localhost:5173",            # للتطوير المحلي على جهازك
    "https://hu-matloobat.vercel.app",  # رابط تطبيق الـ Frontend المرفوع على Vercel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("root")
def root():
    return {"message": "hello from root"}

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(orders_list.router)
