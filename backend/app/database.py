from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from .config import settings

SQL_DATABASE_URL = f'postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}'

engine = create_engine(url=SQL_DATABASE_URL)

Base = declarative_base()

SessionLocal = sessionmaker(autoflush=False,autocommit=False,
                            bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

