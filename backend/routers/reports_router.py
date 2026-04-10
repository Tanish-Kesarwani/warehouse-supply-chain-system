from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas.report_schema import (
    CurrentInventoryReportRow,
    VendorPurchaseSummaryRow,
    WarehouseMovementSummaryRow,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/warehouse/{warehouse_id}", response_model=List[CurrentInventoryReportRow])
def get_warehouse_report(warehouse_id: int, db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT
                    inventory_id,
                    warehouse_id,
                    warehouse_name,
                    product_id,
                    product_name,
                    sku,
                    quantity,
                    reorder_level
                FROM vw_current_inventory
                WHERE warehouse_id = :warehouse_id
                ORDER BY product_name
                """
            ),
            {"warehouse_id": warehouse_id},
        )
        .mappings()
        .all()
    )
    return [CurrentInventoryReportRow(**row) for row in rows]


@router.get("/vendor-summary", response_model=List[VendorPurchaseSummaryRow])
def get_vendor_purchase_summary(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT
                    vendor_id,
                    vendor_name,
                    total_purchase_orders,
                    total_purchase_value
                FROM vw_vendor_purchase_summary
                ORDER BY total_purchase_value DESC
                """
            )
        )
        .mappings()
        .all()
    )
    return [VendorPurchaseSummaryRow(**row) for row in rows]


@router.get(
    "/warehouse-movement-summary",
    response_model=List[WarehouseMovementSummaryRow],
)
def get_warehouse_movement_summary(
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    where_clause = "WHERE 1=1"
    params = {}

    if from_date is not None:
        where_clause += " AND date(sm.created_at) >= :from_date"
        params["from_date"] = str(from_date)

    if to_date is not None:
        where_clause += " AND date(sm.created_at) <= :to_date"
        params["to_date"] = str(to_date)

    if warehouse_id is not None:
        where_clause += " AND sm.warehouse_id = :warehouse_id"
        params["warehouse_id"] = warehouse_id

    db.execute(text("DROP TABLE IF EXISTS temp_movement_summary"))
    db.execute(
        text(
            f"""
            CREATE TEMP TABLE temp_movement_summary AS
            SELECT
                sm.warehouse_id,
                w.name AS warehouse_name,
                sm.movement_type,
                COUNT(sm.movement_id) AS total_transactions,
                COALESCE(SUM(sm.quantity), 0) AS total_quantity
            FROM stock_movements sm
            JOIN warehouses w ON w.warehouse_id = sm.warehouse_id
            {where_clause}
            GROUP BY sm.warehouse_id, w.name, sm.movement_type
            """
        ),
        params,
    )

    rows = (
        db.execute(
            text(
                """
                SELECT
                    warehouse_id,
                    warehouse_name,
                    movement_type,
                    total_transactions,
                    total_quantity
                FROM temp_movement_summary
                ORDER BY warehouse_name, movement_type
                """
            )
        )
        .mappings()
        .all()
    )
    return [WarehouseMovementSummaryRow(**row) for row in rows]
