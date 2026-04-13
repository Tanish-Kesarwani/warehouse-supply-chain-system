import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { Card, Input, SectionHeading, Select } from "../components/ui";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils";

export function ReportsPage() {
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: api.getWarehouses });
  const [selectedWarehouse, setSelectedWarehouse] = useState(0);
  const [movementWarehouse, setMovementWarehouse] = useState<number | undefined>(undefined);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const warehouseReport = useQuery({
    queryKey: ["reports", "warehouse", selectedWarehouse],
    queryFn: () => api.getWarehouseReport(selectedWarehouse),
    enabled: selectedWarehouse > 0
  });
  const vendorSummary = useQuery({ queryKey: ["reports", "vendor-summary"], queryFn: api.getVendorPurchaseSummary });
  const movementSummary = useQuery({
    queryKey: ["reports", "movement-summary", fromDate, toDate, movementWarehouse],
    queryFn: () => api.getWarehouseMovementSummary(fromDate || undefined, toDate || undefined, movementWarehouse)
  });
  const productStock = useQuery({ queryKey: ["reports", "product-stock"], queryFn: api.getProductStockSummary });
  const lowStock = useQuery({ queryKey: ["reports", "low-stock"], queryFn: api.getLowStockProducts });
  const valuation = useQuery({ queryKey: ["reports", "valuation"], queryFn: api.getProductValuation });
  const topVendors = useQuery({ queryKey: ["reports", "top-vendors"], queryFn: api.getTopVendors });
  const vendorSupply = useQuery({ queryKey: ["reports", "vendor-supply"], queryFn: api.getVendorProductSupply });
  const warehouseStock = useQuery({ queryKey: ["reports", "warehouse-stock"], queryFn: api.getWarehouseStockSummary });
  const distribution = useQuery({ queryKey: ["reports", "distribution"], queryFn: api.getProductDistribution });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Reports"
        title="Operational intelligence hub"
        description="Every backend report endpoint is surfaced here with lightweight controls for warehouse and date-based analysis."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-display text-xl text-white">Warehouse inventory report</h3>
          <Select value={selectedWarehouse} onChange={(event) => setSelectedWarehouse(Number(event.target.value))}>
            <option value={0}>Select warehouse</option>
            {warehouses.data?.map((warehouse) => (
              <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                {warehouse.name}
              </option>
            ))}
          </Select>
          <DataTable
            title="Current Inventory by Warehouse"
            rows={warehouseReport.data ?? []}
            emptyMessage="Choose a warehouse to load the report."
            columns={[
              { key: "product", header: "Product", render: (row) => row.product_name },
              { key: "sku", header: "SKU", render: (row) => row.sku },
              { key: "quantity", header: "Quantity", render: (row) => row.quantity },
              { key: "reorder", header: "Reorder Level", render: (row) => row.reorder_level }
            ]}
          />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-display text-xl text-white">Warehouse movement summary</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            <Select value={movementWarehouse ?? ""} onChange={(event) => setMovementWarehouse(event.target.value ? Number(event.target.value) : undefined)}>
              <option value="">All warehouses</option>
              {warehouses.data?.map((warehouse) => (
                <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
          </div>
          <DataTable
            title="Movement Summary"
            rows={movementSummary.data ?? []}
            emptyMessage="No movement data available for the current filter."
            columns={[
              { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse_name },
              { key: "type", header: "Movement", render: (row) => row.movement_type },
              { key: "transactions", header: "Transactions", render: (row) => row.total_transactions },
              { key: "quantity", header: "Quantity", render: (row) => row.total_quantity }
            ]}
          />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Vendor Purchase Summary"
          rows={vendorSummary.data ?? []}
          emptyMessage="No vendor summary available."
          columns={[
            { key: "vendor", header: "Vendor", render: (row) => row.vendor_name },
            { key: "orders", header: "Orders", render: (row) => row.total_purchase_orders },
            { key: "value", header: "Value", render: (row) => formatCurrency(row.total_purchase_value) }
          ]}
        />
        <DataTable
          title="Product Stock Summary"
          rows={productStock.data ?? []}
          emptyMessage="No stock summary available."
          columns={[
            { key: "product", header: "Product", render: (row) => row.product_name },
            { key: "sku", header: "SKU", render: (row) => row.sku },
            { key: "stock", header: "Total Stock", render: (row) => row.total_stock }
          ]}
        />
        <DataTable
          title="Low Stock Products"
          rows={lowStock.data ?? []}
          emptyMessage="No low stock products."
          columns={[
            { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse_name },
            { key: "product", header: "Product", render: (row) => row.product_name },
            { key: "current", header: "Current Qty", render: (row) => row.current_quantity },
            { key: "shortage", header: "Shortage", render: (row) => row.shortage }
          ]}
        />
        <DataTable
          title="Product Valuation"
          rows={valuation.data ?? []}
          emptyMessage="No valuation data."
          columns={[
            { key: "product", header: "Product", render: (row) => row.product_name },
            { key: "price", header: "Price", render: (row) => formatCurrency(row.price) },
            { key: "quantity", header: "Qty", render: (row) => row.total_quantity },
            { key: "value", header: "Total Value", render: (row) => formatCurrency(row.total_value) }
          ]}
        />
        <DataTable
          title="Top Vendors"
          rows={topVendors.data ?? []}
          emptyMessage="No vendor spend data."
          columns={[
            { key: "vendor", header: "Vendor", render: (row) => row.vendor_name },
            { key: "spend", header: "Total Spend", render: (row) => formatCurrency(row.total_spend) }
          ]}
        />
        <DataTable
          title="Vendor Product Supply"
          rows={vendorSupply.data ?? []}
          emptyMessage="No product supply data."
          columns={[
            { key: "vendor", header: "Vendor", render: (row) => row.vendor_name },
            { key: "product", header: "Product", render: (row) => row.product_name },
            { key: "qty", header: "Quantity Supplied", render: (row) => row.total_quantity_supplied }
          ]}
        />
        <DataTable
          title="Warehouse Stock Summary"
          rows={warehouseStock.data ?? []}
          emptyMessage="No warehouse stock data."
          columns={[
            { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse_name },
            { key: "products", header: "Products", render: (row) => row.total_products },
            { key: "items", header: "Total Items", render: (row) => row.total_items }
          ]}
        />
        <DataTable
          title="Product Distribution"
          rows={distribution.data ?? []}
          emptyMessage="No distribution data."
          columns={[
            { key: "product", header: "Product", render: (row) => row.product_name },
            { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse_name },
            { key: "quantity", header: "Quantity", render: (row) => row.quantity }
          ]}
        />
      </div>
    </div>
  );
}
