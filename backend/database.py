from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Switch to PostgreSQL for development
# Using current user name (macOS default for Homebrew Postgres)
SQLALCHEMY_DATABASE_URL = "postgresql://@localhost/kanata_academy"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
