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
    ProductStockSummaryRow,
    LowStockProductRow,
    ProductValuationRow,
    TopVendorRow,
    VendorProductSupplyRow,
    VendorMonthlySpendRow,
    WarehouseStockSummaryRow,
    ProductDistributionRow,
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

    if from_date:
        where_clause += " AND date(sm.created_at) >= :from_date"
        params["from_date"] = str(from_date)

    if to_date:
        where_clause += " AND date(sm.created_at) <= :to_date"
        params["to_date"] = str(to_date)

    if warehouse_id:
        where_clause += " AND sm.warehouse_id = :warehouse_id"
        params["warehouse_id"] = warehouse_id

    rows = (
        db.execute(
            text(
                f"""
                WITH movement_summary AS (
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
                )
                SELECT *
                FROM movement_summary
                ORDER BY warehouse_name, movement_type
                """
            ),
            params,
        )
        .mappings()
        .all()
    )

    return [WarehouseMovementSummaryRow(**row) for row in rows]

@router.get("/products/stock-summary", response_model=List[ProductStockSummaryRow])
def get_product_stock_summary(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT
                    p.product_id,
                    p.name AS product_name,
                    p.sku,
                    COALESCE(SUM(i.quantity), 0) AS total_stock
                FROM products p
                LEFT JOIN inventory i ON i.product_id = p.product_id
                GROUP BY p.product_id, p.name, p.sku
                ORDER BY total_stock DESC
                """
            )
        )
        .mappings()
        .all()
    )
    return rows

@router.get("/products/low-stock", response_model=List[LowStockProductRow])
def get_low_stock_products(db: Session = Depends(get_db)):
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
                    current_quantity,
                    reorder_level,
                    shortage
                FROM vw_reorder_alerts
                ORDER BY shortage DESC
                """
            )
        )
        .mappings()
        .all()
    )
    return rows

@router.get("/products/valuation", response_model=List[ProductValuationRow])
def get_product_valuation(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT
                    p.product_id,
                    p.name AS product_name,
                    p.price,
                    COALESCE(SUM(i.quantity), 0) AS total_quantity,
                    COALESCE(SUM(i.quantity * p.price), 0) AS total_value
                FROM products p
                LEFT JOIN inventory i ON i.product_id = p.product_id
                GROUP BY p.product_id, p.name, p.price
                ORDER BY total_value DESC
                """
            )
        )
        .mappings()
        .all()
    )
    return rows

@router.get("/vendors/top", response_model=List[TopVendorRow])
def get_top_vendors(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT
                    v.vendor_id,
                    v.name AS vendor_name,
                    COALESCE(SUM(poi.quantity * poi.price), 0) AS total_spend
                FROM vendors v
                LEFT JOIN purchase_orders po ON po.vendor_id = v.vendor_id
                LEFT JOIN purchase_order_items poi ON poi.po_id = po.po_id
                GROUP BY v.vendor_id, v.name
                ORDER BY total_spend DESC
                """
            )
        )
        .mappings()
        .all()
    )
    return rows

@router.get("/vendors/product-supply", response_model=List[VendorProductSupplyRow])
def get_vendor_product_supply(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT
                    v.vendor_id,
                    v.name AS vendor_name,
                    p.product_id,
                    p.name AS product_name,
                    COALESCE(SUM(poi.quantity), 0) AS total_quantity_supplied
                FROM vendors v
                JOIN purchase_orders po ON po.vendor_id = v.vendor_id
                JOIN purchase_order_items poi ON poi.po_id = po.po_id
                JOIN products p ON p.product_id = poi.product_id
                GROUP BY v.vendor_id, v.name, p.product_id, p.name
                ORDER BY total_quantity_supplied DESC
                """
            )
        )
        .mappings()
        .all()
    )
    return rows

@router.get("/warehouse-stock-summary", response_model=List[WarehouseStockSummaryRow])
def get_warehouse_stock_summary(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT *
                FROM vw_warehouse_stock_summary
                ORDER BY total_items DESC
                """
            )
        )
        .mappings()
        .all()
    )
    return rows

@router.get("/product-distribution", response_model=List[ProductDistributionRow])
def get_product_distribution(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
                SELECT *
                FROM vw_product_distribution
                ORDER BY product_name, warehouse_name
                """
            )
        )
        .mappings()
        .all()
    )
    return rows