from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.purchase_order import PurchaseOrder, PurchaseOrderItem
from models.vendor import Vendor
from models.warehouse import Warehouse
from models.product import Product
from schemas.purchase_order_schema import PurchaseOrderCreate

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE PURCHASE ORDER
@router.post("/")
def create_purchase_order(order: PurchaseOrderCreate, db: Session = Depends(get_db)):

    vendor = db.query(Vendor).filter(Vendor.vendor_id == order.vendor_id).first()
    warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == order.warehouse_id).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    new_order = PurchaseOrder(
        vendor_id=order.vendor_id,
        warehouse_id=order.warehouse_id,
        status=order.status
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()

        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        new_item = PurchaseOrderItem(
            po_id=new_order.po_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )

        db.add(new_item)

    db.commit()

    return {
        "message": "Purchase Order created successfully",
        "po_id": new_order.po_id
    }


# GET ALL PURCHASE ORDERS
@router.get("/")
def get_purchase_orders(db: Session = Depends(get_db)):
    orders = db.query(PurchaseOrder).all()
    return orders