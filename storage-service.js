/*==================================================
SUPABASE STORAGE SERVICE
==================================================*/

console.log("✅ storage-service.js berhasil dimuat");

// storage-service.js

const STORAGE_BUCKET = "menu-images";
const STORAGE_FOLDER = "menu";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB


async function uploadImage(file) {

    if (!file) {
        throw new Error("File tidak ditemukan.");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Ukuran gambar maksimal 5 MB.");
    }

    const extension = file.name.split(".").pop().toLowerCase();

    const fileName =
        `${STORAGE_FOLDER}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
            upsert: false
        });

    if (error) throw error;

    const { data } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

    return data.publicUrl;

}

/*==================================================
DELETE IMAGE
==================================================*/

async function deleteImage(filePath) {

    if (!filePath) return;

    const { error } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    if (error) throw error;

}
    
/*==================================================
GET STORAGE PATH FROM URL
==================================================*/

function getStoragePath(imageUrl) {

    if (!imageUrl) return null;

    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    const index = imageUrl.indexOf(marker);

    if (index === -1) return null;

    return imageUrl.substring(index + marker.length);

}