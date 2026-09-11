import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import client from "../../api/client";

export default function AdminPromotions() {
  const [categories, setCategories] = useState([]);
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", category: "" });

  const load = async () => {
    const [cats, proms] = await Promise.all([
      client.get("/catalog/categories/"),
      client.get("/promotions/"),
    ]);
    setCategories(cats.data.results ?? cats.data);
    setPromos(proms.data.results ?? proms.data);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.title || !form.category) return;
    await client.post("/promotions/", form);
    setForm({ title: "", subtitle: "", category: "" });
    load();
  };
  const remove = async (id) => { await client.delete(`/promotions/${id}/`); load(); };

  return (
    <div>
      <h3 className="font-display mt-0">Homepage Promotions</h3>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
        <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm">
          <option value="">Category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={add} className="px-4 py-2 rounded-lg bg-red text-white text-sm font-semibold">Add</button>
      </div>
      {promos.map((p) => (
        <div key={p.id} className="flex justify-between items-center px-3.5 py-2.5 border border-cream rounded-lg mb-2">
          <div>
            <strong className="text-sm">{p.title}</strong>
            <span className="text-mute text-xs ml-2">{p.subtitle}</span>
          </div>
          <button onClick={() => remove(p.id)} className="p-1 text-mute"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}
