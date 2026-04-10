from pydantic import BaseModel


class ReorderAlertResponse(BaseModel):
    inventory_id: int
    warehouse_id: int
    warehouse_name: str
    product_id: int
    product_name: str
    current_quantity: int
    reorder_level: int
    shortage: int
