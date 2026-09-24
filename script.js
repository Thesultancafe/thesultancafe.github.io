/*==================================================
THE SULTAN CAFE
DIGITAL MENU V2
SCRIPT FINAL
==================================================*/

"use strict";

/*==================================================
KONSTANTA
==================================================*/

const STORAGE_KEY = "THE_SULTAN_CAFE_V2";

/*==================================================
STATE APLIKASI
==================================================*/

let daftarMenu = [];
let shoppingCart = [];

let editKategoriId = null;
let editUserId = null;
let editId = null;
let fotoBase64 = "";
let fotoFile = null;

/*==================================================
HELPER
==================================================*/

const $ = (id) => document.getElementById(id);

/*==================================================
TEST KONEKSI SUPABASE
==================================================*/

async function testSupabase() {

    try {

        const { data, error } = await supabaseClient
            .from("menu")
            .select("*");

        if (error) throw error;

        console.log("✅ Koneksi Supabase OK");
        console.log(data);

    } catch (err) {

        console.error("❌ Gagal koneksi ke Supabase");
        console.error(err);

    }

}

/*==================================================
STATUS LOGIN
==================================================*/

let adminLoggedIn = false;


/*==================================================
ELEMENT
==================================================*/

const homePage = $("homePage");
const menuPage = $("menuPage");
const loginPage = $("loginPage");
const adminPage = $("adminPage");

const navHome = $("navHome");
const navMenu = $("navMenu");
const navAdmin = $("navAdmin");

const btnLihatMenu = $("btnLihatMenu");
const btnLogin = $("btnLogin");
const btnLogout = $("btnLogout");

const loadingScreen = $("loadingScreen");
const loadingModal = $("loadingModal");

const listMenu = $("listMenu");
const menuLoading = $("menuLoading");

const kategoriMenu = $("kategoriMenu");
const filterKategori = $("filterKategori");

const cariMenu = $("cariMenu");
const filterStatus = $("filterStatus");

const jumlahMenu = $("jumlahMenu");
const jumlahKategori = $("jumlahKategori");
const menuPromo = $("menuPromo");
const menuBestSeller = $("menuBestSeller");

const dashboardTotalMenu = $("dashboardTotalMenu");
const dashboardKategori = $("dashboardKategori");
const dashboardPromo = $("dashboardPromo");
const dashboardBestSeller = $("dashboardBestSeller");

const usernameAdmin = $("usernameAdmin");
const passwordAdmin = $("passwordAdmin");

const menuId = $("menuId");
const namaMenu = $("namaMenu");
const hargaMenu = $("hargaMenu");
const deskripsiMenu = $("deskripsiMenu");

const fotoMenu = $("fotoMenu");
const previewFoto = $("previewFoto");

const statusBestSeller = $("statusBestSeller");
const statusPromo = $("statusPromo");
const statusBaru = $("statusBaru");

const btnSimpan = $("btnSimpan");
const btnReset = $("btnReset");

const adminTableMenu = $("adminTableMenu");
const namaKategori = $("namaKategori");
const btnTambahKategori = $("btnTambahKategori");
const categoryTable = $("categoryTable");

const imageModal = $("imageModal");
const modalImage = $("modalImage");
const closeImage = $("closeImage");

const descriptionModal = $("descriptionModal");
const descriptionTitle = $("descriptionTitle");
const descriptionPrice = $("descriptionPrice");
const descriptionText = $("descriptionText");
const closeDescription = $("closeDescription");

const toast = $("toast");
const toastMessage = $("toastMessage");

const cartModal = $("cartModal");
const closeCart = $("closeCart");
const btnCart = $("btnCart");
const btnCancelCart = $("btnCancelCart");
const btnCheckout = $("btnCheckout");

/*==================================================
LOAD DATA (SUPABASE + FALLBACK LOCALSTORAGE)
==================================================*/

async function loadData() {

    if (menuLoading) {
        menuLoading.classList.add("show");
    }

    renderSkeleton();

    try {

        const data = await getMenus();

        daftarMenu = (data || []).map(item => ({
            id: item.id,
            nama: item.nama,
            harga: item.harga,
            kategori: item.kategori,
            deskripsi: item.deskripsi,
            foto: item.foto,
            bestSeller: item.best_seller,
            promo: item.promo,
            baru: item.baru
        }));

        console.log("✅ Data menu berhasil dimuat dari Supabase");

    } catch (err) {

        console.error("❌ Error loadData:", err);

        console.warn("⚠️ Supabase gagal, menggunakan LocalStorage");

        const localData = localStorage.getItem(STORAGE_KEY);

        daftarMenu = localData ? JSON.parse(localData) : [];

    } finally {

        if (menuLoading) {
            menuLoading.classList.remove("show");
        }

    }

}

/*==================================================
SAVE DATA (SUPABASE + LOCALSTORAGE)
==================================================*/

