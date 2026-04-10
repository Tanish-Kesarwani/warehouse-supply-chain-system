from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.product import Product
from schemas.product_schema import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE Product
@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        reorder_level=product.reorder_level
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


# GET All Products
@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


# UPDATE Product
@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, updated_data: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = updated_data.name
    product.sku = updated_data.sku
    product.price = updated_data.price
    product.reorder_level = updated_data.reorder_level

    db.commit()
    db.refresh(product)
    return product


# DELETE Product
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}