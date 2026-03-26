import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateHumorFlavor } from "@/app/actions/humor-flavors";

export default async function EditHumorFlavorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: flavor } = await admin
    .from("humor_flavors")
    .select("id, slug, description")
    .eq("id", id)
    .single();

  if (!flavor) redirect("/admin/humor-flavors");

  const updateAction = updateHumorFlavor.bind(null, Number(id));

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/humor-flavors/${id}`}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
        >
          ← {flavor.slug}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Edit Flavor
        </h1>
      </div>

      <form action={updateAction} className="space-y-4">
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
              defaultValue={flavor.slug}
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
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
              defaultValue={flavor.description ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Save Changes
          </button>
          <Link
            href={`/admin/humor-flavors/${id}`}
            className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
