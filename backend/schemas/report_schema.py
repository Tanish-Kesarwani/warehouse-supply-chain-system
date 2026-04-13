from pydantic import BaseModel


# ---------------- EXISTING ----------------
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


# ---------------- NEW (US-11) ----------------
class ProductStockSummaryRow(BaseModel):
    product_id: int
    product_name: str
    sku: str
    total_stock: int


class LowStockProductRow(BaseModel):
    inventory_id: int
    warehouse_id: int
    warehouse_name: str
    product_id: int
    product_name: str
    current_quantity: int
    reorder_level: int
    shortage: int


class ProductValuationRow(BaseModel):
    product_id: int
    product_name: str
    price: float
    total_quantity: int
    total_value: float

class TopVendorRow(BaseModel):
    vendor_id: int
    vendor_name: str
    total_spend: float


class VendorProductSupplyRow(BaseModel):
    vendor_id: int
    vendor_name: str
    product_id: int
    product_name: str
    total_quantity_supplied: int


class VendorMonthlySpendRow(BaseModel):
    vendor_id: int
    vendor_name: str
    month: str
    total_spend: float

class WarehouseStockSummaryRow(BaseModel):
    warehouse_id: int
    warehouse_name: str
    total_products: int
    total_items: int


class ProductDistributionRow(BaseModel):
    product_id: int
    product_name: str
    warehouse_id: int
    warehouse_name: str
    quantity: int