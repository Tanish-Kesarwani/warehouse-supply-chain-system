from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Database file ka rasta (SQLite use kar rahe hain simple setup ke liye)
SQLALCHEMY_DATABASE_URL = "sqlite:///./inventory_system.db"

# 2. Engine create karna jo DB se baat karega
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Har request ke liye ek naya session banane ka intezam
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Ye Base class hamari sari tables (Models) ko track karegi
Base = declarative_base()

# 5. Dependency: Ye function hum main.py mein use karenge DB access karne ke liye
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()