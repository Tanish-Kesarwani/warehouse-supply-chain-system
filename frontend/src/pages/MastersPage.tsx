import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Badge, Button, Card, Input, SectionHeading, Textarea } from "../components/ui";
import { api } from "../lib/api";
import { Product, ProductPayload, Vendor, VendorPayload, Warehouse, WarehousePayload } from "../types";

function Feedback({ message }: { message: string }) {
  return message ? <p className="text-sm text-amber-200">{message}</p> : null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export function MastersPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");

  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: api.getWarehouses });
  const vendors = useQuery({ queryKey: ["vendors"], queryFn: api.getVendors });
  const products = useQuery({ queryKey: ["products"], queryFn: api.getProducts });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
      queryClient.invalidateQueries({ queryKey: ["vendors"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    ]);
  };

  const warehouseMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: WarehousePayload }) =>
      id ? api.updateWarehouse(id, payload) : api.createWarehouse(payload),
    onSuccess: async () => {
      setFeedback("Warehouse command executed successfully.");
      await invalidate();
    },
    onError: (error) => {
      setFeedback(getErrorMessage(error));
    }
  });

  const vendorMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: VendorPayload }) =>
      id ? api.updateVendor(id, payload) : api.createVendor(payload),
    onSuccess: async () => {
      setFeedback("Vendor registry updated.");
      await invalidate();
    },
    onError: (error) => {
      setFeedback(getErrorMessage(error));
    }
  });

  const productMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: ProductPayload }) =>
      id ? api.updateProduct(id, payload) : api.createProduct(payload),
    onSuccess: async () => {
      setFeedback("Product catalog synchronized.");
      await invalidate();
    },
    onError: (error) => {
      setFeedback(getErrorMessage(error));
    }
  });

  const deleteWarehouse = useMutation({
    mutationFn: api.deleteWarehouse,
    onSuccess: async () => {
      setFeedback("Warehouse removed.");
      await invalidate();
    },
    onError: (error) => {
      setFeedback(getErrorMessage(error));
    }
  });
  const deleteVendor = useMutation({
    mutationFn: api.deleteVendor,
    onSuccess: async () => {
      setFeedback("Vendor removed.");
      await invalidate();
    },
    onError: (error) => {
      setFeedback(getErrorMessage(error));
    }
  });
  const deleteProduct = useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: async () => {
      setFeedback("Product removed.");
      await invalidate();
    },
    onError: (error) => {
      setFeedback(getErrorMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Masters"
        title="Core network records"
        description="Maintain warehouse nodes, supplier partners, and product definitions without altering the backend contracts."
      />
      <Feedback message={feedback} />

      <div className="grid gap-6 xl:grid-cols-3">
        <MasterForm
          title="Warehouse Registry"
          description="Create or update warehouse nodes"
          initialState={{ name: "", location: "", capacity: 0 }}
          onSubmit={(payload, id) => warehouseMutation.mutateAsync({ id, payload })}
          idLabel="Warehouse ID for edit"
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "location", label: "Location", type: "text" },
            { key: "capacity", label: "Capacity", type: "number" }
          ]}
        />
        <MasterForm
          title="Vendor Registry"
          description="Manage supplier details"
          initialState={{ name: "", phone: "", email: "", address: "" }}
          onSubmit={(payload, id) => vendorMutation.mutateAsync({ id, payload })}
          idLabel="Vendor ID for edit"
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "phone", label: "Phone", type: "text" },
            { key: "email", label: "Email", type: "text" },
            { key: "address", label: "Address", type: "textarea" }
          ]}
        />
        <MasterForm
          title="Product Catalog"
          description="Set price and reorder controls"
          initialState={{ name: "", sku: "", price: 0, reorder_level: 0 }}
          onSubmit={(payload, id) => productMutation.mutateAsync({ id, payload })}
          idLabel="Product ID for edit"
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "sku", label: "SKU", type: "text" },
            { key: "price", label: "Price", type: "number" },
            { key: "reorder_level", label: "Reorder Level", type: "number" }
          ]}
        />
      </div>

      <div className="grid gap-6">
        <DataTable
          title="Warehouses"
          rows={warehouses.data ?? []}
          emptyMessage="No warehouses found."
          columns={[
            { key: "id", header: "ID", render: (row: Warehouse) => <Badge>{row.warehouse_id}</Badge> },
            { key: "name", header: "Name", render: (row: Warehouse) => row.name },
            { key: "location", header: "Location", render: (row: Warehouse) => row.location },
            { key: "capacity", header: "Capacity", render: (row: Warehouse) => row.capacity },
            {
              key: "delete",
              header: "Action",
              render: (row: Warehouse) => (
                <Button tone="danger" onClick={() => deleteWarehouse.mutate(row.warehouse_id)}>
                  Delete
                </Button>
              )
            }
          ]}
        />
        <DataTable
          title="Vendors"
          rows={vendors.data ?? []}
          emptyMessage="No vendors found."
          columns={[
            { key: "id", header: "ID", render: (row: Vendor) => <Badge>{row.vendor_id}</Badge> },
            { key: "name", header: "Name", render: (row: Vendor) => row.name },
            { key: "phone", header: "Phone", render: (row: Vendor) => row.phone },
            { key: "email", header: "Email", render: (row: Vendor) => row.email },
            {
              key: "delete",
              header: "Action",
              render: (row: Vendor) => (
                <Button tone="danger" onClick={() => deleteVendor.mutate(row.vendor_id)}>
                  Delete
                </Button>
              )
            }
          ]}
        />
        <DataTable
          title="Products"
          rows={products.data ?? []}
          emptyMessage="No products found."
          columns={[
            { key: "id", header: "ID", render: (row: Product) => <Badge>{row.product_id}</Badge> },
            { key: "name", header: "Name", render: (row: Product) => row.name },
            { key: "sku", header: "SKU", render: (row: Product) => row.sku },
            { key: "price", header: "Price", render: (row: Product) => row.price.toFixed(2) },
            { key: "reorder", header: "Reorder Level", render: (row: Product) => row.reorder_level },
            {
              key: "delete",
              header: "Action",
              render: (row: Product) => (
                <Button tone="danger" onClick={() => deleteProduct.mutate(row.product_id)}>
                  Delete
                </Button>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}

function MasterForm<T extends Record<string, string | number>>({
  title,
  description,
  initialState,
  onSubmit,
  idLabel,
  fields
}: {
  title: string;
  description: string;
  initialState: T;
  onSubmit: (payload: T, id?: number) => Promise<unknown>;
  idLabel: string;
  fields: Array<{ key: keyof T; label: string; type: "text" | "number" | "textarea" }>;
}) {
  const [editId, setEditId] = useState("");
  const [state, setState] = useState<T>(initialState);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(state, editId ? Number(editId) : undefined);
    setEditId("");
    setState(initialState);
  }

  return (
    <Card>
      <h3 className="font-display text-xl text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm text-slate-300">{idLabel}</label>
          <Input placeholder="Leave empty to create new" value={editId} onChange={(event) => setEditId(event.target.value)} />
        </div>
        {fields.map((field) => (
          <div key={String(field.key)}>
            <label className="mb-2 block text-sm text-slate-300">{field.label}</label>
            {field.type === "textarea" ? (
              <Textarea
                value={String(state[field.key] ?? "")}
                onChange={(event) => setState({ ...state, [field.key]: event.target.value })}
              />
            ) : (
              <Input
                type={field.type}
                value={String(state[field.key] ?? "")}
                onChange={(event) =>
                  setState({
                    ...state,
                    [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value
                  })
                }
              />
            )}
          </div>
        ))}
        <Button className="w-full" type="submit">
          {editId ? "Update record" : "Create record"}
        </Button>
      </form>
    </Card>
  );
}