async function saveData() {

    // Tetap simpan ke LocalStorage sebagai backup
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(daftarMenu)
    );

    try {

        // Hapus semua data lama di Supabase
        const { error: deleteError } = await supabaseClient
            .from("menu")
            .delete()
            .neq("id", 0);

        if (deleteError) throw deleteError;

        // Simpan ulang seluruh daftar menu
        const dataSupabase = daftarMenu.map(item => ({
            id: item.id,
            nama: item.nama,
            harga: item.harga,
            kategori: item.kategori,
            deskripsi: item.deskripsi,
            foto: item.foto,
            best_seller: item.bestSeller,
            promo: item.promo,
            baru: item.baru
        }));

        if (dataSupabase.length > 0) {

            const { error: insertError } = await supabaseClient
                .from("menu")
                .insert(dataSupabase);

            if (insertError) throw insertError;

        }

        console.log("✅ Data berhasil disimpan ke Supabase");

    } catch (err) {

        console.error("❌ Gagal menyimpan ke Supabase", err);

    }

}

/*==================================================
FORMAT RUPIAH
==================================================*/

function formatRupiah(nilai){

    return "Rp " +

    Number(nilai).toLocaleString("id-ID");

}

/*==================================================
TOAST
==================================================*/

function showToast(pesan){

    toastMessage.textContent = pesan;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },2500);

}

/*==================================================
LOADING
==================================================*/

function showLoading(){

    if(loadingModal){

        loadingModal.style.display = "flex";

    }

}

function hideLoading(){

    if(loadingModal){

        loadingModal.style.display = "none";

    }

}

/*==================================================
NAVIGASI HALAMAN
==================================================*/

function showPage(page){

    document

    .querySelectorAll(".page")

    .forEach(item=>{

        item.classList.remove("active");

    });

    page.classList.add("active");

}

/*==================================================
NAVBAR ACTIVE
==================================================*/

function setActiveNav(button){

    document

    .querySelectorAll(".nav-btn")

    .forEach(btn=>{

        btn.classList.remove("active");

    });

    if(button){

        button.classList.add("active");

    }

}

/*==================================================
INISIALISASI
==================================================*/

async function initApp() {

    await loadData();

    await loadCategories();

    await loadUsers();
}

/*==================================================
POTONGAN 2 DIMULAI DARI SINI
==================================================*/

/*==================================================
NAVIGASI
==================================================*/

function bukaHome(){

    showPage(homePage);

    setActiveNav(navHome);

}

function bukaMenu(){

    showPage(menuPage);

    setActiveNav(navMenu);

    renderMenu();

    updateStatistik();

}

function bukaLogin(){

    if(adminLoggedIn){

        showPage(adminPage);

        setActiveNav(navAdmin);

        renderTable();

        updateDashboard();

        return;

    }

    showPage(loginPage);

    setActiveNav(navAdmin);

}

/*==================================================
LOGIN ADMIN
==================================================*/

async function loginAdmin() {

    const username = usernameAdmin.value.trim();
    const password = passwordAdmin.value.trim();

    if (username === "" || password === "") {

        showToast("Username dan password harus diisi.");

        return;

    }

    try {

        const user = await loginUser(username, password);

        if (!user) {

            showToast("Username atau password salah.");

            passwordAdmin.value = "";
            passwordAdmin.focus();

            return;

        }

        if (user.role !== "admin") {

        showToast("Akses hanya untuk admin.");

        passwordAdmin.value = "";
        passwordAdmin.focus();

        return;

        }

        adminLoggedIn = true;

        usernameAdmin.value = "";
        passwordAdmin.value = "";

        showToast("Selamat datang, " + user.nama + "!");
        
        showPage(adminPage);

        setActiveNav(navAdmin);

        renderTable();

        updateDashboard();

        
    } catch (err) {

        console.error(err);

        showToast("Gagal login.");

    }

}

/*==================================================
LOGOUT
==================================================*/

function logoutAdmin(){

    adminLoggedIn = false;
    
    showPage(homePage);

    setActiveNav(navHome);

    showToast("Logout berhasil.");

}

/*==================================================
LOADING SCREEN
==================================================*/

window.addEventListener("load", async () => {

    testSupabase();

    await initApp();

    bukaHome();

    renderMenu();

    renderTable();

    updateStatistik();

    updateDashboard();


    setTimeout(()=>{

        if(loadingScreen){

            loadingScreen.style.display="none";

        }

    },1000);

});

/*==================================================
EVENT NAVIGASI
==================================================*/

if(navHome){

    navHome.addEventListener(

        "click",

        bukaHome

    );

}

if(navMenu){

    navMenu.addEventListener(

        "click",

        bukaMenu

    );

}

if(navAdmin){

    navAdmin.addEventListener(

        "click",

        bukaLogin

    );

}

if(btnLihatMenu){

    btnLihatMenu.addEventListener(

        "click",

        bukaMenu

    );

}

if(btnLogin){

    btnLogin.addEventListener(

        "click",

        loginAdmin

    );

}

if(btnLogout){

    btnLogout.addEventListener(

        "click",

        logoutAdmin

    );

}

if(btnCart){

    btnCart.addEventListener(

        "click",

        bukaKeranjang

    );

}

if(closeCart){

    closeCart.addEventListener(

        "click",

        tutupKeranjang

    );

}

if(btnCancelCart){

    btnCancelCart.addEventListener(

        "click",

        tutupKeranjang

    );

}

if(btnCheckout){

    btnCheckout.addEventListener(

        "click",

        checkoutWhatsApp

    );

}

/*==================================================
ENTER UNTUK LOGIN
==================================================*/

