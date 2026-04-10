from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.inventory_audit_log import InventoryAuditLog
from schemas.inventory_audit_schema import InventoryAuditLogResponse

router = APIRouter(prefix="/logs", tags=["Inventory Audit Logs"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/inventory", response_model=List[InventoryAuditLogResponse])
def get_inventory_audit_logs(
    warehouse_id: Optional[int] = None,
    product_id: Optional[int] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(InventoryAuditLog)

    if warehouse_id is not None:
        query = query.filter(InventoryAuditLog.warehouse_id == warehouse_id)
    if product_id is not None:
        query = query.filter(InventoryAuditLog.product_id == product_id)
    if action is not None:
        query = query.filter(InventoryAuditLog.action == action.upper())

    return query.order_by(InventoryAuditLog.created_at.desc()).all()
