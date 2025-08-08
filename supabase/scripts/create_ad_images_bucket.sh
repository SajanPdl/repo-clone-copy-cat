# This script creates a public bucket named 'ad-images' in your Supabase project using the Supabase CLI.
# Usage: Run this script from your project root after installing the Supabase CLI and logging in.

SELECT storage.create_bucket('ad-images', 'public');
