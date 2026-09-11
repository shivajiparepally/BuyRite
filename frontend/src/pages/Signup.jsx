import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassWater } from "lucide-react";
import { useAuth, errMessage } from "../context/AuthContext";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "", first_name: "", last_name: "",
    date_of_birth: "", phone_number: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.phone_number.replace(/\D/g, "").length < 10) {
      setError("A valid phone number (at least 10 digits) is required so the store can reach you about your order.");
      return;
    }
    setLoading(true);
    try {
      const { email } = await register(form);
      navigate("/verify-email", { state: { email } });
    } catch (e) {
      setError(errMessage(e, "Something went wrong creating your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-dark px-5 py-10">
      <div className="max-w-sm w-full text-white text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-orange flex items-center justify-center">
          <GlassWater color="#fff" size={28} />
        </div>
        <h1 className="font-display text-2xl mb-2">Create Account</h1>
        <p className="text-xs text-[#E8B4A8] mb-6">You must be 21 or older to shop here.</p>
        <form onSubmit={submit} className="text-left space-y-3.5">
          <div>
            <label className="text-xs text-[#E8B4A8]">Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#E8B4A8]">First name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#E8B4A8]">Last name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#E8B4A8]">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink" />
          </div>
          <div>
            <label className="text-xs text-[#E8B4A8]">Date of Birth</label>
            <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink" />
          </div>
          <div>
            <label className="text-xs text-[#E8B4A8]">Phone number <span className="text-white">(required)</span></label>
            <input type="tel" required placeholder="e.g. 732-555-0100" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink" />
          </div>
          <div>
            <label className="text-xs text-[#E8B4A8]">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg mt-1 text-ink" />
          </div>
          {error && <div className="bg-[#6E0A1B] rounded-lg p-3 text-sm">{error}</div>}
          <button disabled={loading} className="w-full py-3 rounded-lg bg-orange font-semibold disabled:opacity-60">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-[#E8B4A8] mt-5">
          Already have an account? <Link to="/login" className="text-white underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
