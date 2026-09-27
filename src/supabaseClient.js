import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Supabase sozlanmagan: .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni to'ldiring."
  );
}

export const supabase = createClient(url, key);
