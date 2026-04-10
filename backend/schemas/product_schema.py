from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    reorder_level: int

class ProductResponse(ProductCreate):
    product_id: int

    class Config:
        orm_mode = True