if(passwordAdmin){

    passwordAdmin.addEventListener(

        "keydown",

        function(e){

            if(e.key==="Enter"){

                loginAdmin();

            }

        }

    );

}

/*==================================================
POTONGAN 3 DIMULAI DARI SINI
==================================================*/

/*==================================================
RESET FORM
==================================================*/

function resetForm() {

    editId = null;

    menuId.value = "";

    namaMenu.value = "";

    hargaMenu.value = "";

    kategoriMenu.value = "";

    deskripsiMenu.value = "";

    fotoMenu.value = "";

    fotoFile = null;
    
    fotoBase64 = "";

    previewFoto.src = "";

    previewFoto.style.display = "none";

    statusBestSeller.checked = false;
    statusPromo.checked = false;
    statusBaru.checked = false;

    btnSimpan.textContent = "Simpan Menu";

}

/*==================================================
VALIDASI
==================================================*/

function validasiForm(){

    // Bersihkan error sebelumnya
    namaMenu.classList.remove("input-error");
    hargaMenu.classList.remove("input-error");
    kategoriMenu.classList.remove("input-error");

    if(namaMenu.value.trim()===""){

        namaMenu.classList.add("input-error");

        showToast("Nama menu wajib diisi.");

        namaMenu.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        namaMenu.focus();

        return false;

    }

    if(hargaMenu.value==="" || Number(hargaMenu.value)<=0){

        hargaMenu.classList.add("input-error");

        showToast("Harga belum benar.");

        hargaMenu.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        hargaMenu.focus();

        return false;

    }

    if(kategoriMenu.value===""){

        kategoriMenu.classList.add("input-error");

        showToast("Pilih kategori menu.");

        kategoriMenu.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        kategoriMenu.focus();

        return false;

    }

    return true;

}

/*==================================================
SIMPAN MENU
==================================================*/

