import { createHumorFlavor } from "@/app/actions/humor-flavors";
import Link from "next/link";

export default function NewHumorFlavorPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/humor-flavors"
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
        >
          ← Humor Flavors
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          New Humor Flavor
        </h1>
      </div>

      <form action={createHumorFlavor} className="space-y-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="slug"
              className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider"
            >
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              required
              placeholder="e.g. dad-joke"
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
            <p className="text-xs text-[var(--muted)]">
              Unique identifier, lowercase with hyphens
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe this humor style..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Create Flavor
          </button>
          <Link
            href="/admin/humor-flavors"
            className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
