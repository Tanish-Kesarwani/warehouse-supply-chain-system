from pydantic import BaseModel

class InventoryCreate(BaseModel):
    warehouse_id: int
    product_id: int
    quantity: int

class InventoryResponse(InventoryCreate):
    inventory_id: int

    class Config:
        from_attributes = True