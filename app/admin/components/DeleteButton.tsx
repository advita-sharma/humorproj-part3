"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmMessage: string;
  className?: string;
  label?: string;
  iconSize?: number;
}

export function DeleteButton({
  action,
  confirmMessage,
  className,
  label,
  iconSize = 12,
}: DeleteButtonProps) {
  const [, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(confirmMessage)) return;
    startTransition(() => action());
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs transition-colors cursor-pointer"
      }
    >
      <Trash2 size={iconSize} />
      {label && <span>{label}</span>}
    </button>
  );
}
