


console.log("supabase.js berhasil dimuat");

const SUPABASE_URL = "https://qpytmhxjnlqwsphiqltv.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_JnCQy6kLN6jS8dq4vOZs6w_cD0kVI0p";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("✅ Supabase berhasil diinisialisasi", supabaseClient);