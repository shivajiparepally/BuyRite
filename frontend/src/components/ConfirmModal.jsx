import React from "react";

/**
 * Generic "are you sure?" dialog. Renders nothing when `open` is false.
 */
export function ConfirmModal({ open, title = "Are you sure?", message, confirmLabel = "Yes", cancelLabel = "No", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
      <div onClick={onCancel} className="absolute inset-0 bg-black/55" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 text-center">
        <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
        {message && <p className="text-sm text-mute mb-5">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-ink"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-red text-white text-sm font-semibold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