async function simpanMenu() {

    if (!validasiForm()) return;

    btnSimpan.disabled = true;

    const tombolAwal = btnSimpan.innerHTML;

    btnSimpan.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
Menyimpan...
`;

    try {

        let fotoUrl = fotoBase64;

        // Upload gambar baru jika dipilih
        if (fotoFile) {

            fotoUrl = await uploadImage(fotoFile);

        }

        const data = {

            nama: namaMenu.value.trim(),

            harga: Number(hargaMenu.value),

            kategori: kategoriMenu.value,

            deskripsi: deskripsiMenu.value.trim(),

            foto: fotoUrl,

            bestSeller: statusBestSeller.checked,

            promo: statusPromo.checked,

            baru: statusBaru.checked

        };

        /*==============================
        EDIT MENU
        ==============================*/

        if (editId) {

            const oldMenu = daftarMenu.find(
                item => item.id === editId
            );

            const oldFoto = oldMenu?.foto;

            await updateMenu(editId, {

                nama: data.nama,

                harga: data.harga,

                kategori: data.kategori,

                deskripsi: data.deskripsi,

                foto: data.foto,

                best_seller: data.bestSeller,

                promo: data.promo,

                baru: data.baru

            });

            const index = daftarMenu.findIndex(
                item => item.id === editId
            );

            if (index !== -1) {

                daftarMenu[index] = {

                    id: editId,

                    ...data

                };

            }

            // Hapus gambar lama jika diganti
            if (fotoFile && oldFoto && oldFoto !== fotoUrl) {

                const oldPath = getStoragePath(oldFoto);

                if (oldPath) {

                    await deleteImage(oldPath);

                }

            }

            showToast("Menu berhasil diperbarui.");

        }

        /*==============================
        TAMBAH MENU
        ==============================*/

        else {

            const menuBaru = await insertMenu({

                nama: data.nama,

                harga: data.harga,

                kategori: data.kategori,

                deskripsi: data.deskripsi,

                foto: data.foto,

                best_seller: data.bestSeller,

                promo: data.promo,

                baru: data.baru

            });

            daftarMenu.push({

                id: menuBaru.id,

                nama: menuBaru.nama,

                harga: menuBaru.harga,

                kategori: menuBaru.kategori,

                deskripsi: menuBaru.deskripsi,

                foto: menuBaru.foto,

                bestSeller: menuBaru.best_seller,

                promo: menuBaru.promo,

                baru: menuBaru.baru

            });

            showToast("Menu berhasil ditambahkan.");

        }

        refreshSemua();

        resetForm();

    } catch (err) {

    console.error(err);

    if (err.message) {

        showToast(err.message);

    } else {

        showToast("Gagal menyimpan menu.");

    }


    } finally {

        btnSimpan.disabled = false;

        btnSimpan.innerHTML = tombolAwal;

    }

}

/*==================================================
EDIT MENU
==================================================*/

function editMenu(id){

    const data = daftarMenu.find(

        item => item.id === id

    );

    if(!data) return;

    editId = data.id;

    menuId.value = data.id;

    namaMenu.value = data.nama;

    hargaMenu.value = data.harga;

    kategoriMenu.value = data.kategori;

    deskripsiMenu.value = data.deskripsi;

    fotoBase64 = data.foto || "";

    if(fotoBase64){

        previewFoto.src = fotoBase64;

        previewFoto.style.display = "block";

    }

    statusBestSeller.checked = data.bestSeller;

    statusPromo.checked = data.promo;

    statusBaru.checked = data.baru;

    btnSimpan.textContent = "Update Menu";

    showPage(adminPage);

}

/*==================================================
HAPUS MENU
==================================================*/

async function hapusMenu(id) {

    if (!confirm("Hapus menu ini?")) return;

    try {

        // Cari data menu sebelum dihapus
        const menu = daftarMenu.find(item => item.id === id);

        // Hapus data dari database
        await deleteMenu(id);

        // Hapus gambar jika menggunakan Supabase Storage
        if (menu && menu.foto) {

            const filePath = getStoragePath(menu.foto);

        

            if (filePath) {
                await deleteImage(filePath);
            }

        }

        // Hapus dari array lokal
        daftarMenu = daftarMenu.filter(
            item => item.id !== id
        );

        refreshSemua();

        showToast("Menu berhasil dihapus.");

    } catch (err) {

        console.error(err);

        showToast("Gagal menghapus menu.");

    }

}
/*==================================================
EVENT BUTTON
==================================================*/

if(btnSimpan){

    btnSimpan.addEventListener(

        "click",

        simpanMenu

    );

}

if(btnReset){

    btnReset.addEventListener(

        "click",

        resetForm

    );

}

if(btnTambahUser){

    btnTambahUser.addEventListener(

        "click",

        tambahUser

    );

}

if(btnTambahKategori){

    btnTambahKategori.addEventListener(

        "click",

        tambahKategori

    );

}

/*==================================================
HAPUS VALIDASI MERAH
==================================================*/

namaMenu.addEventListener("input", function () {

    namaMenu.classList.remove("input-error");

});

hargaMenu.addEventListener("input", function () {

    hargaMenu.classList.remove("input-error");

});

kategoriMenu.addEventListener("change", function () {

    kategoriMenu.classList.remove("input-error");

});

/*==================================================
POTONGAN 4 DIMULAI DARI SINI
==================================================*/

/*==================================================
RENDER SKELETON MENU
==================================================*/

function renderSkeleton() {

    listMenu.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        listMenu.innerHTML += `
            <div class="menu-card skeleton">

                <div class="menu-image"></div>

                <div class="menu-content">

                    <div class="skeleton-line title"></div>

                    <div class="skeleton-line"></div>

                    <div class="skeleton-line"></div>

                    <div class="skeleton-line price"></div>

                </div>

            </div>
        `;

    }

}

/*==================================================
LOAD CATEGORY
==================================================*/

async function loadCategories() {

    try {

        const categories = await getCategories();
        console.log("Kategori dari Supabase:", categories);

        /* DROPDOWN FORM MENU */

        if (kategoriMenu) {

            kategoriMenu.innerHTML = "";

            categories.forEach(category => {

                kategoriMenu.innerHTML += `
                    <option value="${category.nama}">
                        ${category.nama}
                    </option>
                `;

            });

        }

        /* DROPDOWN FILTER */

        if (filterKategori) {

            filterKategori.innerHTML = `
                <option value="Semua">Semua</option>
            `;

            categories.forEach(category => {

                filterKategori.innerHTML += `
                    <option value="${category.nama}">
                        ${category.nama}
                    </option>
                `;

            });

        }

        renderCategoryTable(categories);

        console.log("✅ Kategori berhasil dimuat");

    } catch (err) {

        console.error("❌ Error loadCategories:", err);

    }

}

/*==================================================
RENDER CATEGORY TABLE
==================================================*/

function renderCategoryTable(categories) {

    if (!categoryTable) return;

    categoryTable.innerHTML = "";

    categories.forEach((category, index) => {

        categoryTable.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${category.nama}</td>

            <td>

                <button
                    class="btn-edit"
                    onclick="editCategory(${category.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="btn-danger"
                    onclick="deleteCategoryConfirm(${category.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

/*==================================================
RENDER USER TABLE
==================================================*/

function renderUserTable(users) {

    if (!userTable) return;

    userTable.innerHTML = "";

    users.forEach((user, index) => {

        userTable.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${user.username}</td>

            <td>${user.nama}</td>

            <td>${user.role}</td>

            <td>

                ${user.status
                    ? '<span class="badge best">Aktif</span>'
                    : '<span class="badge promo">Nonaktif</span>'
                }

            </td>

            <td>

                <button
                    class="btn-edit"
                    onclick="editUser(${user.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="btn-danger"
                    onclick="deleteUserConfirm(${user.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

/*==================================================
LOAD USERS
==================================================*/

async function loadUsers() {

    try {

        const users = await getUsers();

        console.log("User dari Supabase:", users);

        renderUserTable(users);

    } catch (err) {

        console.error("❌ Error loadUsers:", err);

    }

}

/*==================================================
TAMBAH / UPDATE USER
==================================================*/

async function tambahUser() {

    const username = usernameUser.value.trim();
    const password = passwordUser.value.trim();
    const nama = namaUser.value.trim();
    const role = roleUser.value;

    if (
        username === "" ||
        password === "" ||
        nama === ""
    ) {

        showToast("Semua data user harus diisi.");

        return;

    }

    try {

        if (editUserId === null) {

            await insertUser({

                username: username,
                password: password,
                nama: nama,
                role: role,
                status: true

            });

            showToast("User berhasil ditambahkan.");

        } else {

            await updateUser(editUserId, {

                username: username,
                password: password,
                nama: nama,
                role: role

            });

            showToast("User berhasil diperbarui.");

            editUserId = null;

            btnTambahUser.innerHTML = `
                <i class="fa-solid fa-user-plus"></i>
                Tambah User
            `;

        }

        usernameUser.value = "";
        passwordUser.value = "";
        namaUser.value = "";
        roleUser.value = "admin";

        await loadUsers();

    } catch (err) {

        console.error(err);

        showToast("Gagal menyimpan user.");

    }

}

/*==================================================
EDIT USER
==================================================*/

async function editUser(id) {

    try {

        const users = await getUsers();

        const user = users.find(item => item.id === id);

        if (!user) return;

        editUserId = id;

        usernameUser.value = user.username;
        passwordUser.value = user.password;
        namaUser.value = user.nama;
        roleUser.value = user.role;

        btnTambahUser.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Update User
        `;

        usernameUser.focus();

    } catch (err) {

        console.error(err);

        showToast("Gagal membuka data user.");

    }

}

