import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth, errMessage } from "../context/AuthContext";
import { OtpInput } from "../components/OtpInput";

export default function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = location.state?.email || params.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errMessage(err, "That code didn't work."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-dark px-5">
      <div className="max-w-sm w-full text-white text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-orange flex items-center justify-center">
          <MailCheck color="#fff" size={28} />
        </div>
        <h1 className="font-display text-2xl mb-2">Verify your email</h1>
        <p className="text-xs text-[#E8B4A8] mb-6">
          We sent a 6-digit code to {email ? <strong className="text-white">{email}</strong> : "your email"}.
          Enter it below to finish creating your account.
        </p>
        <form onSubmit={submit}>
          <OtpInput value={code} onChange={setCode} />
          {error && <div className="bg-[#6E0A1B] rounded-lg p-3 text-sm mt-4">{error}</div>}
          <button
            disabled={loading || code.length < 6}
            className="w-full mt-5 py-3 rounded-lg bg-orange font-semibold disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
        <button
          onClick={async () => {
            try {
              await resendVerification(email);
              setResent(true);
            } catch {
              /* ignore */
            }
          }}
          className="text-sm text-[#E8B4A8] underline mt-5"
        >
          {resent ? "New code sent" : "Didn't get it? Resend code"}
        </button>
        <p className="text-sm text-[#E8B4A8] mt-4">
          <Link to="/login" className="text-white underline">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
