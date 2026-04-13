import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Badge, Button, Card, Input, SectionHeading, Select, Textarea } from "../components/ui";
import { api } from "../lib/api";
import { InventoryPayload, InventoryRecord, StockMovementPayload, StockTransferPayload } from "../types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export function InventoryPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: api.getWarehouses });
  const products = useQuery({ queryKey: ["products"], queryFn: api.getProducts });
  const inventory = useQuery({ queryKey: ["inventory"], queryFn: api.getInventory });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["alerts"] }),
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] })
    ]);
  };

  const inventoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: InventoryPayload }) =>
      id ? api.updateInventory(id, payload) : api.createInventory(payload),
    onSuccess: async () => {
      setMessage("Inventory baseline updated.");
      await refresh();
    },
    onError: (error) => {
      setMessage(getErrorMessage(error));
    }
  });

  const transferMutation = useMutation({
    mutationFn: api.transferStock,
    onSuccess: async (response) => {
      setMessage(response.message);
      await refresh();
    },
    onError: (error) => {
      setMessage(getErrorMessage(error));
    }
  });

  const inwardMutation = useMutation({
    mutationFn: api.inwardStock,
    onSuccess: async (response) => {
      setMessage(response.message);
      await refresh();
    },
    onError: (error) => {
      setMessage(getErrorMessage(error));
    }
  });

  const outwardMutation = useMutation({
    mutationFn: api.outwardStock,
    onSuccess: async (response) => {
      setMessage(response.message);
      await refresh();
    },
    onError: (error) => {
      setMessage(getErrorMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Inventory Ops"
        title="Move stock with control"
        description="Operate direct inventory records, warehouse transfers, and inbound or outbound movement entries against the existing backend flows."
      />

      {message ? <Card className="text-amber-200">{message}</Card> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <InventoryForm
          title="Inventory Record"
          warehouses={warehouses.data ?? []}
          products={products.data ?? []}
          onSubmit={(payload, id) => inventoryMutation.mutateAsync({ id, payload })}
        />
        <TransferForm
          warehouses={warehouses.data ?? []}
          products={products.data ?? []}
          onSubmit={(payload) => transferMutation.mutateAsync(payload)}
        />
        <MovementForm
          title="Goods Inward"
          warehouses={warehouses.data ?? []}
          products={products.data ?? []}
          submitLabel="Record inward"
          onSubmit={(payload) => inwardMutation.mutateAsync(payload)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MovementForm
          title="Goods Outward"
          warehouses={warehouses.data ?? []}
          products={products.data ?? []}
          submitLabel="Record outward"
          onSubmit={(payload) => outwardMutation.mutateAsync(payload)}
        />
        <DataTable
          title="Current Inventory"
          rows={inventory.data ?? []}
          emptyMessage="No inventory records found."
          columns={[
            { key: "id", header: "Inventory ID", render: (row: InventoryRecord) => <Badge>{row.inventory_id}</Badge> },
            { key: "warehouse", header: "Warehouse ID", render: (row: InventoryRecord) => row.warehouse_id },
            { key: "product", header: "Product ID", render: (row: InventoryRecord) => row.product_id },
            { key: "quantity", header: "Quantity", render: (row: InventoryRecord) => row.quantity }
          ]}
        />
      </div>
    </div>
  );
}

function InventoryForm({
  title,
  warehouses,
  products,
  onSubmit
}: {
  title: string;
  warehouses: Array<{ warehouse_id: number; name: string }>;
  products: Array<{ product_id: number; name: string }>;
  onSubmit: (payload: InventoryPayload, id?: number) => Promise<unknown>;
}) {
  const [inventoryId, setInventoryId] = useState("");
  const [payload, setPayload] = useState<InventoryPayload>({
    warehouse_id: 0,
    product_id: 0,
    quantity: 0
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(payload, inventoryId ? Number(inventoryId) : undefined);
    setInventoryId("");
  }

  return (
    <Card>
      <h3 className="font-display text-xl text-white">{title}</h3>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Inventory ID for edit</label>
          <Input value={inventoryId} onChange={(event) => setInventoryId(event.target.value)} placeholder="Leave empty to create" />
        </div>
        <Select value={payload.warehouse_id} onChange={(event) => setPayload({ ...payload, warehouse_id: Number(event.target.value) })}>
          <option value={0}>Select warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
              {warehouse.name}
            </option>
          ))}
        </Select>
        <Select value={payload.product_id} onChange={(event) => setPayload({ ...payload, product_id: Number(event.target.value) })}>
          <option value={0}>Select product</option>
          {products.map((product) => (
            <option key={product.product_id} value={product.product_id}>
              {product.name}
            </option>
          ))}
        </Select>
        <Input type="number" value={payload.quantity} onChange={(event) => setPayload({ ...payload, quantity: Number(event.target.value) })} />
        <Button className="w-full" type="submit">
          Save inventory
        </Button>
      </form>
    </Card>
  );
}

function TransferForm({
  warehouses,
  products,
  onSubmit
}: {
  warehouses: Array<{ warehouse_id: number; name: string }>;
  products: Array<{ product_id: number; name: string }>;
  onSubmit: (payload: StockTransferPayload) => Promise<unknown>;
}) {
  const [payload, setPayload] = useState<StockTransferPayload>({
    product_id: 0,
    from_warehouse_id: 0,
    to_warehouse_id: 0,
    quantity: 0
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(payload);
  }

  return (
    <Card>
      <h3 className="font-display text-xl text-white">Stock Transfer</h3>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <Select value={payload.product_id} onChange={(event) => setPayload({ ...payload, product_id: Number(event.target.value) })}>
          <option value={0}>Select product</option>
          {products.map((product) => (
            <option key={product.product_id} value={product.product_id}>
              {product.name}
            </option>
          ))}
        </Select>
        <Select
          value={payload.from_warehouse_id}
          onChange={(event) => setPayload({ ...payload, from_warehouse_id: Number(event.target.value) })}
        >
          <option value={0}>Source warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
              {warehouse.name}
            </option>
          ))}
        </Select>
        <Select
          value={payload.to_warehouse_id}
          onChange={(event) => setPayload({ ...payload, to_warehouse_id: Number(event.target.value) })}
        >
          <option value={0}>Destination warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
              {warehouse.name}
            </option>
          ))}
        </Select>
        <Input type="number" value={payload.quantity} onChange={(event) => setPayload({ ...payload, quantity: Number(event.target.value) })} />
        <Button className="w-full" type="submit">
          Execute transfer
        </Button>
      </form>
    </Card>
  );
}

