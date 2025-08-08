// Supabase Edge Function: get-users
// Fetches all users from auth.users for admin panel
import { serve } from 'std/server';

serve(async (req) => {
  // Only allow admins (add your own admin check logic here)
  // For now, allow all requests (add RLS or JWT check in production)
  const { data, error } = await Deno.supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  // Return only safe fields
  const users = (data?.users || []).map((u) => ({
    id: u.id,
    email: u.email,
    phone: u.phone,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    user_metadata: u.user_metadata || {},
    app_metadata: u.app_metadata || {},
    // Add more fields as needed
  }));
  return new Response(JSON.stringify({ users }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
