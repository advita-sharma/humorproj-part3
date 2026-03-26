import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_superadmin, is_matrix_admin, first_name, email")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin && !profile?.is_matrix_admin) {
    redirect("/login?error=unauthorized");
  }

  const displayName =
    profile.first_name ?? user.user_metadata?.full_name ?? user.email ?? "Admin";

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar userName={displayName} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
