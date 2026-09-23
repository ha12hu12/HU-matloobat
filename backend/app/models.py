from .database import Base
from sqlalchemy import text, Column, Boolean, Integer, String, TIMESTAMP, func, ForeignKey

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String(15), unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), 
                        server_default=func.now())

class Orders(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, nullable=False)

    order_name = Column(String(15), nullable=False)

    desc = Column(String(200))
    
    applicant_id = Column(ForeignKey(column="users.id", 
                         ondelete="CASCADE"), nullable=False)

    applicant_name = Column(ForeignKey(column="users.username",
                                    ondelete="CASCADE"), nullable=False)

    is_took = Column(Boolean, nullable=False, 
                     server_default="FALSE")

    taken_by_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    
    payed_to_taker = Column(Boolean, nullable=False, 
                            server_default=text("FALSE"))

    received = Column(Boolean, nullable=False, 
                      server_default=text("FALSE"))

    done = Column(Boolean, nullable=False, 
                  server_default=text("FALSE"))

    