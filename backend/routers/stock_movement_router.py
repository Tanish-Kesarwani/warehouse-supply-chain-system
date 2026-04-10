from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import SessionLocal
from models.inventory import Inventory
from models.product import Product
from models.stock_movement import StockMovement
from models.warehouse import Warehouse
from schemas.stock_movement_schema import (
    StockMovementActionResponse,
    StockMovementCreate,
    StockMovementResponse,
)

router = APIRouter(prefix="/inventory", tags=["Stock Movement"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _process_stock_movement(
    db: Session, movement_data: StockMovementCreate, movement_type: str
) -> StockMovementActionResponse:
    try:
        # SQLite does not support row-level locks. BEGIN IMMEDIATE is used to
        # prevent concurrent writes while we validate and update stock.
        db.execute(text("BEGIN IMMEDIATE"))

        warehouse = (
            db.query(Warehouse)
            .filter(Warehouse.warehouse_id == movement_data.warehouse_id)
            .first()
        )
        if not warehouse:
            raise HTTPException(status_code=404, detail="Warehouse not found")

        product = (
            db.query(Product)
            .filter(Product.product_id == movement_data.product_id)
            .first()
        )
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.warehouse_id == movement_data.warehouse_id,
                Inventory.product_id == movement_data.product_id,
            )
            .first()
        )

        if movement_type == "INWARD":
            if not inventory:
                inventory = Inventory(
                    warehouse_id=movement_data.warehouse_id,
                    product_id=movement_data.product_id,
                    quantity=0,
                )
                db.add(inventory)
                db.flush()
            inventory.quantity += movement_data.quantity
        else:
            if not inventory:
                raise HTTPException(status_code=404, detail="Inventory record not found")
            if inventory.quantity < movement_data.quantity:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient stock for outward movement",
                )
            inventory.quantity -= movement_data.quantity

        movement = StockMovement(
            warehouse_id=movement_data.warehouse_id,
            product_id=movement_data.product_id,
            movement_type=movement_type,
            quantity=movement_data.quantity,
            reference_type=movement_data.reference_type,
            reference_id=movement_data.reference_id,
            remarks=movement_data.remarks,
            created_by=movement_data.created_by,
        )
        db.add(movement)
        db.commit()
        db.refresh(movement)
        db.refresh(inventory)

        return StockMovementActionResponse(
            message=f"{movement_type.title()} movement recorded successfully",
            movement=StockMovementResponse.model_validate(movement),
            current_quantity=inventory.quantity,
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process stock movement")


@router.post("/inward", response_model=StockMovementActionResponse)
def record_goods_inward(
    movement_data: StockMovementCreate, db: Session = Depends(get_db)
):
    return _process_stock_movement(db, movement_data, movement_type="INWARD")


@router.post("/outward", response_model=StockMovementActionResponse)
def record_goods_outward(
    movement_data: StockMovementCreate, db: Session = Depends(get_db)
):
    return _process_stock_movement(db, movement_data, movement_type="OUTWARD")
