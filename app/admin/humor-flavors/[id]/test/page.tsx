import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TestRunner } from "./TestRunner";

export default async function TestFlavorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: flavor }, { data: images }] = await Promise.all([
    admin.from("humor_flavors").select("id, slug, description").eq("id", id).single(),
    admin
      .from("images")
      .select("id, url, image_description")
      .eq("is_public", true)
      .not("url", "is", null)
      .order("created_datetime_utc", { ascending: false })
      .limit(50),
  ]);

  if (!flavor) redirect("/admin/humor-flavors");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/humor-flavors/${id}`}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
        >
          ← {flavor.slug}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Test Flavor
        </h1>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[var(--accent)] text-sm font-bold">i</span>
          </div>
          <div>
            <p className="text-[var(--foreground)] text-sm font-medium">
              Testing:{" "}
              <span className="font-mono text-[var(--accent)]">{flavor.slug}</span>
            </p>
            {flavor.description && (
              <p className="text-[var(--muted)] text-xs mt-1">{flavor.description}</p>
            )}
            <p className="text-[var(--muted)] text-xs mt-2">
              Select an image from the test set and generate captions using the pipeline API.
              Captions are generated based on the current humor flavor mix configuration.
            </p>
          </div>
        </div>
      </div>

      <TestRunner
        images={images ?? []}
        flavorId={Number(id)}
        flavorSlug={flavor.slug}
      />
    </div>
  );
}
