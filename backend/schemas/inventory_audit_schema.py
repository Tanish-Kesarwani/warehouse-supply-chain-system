from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class InventoryAuditLogResponse(BaseModel):
    audit_id: int
    inventory_id: int
    warehouse_id: int
    product_id: int
    action: str
    quantity_before: int
    quantity_after: int
    delta: int
    actor: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
