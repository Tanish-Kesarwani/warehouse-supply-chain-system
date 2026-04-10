from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.inventory import Inventory
from models.warehouse import Warehouse
from models.product import Product
from schemas.inventory_schema import InventoryCreate, InventoryResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ADD INVENTORY
@router.post("/", response_model=InventoryResponse)
def create_inventory(inventory: InventoryCreate, db: Session = Depends(get_db)):

    warehouse = db.query(Warehouse).filter(
        Warehouse.warehouse_id == inventory.warehouse_id
    ).first()

    product = db.query(Product).filter(
        Product.product_id == inventory.product_id
    ).first()

    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_inventory = Inventory(
        warehouse_id=inventory.warehouse_id,
        product_id=inventory.product_id,
        quantity=inventory.quantity
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory


# GET ALL INVENTORY
@router.get("/", response_model=list[InventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()


# UPDATE INVENTORY QUANTITY
@router.put("/{inventory_id}", response_model=InventoryResponse)
def update_inventory(inventory_id: int, updated_data: InventoryCreate, db: Session = Depends(get_db)):
    inventory = db.query(Inventory).filter(
        Inventory.inventory_id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    inventory.warehouse_id = updated_data.warehouse_id
    inventory.product_id = updated_data.product_id
    inventory.quantity = updated_data.quantity

    db.commit()
    db.refresh(inventory)

    return inventory