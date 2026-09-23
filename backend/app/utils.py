from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

def verify(plain_pwd, hashed_pwd): #pwd = password
    return pwd_context.verify(plain_pwd, hashed_pwd)