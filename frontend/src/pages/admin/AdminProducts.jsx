import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import client from "../../api/client";

const fmt = (n) => `$${Number(n).toFixed(2)}`;

const emptyForm = { name: "", category: "", description: "", size: "750ml", price: "", stock: "", sale_price: "" };

export default function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // "new" | product id | null
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [cats, prods] = await Promise.all([
      client.get("/catalog/categories/"),
      client.get("/catalog/products/", { params: { page_size: 500 } }),
    ]);
    setCategories(cats.data.results ?? cats.data);
    setProducts(prods.data.results ?? prods.data);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing("new"); setForm({ ...emptyForm, category: categories[0]?.id ?? "" }); };
  const startEdit = (p) => {
    const v = p.variants?.[0];
    setEditing(p.id);
    setForm({
      name: p.name, category: p.category, description: p.description || "",
      size: v?.size || "750ml", price: v ? String(v.price) : "",
      stock: v ? String(v.stock) : "", sale_price: v?.sale_price ? String(v.sale_price) : "",
      variantId: v?.id,
    });
  };

  const save = async () => {
    if (editing === "new") {
      const { data: product } = await client.post("/catalog/products/", {
        name: form.name, category: form.category, description: form.description,
      });
      await client.post("/catalog/variants/", {
        product: product.id, size: form.size, sku: `SKU-${Date.now()}`,
        price: form.price, stock: form.stock, sale_price: form.sale_price || null,
      });
    } else {
      await client.patch(`/catalog/products/${editing}/`, {
        name: form.name, category: form.category, description: form.description,
      });
      if (form.variantId) {
        await client.patch(`/catalog/variants/${form.variantId}/`, {
          size: form.size, price: form.price, stock: form.stock, sale_price: form.sale_price || null,
        });
      }
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => { await client.delete(`/catalog/products/${id}/`); load(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-3.5">
        <h3 className="font-display m-0">Products ({products.length})</h3>
        <button onClick={startNew} className="px-4 py-2 rounded-lg bg-red text-white text-sm font-semibold">+ Add Product</button>
      </div>

      {editing && (
        <div className="bg-cream rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-2.5">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Size (e.g. 750ml)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
            <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
            <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
            <input placeholder="Sale price (optional)" type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
            <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm col-span-2" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={save} className="px-4 py-2 rounded-lg bg-red text-white text-sm font-semibold">Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-y-auto max-h-[480px]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-mute border-b border-gray-200">
              <th className="py-2 px-2.5">Name</th><th className="py-2 px-2.5">Category</th><th className="py-2 px-2.5">Size</th><th className="py-2 px-2.5">Price</th><th className="py-2 px-2.5">Stock</th><th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const v = p.variants?.[0];
              return (
                <tr key={p.id} className="border-b border-cream">
                  <td className="py-2 px-2.5">{p.name}</td>
                  <td className="py-2 px-2.5">{p.category_name}</td>
                  <td className="py-2 px-2.5">{v?.size}</td>
                  <td className="py-2 px-2.5">{v ? (v.sale_price ? <span><s className="text-mute">{fmt(v.price)}</s> {fmt(v.sale_price)}</span> : fmt(v.price)) : "—"}</td>
                  <td className="py-2 px-2.5">{v?.stock === 0 ? <span className="text-red">0</span> : v?.stock}</td>
                  <td className="py-2 px-2.5">
                    <button onClick={() => startEdit(p)} className="p-1 text-mute"><Pencil size={14} /></button>
                    <button onClick={() => remove(p.id)} className="p-1 text-mute"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
