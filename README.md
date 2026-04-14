# Warehouse Supply Chain System

A full-stack warehouse and supply-chain tracking project with:
- FastAPI + SQLAlchemy backend
- React + Vite frontend
- SQLite database with views, triggers, and indexes

This README documents the **currently implemented functionality** from the codebase and is designed to avoid any behavior or code changes.

## 1. Project Overview

The system supports operational workflows for:
- Master data management (warehouses, vendors, products)
- Inventory management (create/update records, transfer stock, inward/outward movement)
- Procurement (purchase order creation and listing)
- Monitoring (reorder alerts, inventory audit logs)
- Reporting (warehouse, product, vendor, and movement summaries)

## 2. Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite (`warehouse.db`)

### Frontend
- React
- TypeScript
- Vite
- TanStack React Query
- React Router
- TailwindCSS

## 3. Repository Structure

```text
warehouse-supply-chain-system/
  backend/
    main.py
    database.py
    db_objects.py
    models/
    schemas/
    routers/
  frontend/
    src/
      pages/
      components/
      lib/
      modules/auth/
    package.json
    vite.config.ts
  requirements.txt
```

## 4. Functional Modules

### Dashboard
- Displays aggregated operational snapshot:
  - warehouses
  - products
  - inventory totals
  - reorder alerts
  - top vendors
  - warehouse stock summary

### Masters
- Warehouses: create/read/update/delete
- Vendors: create/read/update/delete
- Products: create/read/update/delete

### Inventory
- Create and update inventory records
- Transfer product stock between warehouses
- Record inward movement
- Record outward movement

### Procurement
- Create purchase orders with multiple line items
- List purchase orders

### Monitoring
- Reorder alerts with optional warehouse/product filters
- Inventory audit log with optional warehouse/product/action filters

### Reports
- Warehouse current inventory report
- Vendor purchase summary
- Warehouse movement summary (date and warehouse filters)
- Product stock summary
- Low stock products
- Product valuation
- Top vendors
- Vendor product supply
- Warehouse stock summary
- Product distribution

## 5. Backend API Map

Base API runs on `http://127.0.0.1:8000`.

### Root
- `GET /`

### Warehouses
- `POST /warehouses/`
- `GET /warehouses/`
- `PUT /warehouses/{warehouse_id}`
- `DELETE /warehouses/{warehouse_id}`

### Vendors
- `POST /vendors/`
- `GET /vendors/`
- `PUT /vendors/{vendor_id}`
- `DELETE /vendors/{vendor_id}`

### Products
- `POST /products/`
- `GET /products/`
- `PUT /products/{product_id}`
- `DELETE /products/{product_id}`

### Inventory
- `POST /inventory/`
- `GET /inventory/`
- `PUT /inventory/{inventory_id}`
- `POST /inventory/transfer`
- `POST /inventory/inward`
- `POST /inventory/outward`

### Purchase Orders
- `POST /purchase-orders/`
- `GET /purchase-orders/`

### Alerts
- `GET /alerts/reorder`

Query params:
- `warehouse_id` (optional)
- `product_id` (optional)

### Audit Logs
- `GET /logs/inventory`

Query params:
- `warehouse_id` (optional)
- `product_id` (optional)
- `action` (optional: `INWARD`, `OUTWARD`, `ADJUSTMENT`)

### Reports
- `GET /reports/warehouse/{warehouse_id}`
- `GET /reports/vendor-summary`
- `GET /reports/warehouse-movement-summary`
- `GET /reports/products/stock-summary`
- `GET /reports/products/low-stock`
- `GET /reports/products/valuation`
- `GET /reports/vendors/top`
- `GET /reports/vendors/product-supply`
- `GET /reports/warehouse-stock-summary`
- `GET /reports/product-distribution`

`/reports/warehouse-movement-summary` optional query params:
- `from_date` (YYYY-MM-DD)
- `to_date` (YYYY-MM-DD)
- `warehouse_id`

## 6. Database Design Summary

### Core Tables
- `warehouses`
- `vendors`
- `products`
- `inventory`
- `purchase_orders`
- `purchase_order_items`
- `stock_movements`
- `inventory_audit_logs`

### Views
- `vw_reorder_alerts`
- `vw_current_inventory`
- `vw_vendor_purchase_summary`
- `vw_warehouse_stock_summary`
- `vw_product_distribution`

### Triggers
- `trg_inventory_insert_audit`
- `trg_inventory_update_audit`

These triggers auto-create inventory audit log records when inventory is inserted or quantity is updated.

### Indexes
Database indexes are created at startup via `backend/db_objects.py` for frequently queried columns across inventory, stock movements, purchase orders, and audit logs.

## 7. Frontend Routing

Public route:
- `/login`

Protected routes (mock-auth gated):
- `/` (dashboard)
- `/masters`
- `/inventory`
- `/procurement`
- `/monitoring`
- `/reports`

## 8. Local Setup and Run

## Prerequisites
- Python 3.x
- Node.js + npm

## Backend setup
```powershell
cd backend
pip install -r ..\requirements.txt
uvicorn main:app --reload
```

Backend runs on:
- `http://127.0.0.1:8000`

Swagger docs:
- `http://127.0.0.1:8000/docs`

## Frontend setup
```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on:
- `http://127.0.0.1:5173`

## 9. Configuration

Frontend env file example (`frontend/.env.example`):

```env
VITE_API_BASE_URL=/api
```

With this setup, Vite proxy forwards `/api/*` to backend `http://127.0.0.1:8000/*` (configured in `frontend/vite.config.ts`).

Backend database URL (`backend/database.py`):
- `sqlite:///./warehouse.db`

## 10. Typical User Flow

1. Create master records:
   - warehouses
   - vendors
   - products
2. Add baseline inventory.
3. Process stock operations:
   - inward
   - outward
   - transfer
4. Create purchase orders for procurement.
5. Monitor reorder alerts and audit trail.
6. Use reports for inventory, movement, vendor, and valuation analysis.

## 11. Notes and Constraints

- Frontend authentication is mock/session-based (not backend-authenticated JWT).
- Inventory audit logging is primarily trigger-driven at DB level.
- All features documented here are based on existing routes/components and do not require code changes.
- This repository currently includes virtual environment and package artifact folders; they are not required to understand system functionality.
