import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, ShieldCheck, Package, LogOut, CheckCircle2 } from "lucide-react";
import client from "../api/client";
import { useAuth, errMessage } from "../context/AuthContext";
import { OtpModal } from "../components/OtpModal";
import { ConfirmModal } from "../components/ConfirmModal";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Login & Security", icon: ShieldCheck },
  { id: "orders", label: "Order History", icon: Package },
];

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-ink mt-1";
const labelCls = "text-xs text-mute";

function Card({ title, children }) {
  return (
    <div className="bg-white border border-cream rounded-xl p-5 mb-4">
      {title && <h3 className="font-display text-base text-ink mt-0 mb-3">{title}</h3>}
      {children}
    </div>
  );
}

export default function Account() {
  const { user, logout, updateProfile, changePassword, changeUsername, changeEmail } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [toast, setToast] = useState(null);
  const [pending, setPending] = useState(null); // active OTP flow
  const [confirmLogout, setConfirmLogout] = useState(false);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fdf7f6]">
      <div className="bg-red-dark text-white px-6 py-4 flex items-center gap-3.5">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-white">
          <ArrowLeft size={17} />
        </button>
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Buy Rite Renaissance Spirits" className="h-8 w-auto rounded ml-2.5" />
        <h2 className="font-display m-0 ml-2.5 text-xl">My Account</h2>
        <button onClick={() => setConfirmLogout(true)} className="ml-auto flex items-center gap-1.5 text-sm">
          <LogOut size={15} /> Log out
        </button>
      </div>

      <ConfirmModal
        open={confirmLogout}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Yes, log out"
        cancelLabel="No"
        onConfirm={() => { setConfirmLogout(false); logout(); navigate("/"); }}
        onCancel={() => setConfirmLogout(false)}
      />

      {toast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-ink text-white px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto p-6 grid gap-6" style={{ gridTemplateColumns: "220px 1fr" }}>
        <nav className="flex flex-col gap-1 h-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm text-left ${
                tab === t.id ? "bg-white border border-cream font-semibold text-red" : "text-ink"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "profile" && <ProfileTab user={user} updateProfile={updateProfile} flash={flash} />}
          {tab === "security" && (
            <SecurityTab
              user={user}
              flash={flash}
              startFlow={setPending}
              changePassword={changePassword}
              changeUsername={changeUsername}
              changeEmail={changeEmail}
            />
          )}
          {tab === "orders" && <OrdersTab />}
        </div>
      </div>

      <OtpModal
        open={!!pending}
        title={pending?.title}
        message={pending?.message}
        onClose={() => setPending(null)}
        onResend={pending?.resend}
        onSubmit={async (code) => {
          try {
            await pending.confirm(code);
          } catch (err) {
            throw new Error(errMessage(err, "That code didn't work."));
          }
          setPending(null);
          flash(pending.success);
        }}
      />
    </div>
  );
}

