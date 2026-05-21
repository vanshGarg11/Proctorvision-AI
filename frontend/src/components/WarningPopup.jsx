import { AlertTriangle, X } from "lucide-react";
import React from "react";

export default function WarningPopup({ warning, onClose }) {
  if (!warning) return null;
  return (
    <div className="fixed right-4 top-4 z-50 w-[min(92vw,390px)] rounded-lg border border-amber-300 bg-white p-4 shadow-soft dark:border-amber-700 dark:bg-slate-900">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          <AlertTriangle size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Proctoring warning</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{warning.message}</p>
          <p className="mt-2 text-xs text-slate-500">Confidence: {Math.round((warning.confidence || 0) * 100)}%</p>
        </div>
        <button className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
          <X size={16} className="mx-auto" />
        </button>
      </div>
    </div>
  );
}
