export type Warehouse = {
  warehouse_id: number;
  name: string;
  location: string;
  capacity: number;
  created_at: string;
};

export type WarehousePayload = {
  name: string;
  location: string;
  capacity: number;
};

export type Vendor = {
  vendor_id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type VendorPayload = Omit<Vendor, "vendor_id">;

export type Product = {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  reorder_level: number;
};

export type ProductPayload = Omit<Product, "product_id">;

export type InventoryRecord = {
  inventory_id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
};

export type InventoryPayload = {
  warehouse_id: number;
  product_id: number;
  quantity: number;
};

export type StockTransferPayload = {
  product_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  quantity: number;
};

export type StockTransferResponse = {
  message: string;
  from_warehouse: number;
  to_warehouse: number;
  quantity: number;
};

export type StockMovementPayload = {
  warehouse_id: number;
  product_id: number;
  quantity: number;
  reference_type?: string;
  reference_id?: number;
  remarks?: string;
  created_by?: string;
};

export type StockMovement = {
  movement_id: number;
  warehouse_id: number;
  product_id: number;
  movement_type: string;
  quantity: number;
  reference_type?: string | null;
  reference_id?: number | null;
  remarks?: string | null;
  created_by?: string | null;
  created_at: string;
};

export type StockMovementActionResponse = {
  message: string;
  movement: StockMovement;
  current_quantity: number;
};

export type PurchaseOrderItemPayload = {
  product_id: number;
  quantity: number;
  price: number;
};

export type PurchaseOrderPayload = {
  vendor_id: number;
  warehouse_id: number;
  status: string;
  items: PurchaseOrderItemPayload[];
};

export type PurchaseOrder = {
  po_id: number;
  vendor_id: number;
  warehouse_id: number;
  status: string;
};

export type PurchaseOrderCreateResponse = {
  message: string;
  po_id: number;
};

export type ReorderAlert = {
  inventory_id: number;
  warehouse_id: number;
  warehouse_name: string;
  product_id: number;
  product_name: string;
  current_quantity: number;
  reorder_level: number;
  shortage: number;
};

export type InventoryAuditLog = {
  audit_id: number;
  inventory_id: number;
  warehouse_id: number;
  product_id: number;
  action: string;
  quantity_before: number;
  quantity_after: number;
  delta: number;
  actor?: string | null;
  created_at: string;
};

export type CurrentInventoryReportRow = {
  inventory_id: number;
  warehouse_id: number;
  warehouse_name: string;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  reorder_level: number;
};

export type VendorPurchaseSummaryRow = {
  vendor_id: number;
  vendor_name: string;
  total_purchase_orders: number;
  total_purchase_value: number;
};

export type WarehouseMovementSummaryRow = {
  warehouse_id: number;
  warehouse_name: string;
  movement_type: string;
  total_transactions: number;
  total_quantity: number;
};

export type ProductStockSummaryRow = {
  product_id: number;
  product_name: string;
  sku: string;
  total_stock: number;
};

export type LowStockProductRow = ReorderAlert;

export type ProductValuationRow = {
  product_id: number;
  product_name: string;
  price: number;
  total_quantity: number;
  total_value: number;
};

export type TopVendorRow = {
  vendor_id: number;
  vendor_name: string;
  total_spend: number;
};

export type VendorProductSupplyRow = {
  vendor_id: number;
  vendor_name: string;
  product_id: number;
  product_name: string;
  total_quantity_supplied: number;
};

export type WarehouseStockSummaryRow = {
  warehouse_id: number;
  warehouse_name: string;
  total_products: number;
  total_items: number;
};

export type ProductDistributionRow = {
  product_id: number;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
};

export type DashboardSnapshot = {
  warehouses: Warehouse[];
  vendors: Vendor[];
  products: Product[];
  inventory: InventoryRecord[];
  alerts: ReorderAlert[];
  topVendors: TopVendorRow[];
  warehouseSummary: WarehouseStockSummaryRow[];
};
