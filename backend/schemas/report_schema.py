from pydantic import BaseModel


class CurrentInventoryReportRow(BaseModel):
    inventory_id: int
    warehouse_id: int
    warehouse_name: str
    product_id: int
    product_name: str
    sku: str
    quantity: int
    reorder_level: int


class VendorPurchaseSummaryRow(BaseModel):
    vendor_id: int
    vendor_name: str
    total_purchase_orders: int
    total_purchase_value: float


class WarehouseMovementSummaryRow(BaseModel):
    warehouse_id: int
    warehouse_name: str
    movement_type: str
    total_transactions: int
    total_quantity: int
