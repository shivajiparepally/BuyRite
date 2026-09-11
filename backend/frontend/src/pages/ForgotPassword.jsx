import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth, errMessage } from "../context/AuthContext";
import { OtpInput } from "../components/OtpInput";

export default function ForgotPassword() {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "reset"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setStep("reset");
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      await confirmPasswordReset(email, code, newPassword);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errMessage(err, "Could not reset your password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-dark px-5">
      <div className="max-w-sm w-full text-white text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-orange flex items-center justify-center">
          <KeyRound color="#fff" size={26} />
        </div>
        <h1 className="font-display text-2xl mb-2">Reset your password</h1>

        {step === "email" ? (
          <>
            <p className="text-xs text-[#E8B4A8] mb-6">
              Enter your account email and we'll send you a 6-digit reset code.
            </p>
            <form onSubmit={sendCode} className="text-left">
              <label className="text-xs text-[#E8B4A8]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg mb-4 mt-1 text-ink"
              />
              {error && <div className="bg-[#6E0A1B] rounded-lg p-3 text-sm mb-4">{error}</div>}
              <button disabled={loading} className="w-full py-3 rounded-lg bg-orange font-semibold disabled:opacity-60">
                {loading ? "Sending..." : "Send reset code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-xs text-[#E8B4A8] mb-6">
              Enter the code sent to <strong className="text-white">{email}</strong> and choose a new password.
            </p>
            <form onSubmit={reset} className="text-left">
              <OtpInput value={code} onChange={setCode} />
              <label className="text-xs text-[#E8B4A8] block mt-4">New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg mb-4 mt-1 text-ink"
              />
              {error && <div className="bg-[#6E0A1B] rounded-lg p-3 text-sm mb-4">{error}</div>}
              <button
                disabled={loading || code.length < 6}
                className="w-full py-3 rounded-lg bg-orange font-semibold disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
            <button onClick={() => setStep("email")} className="text-xs text-[#E8B4A8] underline mt-4">
              Use a different email
            </button>
          </>
        )}

        <p className="text-sm text-[#E8B4A8] mt-5">
          <Link to="/login" className="text-white underline">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
