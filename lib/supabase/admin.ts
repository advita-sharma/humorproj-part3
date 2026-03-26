import { createClient } from "@supabase/supabase-js";

// Uses the service role key - bypasses RLS entirely.
// Only import this in server-side code (Server Components, API routes, Server Actions).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