function MovementForm({
  title,
  warehouses,
  products,
  submitLabel,
  onSubmit
}: {
  title: string;
  warehouses: Array<{ warehouse_id: number; name: string }>;
  products: Array<{ product_id: number; name: string }>;
  submitLabel: string;
  onSubmit: (payload: StockMovementPayload) => Promise<unknown>;
}) {
  const [payload, setPayload] = useState<StockMovementPayload>({
    warehouse_id: 0,
    product_id: 0,
    quantity: 0,
    reference_type: "",
    reference_id: undefined,
    remarks: "",
    created_by: "frontend-operator"
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(payload);
  }

  return (
    <Card>
      <h3 className="font-display text-xl text-white">{title}</h3>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <Select value={payload.warehouse_id} onChange={(event) => setPayload({ ...payload, warehouse_id: Number(event.target.value) })}>
          <option value={0}>Select warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
              {warehouse.name}
            </option>
          ))}
        </Select>
        <Select value={payload.product_id} onChange={(event) => setPayload({ ...payload, product_id: Number(event.target.value) })}>
          <option value={0}>Select product</option>
          {products.map((product) => (
            <option key={product.product_id} value={product.product_id}>
              {product.name}
            </option>
          ))}
        </Select>
        <Input type="number" value={payload.quantity} onChange={(event) => setPayload({ ...payload, quantity: Number(event.target.value) })} />
        <Input
          placeholder="Reference type"
          value={payload.reference_type ?? ""}
          onChange={(event) => setPayload({ ...payload, reference_type: event.target.value })}
        />
        <Input
          type="number"
          placeholder="Reference ID"
          value={payload.reference_id ?? ""}
          onChange={(event) =>
            setPayload({ ...payload, reference_id: event.target.value ? Number(event.target.value) : undefined })
          }
        />
        <Textarea
          placeholder="Remarks"
          value={payload.remarks ?? ""}
          onChange={(event) => setPayload({ ...payload, remarks: event.target.value })}
        />
        <Button className="w-full" type="submit">
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
