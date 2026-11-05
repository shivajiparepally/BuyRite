import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { AuthModal } from "../components/AuthModal";
import { OrderCelebration } from "../components/OrderCelebration";
import { CategoryGlyph } from "../components/CategoryGlyph";
import { ProductCard } from "../components/ProductCard";
import { PriceTag } from "../components/PriceTag";
import { SubstitutionModal } from "../components/SubstitutionModal";
import { Reveal } from "../components/Reveal";
import { playCapPop } from "../utils/sounds";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, changeQty, removeItem, itemForVariant, items, clear } = useCart();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hours, setHours] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);
  const pendingAction = useRef(null);

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setImgFailed(false);
    window.scrollTo({ top: 0 });
    client
      .get(`/catalog/products/${id}/`)
      .then((r) => {
        setProduct(r.data);
        client
          .get("/catalog/products/", { params: { category: r.data.category, page_size: 20 } })
          .then((r2) => setRelated((r2.data.results ?? r2.data).filter((p) => p.id !== Number(id))))
          .catch(() => setRelated([]));
      })
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    client.get("/catalog/categories/").then((r) => setCategories(r.data.results ?? r.data)).catch(() => {});
    client.get("/store-hours/").then((r) => setHours(r.data.results ?? r.data)).catch(() => {});
  }, []);

  const requireAuth = (action) => {
    if (user) action();
    else {
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

  const variant = product?.variants?.[0];
  const outOfStock = variant && !variant.in_stock;
  const line = variant ? itemForVariant(variant.id) : null;
  const qty = line?.qty ?? 0;
  const save = variant?.sale_price ? Number(variant.price) - Number(variant.sale_price) : 0;

  const doAdd = () => {
    addItem(variant, product, null);
    playCapPop();
  };
  const handleAdd = () => {
    if (outOfStock) return setShowSub(true);
    if (!user) return requireAuth(doAdd);
    doAdd();
  };
  const inc = () => {
    if (!line) return handleAdd();
    changeQty(line.cartId, 1);
    playCapPop();
  };
  const dec = () => {
    if (!line) return;
    qty <= 1 ? removeItem(line.cartId) : changeQty(line.cartId, -1);
  };

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
    } catch (e) {
      setError(e.response?.data ? JSON.stringify(e.response.data) : "Something went wrong submitting the order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#fdf7f6] flex flex-col">
        <Header products={[]} search="" setSearch={() => {}} onCartClick={() => setCartOpen(true)} categories={categories} hours={hours} />
        <div className="max-w-6xl mx-auto px-6 py-16 text-center flex-1">
          <p className="text-mute mb-3">That product couldn't be found.</p>
          <Link to="/" className="text-red font-semibold">← Back to shopping</Link>
        </div>
        <Footer categories={categories} onCategory={() => navigate("/")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7f6] font-sans text-ink flex flex-col" style={{ overflowX: "clip" }}>
      {banner && <OrderCelebration message={banner} onDone={() => setBanner(null)} />}

      <Header products={[]} search="" setSearch={() => {}} onCartClick={() => setCartOpen(true)} categories={categories} hours={hours} />

      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex-1">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-mute mb-4 hover:text-red">
          <ArrowLeft size={15} /> Back
        </button>

        {error && <div className="bg-cream text-red text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        {!product ? (
          <p className="text-mute text-sm">Loading…</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8">
              {/* picture half */}
              <div className="relative aspect-square md:aspect-[4/5] bg-white border border-cream rounded-2xl flex items-center justify-center overflow-hidden">
                {product.image_url && !imgFailed ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    onError={() => setImgFailed(true)}
                    className={`w-full h-full object-cover ${outOfStock ? "grayscale opacity-70" : ""}`}
                  />
                ) : (
                  <CategoryGlyph slug={product.category_name?.toLowerCase().replace(/[^a-z]+/g, "-")} size={120} />
                )}
                {save > 0 && !outOfStock && (
                  <span className="absolute top-3 left-3 bg-orange text-white text-xs font-bold px-2.5 py-1.5 rounded">
                    SAVE ${save.toFixed(2)}
                  </span>
                )}
                {outOfStock && (
                  <span className="absolute top-3 left-3 bg-cream text-red text-xs font-bold px-2.5 py-1.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* details half */}
              <div>
                <span className="text-xs uppercase tracking-wider text-mute">{product.category_name}</span>
                <h1 className="font-display text-3xl text-ink mt-1 mb-2">{product.name}</h1>
                <p className="text-sm text-mute mb-4">{variant?.size} · SKU {variant?.sku}</p>
                {product.description && (
                  <p className="text-sm text-ink leading-relaxed mb-5">{product.description}</p>
                )}
                <div className="mb-5">
                  <PriceTag price={variant?.price} salePrice={variant?.sale_price} />
                </div>

                {!outOfStock && qty > 0 ? (
                  <div className="flex items-center justify-between bg-red text-white rounded-lg px-3 py-2.5 max-w-xs">
                    <button onClick={dec} aria-label="Decrease quantity" className="w-9 h-8 flex items-center justify-center transition-transform active:scale-90">
                      <Minus size={16} />
                    </button>
                    <span className="text-base font-semibold tabular-nums">{qty} in cart</span>
                    <button onClick={inc} aria-label="Increase quantity" className="w-9 h-8 flex items-center justify-center transition-transform active:scale-90">
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAdd}
                    className={`max-w-xs w-full py-3 rounded-lg text-sm font-semibold transition active:scale-95 ${
                      outOfStock ? "bg-cream text-red hover:bg-cream/70" : "bg-red text-white hover:bg-red-dark"
                    }`}
                  >
                    {outOfStock ? "Request Substitute" : "Add to Cart"}
                  </button>
                )}
              </div>
            </div>

            {related.length > 0 && (
              <Reveal>
                <section className="mt-12">
                  <h2 className="font-display text-xl text-ink mb-3">More from {product.category_name}</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                    {related.map((p, i) => (
                      <div key={p.id} className="w-[210px] shrink-0">
                        <ProductCard product={p} categoryIndex={i} onRequireAuth={requireAuth} />
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}
          </>
        )}
      </main>

      <Footer categories={categories} onCategory={() => navigate("/")} />

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
