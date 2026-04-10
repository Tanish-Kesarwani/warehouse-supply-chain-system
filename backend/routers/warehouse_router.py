from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.warehouse import Warehouse
from schemas.warehouse_schema import WarehouseCreate, WarehouseResponse

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE Warehouse
@router.post("/", response_model=WarehouseResponse)
def create_warehouse(warehouse: WarehouseCreate, db: Session = Depends(get_db)):
    new_warehouse = Warehouse(
        name=warehouse.name,
        location=warehouse.location,
        capacity=warehouse.capacity
    )
    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)
    return new_warehouse


# GET All Warehouses
@router.get("/", response_model=list[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()


# UPDATE Warehouse
@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(warehouse_id: int, updated_data: WarehouseCreate, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()

    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    warehouse.name = updated_data.name
    warehouse.location = updated_data.location
    warehouse.capacity = updated_data.capacity

    db.commit()
    db.refresh(warehouse)
    return warehouse


# DELETE Warehouse
@router.delete("/{warehouse_id}")
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()

    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    db.delete(warehouse)
    db.commit()

    return {"message": "Warehouse deleted successfully"}