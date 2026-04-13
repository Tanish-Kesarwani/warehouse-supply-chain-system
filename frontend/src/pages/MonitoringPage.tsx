import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { Badge, Card, Input, SectionHeading, Select } from "../components/ui";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";

export function MonitoringPage() {
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [productId, setProductId] = useState<number | undefined>(undefined);
  const [action, setAction] = useState("");

  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: api.getWarehouses });
  const products = useQuery({ queryKey: ["products"], queryFn: api.getProducts });
  const alerts = useQuery({
    queryKey: ["alerts", warehouseId, productId],
    queryFn: () => api.getReorderAlerts(warehouseId, productId)
  });
  const logs = useQuery({
    queryKey: ["audit-logs", warehouseId, productId, action],
    queryFn: () => api.getInventoryAuditLogs(warehouseId, productId, action || undefined)
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Monitoring"
        title="Alerts and audit trail"
        description="Inspect reorder pressure and inventory audit activity using the backend's reporting view and trigger-driven log history."
      />

      <Card className="grid gap-4 md:grid-cols-4">
        <Select value={warehouseId ?? ""} onChange={(event) => setWarehouseId(event.target.value ? Number(event.target.value) : undefined)}>
          <option value="">All warehouses</option>
          {warehouses.data?.map((warehouse) => (
            <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
              {warehouse.name}
            </option>
          ))}
        </Select>
        <Select value={productId ?? ""} onChange={(event) => setProductId(event.target.value ? Number(event.target.value) : undefined)}>
          <option value="">All products</option>
          {products.data?.map((product) => (
            <option key={product.product_id} value={product.product_id}>
              {product.name}
            </option>
          ))}
        </Select>
        <Input placeholder="Action filter: INWARD / OUTWARD / ADJUSTMENT" value={action} onChange={(event) => setAction(event.target.value)} />
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          Filters apply to both alerts and audit logs.
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DataTable
          title="Reorder Alerts"
          rows={alerts.data ?? []}
          emptyMessage="No alerts for the current filters."
          columns={[
            { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse_name },
            { key: "product", header: "Product", render: (row) => row.product_name },
            { key: "current", header: "Current Qty", render: (row) => row.current_quantity },
            { key: "reorder", header: "Reorder Level", render: (row) => row.reorder_level },
            { key: "shortage", header: "Shortage", render: (row) => <Badge tone="warning">{row.shortage}</Badge> }
          ]}
        />
        <DataTable
          title="Inventory Audit Logs"
          rows={logs.data ?? []}
          emptyMessage="No audit logs for the current filters."
          columns={[
            { key: "audit", header: "Audit ID", render: (row) => <Badge>{row.audit_id}</Badge> },
            { key: "action", header: "Action", render: (row) => row.action },
            { key: "delta", header: "Delta", render: (row) => row.delta },
            { key: "before", header: "Before", render: (row) => row.quantity_before },
            { key: "after", header: "After", render: (row) => row.quantity_after },
            { key: "time", header: "Timestamp", render: (row) => formatDate(row.created_at) }
          ]}
        />
      </div>
    </div>
  );
}
