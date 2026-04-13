import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Badge, Button, Card, Input, SectionHeading, Select } from "../components/ui";
import { api } from "../lib/api";
import { PurchaseOrderItemPayload, PurchaseOrderPayload } from "../types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export function ProcurementPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const vendors = useQuery({ queryKey: ["vendors"], queryFn: api.getVendors });
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: api.getWarehouses });
  const products = useQuery({ queryKey: ["products"], queryFn: api.getProducts });
  const purchaseOrders = useQuery({ queryKey: ["purchase-orders"], queryFn: api.getPurchaseOrders });

  const createPurchaseOrder = useMutation({
    mutationFn: api.createPurchaseOrder,
    onSuccess: async (response) => {
      setMessage(`${response.message} (PO #${response.po_id})`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: (error) => {
      setMessage(getErrorMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Procurement"
        title="Purchase order control"
        description="Create multi-line purchase orders and inspect order history against the existing procurement routes."
      />
      {message ? <Card className="text-amber-200">{message}</Card> : null}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PurchaseOrderForm
          vendors={vendors.data ?? []}
          warehouses={warehouses.data ?? []}
          products={products.data ?? []}
          onSubmit={(payload) => createPurchaseOrder.mutateAsync(payload)}
        />
        <DataTable
          title="Purchase Orders"
          rows={purchaseOrders.data ?? []}
          emptyMessage="No purchase orders available."
          columns={[
            { key: "id", header: "PO ID", render: (row) => <Badge>{row.po_id}</Badge> },
            { key: "vendor", header: "Vendor ID", render: (row) => row.vendor_id },
            { key: "warehouse", header: "Warehouse ID", render: (row) => row.warehouse_id },
            { key: "status", header: "Status", render: (row) => row.status }
          ]}
        />
      </div>
    </div>
  );
}

function PurchaseOrderForm({
  vendors,
  warehouses,
  products,
  onSubmit
}: {
  vendors: Array<{ vendor_id: number; name: string }>;
  warehouses: Array<{ warehouse_id: number; name: string }>;
  products: Array<{ product_id: number; name: string; price: number }>;
  onSubmit: (payload: PurchaseOrderPayload) => Promise<unknown>;
}) {
  const [payload, setPayload] = useState<PurchaseOrderPayload>({
    vendor_id: 0,
    warehouse_id: 0,
    status: "Pending",
    items: [{ product_id: 0, quantity: 0, price: 0 }]
  });

  function updateItem(index: number, nextItem: PurchaseOrderItemPayload) {
    const items = payload.items.slice();
    items[index] = nextItem;
    setPayload({ ...payload, items });
  }

  function addItem() {
    setPayload({ ...payload, items: [...payload.items, { product_id: 0, quantity: 0, price: 0 }] });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(payload);
  }

  return (
    <Card>
      <h3 className="font-display text-xl text-white">Create Purchase Order</h3>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <Select value={payload.vendor_id} onChange={(event) => setPayload({ ...payload, vendor_id: Number(event.target.value) })}>
          <option value={0}>Select vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.vendor_id} value={vendor.vendor_id}>
              {vendor.name}
            </option>
          ))}
        </Select>
        <Select value={payload.warehouse_id} onChange={(event) => setPayload({ ...payload, warehouse_id: Number(event.target.value) })}>
          <option value={0}>Select warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
              {warehouse.name}
            </option>
          ))}
        </Select>
        <Input value={payload.status} onChange={(event) => setPayload({ ...payload, status: event.target.value })} />

        <div className="space-y-3">
          {payload.items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-xl border border-white/10 p-3 md:grid-cols-3">
              <Select
                value={item.product_id}
                onChange={(event) => {
                  const productId = Number(event.target.value);
                  const selected = products.find((product) => product.product_id === productId);
                  updateItem(index, {
                    ...item,
                    product_id: productId,
                    price: selected?.price ?? item.price
                  });
                }}
              >
                <option value={0}>Select product</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.name}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                value={item.quantity}
                onChange={(event) => updateItem(index, { ...item, quantity: Number(event.target.value) })}
              />
              <Input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(event) => updateItem(index, { ...item, price: Number(event.target.value) })}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button tone="muted" type="button" onClick={addItem}>
            Add line item
          </Button>
          <Button className="flex-1" type="submit">
            Submit purchase order
          </Button>
        </div>
      </form>
    </Card>
  );
}
