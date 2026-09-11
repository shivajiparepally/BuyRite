import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Truck, Store, Clock } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Header } from "../components/Header";
import { PromoCarousel } from "../components/PromoCarousel";
import { ProductCard } from "../components/ProductCard";
import { CartDrawer } from "../components/CartDrawer";
import { AuthModal } from "../components/AuthModal";
import { Footer } from "../components/Footer";

const FEATURES = [
  { icon: Store, title: "Order online, pay at pickup", body: "No card needed up front — settle up at the counter." },
  { icon: Truck, title: "Curbside available", body: "We'll bring your order out when you arrive." },
  { icon: Clock, title: "Ready same day", body: "Most orders are ready within the hour during store hours." },
];

export default function Home() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [hours, setHours] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState(null);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const pendingAction = useRef(null);

  const requireAuth = (action) => {
    if (user) {
      action();
    } else {
      pendingAction.current = action;
      setAuthOpen(true);
    }
  };

  const onAuthSuccess = () => {
    setAuthOpen(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  };

  const selectCategory = (key) => {
    setActiveCategory(key);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    Promise.all([
      client.get("/catalog/categories/"),
      client.get("/catalog/products/", { params: { page_size: 200 } }),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.results ?? catRes.data);
        setProducts(prodRes.data.results ?? prodRes.data);
        setCatalogLoaded(true);
      })
      .catch(() => setLoadError("Can't reach the backend. Make sure the API server is running, then reload."));
    client.get("/promotions/").then((r) => setPromos(r.data.results ?? r.data)).catch(() => setPromos([]));
    client.get("/store-hours/").then((r) => setHours(r.data.results ?? r.data)).catch(() => setHours([]));
  }, []);

  const onSale = (p) => p.variants?.[0]?.sale_price != null;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory === "deals") {
        if (!onSale(p)) return false;
      } else if (activeCategory && p.category !== activeCategory) {
        return false;
      }
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, activeCategory, search]);

  const deals = useMemo(() => products.filter(onSale).slice(0, 8), [products]);
  const showDealsRail = !search && activeCategory == null && deals.length > 0;
  const activeName =
    activeCategory === "deals"
      ? "Deals"
      : categories.find((c) => c.id === activeCategory)?.name || "All Products";

  const submitOrder = async (schedule) => {
    if (!user) {
      setError("Please log in before submitting an order.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        schedule,
        items: items.map((i) => ({
          product_variant: i.variantId,
          quantity: i.qty,
          ...(i.subChoice ? { substitution_choice: i.subChoice } : {}),
        })),
      };
      const { data } = await client.post("/orders/", payload);
      clear();
      setCartOpen(false);
      setBanner(`Order #${data.id} submitted — pay at pickup (${schedule}).`);
      setTimeout(() => setBanner(null), 4500);
    } catch (e) {
      setError(e.response?.data ? JSON.stringify(e.response.data) : "Something went wrong submitting the order.");
    } finally {
      setSubmitting(false);
    }
  };

  const gridStyle = { gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" };

  return (
    <div className="min-h-screen bg-[#fdf7f6] font-sans text-ink flex flex-col">
      {banner && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-red text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg">
          <Bell size={16} /> <span className="text-sm">{banner}</span>
        </div>
      )}

      <Header
        products={products}
        search={search}
        setSearch={setSearch}
        onCartClick={() => setCartOpen(true)}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={selectCategory}
        hours={hours}
      />

      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex-1">
        <PromoCarousel promos={promos} onJump={(catId) => selectCategory(catId)} />

        <div className="grid gap-3 sm:grid-cols-3 mt-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-cream rounded-xl p-4 flex gap-3">
              <f.icon size={20} className="text-red shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-ink">{f.title}</div>
                <div className="text-xs text-mute leading-relaxed">{f.body}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="bg-cream text-red text-sm rounded-lg px-4 py-3 mt-5">{error}</div>}

        {loadError ? (
          <div className="bg-cream text-red text-sm rounded-lg px-4 py-3 mt-5">{loadError}</div>
        ) : catalogLoaded && products.length === 0 ? (
          <div className="bg-cream text-ink text-sm rounded-lg px-4 py-3 mt-5">
            The catalog is empty. Run <span className="font-mono">python manage.py seed_demo_data</span> on the backend to load demo products.
          </div>
        ) : (
          <>
            {showDealsRail && (
              <section className="mt-8">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-xl text-ink m-0">On Sale Now</h2>
                  <button onClick={() => selectCategory("deals")} className="text-sm text-red font-semibold">
                    See all deals
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {deals.map((p, i) => (
                    <div key={p.id} className="w-[210px] shrink-0">
                      <ProductCard product={p} categoryIndex={i} onRequireAuth={requireAuth} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-xl text-ink m-0">{activeName}</h2>
                <span className="text-sm text-mute">{filtered.length} item{filtered.length === 1 ? "" : "s"}</span>
              </div>
              <div className="grid gap-4" style={gridStyle}>
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} categoryIndex={i} onRequireAuth={requireAuth} />
                ))}
              </div>
              {catalogLoaded && filtered.length === 0 && (
                <p className="text-mute text-sm">No products match your search.</p>
              )}
            </section>
          </>
        )}
      </main>

      <Footer categories={categories} onCategory={selectCategory} />

      {cartOpen && (
        <CartDrawer onClose={() => setCartOpen(false)} hours={hours} onSubmit={submitOrder} submitting={submitting} />
      )}

      <AuthModal
        open={authOpen}
        onClose={() => { pendingAction.current = null; setAuthOpen(false); }}
        onSuccess={onAuthSuccess}
        reason="Log in or create an account to add items to your cart."
      />
    </div>
  );
}
