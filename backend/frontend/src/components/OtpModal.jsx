import React, { useEffect, useState } from "react";
import { X, MailCheck } from "lucide-react";
import { OtpInput } from "./OtpInput";

/**
 * "Enter the code we emailed you" dialog used by every credential-change flow.
 * onSubmit(code) should throw on failure; the thrown message is shown.
 */
export function OtpModal({ open, title, message, onClose, onSubmit, onResend }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setError(null);
      setResent(false);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e?.preventDefault();
    if (code.length < 6) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(code);
    } catch (err) {
      setError(err?.message || "That didn't work. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
      <div onClick={onClose} className="absolute inset-0 bg-black/55" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 text-center">
        <button onClick={onClose} className="absolute top-3 right-3 text-mute">
          <X size={20} />
        </button>
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-cream flex items-center justify-center">
          <MailCheck className="text-red" size={22} />
        </div>
        <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
        <p className="text-xs text-mute mb-5">{message}</p>

        <form onSubmit={submit}>
          <OtpInput value={code} onChange={setCode} />
          {error && <div className="text-red text-xs mt-3">{error}</div>}
          <button
            disabled={busy || code.length < 6}
            className="w-full mt-5 py-3 rounded-lg bg-red text-white font-semibold text-sm disabled:opacity-60"
          >
            {busy ? "Verifying..." : "Confirm"}
          </button>
        </form>

        {onResend && (
          <button
            onClick={async () => {
              try {
                await onResend();
                setResent(true);
              } catch {
                /* ignore */
              }
            }}
            className="text-xs text-mute underline mt-4"
          >
            {resent ? "New code sent" : "Resend code"}
          </button>
        )}
      </div>
    </div>
  );
}
