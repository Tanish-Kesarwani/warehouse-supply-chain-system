from database import SessionLocal, engine
import models

# Tables create karo agar nahi bani hain
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        # 1. Dummy Warehouses add karna
        w1 = models.Warehouse(name="Noida Main", location="Sector 62")
        w2 = models.Warehouse(name="Delhi Hub", location="Okhla")
        db.add_all([w1, w2])
        db.commit()

        # 2. Dummy Products add karna
        p1 = models.Product(name="Laptop", sku="LAP123", category="Electronics", price=50000.0)
        p2 = models.Product(name="Mouse", sku="MOU456", category="Accessories", price=500.0)
        db.add_all([p1, p2])
        db.commit()

        # 3. Dummy Inventory (Stock) set karna
        # Laptop Noida mein 50, Delhi mein 20
        inv1 = models.Inventory(product_id=1, warehouse_id=1, stock_level=50)
        inv2 = models.Inventory(product_id=1, warehouse_id=2, stock_level=20)
        # Mouse Noida mein 100
        inv3 = models.Inventory(product_id=2, warehouse_id=1, stock_level=100)
        db.add_all([inv1, inv2, inv3])
        db.commit()

        # 4. Dummy Vendor aur Order (Product Summary Report ke liye)
        v1 = models.Vendor(name="Tech Supplies Corp", contact="tech@example.com")
        db.add(v1)
        db.commit()

        o1 = models.Order(product_id=1, vendor_id=1, quantity=10, status="Completed")
        o2 = models.Order(product_id=2, vendor_id=1, quantity=5, status="Completed")
        db.add_all([o1, o2])
        db.commit()

        print("Done! Database mein sample data bhar gaya hai.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()