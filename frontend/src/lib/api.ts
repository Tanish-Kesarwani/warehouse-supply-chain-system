import {
  CurrentInventoryReportRow,
  DashboardSnapshot,
  InventoryAuditLog,
  InventoryPayload,
  InventoryRecord,
  LowStockProductRow,
  Product,
  ProductDistributionRow,
  ProductPayload,
  ProductStockSummaryRow,
  ProductValuationRow,
  PurchaseOrder,
  PurchaseOrderCreateResponse,
  PurchaseOrderPayload,
  ReorderAlert,
  StockMovementActionResponse,
  StockMovementPayload,
  StockTransferPayload,
  StockTransferResponse,
  TopVendorRow,
  Vendor,
  VendorPayload,
  VendorProductSupplyRow,
  VendorPurchaseSummaryRow,
  Warehouse,
  WarehouseMovementSummaryRow,
  WarehousePayload,
  WarehouseStockSummaryRow
} from "../types";
import { toQueryString } from "./utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      message = payload.detail ?? payload.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getWarehouses: () => request<Warehouse[]>("/warehouses/"),
  createWarehouse: (payload: WarehousePayload) =>
    request<Warehouse>("/warehouses/", { method: "POST", body: JSON.stringify(payload) }),
  updateWarehouse: (warehouseId: number, payload: WarehousePayload) =>
    request<Warehouse>(`/warehouses/${warehouseId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteWarehouse: (warehouseId: number) =>
    request<{ message: string }>(`/warehouses/${warehouseId}`, { method: "DELETE" }),

  getVendors: () => request<Vendor[]>("/vendors/"),
  createVendor: (payload: VendorPayload) =>
    request<Vendor>("/vendors/", { method: "POST", body: JSON.stringify(payload) }),
  updateVendor: (vendorId: number, payload: VendorPayload) =>
    request<Vendor>(`/vendors/${vendorId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteVendor: (vendorId: number) =>
    request<{ message: string }>(`/vendors/${vendorId}`, { method: "DELETE" }),

  getProducts: () => request<Product[]>("/products/"),
  createProduct: (payload: ProductPayload) =>
    request<Product>("/products/", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (productId: number, payload: ProductPayload) =>
    request<Product>(`/products/${productId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (productId: number) =>
    request<{ message: string }>(`/products/${productId}`, { method: "DELETE" }),

  getInventory: () => request<InventoryRecord[]>("/inventory/"),
  createInventory: (payload: InventoryPayload) =>
    request<InventoryRecord>("/inventory/", { method: "POST", body: JSON.stringify(payload) }),
  updateInventory: (inventoryId: number, payload: InventoryPayload) =>
    request<InventoryRecord>(`/inventory/${inventoryId}`, { method: "PUT", body: JSON.stringify(payload) }),
  transferStock: (payload: StockTransferPayload) =>
    request<StockTransferResponse>("/inventory/transfer", { method: "POST", body: JSON.stringify(payload) }),
  inwardStock: (payload: StockMovementPayload) =>
    request<StockMovementActionResponse>("/inventory/inward", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  outwardStock: (payload: StockMovementPayload) =>
    request<StockMovementActionResponse>("/inventory/outward", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getPurchaseOrders: () => request<PurchaseOrder[]>("/purchase-orders/"),
  createPurchaseOrder: (payload: PurchaseOrderPayload) =>
    request<PurchaseOrderCreateResponse>("/purchase-orders/", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getReorderAlerts: (warehouseId?: number, productId?: number) =>
    request<ReorderAlert[]>(
      `/alerts/reorder${toQueryString({
        warehouse_id: warehouseId,
        product_id: productId
      })}`
    ),

  getInventoryAuditLogs: (warehouseId?: number, productId?: number, action?: string) =>
    request<InventoryAuditLog[]>(
      `/logs/inventory${toQueryString({
        warehouse_id: warehouseId,
        product_id: productId,
        action
      })}`
    ),

  getWarehouseReport: (warehouseId: number) =>
    request<CurrentInventoryReportRow[]>(`/reports/warehouse/${warehouseId}`),
  getVendorPurchaseSummary: () =>
    request<VendorPurchaseSummaryRow[]>("/reports/vendor-summary"),
  getWarehouseMovementSummary: (fromDate?: string, toDate?: string, warehouseId?: number) =>
    request<WarehouseMovementSummaryRow[]>(
      `/reports/warehouse-movement-summary${toQueryString({
        from_date: fromDate,
        to_date: toDate,
        warehouse_id: warehouseId
      })}`
    ),
  getProductStockSummary: () =>
    request<ProductStockSummaryRow[]>("/reports/products/stock-summary"),
  getLowStockProducts: () =>
    request<LowStockProductRow[]>("/reports/products/low-stock"),
  getProductValuation: () =>
    request<ProductValuationRow[]>("/reports/products/valuation"),
  getTopVendors: () => request<TopVendorRow[]>("/reports/vendors/top"),
  getVendorProductSupply: () =>
    request<VendorProductSupplyRow[]>("/reports/vendors/product-supply"),
  getWarehouseStockSummary: () =>
    request<WarehouseStockSummaryRow[]>("/reports/warehouse-stock-summary"),
  getProductDistribution: () =>
    request<ProductDistributionRow[]>("/reports/product-distribution"),

  getDashboardSnapshot: async (): Promise<DashboardSnapshot> => {
    const [warehouses, vendors, products, inventory, alerts, topVendors, warehouseSummary] =
      await Promise.all([
        api.getWarehouses(),
        api.getVendors(),
        api.getProducts(),
        api.getInventory(),
        api.getReorderAlerts(),
        api.getTopVendors(),
        api.getWarehouseStockSummary()
      ]);

    return {
      warehouses,
      vendors,
      products,
      inventory,
      alerts,
      topVendors,
      warehouseSummary
    };
  }
};

export { ApiError };
