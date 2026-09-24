console.log("✅ user-service.js berhasil dimuat");

/*==================================================
USER SERVICE
Semua komunikasi ke tabel "users" di Supabase
==================================================*/

async function getUsers() {

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .order("id", { ascending: true });

    if (error) throw error;

    return data;

}

async function insertUser(user) {

    const { data, error } = await supabaseClient
        .from("users")
        .insert([user])
        .select()
        .single();

    if (error) throw error;

    return data;

}

async function updateUser(id, user) {

    const { data, error } = await supabaseClient
        .from("users")
        .update(user)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;

}

async function deleteUser(id) {

    const { error } = await supabaseClient
        .from("users")
        .delete()
        .eq("id", id);

    if (error) throw error;

}

async function loginUser(username, password) {

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .eq("status", true)
        .single();

    if (error) return null;

    return data;

}