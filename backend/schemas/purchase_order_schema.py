from pydantic import BaseModel
from typing import List


class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float


class PurchaseOrderCreate(BaseModel):
    vendor_id: int
    warehouse_id: int
    status: str
    items: List[PurchaseOrderItemCreate]


class PurchaseOrderItemResponse(PurchaseOrderItemCreate):
    id: int

    class Config:
        from_attributes = True


class PurchaseOrderResponse(BaseModel):
    po_id: int
    vendor_id: int
    warehouse_id: int
    status: str
    items: List[PurchaseOrderItemResponse]

    class Config:
        from_attributes = True