/*==================================================
HAPUS USER
==================================================*/

async function deleteUserConfirm(id) {

    const konfirmasi = confirm(
        "Yakin ingin menghapus user ini?"
    );

    if (!konfirmasi) return;

    try {

        await deleteUser(id);

        await loadUsers();

        showToast("User berhasil dihapus.");

    } catch (err) {

        console.error(err);

        showToast("Gagal menghapus user.");

    }

}

/*==================================================
TAMBAH / UPDATE KATEGORI
==================================================*/

async function tambahKategori() {

    const nama = namaKategori.value.trim();

    if (nama === "") {

        showToast("Nama kategori tidak boleh kosong.");

        return;

    }

    try {

        if (editKategoriId === null) {

            await insertCategory({
                nama: nama
            });

            showToast("Kategori berhasil ditambahkan.");

        } else {

            await updateCategory(editKategoriId, {
                nama: nama
            });

            showToast("Kategori berhasil diperbarui.");

            editKategoriId = null;

            btnTambahKategori.innerHTML = `
                <i class="fa-solid fa-plus"></i>
                Tambah Kategori
            `;

        }

        namaKategori.value = "";

        await loadCategories();

    } catch (err) {

        console.error(err);

        showToast("Gagal menyimpan kategori.");

    }

}

/*==================================================
EDIT KATEGORI
==================================================*/

