
from backend.database import engine, Base
from backend.models import CreditTransaction
from sqlalchemy import text

def reset_transactions():
    print("Dropping credit_transactions table...")
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS credit_transactions CASCADE"))
    
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    reset_transactions()
