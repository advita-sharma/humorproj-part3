"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin && !profile?.is_matrix_admin) {
    throw new Error("Unauthorized");
  }

  return user;
}

// ─── Humor Flavors ────────────────────────────────────────────────────────────

export async function createHumorFlavor(formData: FormData) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const slug = (formData.get("slug") as string).trim();
  const description = (formData.get("description") as string).trim() || null;

  const { data, error } = await admin
    .from("humor_flavors")
    .insert({
      slug,
      description,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/humor-flavors");
  redirect(`/admin/humor-flavors/${data.id}`);
}

export async function updateHumorFlavor(id: number, formData: FormData) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const slug = (formData.get("slug") as string).trim();
  const description = (formData.get("description") as string).trim() || null;

  const { error } = await admin
    .from("humor_flavors")
    .update({ slug, description, modified_by_user_id: user.id })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/humor-flavors");
  revalidatePath(`/admin/humor-flavors/${id}`);
  redirect(`/admin/humor-flavors/${id}`);
}

export async function duplicateHumorFlavor(id: number, newSlug: string) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const trimmedSlug = newSlug.trim();
  if (!trimmedSlug) throw new Error("New slug is required");

  const [{ data: flavor }, { data: steps }] = await Promise.all([
    admin.from("humor_flavors").select("*").eq("id", id).single(),
    admin
      .from("humor_flavor_steps")
      .select("*")
      .eq("humor_flavor_id", id)
      .order("order_by", { ascending: true }),
  ]);

  if (!flavor) throw new Error("Flavor not found");

  const { data: newFlavor, error: flavorError } = await admin
    .from("humor_flavors")
    .insert({
      slug: trimmedSlug,
      description: flavor.description,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (flavorError) throw new Error(flavorError.message);

  if (steps && steps.length > 0) {
    const stepPayloads = steps.map((step) => ({
      humor_flavor_id: newFlavor.id,
      order_by: step.order_by,
      llm_model_id: step.llm_model_id,
      llm_input_type_id: step.llm_input_type_id,
      llm_output_type_id: step.llm_output_type_id,
      humor_flavor_step_type_id: step.humor_flavor_step_type_id,
      llm_temperature: step.llm_temperature,
      llm_system_prompt: step.llm_system_prompt,
      llm_user_prompt: step.llm_user_prompt,
      description: step.description,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    }));

    const { error: stepsError } = await admin
      .from("humor_flavor_steps")
      .insert(stepPayloads);

    if (stepsError) throw new Error(stepsError.message);
  }

  revalidatePath("/admin/humor-flavors");
  redirect(`/admin/humor-flavors/${newFlavor.id}`);
}

export async function deleteHumorFlavor(id: number) {
  await getAuthenticatedUser();
  const admin = createAdminClient();

  const { error } = await admin.from("humor_flavors").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/humor-flavors");
  redirect("/admin/humor-flavors");
}

// ─── Humor Flavor Steps ───────────────────────────────────────────────────────

export async function createHumorFlavorStep(
  flavorId: number,
  formData: FormData
) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  // Get current max order_by for this flavor
  const { data: existing } = await admin
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].order_by + 1 : 1;

  const payload = {
    humor_flavor_id: flavorId,
    order_by: Number(formData.get("order_by") || nextOrder),
    llm_model_id: Number(formData.get("llm_model_id")),
    llm_input_type_id: Number(formData.get("llm_input_type_id")),
    llm_output_type_id: Number(formData.get("llm_output_type_id")),
    humor_flavor_step_type_id: Number(formData.get("humor_flavor_step_type_id")),
    llm_temperature: formData.get("llm_temperature")
      ? Number(formData.get("llm_temperature"))
      : null,
    llm_system_prompt: (formData.get("llm_system_prompt") as string).trim() || null,
    llm_user_prompt: (formData.get("llm_user_prompt") as string).trim() || null,
    description: (formData.get("description") as string).trim() || null,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  };

  const { error } = await admin.from("humor_flavor_steps").insert(payload);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/humor-flavors/${flavorId}`);
  redirect(`/admin/humor-flavors/${flavorId}`);
}

export async function updateHumorFlavorStep(
  stepId: number,
  flavorId: number,
  formData: FormData
) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const payload = {
    order_by: Number(formData.get("order_by")),
    llm_model_id: Number(formData.get("llm_model_id")),
    llm_input_type_id: Number(formData.get("llm_input_type_id")),
    llm_output_type_id: Number(formData.get("llm_output_type_id")),
    humor_flavor_step_type_id: Number(formData.get("humor_flavor_step_type_id")),
    llm_temperature: formData.get("llm_temperature")
      ? Number(formData.get("llm_temperature"))
      : null,
    llm_system_prompt: (formData.get("llm_system_prompt") as string).trim() || null,
    llm_user_prompt: (formData.get("llm_user_prompt") as string).trim() || null,
    description: (formData.get("description") as string).trim() || null,
    modified_by_user_id: user.id,
  };

  const { error } = await admin
    .from("humor_flavor_steps")
    .update(payload)
    .eq("id", stepId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/humor-flavors/${flavorId}`);
  redirect(`/admin/humor-flavors/${flavorId}`);
}

export async function deleteHumorFlavorStep(stepId: number, flavorId: number) {
  await getAuthenticatedUser();
  const admin = createAdminClient();

  const { error } = await admin
    .from("humor_flavor_steps")
    .delete()
    .eq("id", stepId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/humor-flavors/${flavorId}`);
  redirect(`/admin/humor-flavors/${flavorId}`);
}

export async function moveStepUp(stepId: number, flavorId: number) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const { data: steps } = await admin
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: true });

  if (!steps) return;

  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx <= 0) return;

  const current = steps[idx];
  const above = steps[idx - 1];

  await admin
    .from("humor_flavor_steps")
    .update({ order_by: above.order_by, modified_by_user_id: user.id })
    .eq("id", current.id);
  await admin
    .from("humor_flavor_steps")
    .update({ order_by: current.order_by, modified_by_user_id: user.id })
    .eq("id", above.id);

  revalidatePath(`/admin/humor-flavors/${flavorId}`);
}

export async function moveStepDown(stepId: number, flavorId: number) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const { data: steps } = await admin
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: true });

  if (!steps) return;

  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return;

  const current = steps[idx];
  const below = steps[idx + 1];

  await admin
    .from("humor_flavor_steps")
    .update({ order_by: below.order_by, modified_by_user_id: user.id })
    .eq("id", current.id);
  await admin
    .from("humor_flavor_steps")
    .update({ order_by: current.order_by, modified_by_user_id: user.id })
    .eq("id", below.id);

  revalidatePath(`/admin/humor-flavors/${flavorId}`);
}
