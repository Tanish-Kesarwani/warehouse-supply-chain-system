from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.vendor import Vendor
from schemas.vendor_schema import VendorCreate, VendorResponse

router = APIRouter(prefix="/vendors", tags=["Vendors"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE Vendor
@router.post("/", response_model=VendorResponse)
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    new_vendor = Vendor(
        name=vendor.name,
        phone=vendor.phone,
        email=vendor.email,
        address=vendor.address
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor


# GET All Vendors
@router.get("/", response_model=list[VendorResponse])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()


# UPDATE Vendor
@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(vendor_id: int, updated_data: VendorCreate, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.name = updated_data.name
    vendor.phone = updated_data.phone
    vendor.email = updated_data.email
    vendor.address = updated_data.address

    db.commit()
    db.refresh(vendor)
    return vendor


# DELETE Vendor
@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db.delete(vendor)
    db.commit()

    return {"message": "Vendor deleted successfully"}