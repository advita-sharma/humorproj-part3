import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, ChevronUp, ChevronDown, FlaskConical, MessageSquare } from "lucide-react";
import { deleteHumorFlavor, deleteHumorFlavorStep, duplicateHumorFlavor, moveStepDown, moveStepUp } from "@/app/actions/humor-flavors";
import { DeleteButton } from "@/app/admin/components/DeleteButton";
import { DuplicateButton } from "@/app/admin/components/DuplicateButton";

export default async function HumorFlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: flavor }, { data: steps }, { data: models }] =
    await Promise.all([
      admin.from("humor_flavors").select("*").eq("id", id).single(),
      admin
        .from("humor_flavor_steps")
        .select("*, llm_models(name)")
        .eq("humor_flavor_id", id)
        .order("order_by", { ascending: true }),
      admin.from("llm_models").select("id, name"),
    ]);

  if (!flavor) redirect("/admin/humor-flavors");

  const modelMap = Object.fromEntries(
    (models ?? []).map((m) => [m.id, m.name])
  );

  const flavorId = Number(id);
  const deleteFlavorAction = deleteHumorFlavor.bind(null, flavorId);
  const duplicateFlavorAction = duplicateHumorFlavor.bind(null, flavorId);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/humor-flavors"
            className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
          >
            ← Flavors
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-mono">
            {flavor.slug}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/humor-flavors/${id}/captions`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] text-xs transition-colors"
          >
            <MessageSquare size={13} />
            Captions
          </Link>
          <Link
            href={`/admin/humor-flavors/${id}/test`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] text-xs transition-colors"
          >
            <FlaskConical size={13} />
            Test
          </Link>
          <Link
            href={`/admin/humor-flavors/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] text-xs transition-colors"
          >
            <Pencil size={13} />
            Edit
          </Link>
          <DuplicateButton action={duplicateFlavorAction} defaultSlug={flavor.slug} />
          <DeleteButton
            action={deleteFlavorAction}
            confirmMessage={`Delete flavor "${flavor.slug}"? This cannot be undone.`}
            label="Delete"
            iconSize={13}
          />
        </div>
      </div>

      {/* Flavor info */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
              ID
            </p>
            <p className="text-[var(--foreground)] font-mono text-sm">{flavor.id}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
              Created
            </p>
            <p className="text-[var(--muted)] text-xs">
              {flavor.created_datetime_utc
                ? new Date(flavor.created_datetime_utc).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
        {flavor.description && (
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
              Description
            </p>
            <p className="text-[var(--foreground)] text-sm leading-relaxed">
              {flavor.description}
            </p>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Steps ({(steps ?? []).length})
          </h2>
          <Link
            href={`/admin/humor-flavors/${id}/steps/new`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={13} />
            Add Step
          </Link>
        </div>

        {(steps ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] p-8 text-center">
            <p className="text-[var(--muted)] text-sm">
              No steps configured.{" "}
              <Link
                href={`/admin/humor-flavors/${id}/steps/new`}
                className="text-[var(--accent)] underline"
              >
                Add the first step
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(steps ?? []).map((step, idx) => {
              const modelName =
                modelMap[step.llm_model_id] ?? `Model #${step.llm_model_id}`;
              const isFirst = idx === 0;
              const isLast = idx === (steps ?? []).length - 1;

              const moveUpAction = moveStepUp.bind(null, step.id, flavorId);
              const moveDownAction = moveStepDown.bind(null, step.id, flavorId);
              const deleteStepAction = deleteHumorFlavorStep.bind(null, step.id, flavorId);

              return (
                <div
                  key={step.id}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4"
                >
                  {/* Step header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-xs flex items-center justify-center font-bold shrink-0">
                        {step.order_by}
                      </span>
                      <span className="text-[var(--foreground)] text-sm font-medium">
                        {step.description ?? `Step ${step.order_by}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Reorder buttons */}
                      <div className="flex items-center gap-1">
                        <form action={moveUpAction}>
                          <button
                            type="submit"
                            disabled={isFirst}
                            title="Move up"
                            className="w-6 h-6 flex items-center justify-center rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronUp size={14} />
                          </button>
                        </form>
                        <form action={moveDownAction}>
                          <button
                            type="submit"
                            disabled={isLast}
                            title="Move down"
                            className="w-6 h-6 flex items-center justify-center rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </form>
                      </div>

                      {/* Model + temp badges */}
                      <span className="text-xs text-[var(--muted)] px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--card-border)]">
                        {modelName}
                      </span>
                      {step.llm_temperature != null && (
                        <span className="text-xs text-[var(--muted)] px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--card-border)]">
                          temp {step.llm_temperature}
                        </span>
                      )}

                      {/* Edit / Delete */}
                      <Link
                        href={`/admin/humor-flavors/${id}/steps/${step.id}/edit`}
                        className="w-6 h-6 flex items-center justify-center rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                        title="Edit step"
                      >
                        <Pencil size={12} />
                      </Link>
                      <DeleteButton
                        action={deleteStepAction}
                        confirmMessage="Delete this step?"
                        iconSize={12}
                        className="w-6 h-6 flex items-center justify-center rounded text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Prompts */}
                  {step.llm_system_prompt && (
                    <div className="space-y-1">
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
                        System Prompt
                      </p>
                      <pre className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 text-xs text-[var(--foreground)] font-mono whitespace-pre-wrap overflow-auto max-h-40">
                        {step.llm_system_prompt}
                      </pre>
                    </div>
                  )}

                  {step.llm_user_prompt && (
                    <div className="space-y-1">
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
                        User Prompt
                      </p>
                      <pre className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 text-xs text-[var(--foreground)] font-mono whitespace-pre-wrap overflow-auto max-h-40">
                        {step.llm_user_prompt}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
