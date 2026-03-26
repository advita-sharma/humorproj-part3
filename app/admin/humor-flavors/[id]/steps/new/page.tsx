import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createHumorFlavorStep } from "@/app/actions/humor-flavors";

export default async function NewStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [
    { data: flavor },
    { data: steps },
    { data: models },
    { data: inputTypes },
    { data: outputTypes },
    { data: stepTypes },
  ] = await Promise.all([
    admin.from("humor_flavors").select("id, slug").eq("id", id).single(),
    admin
      .from("humor_flavor_steps")
      .select("order_by")
      .eq("humor_flavor_id", id)
      .order("order_by", { ascending: false })
      .limit(1),
    admin.from("llm_models").select("id, name").order("id"),
    admin.from("llm_input_types").select("id, slug, description").order("id"),
    admin.from("llm_output_types").select("id, slug, description").order("id"),
    admin
      .from("humor_flavor_step_types")
      .select("id, slug, description")
      .order("id"),
  ]);

  if (!flavor) redirect("/admin/humor-flavors");

  const nextOrder =
    steps && steps.length > 0 ? steps[0].order_by + 1 : 1;
  const createAction = createHumorFlavorStep.bind(null, Number(id));

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
          Add Step
        </h1>
      </div>

      <form action={createAction} className="space-y-4">
        <StepFormFields
          models={models ?? []}
          inputTypes={inputTypes ?? []}
          outputTypes={outputTypes ?? []}
          stepTypes={stepTypes ?? []}
          defaultOrderBy={nextOrder}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Add Step
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

function StepFormFields({
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  defaultOrderBy,
  defaultValues,
}: {
  models: { id: number; name: string }[];
  inputTypes: { id: number; slug: string; description: string }[];
  outputTypes: { id: number; slug: string; description: string }[];
  stepTypes: { id: number; slug: string; description: string }[];
  defaultOrderBy?: number;
  defaultValues?: {
    order_by?: number;
    description?: string | null;
    llm_model_id?: number;
    llm_temperature?: number | null;
    llm_input_type_id?: number;
    llm_output_type_id?: number;
    humor_flavor_step_type_id?: number;
    llm_system_prompt?: string | null;
    llm_user_prompt?: string | null;
  };
}) {
  return (
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
            defaultValue={defaultValues?.order_by ?? defaultOrderBy ?? 1}
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
            defaultValue={defaultValues?.description ?? ""}
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
            defaultValue={defaultValues?.llm_model_id ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="" disabled>
              Select model…
            </option>
            {models.map((m) => (
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
            defaultValue={defaultValues?.llm_temperature ?? ""}
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
            defaultValue={defaultValues?.llm_input_type_id ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="" disabled>
              Select…
            </option>
            {inputTypes.map((t) => (
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
            defaultValue={defaultValues?.llm_output_type_id ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="" disabled>
              Select…
            </option>
            {outputTypes.map((t) => (
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
            defaultValue={defaultValues?.humor_flavor_step_type_id ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="" disabled>
              Select…
            </option>
            {stepTypes.map((t) => (
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
          rows={5}
          defaultValue={defaultValues?.llm_system_prompt ?? ""}
          placeholder="You are a helpful assistant that..."
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
          rows={5}
          defaultValue={defaultValues?.llm_user_prompt ?? ""}
          placeholder="Describe this image:&#10;{{image}}&#10;&#10;Provide a..."
          className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
        />
      </div>
    </div>
  );
}

export { StepFormFields };
