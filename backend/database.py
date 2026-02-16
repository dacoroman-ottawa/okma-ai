from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Using SQLite for development simplicity (Can be switched to PostgreSQL later)
SQLALCHEMY_DATABASE_URL = "sqlite:///./kanata_academy.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
