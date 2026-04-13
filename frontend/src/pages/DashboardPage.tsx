import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../components/DataTable";
import { Card, SectionHeading } from "../components/ui";
import { api } from "../lib/api";
import { formatCurrency, formatNumber } from "../lib/utils";

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.getDashboardSnapshot
  });

  const metrics = data
    ? [
        { label: "Warehouses", value: formatNumber(data.warehouses.length) },
        { label: "Products", value: formatNumber(data.products.length) },
        {
          label: "Total Inventory Units",
          value: formatNumber(data.inventory.reduce((sum, row) => sum + row.quantity, 0))
        },
        { label: "Reorder Alerts", value: formatNumber(data.alerts.length) }
      ]
    : [];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Control Deck"
        title="Warehouse command overview"
        description="A unified readout of network capacity, stock pressure, and supplier performance sourced directly from the current backend."
      />

      {error ? <Card className="text-red-300">{(error as Error).message}</Card> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02]">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
            <p className="mt-4 font-display text-4xl text-white">{isLoading ? "..." : metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTable
          title="Warehouse Stock Summary"
          description="Live warehouse capacity and unit distribution"
          rows={data?.warehouseSummary ?? []}
          emptyMessage="No warehouse summary available."
          columns={[
            { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse_name },
            { key: "products", header: "Products", render: (row) => formatNumber(row.total_products) },
            { key: "items", header: "Total Items", render: (row) => formatNumber(row.total_items) }
          ]}
        />

        <DataTable
          title="Top Vendors"
          description="Purchase spend leaders from reporting view"
          rows={data?.topVendors ?? []}
          emptyMessage="No vendor spend data available."
          columns={[
            { key: "name", header: "Vendor", render: (row) => row.vendor_name },
            { key: "spend", header: "Total Spend", render: (row) => formatCurrency(row.total_spend) }
          ]}
        />
      </div>

      <DataTable
        title="Reorder Pressure"
        description="Products currently at or under reorder level"
        rows={data?.alerts ?? []}
        emptyMessage="No reorder alerts. Network is stable."
        columns={[
          { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse_name },
          { key: "product", header: "Product", render: (row) => row.product_name },
          { key: "qty", header: "Current Qty", render: (row) => formatNumber(row.current_quantity) },
          { key: "level", header: "Reorder Level", render: (row) => formatNumber(row.reorder_level) },
          { key: "shortage", header: "Shortage", render: (row) => formatNumber(row.shortage) }
        ]}
      />
    </div>
  );
}
