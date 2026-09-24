console.log("✅ category-service.js berhasil dimuat");

/*==================================================
CATEGORY SERVICE
Semua komunikasi ke tabel "kategori" di Supabase
==================================================*/

async function getCategories() {

    const { data, error } = await supabaseClient
        .from("kategori")
        .select("*")
        .order("nama", { ascending: true });

    if (error) throw error;

    return data;

}

async function insertCategory(kategori) {

    const { data, error } = await supabaseClient
        .from("kategori")
        .insert([kategori])
        .select()
        .single();

    if (error) throw error;

    return data;

}

async function updateCategory(id, kategori) {

    const { data, error } = await supabaseClient
        .from("kategori")
        .update(kategori)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;

}

async function deleteCategory(id) {

    const { error } = await supabaseClient
        .from("kategori")
        .delete()
        .eq("id", id);

    if (error) throw error;

}

async function saveCategory(kategori) {

    if (kategori.id) {
        return await updateCategory(kategori.id, kategori);
    }

    return await insertCategory(kategori);

}