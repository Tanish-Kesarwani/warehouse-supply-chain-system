from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas.alerts_schema import ReorderAlertResponse

router = APIRouter(prefix="/alerts", tags=["Reorder Alerts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/reorder", response_model=List[ReorderAlertResponse])
def get_reorder_alerts(
    warehouse_id: Optional[int] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = """
        SELECT
            inventory_id,
            warehouse_id,
            warehouse_name,
            product_id,
            product_name,
            current_quantity,
            reorder_level,
            shortage
        FROM vw_reorder_alerts
        WHERE 1=1
    """
    params = {}

    if warehouse_id is not None:
        query += " AND warehouse_id = :warehouse_id"
        params["warehouse_id"] = warehouse_id

    if product_id is not None:
        query += " AND product_id = :product_id"
        params["product_id"] = product_id

    query += " ORDER BY shortage DESC, warehouse_id, product_id"

    rows = db.execute(text(query), params).mappings().all()
    return [ReorderAlertResponse(**row) for row in rows]
