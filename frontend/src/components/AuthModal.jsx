import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, GlassWater, MailCheck } from "lucide-react";
import { useAuth, errCode, errMessage } from "../context/AuthContext";
import { OtpInput } from "./OtpInput";

const field = "w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink";
const labelCls = "text-xs text-[#E8B4A8]";

export function AuthModal({ open, onClose, onSuccess, reason }) {
  const { login, register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [form, setForm] = useState({
    username: "", email: "", password: "", first_name: "", last_name: "",
    date_of_birth: "", phone_number: "",
  });

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const go = (m) => { setMode(m); setError(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && form.phone_number.replace(/\D/g, "").length < 10) {
      setError("A valid phone number (at least 10 digits) is required.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
        onSuccess?.();
      } else if (mode === "signup") {
        const { email } = await register(form);
        setPendingEmail(email);
        go("verify");
      } else {
        await verifyEmail(pendingEmail, code);
        onSuccess?.();
      }
    } catch (err) {
      if (mode === "login" && errCode(err) === "email_not_verified") {
        const em = err.response?.data?.email;
        setPendingEmail(Array.isArray(em) ? em[0] : em || form.email || form.username);
        go("verify");
      } else if (mode === "login") {
        setError("Invalid username or password.");
      } else {
        setError(errMessage(err, mode === "verify" ? "That code didn't work." : "Could not create your account."));
      }
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "login" ? "Log in to continue" : mode === "signup" ? "Create your account" : "Verify your email";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
      <div onClick={onClose} className="absolute inset-0 bg-black/55" />
      <div className="relative w-full max-w-sm bg-red-dark text-white rounded-2xl p-6 text-center">
        <button onClick={onClose} className="absolute top-3 right-3 text-white/80">
          <X size={20} />
        </button>
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange flex items-center justify-center">
          {mode === "verify" ? <MailCheck color="#fff" size={24} /> : <GlassWater color="#fff" size={24} />}
        </div>
        <h2 className="font-display text-xl mb-1">{title}</h2>
        <p className="text-xs text-[#E8B4A8] mb-5">
          {mode === "verify"
            ? `Enter the 6-digit code we sent to ${pendingEmail}.`
            : reason || "You need an account to add items to your cart."}
        </p>

        {mode === "verify" ? (
          <form onSubmit={submit}>
            <OtpInput value={code} onChange={setCode} />
            {error && <div className="bg-[#6E0A1B] rounded-lg p-3 text-sm mt-4">{error}</div>}
            <button disabled={loading || code.length < 6}
              className="w-full mt-5 py-3 rounded-lg bg-orange font-semibold disabled:opacity-60">
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button type="button" onClick={() => resendVerification(pendingEmail)}
              className="text-xs text-[#E8B4A8] underline mt-4">
              Resend code
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="text-left space-y-3">
            <div>
              <label className={labelCls}>Username</label>
              <input value={form.username} onChange={set("username")} className={field} />
            </div>

            {mode === "signup" && (
              <>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={labelCls}>First name</label>
                    <input value={form.first_name} onChange={set("first_name")} className={field} />
                  </div>
                  <div className="flex-1">
                    <label className={labelCls}>Last name</label>
                    <input value={form.last_name} onChange={set("last_name")} className={field} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={form.email} onChange={set("email")} className={field} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} className={field} />
                </div>
                <div>
                  <label className={labelCls}>Phone number <span className="text-white">(required)</span></label>
                  <input type="tel" value={form.phone_number} onChange={set("phone_number")}
                    placeholder="e.g. 732-555-0100" className={field} required />
                </div>
              </>
            )}

            <div>
              <label className={labelCls}>Password</label>
              <input type="password" value={form.password} onChange={set("password")} className={field} />
            </div>

            {error && <div className="bg-[#6E0A1B] rounded-lg p-3 text-sm">{error}</div>}

            <button disabled={loading}
              className="w-full py-3 rounded-lg bg-orange font-semibold disabled:opacity-60">
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account & Continue"}
            </button>
          </form>
        )}

        {mode !== "verify" && (
          <p className="text-sm text-[#E8B4A8] mt-4">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button onClick={() => go("signup")} className="text-white underline">Create an account</button>
                <span className="block mt-2">
                  <button
                    onClick={() => { onClose?.(); navigate("/forgot-password"); }}
                    className="text-white underline"
                  >
                    Forgot password?
                  </button>
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => go("login")} className="text-white underline">Log in</button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
