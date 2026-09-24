console.log("✅ menu-service.js berhasil dimuat");

/*==================================================
MENU SERVICE
Semua komunikasi ke tabel "menu" di Supabase
==================================================*/

async function getMenus() {

    const { data, error } = await supabaseClient
        .from("menu")
        .select("*")
        .order("id", { ascending: true });

    if (error) throw error;

    return data;

}

async function insertMenu(menu) {

    const { data, error } = await supabaseClient
        .from("menu")
        .insert([menu])
        .select()
        .single();

    if (error) throw error;

    return data;

}
async function updateMenu(id, menu) {

    const { data, error } = await supabaseClient
        .from("menu")
        .update(menu)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;

}

async function deleteMenu(id) {

    const { error } = await supabaseClient
        .from("menu")
        .delete()
        .eq("id", id);

    if (error) throw error;

}

async function saveMenu(menu) {

    if (menu.id) {

        return await updateMenu(menu.id, menu);

    }

    return await insertMenu(menu);

}