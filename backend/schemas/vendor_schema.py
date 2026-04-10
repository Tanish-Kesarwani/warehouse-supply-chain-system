from pydantic import BaseModel

class VendorCreate(BaseModel):
    name: str
    phone: str
    email: str
    address: str

class VendorResponse(VendorCreate):
    vendor_id: int

    class Config:
        orm_mode = True