async function editCategory(id) {

    try {

        const categories = await getCategories();

        const kategori = categories.find(item => item.id === id);

        if (!kategori) return;

        editKategoriId = id;

        namaKategori.value = kategori.nama;

        btnTambahKategori.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Update Kategori
        `;

        namaKategori.focus();

    } catch (err) {

        console.error(err);

        showToast("Gagal membuka kategori.");

    }

}

/*==================================================
HAPUS KATEGORI
==================================================*/

async function deleteCategoryConfirm(id) {

    const konfirmasi = confirm(
        "Yakin ingin menghapus kategori ini?"
    );

    if (!konfirmasi) return;

    try {

        await deleteCategory(id);

        await loadCategories();

        showToast("Kategori berhasil dihapus.");

    } catch (err) {

        console.error(err);

        showToast("Gagal menghapus kategori.");

    }

}

/*==================================================*
*MEMBUAT CARD MENU
*==================================================*/

function createMenuCard(item) {

    return `

<div class="menu-card">

    <div class="menu-image">

        <img
            src="${item.foto || 'images/default.jpg'}"
            alt="${item.nama}"
            onclick="lihatGambar('${item.foto || 'images/default.jpg'}')">

        ${item.bestSeller
            ? '<span class="badge best">Best Seller</span>'
            : ''}

        ${item.promo
            ? '<span class="badge promo">Promo</span>'
            : ''}

        ${item.baru
            ? '<span class="badge new">Baru</span>'
            : ''}

    </div>

    <div class="menu-content">

        <h3 class="menu-title">

            ${item.nama}

        </h3>

        <p class="menu-description"
        onclick='lihatDeskripsi(${JSON.stringify(item)})'>

        ${item.deskripsi}

    </p>

        <div class="menu-price">

            ${formatRupiah(item.harga)}

        </div>

        <div class="menu-action">

            <button
                class="btn-detail"
                onclick="lihatGambar('${item.foto || 'images/default.jpg'}')">

                Detail

        <button

            class="btn-order"
            onclick='tambahKeKeranjang(${JSON.stringify(item)})'>

            Pesan

        </button>

        </div>

    </div>

</div>

`;

}


/*==================================================*
* RENDER SATU KATEGORI
*==================================================*/

function renderCategory(title, menus, icon = "🍽️") {

    if (!menus || menus.length === 0) {
        return "";
    }

    const bestSeller = menus.filter(item => item.bestSeller);
    const regularMenu = menus.filter(item => !item.bestSeller);

    return `

<section class="menu-category">

    <div class="category-header">

        <h2>${icon} ${title}</h2>

    </div>

    <div class="menu-grid">

        ${bestSeller.map(item => createMenuCard(item)).join("")}

        ${regularMenu.map(item => createMenuCard(item)).join("")}

    </div>

</section>

`;

}

/*==================================================*
* RENDER PROMO
*==================================================*/

function renderPromo(menus) {

    if (!menus || menus.length === 0) {
        return "";
    }

    return `

<section class="promo-section">

    <div class="category-header promo-header">

        <h2>🔥 Promo Spesial</h2>

        <p>Jangan lewatkan penawaran terbaik hari ini.</p>

    </div>

    <div class="menu-grid">

        ${menus.map(item => createMenuCard(item)).join("")}

    </div>

</section>

`;

}

/*==================================================*
*FILTER MENU
*==================================================*/

function filterMenu() {

    let data = [...daftarMenu];

    /* SEARCH */

    const keyword = cariMenu
        ? cariMenu.value.trim().toLowerCase()
        : "";

    if (keyword !== "") {

        data = data.filter(item =>
            item.nama.toLowerCase().includes(keyword) ||
            item.deskripsi.toLowerCase().includes(keyword)
        );

    }

    /* FILTER KATEGORI */

    if (
        filterKategori &&
        filterKategori.value !== "" &&
        filterKategori.value !== "Semua"
    ) {

        data = data.filter(item =>
            item.kategori === filterKategori.value
        );

    }

    /* FILTER STATUS */

    if (
        filterStatus &&
        filterStatus.value !== "" &&
        filterStatus.value !== "Semua"
    ) {

        data = data.filter(item => {

            switch (filterStatus.value) {

                case "bestseller":
                    return item.bestSeller;

                case "promo":
                    return item.promo;

                case "baru":
                    return item.baru;

                default:
                    return true;

            }

        });

    }

    return data;

}

/*==================================================*
* GROUP MENU BERDASARKAN KATEGORI
*==================================================*/

function groupMenuByCategory(data) {

    return {

        promo: data.filter(item => item.promo),

        "Sarapan Pagi": data.filter(item =>
            item.kategori === "Sarapan Pagi"
        ),

        "Makanan": data.filter(item =>
            item.kategori === "Makanan"
        ),

        "Minuman": data.filter(item =>
            item.kategori === "Minuman"
        ),

        "Paket Nasi Special": data.filter(item =>
            item.kategori === "Paket Nasi Special"
        ),

        "Snack": data.filter(item =>
            item.kategori === "Snack"
        )

    };

}

/*==================================================*
* RENDER SEMUA KATEGORI
*==================================================*/

function renderAllCategories(groups) {

    let html = "";

    /* PROMO */

    html += renderPromo(groups.promo);

    /* KATEGORI */

    html += renderCategory(
        "Sarapan Pagi",
        groups["Sarapan Pagi"],
        "🥣"
    );

    html += renderCategory(
        "Makanan",
        groups["Makanan"],
        "🍽️"
    );

    html += renderCategory(
        "Minuman",
        groups["Minuman"],
        "☕"
    );

    html += renderCategory(
        "Paket Nasi Special",
        groups["Paket Nasi Special"],
        "🍛"
    );

    html += renderCategory(
        "Snack",
        groups["Snack"],
        "🥨"
    );

    return html;

}

/*==================================================*
* RENDER MENU
*==================================================*/

function renderMenu() {

    if (!listMenu) return;

    const data = filterMenu();

    /* MENU KOSONG */

    if (data.length === 0) {

        listMenu.innerHTML = `

        <div class="empty-menu">

            <h3>Tidak ada menu.</h3>

            <p>Coba ubah pencarian atau filter.</p>

        </div>

        `;

        updateStatistik(data);

        return;

    }

    /* GROUP KATEGORI */

    const groups = groupMenuByCategory(data);

    /* RENDER SEMUA KATEGORI */

    listMenu.innerHTML = renderAllCategories(groups);

    updateStatistik(data);

}

/*==================================================
STATISTIK
==================================================*/

function updateStatistik(data = daftarMenu){

    if(jumlahMenu)
        jumlahMenu.textContent = data.length;

    if(jumlahKategori){

        const kategori =
            [...new Set(data.map(item => item.kategori))];

        jumlahKategori.textContent =
            kategori.length;

    }

    if(menuPromo){

        menuPromo.textContent =
            data.filter(item => item.promo).length;

    }

    if(menuBestSeller){

        menuBestSeller.textContent =
            data.filter(item => item.bestSeller).length;

    }

}

/*==================================================
SEARCH
==================================================*/

if(cariMenu){

    cariMenu.addEventListener(

        "input",

        renderMenu

    );

}

/*==================================================
FILTER
==================================================*/

if(filterKategori){

    filterKategori.addEventListener(

        "change",

        renderMenu

    );

}

if(filterStatus){

    filterStatus.addEventListener(

        "change",

        renderMenu

    );

}

/*==================================================
POTONGAN 5 DIMULAI DARI SINI
==================================================*/

/*==================================================
UPLOAD FOTO
==================================================*/

if(fotoMenu){

    fotoMenu.addEventListener("change",function(e){

        const file = e.target.files[0];
        if(!file) return;
        fotoFile = file;
        const reader = new FileReader();

        reader.onload = function(ev){

            fotoBase64 = ev.target.result;

            if(previewFoto){

                previewFoto.src = fotoBase64;

                previewFoto.style.display = "block";

            }

        };

        reader.readAsDataURL(file);

    });

}

/*==================================================
MODAL GAMBAR
==================================================*/

function lihatGambar(src){

    if(!imageModal || !modalImage) return;

    modalImage.src = src;

    imageModal.classList.add("active");

}

if(closeImage){

    closeImage.addEventListener("click",function(){

        imageModal.classList.remove("active");

    });

}

if(imageModal){

    imageModal.addEventListener("click",function(e){

        if(e.target===imageModal){

            imageModal.classList.remove("active");

        }

    });

}

/*==================================================
MODAL DESKRIPSI MENU
==================================================*/

function lihatDeskripsi(item){

    if(!descriptionModal) return;

    descriptionTitle.textContent = item.nama || "Detail Menu";

    descriptionPrice.textContent =
        formatRupiah(item.harga || 0);

    descriptionText.textContent =
        item.deskripsi || "Tidak ada deskripsi.";

    descriptionModal.classList.add("active");

}

if(closeDescription){

    closeDescription.addEventListener("click",function(){

        descriptionModal.classList.remove("active");

    });

}

/*==================================================
SHOPPING CART
==================================================*/

function tambahKeKeranjang(item) {

    const itemAda = shoppingCart.find(
        menu => menu.nama === item.nama
    );

    if (itemAda) {

        itemAda.jumlah += 1;

    } else {

        shoppingCart.push({

            nama: item.nama,
            harga: Number(item.harga),
            jumlah: 1

        });

    }

    console.log("🛒 Shopping Cart:", shoppingCart);
    updateCartCount();

}


/*==================================================
BUKA SHOPPING CART
==================================================*/

function bukaKeranjang() {

    renderKeranjang();
    cartModal.style.display = "flex";

}

/*==================================================
TUTUP SHOPPING CART
==================================================*/

function tutupKeranjang() {

    cartModal.style.display = "none";

}


/*==================================================
HITUNG SHOPPING CART
==================================================*/

function hitungTotalKeranjang() {

    return shoppingCart.reduce(

        (total, item) => {

            return total +
                (item.harga * item.jumlah);

        },

        0

    );

}

/*==================================================
CHECKOUT WHATSAPP
==================================================*/

function checkoutWhatsApp() {

    if (shoppingCart.length === 0) {

        alert("Keranjang masih kosong.");

        return;

    }


    /* DATA PELANGGAN */

    const customerName =
        $("customerName")?.value.trim() || "-";

    const tableNumber =
        $("tableNumber")?.value.trim() || "-";

    const orderNote =
        $("orderNote")?.value.trim() || "-";


    const nomor = "6285150723357";


    /* PESAN WHATSAPP */

    let pesan =

`Halo The Sultan Cafe,

Saya ingin memesan:

Nama Pelanggan: ${customerName}
Nomor Meja: ${tableNumber}

`;


    /* DAFTAR MENU */

    shoppingCart.forEach((item, index) => {

        const subtotal =
            item.harga * item.jumlah;


        pesan +=

`${index + 1}. ${item.nama}
   ${formatRupiah(item.harga)} x ${item.jumlah} = ${formatRupiah(subtotal)}
   Catatan: ${item.catatan || "-"}

`;

    });


    /* TOTAL + CATATAN UMUM */

    pesan +=

`Total: ${formatRupiah(hitungTotalKeranjang())}

Catatan Pesanan: ${orderNote}

Terima kasih.`;


    /* BUKA WHATSAPP */

    window.open(

        "https://wa.me/" +
        nomor +
        "?text=" +
        encodeURIComponent(pesan),

        "_blank"

    );


    /* KOSONGKAN KERANJANG */

    shoppingCart.length = 0;

    updateCartCount();

    renderKeranjang();

    tutupKeranjang();

}

/*==================================================
UPDATE CART COUNT
==================================================*/

function updateCartCount() {

    const cartCount = $("cartCount");

    if (!cartCount) return;

    const totalJumlah = shoppingCart.reduce(

        (total, item) => {

            return total + item.jumlah;

        },

        0

    );

    cartCount.textContent = totalJumlah;

}

/*==================================================
RENDER SHOPPING CART
==================================================*/

function renderKeranjang() {

    const cartItems = $("cartItems");

    if (!cartItems) return;


    /* CART KOSONG */

    if (shoppingCart.length === 0) {

        cartItems.innerHTML = `

            <div class="cart-empty">

                <i class="fa-solid fa-cart-shopping"></i>

                <p>Keranjang masih kosong</p>

            </div>

        `;

        const cartTotal = $("cartTotal");

        if (cartTotal) {

            cartTotal.textContent = "Rp0";

        }

        return;

    }


    /* TAMPILKAN ITEM */

    cartItems.innerHTML = shoppingCart.map(

        (item, index) => `

            <div class="cart-item">


                <div class="cart-item-info">

                    <strong class="cart-item-name">

                        ${item.nama}

                    </strong>

                    <span class="cart-item-detail">

                        ${formatRupiah(item.harga)}
                        ×
                        ${item.jumlah}

                    </span>

                </div>


                <strong class="cart-item-subtotal">

                    ${formatRupiah(item.harga * item.jumlah)}

                </strong>


                <div class="cart-item-action">

                    <button
                        onclick="kurangiJumlahCart(${index})">

                        −

                    </button>

                    <span>

                        ${item.jumlah}

                    </span>

                    <button
                        onclick="tambahJumlahCart(${index})">

                        +

                    </button>

                </div>


                <!-- CATATAN PER MENU -->

                <div class="cart-item-note">

                
                    <input
                        type="text"
                        placeholder="Catatan untuk menu ini"
                        value="${item.catatan || ''}"
                        onchange="simpanCatatanCart(${index}, this.value)">

                </div>


            </div>

        `

    ).join("");


    /* TOTAL */

    const cartTotal = $("cartTotal");

    if (cartTotal) {

        cartTotal.textContent =

            formatRupiah(

                hitungTotalKeranjang()

            );

    }

}

/*==================================================
TAMBAH JUMLAH CART
==================================================*/

function tambahJumlahCart(index) {

    if (!shoppingCart[index]) return;

    shoppingCart[index].jumlah += 1;

    updateCartCount();

    renderKeranjang();

}


/*==================================================
KURANGI JUMLAH CART
==================================================*/

function kurangiJumlahCart(index) {

    if (!shoppingCart[index]) return;

    shoppingCart[index].jumlah -= 1;

    if (shoppingCart[index].jumlah <= 0) {

        shoppingCart.splice(index, 1);

    }

    updateCartCount();

    renderKeranjang();

}

/*==================================================
WHATSAPP
==================================================*/

function pesanWA(namaMenu){

    const nomor = "6285150723357";

    const pesan =

`Halo The Sultan Cafe,

Saya ingin memesan:

${namaMenu}

Terima kasih.`;

    window.open(

        "https://wa.me/"+

        nomor+

        "?text="+

        encodeURIComponent(pesan),

        "_blank"

    );

}

/*==================================================
DASHBOARD
==================================================*/

function updateDashboard(){

    if(dashboardTotalMenu){

        dashboardTotalMenu.textContent =

        daftarMenu.length;

    }

    if(dashboardKategori){

        dashboardKategori.textContent =

        [...new Set(

            daftarMenu.map(

                item=>item.kategori

            )

        )].length;

    }

    if(dashboardPromo){

        dashboardPromo.textContent =

        daftarMenu.filter(

            item=>item.promo

        ).length;

    }

    if(dashboardBestSeller){

        dashboardBestSeller.textContent =

        daftarMenu.filter(

            item=>item.bestSeller

        ).length;

    }

}

/*==================================================
TABLE ADMIN
==================================================*/

function renderTable(){

    if(!adminTableMenu) return;

    if(daftarMenu.length===0){

        adminTableMenu.innerHTML=

        `<tr>

            <td colspan="7">

                Belum ada data menu.

            </td>

        </tr>`;

        return;

    }

adminTableMenu.innerHTML = daftarMenu.map((item, index) => `

<tr>

    <td>${index + 1}</td>

    <td>
        <img
            src="${item.foto || 'images/default.jpg'}"
            alt="${item.nama}"
            style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
    </td>

    <td>${item.nama}</td>

    <td>${item.kategori}</td>

    <td>${formatRupiah(item.harga)}</td>

    <td>
        ${item.bestSeller ? "⭐" : ""}
        ${item.promo ? "🔥" : ""}
        ${item.baru ? "🆕" : ""}
    </td>

    <td>

        <button
            class="btn-warning"
            onclick="editMenu(${item.id})">
            Edit
        </button>

        <button
            class="btn-danger"
            onclick="hapusMenu(${item.id})">
            Hapus
        </button>

    </td>

</tr>

`).join("");

}

/*==================================================
POTONGAN 6 DIMULAI DARI SINI
==================================================*/

/*==================================================
EVENT FILTER
==================================================*/



/*==================================================
SCROLL TOP
==================================================*/

const scrollTopBtn = document.getElementById("scrollTop");

if(scrollTopBtn){

    window.addEventListener(

        "scroll",

        function(){

            if(window.scrollY>300){

                scrollTopBtn.style.display="flex";

            }else{

                scrollTopBtn.style.display="none";

            }

        }

    );

    scrollTopBtn.addEventListener(

        "click",

        function(){

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }

    );

}

/*==================================================
FLOATING WHATSAPP
==================================================*/

const floatingWA = document.getElementById("floatingWA");

if(floatingWA){

    floatingWA.addEventListener(

        "click",

        function(){

            pesanWA("Saya ingin melihat menu The Sultan Cafe");

        }

    );

}

/*==================================================
REFRESH SELURUH TAMPILAN
==================================================*/

function refreshSemua(){

    renderMenu();

    renderTable();

    updateDashboard();

    updateStatistik();

}


/*==================================================
START APP
==================================================*/
/*
document.addEventListener(

    "DOMContentLoaded",

    function(){

        showLoading();

        loadData();

        refreshSemua();

        showPage(homePage);

        setActiveNav(navHome);

        setTimeout(function(){

            hideLoading();

        },800);

    }

);
*/
/*==================================================
DEBUG
==================================================*/

/*==================================================
TEST SUPABASE STORAGE
==================================================*/

async function testStorageUpload() {

    if (!fotoFile) {
        alert("Pilih gambar terlebih dahulu.");
        return;
    }

    try {

        const url = await uploadImage(fotoFile);

        console.log("✅ Upload berhasil");
        console.log(url);

        alert("Upload berhasil.\nLihat Console untuk URL.");

    } catch (error) {

        console.error(error);

        alert("Upload gagal.");

    }

}

console.log(

    "THE SULTAN CAFE V2 READY"

);