import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import client from "../../api/client";

const emptyForm = { title: "", subtitle: "", category: "", products: [] };

export default function AdminPromotions() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [cats, prods, proms] = await Promise.all([
      client.get("/catalog/categories/"),
      client.get("/catalog/products/", { params: { page_size: 500 } }),
      client.get("/promotions/"),
    ]);
    setCategories(cats.data.results ?? cats.data);
    setProducts(prods.data.results ?? prods.data);
    setPromos(proms.data.results ?? proms.data);
  };
  useEffect(() => { load(); }, []);

  const toggleProduct = (id) =>
    setForm((f) => ({
      ...f,
      products: f.products.includes(id) ? f.products.filter((x) => x !== id) : [...f.products, id],
    }));

  const add = async () => {
    if (!form.title || !form.category) return;
    await client.post("/promotions/", form);
    setForm(emptyForm);
    load();
  };
  const remove = async (id) => { await client.delete(`/promotions/${id}/`); load(); };

  return (
    <div>
      <h3 className="font-display mt-0">Homepage Promotions</h3>

      <div className="bg-cream rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
          <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="mt-3">
          <label className="text-xs text-mute">Related products (optional) — shoppers see these when they follow this promotion</label>
          <div className="mt-1.5 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg p-2 grid grid-cols-2 gap-x-3">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-1.5 text-xs py-1 cursor-pointer">
                <input type="checkbox" checked={form.products.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
          {form.products.length > 0 && (
            <div className="text-xs text-mute mt-1">{form.products.length} product{form.products.length === 1 ? "" : "s"} selected</div>
          )}
        </div>

        <button onClick={add} className="px-4 py-2 mt-3 rounded-lg bg-red text-white text-sm font-semibold">Add Promotion</button>
      </div>

      {promos.map((p) => (
        <div key={p.id} className="flex justify-between items-center px-3.5 py-2.5 border border-cream rounded-lg mb-2">
          <div>
            <strong className="text-sm">{p.title}</strong>
            <span className="text-mute text-xs ml-2">{p.subtitle}</span>
            {p.product_names?.length > 0 && (
              <div className="text-[11px] text-mute mt-0.5">Products: {p.product_names.join(", ")}</div>
            )}
          </div>
          <button onClick={() => remove(p.id)} className="p-1 text-mute"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}
