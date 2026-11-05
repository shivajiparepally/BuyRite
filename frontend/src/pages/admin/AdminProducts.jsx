import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Upload, ImageOff, Search } from "lucide-react";
import client from "../../api/client";

const fmt = (n) => `$${Number(n).toFixed(2)}`;

const emptyForm = {
  name: "", category: "", description: "", image_url: "",
  size: "750ml", price: "", stock: "", sale_price: "",
};

export default function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // "new" | product id | null
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileRef = useRef(null);

  // toolbar: search / category / size / sort
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const load = async () => {
    const [cats, prods] = await Promise.all([
      client.get("/catalog/categories/"),
      client.get("/catalog/products/", { params: { page_size: 500 } }),
    ]);
    setCategories(cats.data.results ?? cats.data);
    setProducts(prods.data.results ?? prods.data);
  };

  useEffect(() => { load(); }, []);

  // Every size that exists anywhere in the catalog right now — grows
  // automatically the moment a product with a new size is saved and the
  // list reloads, since this is just derived from the live product list.
  const allSizes = useMemo(() => {
    const set = new Set();
    products.forEach((p) => { const s = p.variants?.[0]?.size; if (s) set.add(s); });
    return Array.from(set).sort();
  }, [products]);

  const visible = useMemo(() => {
    let list = products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && String(p.category) !== String(categoryFilter)) return false;
      if (sizeFilter && p.variants?.[0]?.size !== sizeFilter) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const va = a.variants?.[0], vb = b.variants?.[0];
      if (sortBy === "price-asc") return (va ? Number(va.price) : 0) - (vb ? Number(vb.price) : 0);
      if (sortBy === "price-desc") return (vb ? Number(vb.price) : 0) - (va ? Number(va.price) : 0);
      if (sortBy === "stock-asc") return (va?.stock ?? 0) - (vb?.stock ?? 0);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, search, categoryFilter, sizeFilter, sortBy]);

  const startNew = () => { setEditing("new"); setForm({ ...emptyForm, category: categories[0]?.id ?? "" }); setUploadError(null); };
  const startEdit = (p) => {
    const v = p.variants?.[0];
    setEditing(p.id);
    setUploadError(null);
    setForm({
      name: p.name, category: p.category, description: p.description || "", image_url: p.image_url || "",
      size: v?.size || "750ml", price: v ? String(v.price) : "",
      stock: v ? String(v.stock) : "", sale_price: v?.sale_price ? String(v.sale_price) : "",
      variantId: v?.id,
    });
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await client.post("/catalog/upload-image/", body);
      setForm((f) => ({ ...f, image_url: data.image_url }));
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Upload failed. Try a smaller JPEG/PNG.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    // stock is optional — omit it entirely when blank instead of sending ""
    // (an empty string fails integer validation; omitting it lets the
    // database default of 0 apply, the same as if it were never set).
    const variantPayload = {
      size: form.size, price: form.price, sale_price: form.sale_price || null,
      ...(form.stock !== "" ? { stock: form.stock } : {}),
    };
    if (editing === "new") {
      const { data: product } = await client.post("/catalog/products/", {
        name: form.name, category: form.category, description: form.description, image_url: form.image_url,
      });
      await client.post("/catalog/variants/", {
        product: product.id, sku: `SKU-${Date.now()}`, ...variantPayload,
      });
    } else {
      await client.patch(`/catalog/products/${editing}/`, {
        name: form.name, category: form.category, description: form.description, image_url: form.image_url,
      });
      if (form.variantId) {
        await client.patch(`/catalog/variants/${form.variantId}/`, variantPayload);
      }
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => { await client.delete(`/catalog/products/${id}/`); load(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-3.5">
        <h3 className="font-display m-0">Products ({visible.length}{visible.length !== products.length ? ` of ${products.length}` : ""})</h3>
        <button onClick={startNew} className="px-4 py-2 rounded-lg bg-red text-white text-sm font-semibold">+ Add Product</button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mb-4 bg-cream/60 rounded-lg px-3 py-2.5">
        <div className="flex items-center bg-white rounded-lg px-2.5 py-1.5 border border-gray-300">
          <Search size={14} className="text-mute shrink-0" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-1.5 text-sm outline-none border-none min-w-[140px]"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white">
          <option value="">All sizes</option>
          {allSizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white">
          <option value="name">Sort: Name A-Z</option>
          <option value="price-asc">Sort: Price Low-High</option>
          <option value="price-desc">Sort: Price High-Low</option>
          <option value="stock-asc">Sort: Stock Low-High</option>
        </select>
        {(search || categoryFilter || sizeFilter) && (
          <button
            onClick={() => { setSearch(""); setCategoryFilter(""); setSizeFilter(""); }}
            className="text-xs text-mute underline"
          >
            Clear filters
          </button>
        )}
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
            <input placeholder="Stock (optional)" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
            <input placeholder="Sale price (optional)" type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm" />
            <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm col-span-2" />
          </div>

          <div className="mt-2.5 flex gap-3 items-start">
            <div className="w-16 h-16 rounded-lg bg-white border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
              {form.image_url ? (
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              ) : (
                <ImageOff size={18} className="text-mute" />
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs text-mute">Product image — paste a URL or upload a file</label>
              <input
                placeholder="https://example.com/bottle.jpg"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-sm mt-1"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold disabled:opacity-60"
                >
                  <Upload size={13} /> {uploading ? "Uploading..." : "Upload image"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                />
                {uploadError && <span className="text-red text-xs">{uploadError}</span>}
              </div>
            </div>
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
              <th className="py-2 px-2.5"></th><th className="py-2 px-2.5">Name</th><th className="py-2 px-2.5">Category</th><th className="py-2 px-2.5">Size</th><th className="py-2 px-2.5">Price</th><th className="py-2 px-2.5">Stock</th><th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => {
              const v = p.variants?.[0];
              return (
                <tr key={p.id} className="border-b border-cream">
                  <td className="py-2 px-2.5">
                    <div className="w-9 h-9 rounded bg-cream overflow-hidden flex items-center justify-center">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                      ) : (
                        <ImageOff size={13} className="text-mute" />
                      )}
                    </div>
                  </td>
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
            {visible.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-mute text-sm">No products match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
