"use client";

import { useTransition } from "react";
import { Copy } from "lucide-react";

interface DuplicateButtonProps {
  action: (newSlug: string) => Promise<void>;
  defaultSlug: string;
}

export function DuplicateButton({ action, defaultSlug }: DuplicateButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const newSlug = window.prompt(
      "Enter a unique slug for the duplicated flavor:",
      `${defaultSlug}-copy`
    );
    if (!newSlug || !newSlug.trim()) return;
    startTransition(() => action(newSlug.trim()));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <Copy size={13} />
      {isPending ? "Duplicating…" : "Duplicate"}
    </button>
  );
}
