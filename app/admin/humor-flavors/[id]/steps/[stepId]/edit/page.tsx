import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateHumorFlavorStep } from "@/app/actions/humor-flavors";

export default async function EditStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;
  const admin = createAdminClient();

  const [
    { data: flavor },
    { data: step },
    { data: models },
    { data: inputTypes },
    { data: outputTypes },
    { data: stepTypes },
  ] = await Promise.all([
    admin.from("humor_flavors").select("id, slug").eq("id", id).single(),
    admin.from("humor_flavor_steps").select("*").eq("id", stepId).single(),
    admin.from("llm_models").select("id, name").order("id"),
    admin.from("llm_input_types").select("id, slug, description").order("id"),
    admin.from("llm_output_types").select("id, slug, description").order("id"),
    admin
      .from("humor_flavor_step_types")
      .select("id, slug, description")
      .order("id"),
  ]);

  if (!flavor || !step) redirect(`/admin/humor-flavors/${id}`);

  const updateAction = updateHumorFlavorStep.bind(
    null,
    Number(stepId),
    Number(id)
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/humor-flavors/${id}`}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
        >
          ← {flavor.slug}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Edit Step {step.order_by}
        </h1>
      </div>

      <form action={updateAction} className="space-y-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-5">
          {/* Row 1: order + description */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Order <span className="text-red-500">*</span>
              </label>
              <input
                name="order_by"
                type="number"
                min={1}
                required
                defaultValue={step.order_by}
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Label / Description
              </label>
              <input
                name="description"
                type="text"
                defaultValue={step.description ?? ""}
                placeholder="e.g. Describe the image"
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Row 2: model + temperature */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                LLM Model <span className="text-red-500">*</span>
              </label>
              <select
                name="llm_model_id"
                required
                defaultValue={step.llm_model_id}
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {(models ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Temperature
              </label>
              <input
                name="llm_temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                defaultValue={step.llm_temperature ?? ""}
                placeholder="0.7"
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Row 3: input type + output type + step type */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Input Type <span className="text-red-500">*</span>
              </label>
              <select
                name="llm_input_type_id"
                required
                defaultValue={step.llm_input_type_id}
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {(inputTypes ?? []).map((t) => (
                  <option key={t.id} value={t.id} title={t.description}>
                    {t.slug}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Output Type <span className="text-red-500">*</span>
              </label>
              <select
                name="llm_output_type_id"
                required
                defaultValue={step.llm_output_type_id}
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {(outputTypes ?? []).map((t) => (
                  <option key={t.id} value={t.id} title={t.description}>
                    {t.slug}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Step Type <span className="text-red-500">*</span>
              </label>
              <select
                name="humor_flavor_step_type_id"
                required
                defaultValue={step.humor_flavor_step_type_id}
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {(stepTypes ?? []).map((t) => (
                  <option key={t.id} value={t.id} title={t.description}>
                    {t.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
              System Prompt
            </label>
            <textarea
              name="llm_system_prompt"
              rows={6}
              defaultValue={step.llm_system_prompt ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
            />
          </div>

          {/* User Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
              User Prompt
            </label>
            <textarea
              name="llm_user_prompt"
              rows={6}
              defaultValue={step.llm_user_prompt ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
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
