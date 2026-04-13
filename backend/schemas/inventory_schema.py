from pydantic import BaseModel, Field


# ---------------- CREATE ----------------
class InventoryCreate(BaseModel):
    warehouse_id: int
    product_id: int
    quantity: int = Field(ge=0)


# ---------------- UPDATE ----------------
class InventoryUpdate(BaseModel):
    quantity: int = Field(ge=0)


# ---------------- RESPONSE ----------------
class InventoryResponse(BaseModel):
    inventory_id: int
    warehouse_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True


# ---------------- STOCK TRANSFER (US-13) ----------------
class StockTransferRequest(BaseModel):
    product_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: int = Field(gt=0)


class StockTransferResponse(BaseModel):
    message: str
    from_warehouse: int
    to_warehouse: int
    quantity: int