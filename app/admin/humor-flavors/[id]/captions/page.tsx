import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function FlavorCaptionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const pageSize = 50;
  const from = (page - 1) * pageSize;

  const admin = createAdminClient();

  const [{ data: flavor }, { data: captions, count }] = await Promise.all([
    admin.from("humor_flavors").select("id, slug").eq("id", id).single(),
    admin
      .from("captions")
      .select(
        "id, content, like_count, is_public, created_datetime_utc, images(url, image_description), profiles(first_name, email)",
        { count: "exact" }
      )
      .eq("humor_flavor_id", id)
      .order("created_datetime_utc", { ascending: false })
      .range(from, from + pageSize - 1),
  ]);

  if (!flavor) redirect("/admin/humor-flavors");

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/humor-flavors/${id}`}
            className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
          >
            ← {flavor.slug}
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Captions
          </h1>
        </div>
        <p className="text-[var(--muted)] text-sm">
          {count?.toLocaleString() ?? 0} total
        </p>
      </div>

      {(captions ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] p-12 text-center">
          <p className="text-[var(--muted)] text-sm">
            No captions generated yet for this flavor.
          </p>
          <Link
            href={`/admin/humor-flavors/${id}/test`}
            className="text-[var(--accent)] text-sm underline mt-2 inline-block"
          >
            Generate some →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(captions ?? []).map((caption) => {
            const img = Array.isArray(caption.images)
              ? caption.images[0]
              : caption.images;
            const profile = Array.isArray(caption.profiles)
              ? caption.profiles[0]
              : caption.profiles;
            const authorName =
              profile?.first_name ?? profile?.email ?? "Unknown";

            return (
              <div
                key={caption.id}
                className="flex gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
              >
                {img?.url && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={img.url}
                      alt={img.image_description ?? "Caption image"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--foreground)] text-sm leading-relaxed">
                    {caption.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted)]">
                    <span>by {authorName}</span>
                    <span>·</span>
                    <span>{caption.like_count ?? 0} likes</span>
                    {!caption.is_public && (
                      <>
                        <span>·</span>
                        <span className="text-amber-500">private</span>
                      </>
                    )}
                    <span>·</span>
                    <span>
                      {caption.created_datetime_utc
                        ? new Date(
                            caption.created_datetime_utc
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
              className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors"
            >
              ← Prev
            </Link>
          )}
          <span className="text-[var(--muted)] text-sm">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`?page=${page + 1}`}
              className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
