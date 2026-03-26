import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function HumorFlavorsPage() {
  const admin = createAdminClient();

  const { data: flavors, count } = await admin
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc", { count: "exact" })
    .order("id", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Humor Flavors
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {count?.toLocaleString() ?? 0} flavors configured
          </p>
        </div>
        <Link
          href="/admin/humor-flavors/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Flavor
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--card)]">
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium w-16">
                ID
              </th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">
                Slug
              </th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">
                Description
              </th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">
                Created
              </th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {(flavors ?? []).map((f) => (
              <tr
                key={f.id}
                className="hover:bg-[var(--card)] transition-colors"
              >
                <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">
                  {f.id}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs px-2 py-1 rounded-md bg-violet-500/10 text-violet-500 dark:text-violet-300">
                    {f.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--foreground)] max-w-sm">
                  <span className="line-clamp-2 text-xs">
                    {f.description ?? (
                      <span className="text-[var(--muted)] italic">
                        No description
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--muted)] text-xs whitespace-nowrap">
                  {f.created_datetime_utc
                    ? new Date(f.created_datetime_utc).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/humor-flavors/${f.id}`}
                    className="text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(flavors ?? []).length === 0 && (
          <p className="text-[var(--muted)] text-sm text-center py-12">
            No humor flavors yet.{" "}
            <Link
              href="/admin/humor-flavors/new"
              className="text-[var(--accent)] underline"
            >
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
