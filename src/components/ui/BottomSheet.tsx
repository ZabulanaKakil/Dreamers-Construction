"use client";

import { useEffect, useId, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Optional footer actions (Apply / Clear) */
  footer?: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title = "Filters",
  children,
  footer,
}: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-[2px]"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ui-panel absolute inset-x-0 bottom-0 flex max-h-[85svh] translate-y-0 flex-col overflow-hidden rounded-t-[var(--radius-lg)] border-b-0 shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-syne)] text-base font-semibold"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline btn-sm min-h-11 px-3 text-xs"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
