// Supabase Edge Function: get-users
// Fetches all users from auth.users for admin panel

// @ts-ignore: Deno runtime and remote imports are only available in Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';

serve(async (req) => {
  // Use environment variables for admin access
  // @ts-ignore
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  // @ts-ignore
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Fetch users from auth.users (via RPC or direct query)
  // Supabase Edge Functions do not have admin API, so use RPC or expose a view if needed
  // For now, try to select from auth.users (works if function runs with service role)
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  const users = (data?.users || []).map((u) => ({
    id: u.id,
    email: u.email,
    phone: u.phone,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    user_metadata: u.user_metadata || {},
    app_metadata: u.app_metadata || {},
  }));
  return new Response(JSON.stringify({ users }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});