function ProfileTab({ user, updateProfile, flash }) {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone_number: user.phone_number || "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(form);
      flash("Profile updated");
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <Card title="Personal details">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>First name</label>
            <input value={form.first_name} onChange={set("first_name")} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input value={form.last_name} onChange={set("last_name")} className={inputCls} />
          </div>
        </div>
        <div className="mt-3">
          <label className={labelCls}>Phone number</label>
          <input value={form.phone_number} onChange={set("phone_number")} className={inputCls} />
        </div>
        {error && <div className="text-red text-xs mt-3">{error}</div>}
        <button disabled={saving} className="mt-4 px-5 py-2.5 rounded-lg bg-red text-white text-sm font-semibold disabled:opacity-60">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </Card>

      <Card title="Account">
        <Row label="Username" value={user.username} />
        <Row
          label="Email"
          value={
            <span className="flex items-center gap-2">
              {user.email}
              {user.email_verified ? (
                <span className="text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Verified</span>
              ) : (
                <span className="text-[11px] text-orange bg-cream px-2 py-0.5 rounded-full">Unverified</span>
              )}
            </span>
          }
        />
        <p className="text-xs text-mute mt-3">
          Change your username or email under <strong>Login &amp; Security</strong>.
        </p>
      </Card>
    </form>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-cream last:border-0 text-sm">
      <span className="text-mute">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function SecurityTab({ user, flash, startFlow, changePassword, changeUsername, changeEmail }) {
  const [pw, setPw] = useState({ current_password: "", new_password: "" });
  const [uname, setUname] = useState({ new_username: "", password: "" });
  const [em, setEm] = useState({ new_email: "", password: "" });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(null);

  const run = async (key, fn, onOtp) => {
    setBusy(key);
    setErr((e) => ({ ...e, [key]: null }));
    try {
      await fn();
      onOtp();
    } catch (error) {
      setErr((e) => ({ ...e, [key]: errMessage(error) }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Card title="Change password">
        <label className={labelCls}>Current password</label>
        <input type="password" value={pw.current_password}
          onChange={(e) => setPw({ ...pw, current_password: e.target.value })} className={inputCls} />
        <label className={`${labelCls} block mt-3`}>New password</label>
        <input type="password" value={pw.new_password}
          onChange={(e) => setPw({ ...pw, new_password: e.target.value })} className={inputCls} />
        {err.pw && <div className="text-red text-xs mt-2">{err.pw}</div>}
        <button
          disabled={busy === "pw" || !pw.current_password || pw.new_password.length < 8}
          onClick={() =>
            run("pw", () => changePassword.request(pw.current_password, pw.new_password), () =>
              startFlow({
                title: "Confirm password change",
                message: `Enter the code we emailed to ${user.email}.`,
                confirm: (code) => changePassword.confirm(code, pw.new_password),
                resend: () => changePassword.request(pw.current_password, pw.new_password),
                success: "Password updated",
              })
            )
          }
          className="mt-4 px-5 py-2.5 rounded-lg bg-red text-white text-sm font-semibold disabled:opacity-60"
        >
          {busy === "pw" ? "Sending code..." : "Update password"}
        </button>
      </Card>

      <Card title="Change username">
        <label className={labelCls}>New username</label>
        <input value={uname.new_username}
          onChange={(e) => setUname({ ...uname, new_username: e.target.value })} className={inputCls} />
        <label className={`${labelCls} block mt-3`}>Current password</label>
        <input type="password" value={uname.password}
          onChange={(e) => setUname({ ...uname, password: e.target.value })} className={inputCls} />
        {err.uname && <div className="text-red text-xs mt-2">{err.uname}</div>}
        <button
          disabled={busy === "uname" || !uname.new_username || !uname.password}
          onClick={() =>
            run("uname", () => changeUsername.request(uname.new_username, uname.password), () =>
              startFlow({
                title: "Confirm username change",
                message: `Enter the code we emailed to ${user.email}.`,
                confirm: (code) => changeUsername.confirm(code),
                resend: () => changeUsername.request(uname.new_username, uname.password),
                success: "Username updated",
              })
            )
          }
          className="mt-4 px-5 py-2.5 rounded-lg bg-red text-white text-sm font-semibold disabled:opacity-60"
        >
          {busy === "uname" ? "Sending code..." : "Update username"}
        </button>
      </Card>

      <Card title="Change email">
        <label className={labelCls}>New email</label>
        <input type="email" value={em.new_email}
          onChange={(e) => setEm({ ...em, new_email: e.target.value })} className={inputCls} />
        <label className={`${labelCls} block mt-3`}>Current password</label>
        <input type="password" value={em.password}
          onChange={(e) => setEm({ ...em, password: e.target.value })} className={inputCls} />
        {err.em && <div className="text-red text-xs mt-2">{err.em}</div>}
        <button
          disabled={busy === "em" || !em.new_email || !em.password}
          onClick={() =>
            run("em", () => changeEmail.request(em.new_email, em.password), () =>
              startFlow({
                title: "Confirm your new email",
                message: `Enter the code we sent to ${em.new_email}.`,
                confirm: (code) => changeEmail.confirm(code),
                resend: () => changeEmail.request(em.new_email, em.password),
                success: "Email updated",
              })
            )
          }
          className="mt-4 px-5 py-2.5 rounded-lg bg-red text-white text-sm font-semibold disabled:opacity-60"
        >
          {busy === "em" ? "Sending code..." : "Update email"}
        </button>
      </Card>
    </>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .get("/orders/")
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => setError("Couldn't load your orders."));
  }, []);

  if (error) return <Card>{error}</Card>;
  if (orders === null) return <Card>Loading your orders…</Card>;
  if (orders.length === 0)
    return (
      <Card>
        <p className="text-sm text-mute m-0">
          You haven't placed any orders yet. <Link to="/" className="text-red underline">Start shopping</Link>.
        </p>
      </Card>
    );

  return orders
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((o) => (
      <Card key={o.id}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <strong className="text-ink">Order #{o.id}</strong>
            <div className="text-xs text-mute">{new Date(o.created_at).toLocaleString()}</div>
          </div>
          <span className="text-xs font-bold text-orange capitalize">{o.status}</span>
        </div>
        <ul className="list-none pl-0 my-2 border-y border-cream divide-y divide-cream">
          {o.items.map((i) => (
            <li key={i.id} className="flex justify-between py-1.5 text-xs">
              <span className="text-ink">
                {i.quantity}× {i.product_name} <span className="text-mute">· {i.size}</span>
              </span>
              <span className="text-mute">${Number(i.line_total).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="text-xs text-mute">
          Pickup {o.schedule} · <span className="text-ink font-semibold">total ${Number(o.total).toFixed(2)}</span>
        </div>
      </Card>
    ));
}
