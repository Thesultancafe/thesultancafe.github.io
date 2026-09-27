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


const transactionHistoryPage =
    $("transactionHistoryPage");


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

        setTimeout(function(){

            if(adminPage){
                adminPage.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            const namaMenu =
                document.getElementById("namaMenu");

            if(namaMenu){
                namaMenu.focus();
            }

        }, 300);

        return;

    }


    showPage(loginPage);

    setActiveNav(navAdmin);

    setTimeout(function(){

        if(loginPage){
            loginPage.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        const usernameAdmin =
            document.getElementById("usernameAdmin");

        if(usernameAdmin){
            usernameAdmin.focus();
        }

    }, 300);

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


/* ==========================================
   SIMPAN DATA ADMIN UNTUK POS
   ========================================== */

sessionStorage.setItem(
    "posKasirNama",
    user.nama || user.username || "Admin"
);


usernameAdmin.value = "";

passwordAdmin.value = "";

showToast(
    "Selamat datang, " +
    user.nama +
    "!"
);
        
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


    /* ==========================================
       HAPUS DATA ADMIN DARI SESI POS
       ========================================== */

    sessionStorage.removeItem(
        "posKasirNama"
    );


    showPage(homePage);

    setActiveNav(navHome);

    showToast("Logout berhasil.");

}


/* ==========================================
   BUKA POS KASIR
   ========================================== */

const btnOpenPOS =
    document.getElementById("btnOpenPOS");


if (btnOpenPOS) {

    btnOpenPOS.addEventListener(
        "click",
        function(){

            window.location.href =
                "admin/pos.html";

        }
    );

}


/* ==========================================
   BUKA RIWAYAT TRANSAKSI
   ========================================== */

const btnOpenTransactionHistory =
    $("btnOpenTransactionHistory");

const btnBackToDashboard =
    $("btnBackToDashboard");


if (btnOpenTransactionHistory) {

    btnOpenTransactionHistory.addEventListener(
        "click",
        function() {

            showPage(
                transactionHistoryPage
            );

            loadTransactionHistory();


        }
    );

}


if (btnBackToDashboard) {

    btnBackToDashboard.addEventListener(
        "click",
        function() {

            showPage(
                adminPage
            );

        }
    );

}

/* ==========================================
   LOAD RIWAYAT TRANSAKSI
   ========================================== */

async function loadTransactionHistory() {

    const tableBody =
        $("transactionHistoryTable");


    if (!tableBody) {

        return;

    }


    /* ==========================================
       TAMPILKAN LOADING
       ========================================== */

    tableBody.innerHTML = `
        <tr>
            <td
                colspan="8"
                style="text-align:center;"
            >
                Memuat data transaksi...
            </td>
        </tr>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("transaksi")

            .select(`
                id,
                nomor_transaksi,
                created_at,
                kasir,
                nama_pelanggan,
                nomor_meja,
                total,
                metode_pembayaran
            `)

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        /* ==========================================
           JIKA BELUM ADA TRANSAKSI
           ========================================== */

        if (!data || data.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        style="text-align:center;"
                    >
                        Belum ada transaksi.
                    </td>
                </tr>
            `;

            return;

        }


        /* ==========================================
           RENDER DATA
           ========================================== */

        tableBody.innerHTML = "";


        data.forEach(
            function(
                transaksi,
                index
            ) {

                const tanggal =
                    transaksi.created_at
                        ? new Date(
                            transaksi.created_at
                          ).toLocaleDateString(
                            "id-ID"
                          )
                        : "-";


                const total =
                    Number(
                        transaksi.total || 0
                    ).toLocaleString(
                        "id-ID"
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

        <td>
            <button
                class="btn-transaction-detail"
                data-id="${transaksi.id}"
                type="button">

                ${transaksi.nomor_transaksi || "-"}

            </button>
        </td>

                    <td>
                        ${tanggal}
                    </td>

                    <td>
                        ${transaksi.kasir || "-"}
                    </td>

                    <td>
                        ${transaksi.nama_pelanggan || "-"}
                    </td>

                    <td>
                        ${transaksi.nomor_meja || "-"}
                    </td>

                    <td>
                        Rp ${total}
                    </td>

                    <td>
                        ${transaksi.metode_pembayaran || "-"}
                    </td>
                    <td>
                       <button
                            type="button"
                            class="btn-delete-transaction"
                            data-id="${transaksi.id}"
                            style="
                            background:#dc3545;
                            color:#ffffff;
                            border:none;
                            padding:6px 10px;
                            border-radius:5px;
                            cursor:pointer;
                            font-size:13px;
                        "
                    >
                        <i class="fa-solid fa-trash"></i>
                         Hapus
                    </button>
                </td>
                `;


                tableBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ Gagal memuat riwayat transaksi:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="text-align:center;"
                >
                    Gagal memuat riwayat transaksi.
                </td>
            </tr>
        `;

    }

}

/* ==========================================
   HAPUS TRANSAKSI
   ========================================== */

async function hapusTransaksi(
    transaksiId
) {

    if (!transaksiId) {
        return;
    }


    /* ==========================================
       KONFIRMASI
       ========================================== */

    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus transaksi ini?\n\n" +
            "Detail transaksi juga akan dihapus."
        );


    if (!yakin) {
        return;
    }


    try {

        /* ==========================================
           HAPUS DETAIL TRANSAKSI
           ========================================== */

        const {
            error: detailError
        } = await supabaseClient
            .from("detail_transaksi")
            .delete()
            .eq(
                "transaksi_id",
                transaksiId
            );


        if (detailError) {
            throw detailError;
        }


        /* ==========================================
           HAPUS TRANSAKSI UTAMA
           ========================================== */

        const {
            error: transaksiError
        } = await supabaseClient
            .from("transaksi")
            .delete()
            .eq(
                "id",
                transaksiId
            );


        if (transaksiError) {
            throw transaksiError;
        }


        alert(
            "Transaksi berhasil dihapus."
        );


        /* ==========================================
           REFRESH RIWAYAT TRANSAKSI
           ========================================== */

        loadTransactionHistory();


    } catch (error) {

        console.error(
            "❌ Gagal menghapus transaksi:",
            error
        );


        alert(
            "Gagal menghapus transaksi.\n\n" +
            error.message
        );

    }

}

 /* ==========================================
    KLIK NO. TRANSAKSI
    ========================================== */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                ".btn-transaction-detail"
            );

        if (!button) {
            return;
        }

        const transaksiId =
            button.dataset.id;

        console.log(
            "ID transaksi dipilih:",
            transaksiId
        );

        ambilDetailTransaksi(
            transaksiId
        );

    }
);

/* ==========================================
   KLIK HAPUS TRANSAKSI
   ========================================== */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                ".btn-delete-transaction"
            );

        if (!button) {
            return;
        }

        const transaksiId =
            button.dataset.id;

        console.log(
            "ID transaksi yang akan dihapus:",
            transaksiId
        );

        hapusTransaksi(
            transaksiId
        );

    }
);

/* ==========================================
   AMBIL DETAIL TRANSAKSI
   ========================================== */

async function ambilDetailTransaksi(
    transaksiId
) {

    try {

        /* ==========================================
           AMBIL TRANSAKSI UTAMA
           ========================================== */

        const {
            data: transaksi,
            error: transaksiError
        } = await supabaseClient

            .from("transaksi")

            .select("*")

            .eq(
                "id",
                transaksiId
            )

            .single();


        if (transaksiError) {

            throw transaksiError;

        }


        /* ==========================================
           AMBIL DETAIL MENU
           ========================================== */

        const {
            data: detail,
            error: detailError
        } = await supabaseClient

            .from("detail_transaksi")

            .select("*")

            .eq(
                "transaksi_id",
                transaksiId
            )

            .order(
                "id",
                {
                    ascending: true
                }
            );


        if (detailError) {

            throw detailError;

        }


        /* ==========================================
           TAMPILKAN HASIL UNTUK TEST
           ========================================== */

        console.log(
            "DATA TRANSAKSI:",
            transaksi
        );


        console.log(
            "DETAIL TRANSAKSI:",
            detail
        );

        /* ==========================================
           TAMPILKAN PREVIEW NOTA
           ========================================== */

        tampilkanPreviewNota(
            transaksi,
            detail
        );


    } catch (error) {

        console.error(
            "❌ Gagal mengambil detail transaksi:",
            error
        );

    }

}

/* ==========================================
   TAMPILKAN PREVIEW NOTA
   ========================================== */

function tampilkanPreviewNota(
    transaksi,
    detail
) {

    const modal =
        $("transactionDetailModal");

    const content =
        $("transactionDetailContent");


    if (!modal || !content) {

        return;

    }


    /* ==========================================
       FORMAT TANGGAL
       ========================================== */

    let tanggal =
        "-";

    let jam =
        "-";


    if (transaksi.tanggal) {

        const waktu =
            new Date(
                transaksi.tanggal
            );


        tanggal =
            waktu.toLocaleDateString(
                "id-ID"
            );


        jam =
            waktu.toLocaleTimeString(
                "id-ID",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }


    /* ==========================================
       FORMAT TOTAL
       ========================================== */

    function rupiah(
        angka
    ) {

        return (
            "Rp " +
            Number(
                angka || 0
            ).toLocaleString(
                "id-ID"
            )
        );

    }


    /* ==========================================
       HEADER NOTA
       ========================================== */

    let html = `

        <div
            style="
                text-align:center;
                margin-bottom:15px;
            "
        >

            <strong
                style="
                    font-size:20px;
                "
            >
                THE SULTAN CAFE
            </strong>

            <div>
                Palembang Tempo Doeloe
            </div>

        </div>


        <hr>


        <div
            style="
                font-size:14px;
                line-height:1.6;
            "
        >

            <div>
                <strong>No. Transaksi</strong>
                : ${transaksi.nomor_transaksi || "-"}
            </div>

            <div>
                <strong>Tanggal</strong>
                : ${tanggal}

                &nbsp;&nbsp;

                <strong>Jam</strong>
                : ${jam}
            </div>

            <div>
                <strong>Kasir</strong>
                : ${transaksi.kasir || "-"}
            </div>

    `;


    if (
        transaksi.nama_pelanggan
    ) {

        html += `

            <div>
                <strong>Pelanggan</strong>
                : ${transaksi.nama_pelanggan}
            </div>

        `;

    }


    if (
        transaksi.nomor_meja
    ) {

        html += `

            <div>
                <strong>Meja</strong>
                : ${transaksi.nomor_meja}
            </div>

        `;

    }


    html += `

        </div>


        <hr>


        <div
            style="
                font-size:14px;
            "
        >

    `;


    /* ==========================================
       DAFTAR MENU
       ========================================== */

    detail.forEach(
        function(item) {

            const subtotal =
                Number(
                    item.harga || 0
                ) *
                Number(
                    item.jumlah || 0
                );


            html += `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        margin-bottom:6px;
                    "
                >

                    <span>

                        ${item.nama_menu}

                        x${item.jumlah}

                    </span>

                    <span>

                        ${rupiah(
                            subtotal
                        )}

                    </span>

                </div>

            `;


            if (item.catatan) {

                html += `

                    <div
                        style="
                            font-size:12px;
                            margin-left:10px;
                            margin-bottom:8px;
                        "
                    >

                        Catatan:
                        ${item.catatan}

                    </div>

                `;

            }

        }
    );


    /* ==========================================
       PEMBAYARAN
       ========================================== */

    html += `

        </div>


        <hr>


        <div
            style="
                font-size:14px;
                line-height:1.8;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    font-weight:bold;
                "
            >

                <span>
                    TOTAL
                </span>

                <span>
                    ${rupiah(
                        transaksi.total
                    )}
                </span>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                "
            >

                <span>
                    Pembayaran
                </span>

                <span>
                    ${transaksi.metode_pembayaran || "-"}
                </span>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                "
            >

                <span>
                    Dibayar
                </span>

                <span>
                    ${rupiah(
                        transaksi.jumlah_dibayar
                    )}
                </span>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                "
            >

                <span>
                    Kembalian
                </span>

                <span>
                    ${rupiah(
                        transaksi.kembalian
                    )}
                </span>

            </div>

        </div>


        <hr>


        <div
            style="
                text-align:center;
                line-height:1.6;
                font-size:13px;
            "
        >

            Terima kasih

            <br>

            Selamat menikmati

        </div>

    `;


    content.innerHTML =
        html;


    /* ==========================================
       BUKA MODAL
       ========================================== */

    modal.style.display =
        "flex";


    /* ==========================================
       TOMBOL BATAL PREVIEW NOTA
       ========================================== */

    const btnClose =
        document.getElementById(
            "btnCloseTransactionDetail"
        );

    if (btnClose) {

        btnClose.onclick =
            function() {

                modal.style.display =
                    "none";

                console.log(
                    "✅ Preview nota ditutup."
                );

            };

    }


/* ==========================================
   TOMBOL CETAK NOTA
   ========================================== */

const btnPrint =
    document.getElementById(
        "btnPrintTransactionDetail"
    );

if (btnPrint) {

    btnPrint.onclick =
        async function() {

            console.log(
                "🧾 Cetak Nota dari Riwayat Transaksi..."
            );

            const dataCetak = {

                nomorTransaksi:
                    transaksi.nomor_transaksi || "-",

                kasir:
                    transaksi.kasir || "-",

                namaPelanggan:
                    transaksi.nama_pelanggan || "",

                nomorMeja:
                    transaksi.nomor_meja || "",

                items:
                    detail.map(function(item) {

                        return {

                            nama:
                                item.nama_menu,

                            harga:
                                Number(item.harga || 0),

                            jumlah:
                                Number(item.jumlah || 0),

                            catatan:
                                item.catatan || ""

                        };

                    }),

                total:
                    Number(transaksi.total || 0),

                metodePembayaran:
                    transaksi.metode_pembayaran || "-",

                jumlahDibayar:
                    Number(
                        transaksi.jumlah_dibayar || 0
                    ),

                kembalian:
                    Number(
                        transaksi.kembalian || 0
                    )

            };

            console.log(
                "DATA CETAK RIWAYAT:",
                dataCetak
            );

            await cetakStruk58mm(
                dataCetak
            );

        };
}
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

document.addEventListener(

    "DOMContentLoaded",

    function(){

        showLoading();

        loadData();

        refreshSemua();

        showPage(homePage);
        console.log("ADMIN PAGE:", adminPage);
        console.log("ADMIN CLASS:", adminPage.className);
        console.log("ADMIN DISPLAY:", getComputedStyle(adminPage).display);

        setActiveNav(navHome);

        setTimeout(function(){

            hideLoading();

        },800);

    }

);


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

// ==========================================
// TAB UTAMA ADMIN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const tabMenu = document.getElementById("tabMenu");
    const tabUser = document.getElementById("tabUser");
    const tabPOS = document.getElementById("tabPOS");
    const tabTransaksi = document.getElementById("tabTransaksi");
    const tabLaporan = document.getElementById("tabLaporan");
    const tabKeuangan = document.getElementById("tabKeuangan");

    const adminMenuGroup = document.getElementById("adminMenuGroup");
    const adminUserGroup = document.getElementById("adminUserGroup");
    const adminTransactionGroup = document.getElementById("adminTransactionGroup");
    const adminReportGroup = document.getElementById("adminReportGroup");

    function resetAdminTab() {

        if (adminMenuGroup) {
            adminMenuGroup.style.display = "none";
        }

        if (adminUserGroup) {
            adminUserGroup.style.display = "none";
        }

        if (adminTransactionGroup) {
            adminTransactionGroup.style.display = "none";
        }

        if (adminReportGroup) {
            adminReportGroup.style.display = "none";
        }

        if (tabMenu) {
            tabMenu.classList.remove("active");
        }

        if (tabUser) {
            tabUser.classList.remove("active");
        }

        if (tabPOS) {
            tabPOS.classList.remove("active");
        }

        if (tabTransaksi) {
            tabTransaksi.classList.remove("active");
        }

        if (tabLaporan) {
            tabLaporan.classList.remove("active");
        }

        if (tabKeuangan) {
            tabKeuangan.classList.remove("active");
        }
    }

    function aktifkanTab(tombol, kelompok) {

        resetAdminTab();

        if (tombol) {
            tombol.classList.add("active");
        }

        if (kelompok) {
            kelompok.style.display = "block";
        }
    }

    // TAB MENU
    if (tabMenu) {
        tabMenu.addEventListener("click", function () {
            aktifkanTab(tabMenu, adminMenuGroup);
        });
    }

    // TAB USER
    if (tabUser) {
        tabUser.addEventListener("click", function () {
            aktifkanTab(tabUser, adminUserGroup);
        });
    }

    // TAB POS
    if (tabPOS) {
        tabPOS.addEventListener("click", function () {

            const btnOpenPOS =
                document.getElementById("btnOpenPOS");

            if (btnOpenPOS) {
                btnOpenPOS.click();
            }

        });
    }

    // TAB RIWAYAT TRANSAKSI
    if (tabTransaksi) {
        tabTransaksi.addEventListener("click", function () {

            const btnOpenTransactionHistory =
                document.getElementById("btnOpenTransactionHistory");

            if (btnOpenTransactionHistory) {
                btnOpenTransactionHistory.click();
            }

        });
    }

    // TAB LAPORAN
if (tabLaporan) {

    tabLaporan.addEventListener("click", function () {

        resetAdminTab();

        tabLaporan.classList.add("active");

        if (adminReportGroup) {
            adminReportGroup.style.display = "block";
        }

    });

}

   // TAB KEUANGAN
if (tabKeuangan) {

    tabKeuangan.addEventListener("click", function () {

        const adminFinanceGroup =
            document.getElementById("adminFinanceGroup");

        resetAdminTab();

        tabKeuangan.classList.add("active");

        if (adminFinanceGroup) {

            adminFinanceGroup.style.display = "block";

            setTimeout(function () {

                adminFinanceGroup.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);

        }

    });

}
    // DEFAULT: MENU
    if (adminMenuGroup) {
        adminMenuGroup.style.display = "block";
    }

});

// ==========================================
// SUBMENU MENU ADMIN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const subtabKategori =
        document.getElementById("subtabKategori");

    const subtabDaftarMenu =
        document.getElementById("subtabDaftarMenu");

    const subtabEditMenu =
        document.getElementById("subtabEditMenu");


    const adminSubKategori =
        document.getElementById("adminSubKategori");

    const adminSubDaftarMenu =
        document.getElementById("adminSubDaftarMenu");

    const adminSubEditMenu =
        document.getElementById("adminSubEditMenu");


    function resetSubMenu() {

        if (adminSubKategori) {
            adminSubKategori.style.display = "none";
        }

        if (adminSubDaftarMenu) {
            adminSubDaftarMenu.style.display = "none";
        }

        if (adminSubEditMenu) {
            adminSubEditMenu.style.display = "none";
        }


        if (subtabKategori) {
            subtabKategori.classList.remove("active");
        }

        if (subtabDaftarMenu) {
            subtabDaftarMenu.classList.remove("active");
        }

        if (subtabEditMenu) {
            subtabEditMenu.classList.remove("active");
        }

    }


    function aktifkanSubMenu(tombol, kelompok) {

        resetSubMenu();


        if (tombol) {
            tombol.classList.add("active");
        }


        if (kelompok) {
            kelompok.style.display = "block";
        }

    }


    // KATEGORI MENU
    if (subtabKategori) {

        subtabKategori.addEventListener("click", function () {

            aktifkanSubMenu(
                subtabKategori,
                adminSubKategori
            );

        });

    }


 // DAFTAR MENU
if (subtabDaftarMenu) {

    subtabDaftarMenu.addEventListener("click", function () {

        const adminMenuGroup =
            document.getElementById("adminMenuGroup");

        if (adminMenuGroup) {
            adminMenuGroup.style.display = "block";
        }

        aktifkanSubMenu(
            subtabDaftarMenu,
            adminSubDaftarMenu
        );

    });

}

    // EDIT MENU
    if (subtabEditMenu) {

        subtabEditMenu.addEventListener("click", function () {

            aktifkanSubMenu(
                subtabEditMenu,
                adminSubEditMenu
            );

        });

    }


    // DEFAULT: KATEGORI MENU
    aktifkanSubMenu(
        subtabKategori,
        adminSubKategori
    );

});

// ==========================================
// DEFAULT TANGGAL LAPORAN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const reportTanggalMulai =
        document.getElementById("reportTanggalMulai");

    const reportTanggalSelesai =
        document.getElementById("reportTanggalSelesai");

    const hariIni =
        new Date().toISOString().split("T")[0];

    if (reportTanggalMulai) {
        reportTanggalMulai.value = hariIni;
    }

    if (reportTanggalSelesai) {
        reportTanggalSelesai.value = hariIni;
    }

});

// ==========================================
// LAPORAN OMZET PENJUALAN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const btnLoadReport =
        document.getElementById("btnLoadReport");

    const reportTanggalMulai =
        document.getElementById("reportTanggalMulai");

    const reportTanggalSelesai =
        document.getElementById("reportTanggalSelesai");

    const reportStatus =
        document.getElementById("reportStatus");

    const reportTotalOmzet =
        document.getElementById("reportTotalOmzet");

    const reportCash =
        document.getElementById("reportCash");

    const reportQRIS =
        document.getElementById("reportQRIS");

    const reportTransfer =
        document.getElementById("reportTransfer");

    const reportTable =
        document.getElementById("reportTransactionTable");


    function formatRupiahLaporan(nilai) {

        return Number(nilai || 0).toLocaleString(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }
        );

    }


    async function loadLaporanPenjualan() {

        if (!reportTanggalMulai ||
            !reportTanggalSelesai ||
            !reportTable) {

            return;

        }


        const tanggalMulai =
            reportTanggalMulai.value;

        const tanggalSelesai =
            reportTanggalSelesai.value;


        if (!tanggalMulai || !tanggalSelesai) {

            if (reportStatus) {
                reportStatus.textContent =
                    "Tanggal laporan belum lengkap.";
            }

            return;

        }


        if (tanggalMulai > tanggalSelesai) {

            if (reportStatus) {
                reportStatus.textContent =
                    "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.";
            }

            return;

        }


        if (reportStatus) {
            reportStatus.textContent =
                "Memuat laporan...";
        }


        reportTotalOmzet.textContent =
            formatRupiahLaporan(0);

        reportCash.textContent =
            formatRupiahLaporan(0);

        reportQRIS.textContent =
            formatRupiahLaporan(0);

        reportTransfer.textContent =
            formatRupiahLaporan(0);


        const tbody =
            reportTable.querySelector("tbody");


        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Memuat data...
                    </td>
                </tr>
            `;

        }


        try {

            // Awal tanggal mulai = 00:00:00 waktu lokal
            const startDate =
                new Date(
                    tanggalMulai + "T00:00:00"
                );


            // Hari setelah tanggal selesai
            const endDate =
                new Date(
                    tanggalSelesai + "T00:00:00"
                );

            endDate.setDate(
                endDate.getDate() + 1
            );


            const {
                data,
                error
            } = await supabaseClient

                .from("transaksi")

                .select(`
                    id,
                    nomor_transaksi,
                    created_at,
                    kasir,
                    total,
                    metode_pembayaran,
                    status
                `)

                .eq(
                    "status",
                    "SELESAI"
                )

                .gte(
                    "created_at",
                    startDate.toISOString()
                )

                .lt(
                    "created_at",
                    endDate.toISOString()
                )

                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


            if (error) {
                throw error;
            }


            const transaksi =
                data || [];


            let totalOmzet = 0;
            let totalCash = 0;
            let totalQRIS = 0;
            let totalTransfer = 0;


            transaksi.forEach(
                function(item) {

                    const total =
                        Number(item.total || 0);

                    totalOmzet += total;


                    const metode =
                        String(
                            item.metode_pembayaran || ""
                        ).toUpperCase();


                    if (metode === "CASH") {
                        totalCash += total;
                    }

                    if (metode === "QRIS") {
                        totalQRIS += total;
                    }

                    if (metode === "TRANSFER") {
                        totalTransfer += total;
                    }

                }
            );


            reportTotalOmzet.textContent =
                formatRupiahLaporan(
                    totalOmzet
                );

            reportCash.textContent =
                formatRupiahLaporan(
                    totalCash
                );

            reportQRIS.textContent =
                formatRupiahLaporan(
                    totalQRIS
                );

            reportTransfer.textContent =
                formatRupiahLaporan(
                    totalTransfer
                );


            // Tampilkan detail transaksi
            if (tbody) {

                tbody.innerHTML = "";


                if (transaksi.length === 0) {

                    tbody.innerHTML = `
                        <tr>
                            <td
                                colspan="6"
                                style="text-align:center;"
                            >
                                Tidak ada transaksi pada periode ini.
                            </td>
                        </tr>
                    `;

                } else {

                    transaksi.forEach(
                        function(item, index) {

                            const tanggal =
                                item.created_at
                                    ? new Date(
                                        item.created_at
                                      ).toLocaleString(
                                        "id-ID",
                                        {
                                            dateStyle: "short",
                                            timeStyle: "short"
                                        }
                                      )
                                    : "-";


                            const row =
                                document.createElement(
                                    "tr"
                                );


                            row.innerHTML = `

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${item.nomor_transaksi || "-"}
                                </td>

                                <td>
                                    ${tanggal}
                                </td>

                                <td>
                                    ${item.kasir || "-"}
                                </td>

                                <td>
                                    ${item.metode_pembayaran || "-"}
                                </td>

                                <td>
                                    ${formatRupiahLaporan(
                                        item.total
                                    )}
                                </td>

                            `;


                            tbody.appendChild(
                                row
                            );

                        }
                    );

                }

            }


            if (reportStatus) {

                reportStatus.textContent =
                    "Ditemukan " +
                    transaksi.length +
                    " transaksi.";

            }


        } catch (error) {

            console.error(
                "❌ Gagal memuat laporan:",
                error
            );


            if (reportStatus) {

                reportStatus.textContent =
                    "Gagal memuat laporan: " +
                    error.message;

            }


            if (tbody) {

                tbody.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            style="text-align:center;"
                        >
                            Gagal memuat laporan.
                        </td>
                    </tr>
                `;

            }

        }

    }


    if (btnLoadReport) {

        btnLoadReport.addEventListener(
            "click",
            loadLaporanPenjualan
        );

    }


    // Otomatis tampilkan laporan hari ini
    // saat tombol Laporan dibuka
    const tabLaporan =
        document.getElementById("tabLaporan");

    if (tabLaporan) {

        tabLaporan.addEventListener(
            "click",
            function () {

                setTimeout(
                    function () {

                        loadLaporanPenjualan();

                    },
                    150
                );

            }
        );

    }

});

// ==========================================
// SUBTAB KEUANGAN ADMIN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const financeTabRingkasan =
        document.getElementById("financeTabRingkasan");

    const financeTabPemasukan =
        document.getElementById("financeTabPemasukan");

    const financeTabPengeluaran =
        document.getElementById("financeTabPengeluaran");

    const financeTabLaporan =
        document.getElementById("financeTabLaporan");


    const financeContentRingkasan =
        document.getElementById("financeContentRingkasan");

    const financeContentPemasukan =
        document.getElementById("financeContentPemasukan");

    const financeContentPengeluaran =
        document.getElementById("financeContentPengeluaran");

    const financeContentLaporan =
        document.getElementById("financeContentLaporan");


    function resetFinanceTab() {

        if (financeContentRingkasan) {
            financeContentRingkasan.style.display = "none";
        }

        if (financeContentPemasukan) {
            financeContentPemasukan.style.display = "none";
        }

        if (financeContentPengeluaran) {
            financeContentPengeluaran.style.display = "none";
        }

        if (financeContentLaporan) {
            financeContentLaporan.style.display = "none";
        }


        if (financeTabRingkasan) {
            financeTabRingkasan.classList.remove("active");
        }

        if (financeTabPemasukan) {
            financeTabPemasukan.classList.remove("active");
        }

        if (financeTabPengeluaran) {
            financeTabPengeluaran.classList.remove("active");
        }

        if (financeTabLaporan) {
            financeTabLaporan.classList.remove("active");
        }

    }


    function aktifkanFinanceTab(tombol, konten) {

        resetFinanceTab();

        if (tombol) {
            tombol.classList.add("active");
        }

        if (konten) {
            konten.style.display = "block";
        }

    }


    // TAB RINGKASAN

    if (financeTabRingkasan) {

        financeTabRingkasan.addEventListener(
            "click",
            function () {

                aktifkanFinanceTab(
                    financeTabRingkasan,
                    financeContentRingkasan
                );

            }
        );

    }


    // TAB PEMASUKAN

    if (financeTabPemasukan) {

        financeTabPemasukan.addEventListener(
            "click",
            function () {

                aktifkanFinanceTab(
                    financeTabPemasukan,
                    financeContentPemasukan
                );

            }
        );

    }


// ==========================================
// TAB PENGELUARAN
// ==========================================

if (financeTabPengeluaran) {

    financeTabPengeluaran.addEventListener(
        "click",
        function () {

            console.log(
                "🟢 Tab Pengeluaran diklik"
            );


            // ==========================================
            // AKTIFKAN TAB
            // ==========================================

            aktifkanFinanceTab(
                financeTabPengeluaran,
                financeContentPengeluaran
            );


            // ==========================================
            // PASTIKAN CONTENT PENGELUARAN TAMPIL
            // ==========================================

            if (financeContentPengeluaran) {

                financeContentPengeluaran.style.display =
                    "block";

            }


            // ==========================================
            // LOAD DATA PENGELUARAN
            // ==========================================

            if (
                typeof loadPengeluaran ===
                "function"
            ) {

                loadPengeluaran();

            }

        }
    );

}

// ==========================================
// JAVASCRIPT TAB PENGELUARAN
// ==========================================

const financePengeluaranJenis =
    document.getElementById(
        "financePengeluaranJenis"
    );

const financePengeluaranTanggal =
    document.getElementById(
        "financePengeluaranTanggal"
    );

const financePengeluaranKeterangan =
    document.getElementById(
        "financePengeluaranKeterangan"
    );

const financePengeluaranNominal =
    document.getElementById(
        "financePengeluaranNominal"
    );

const financePengeluaranId =
    document.getElementById(
        "financePengeluaranId"
    );

const btnSimpanPengeluaran =
    document.getElementById(
        "btnSimpanPengeluaran"
    );

const btnBatalEditPengeluaran =
    document.getElementById(
        "btnBatalEditPengeluaran"
    );

const financePengeluaranTableBody =
    document.getElementById(
        "financePengeluaranTableBody"
    );


console.log(
    "🔵 Memeriksa Element Tab Pengeluaran..."
);


if (
    financePengeluaranJenis &&
    financePengeluaranTanggal &&
    financePengeluaranKeterangan &&
    financePengeluaranNominal &&
    financePengeluaranId &&
    btnSimpanPengeluaran &&
    btnBatalEditPengeluaran &&
    financePengeluaranTableBody
) {

    console.log(
        "✅ Element Tab Pengeluaran ditemukan."
    );


    // ==========================================
    // TANGGAL HARI INI
    // ==========================================

    function setTanggalHariIni() {

        const hariIni =
            new Date()
                .toISOString()
                .split("T")[0];

        financePengeluaranTanggal.value =
            hariIni;

    }


    // ==========================================
    // RESET FORM
    // ==========================================

    function resetFormPengeluaran() {

        financePengeluaranId.value = "";

        financePengeluaranJenis.value =
            "Pengeluaran Umum";

        financePengeluaranKeterangan.value =
            "";

        financePengeluaranNominal.value =
            "";

        setTanggalHariIni();

        btnSimpanPengeluaran.innerHTML = `
            <i class="fa-solid fa-save"></i>
            Simpan
        `;

        btnBatalEditPengeluaran.style.display =
            "none";

    }


    // ==========================================
    // FORMAT NOMINAL
    // ==========================================

    function formatNominal(nominal) {

        return Number(nominal || 0)
            .toLocaleString("id-ID");

    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ==========================================
    // LOAD DATA PENGELUARAN
    // ==========================================

    async function loadPengeluaran() {

        try {

            financePengeluaranTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align:center;"
                    >
                        Memuat data...
                    </td>
                </tr>
            `;


            const hasil =
                await supabaseClient
                    .from("keuangan")
                    .select("*")
                    .in(
                        "jenis",
                        [
                            "Pengeluaran Umum",
                            "Belanja"
                        ]
                    )
                    .order(
                        "tanggal",
                        {
                            ascending: false
                        }
                    );


            if (hasil.error) {

                throw hasil.error;

            }


            const data =
                hasil.data || [];


            if (data.length === 0) {

                financePengeluaranTableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            style="
                                text-align:center;
                                color:#777;
                            "
                        >
                            Belum ada data pengeluaran.
                        </td>
                    </tr>
                `;

                return;

            }


            let rows = "";


            data.forEach(
                function (item, index) {

                    const tanggal =
                        item.tanggal
                            ? new Date(item.tanggal)
                                .toLocaleDateString(
                                    "id-ID"
                                )
                            : "-";


                    rows += `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHtml(
                                    tanggal
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.jenis || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.keterangan || "-"
                                )}
                            </td>

                            <td
                                style="
                                    text-align:right;
                                "
                            >
                                Rp ${formatNominal(
                                    item.nominal
                                )}
                            </td>

                            <td
                                style="
                                    text-align:center;
                                    white-space:nowrap;
                                "
                            >

                                <button
                                    type="button"
                                    class="btn-secondary btn-edit-pengeluaran"
                                    data-id="${escapeHtml(
                                        item.id
                                    )}"
                                    style="
                                        padding:6px 10px;
                                        margin-right:5px;
                                    "
                                >

                                    <i class="fa-solid fa-pen"></i>
                                    Edit

                                </button>


                                <button
                                    type="button"
                                    class="btn-secondary btn-delete-pengeluaran"
                                    data-id="${escapeHtml(
                                        item.id
                                    )}"
                                    style="
                                        padding:6px 10px;
                                    "
                                >

                                    <i class="fa-solid fa-trash"></i>
                                    Hapus

                                </button>

                            </td>

                        </tr>
                    `;

                }
            );


            financePengeluaranTableBody.innerHTML =
                rows;


            // ==========================================
            // EDIT
            // ==========================================

            financePengeluaranTableBody
                .querySelectorAll(
                    ".btn-edit-pengeluaran"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            async function () {

                                const id =
                                    this.getAttribute(
                                        "data-id"
                                    );


                                if (!id) {
                                    return;
                                }


                                try {

                                    const hasilEdit =
                                        await supabaseClient
                                            .from("keuangan")
                                            .select("*")
                                            .eq(
                                                "id",
                                                id
                                            )
                                            .single();


                                    if (
                                        hasilEdit.error
                                    ) {

                                        throw hasilEdit.error;

                                    }


                                    const item =
                                        hasilEdit.data;


                                    financePengeluaranId.value =
                                        item.id;


                                    financePengeluaranJenis.value =
                                        item.jenis ||
                                        "Pengeluaran Umum";


                                    financePengeluaranTanggal.value =
                                        item.tanggal
                                            ? String(
                                                item.tanggal
                                            ).substring(
                                                0,
                                                10
                                            )
                                            : "";


                                    financePengeluaranKeterangan.value =
                                        item.keterangan ||
                                        "";


                                    financePengeluaranNominal.value =
                                        item.nominal ||
                                        "";


                                    btnSimpanPengeluaran.innerHTML = `
                                        <i class="fa-solid fa-pen"></i>
                                        Simpan Perubahan
                                    `;


                                    btnBatalEditPengeluaran.style.display =
                                        "inline-block";


                                    financePengeluaranKeterangan.focus();

                                }

                                catch (error) {

                                    console.error(
                                        "❌ Gagal membuka data edit:",
                                        error
                                    );

                                    alert(
                                        "Data pengeluaran gagal dibuka untuk edit."
                                    );

                                }

                            }
                        );

                    }
                );


            // ==========================================
            // HAPUS
            // ==========================================

            financePengeluaranTableBody
                .querySelectorAll(
                    ".btn-delete-pengeluaran"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            async function () {

                                const id =
                                    this.getAttribute(
                                        "data-id"
                                    );


                                if (!id) {
                                    return;
                                }


                                if (
                                    !confirm(
                                        "Apakah Anda yakin ingin menghapus data pengeluaran ini?"
                                    )
                                ) {

                                    return;

                                }


                                try {

                                    const hasilHapus =
                                        await supabaseClient
                                            .from("keuangan")
                                            .delete()
                                            .eq(
                                                "id",
                                                id
                                            );


                                    if (
                                        hasilHapus.error
                                    ) {

                                        throw hasilHapus.error;

                                    }


                                    alert(
                                        "Data pengeluaran berhasil dihapus."
                                    );


                                    resetFormPengeluaran();

                                    await loadPengeluaran();

                                }

                                catch (error) {

                                    console.error(
                                        "❌ Gagal menghapus pengeluaran:",
                                        error
                                    );

                                    alert(
                                        "Data pengeluaran gagal dihapus."
                                    );

                                }

                            }
                        );

                    }
                );

        }

        catch (error) {

            console.error(
                "❌ Gagal memuat pengeluaran:",
                error
            );


            financePengeluaranTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            color:red;
                        "
                    >
                        Gagal mengambil data pengeluaran.
                    </td>
                </tr>
            `;

        }

    }


    // ==========================================
    // SIMPAN / UPDATE
    // ==========================================

    console.log(
        "🔵 Handler Simpan Pengeluaran sedang dipasang"
    );


    btnSimpanPengeluaran.addEventListener(
        "click",
        async function () {

            console.log(
                "🟢 Tombol Simpan Pengeluaran diklik"
            );


            const id =
                financePengeluaranId.value.trim();


            const jenis =
                financePengeluaranJenis.value;


            const tanggal =
                financePengeluaranTanggal.value;


            const keterangan =
                financePengeluaranKeterangan.value.trim();


            const nominal =
                Number(
                    financePengeluaranNominal.value
                );


            console.log(
                "📋 Data Pengeluaran:",
                {
                    id,
                    jenis,
                    tanggal,
                    keterangan,
                    nominal
                }
            );


            // ==========================================
            // VALIDASI
            // ==========================================

            if (!tanggal) {

                alert(
                    "Tanggal pengeluaran harus diisi."
                );

                return;

            }


            if (!jenis) {

                alert(
                    "Jenis pengeluaran harus dipilih."
                );

                return;

            }


            if (!keterangan) {

                alert(
                    "Keterangan pengeluaran harus diisi."
                );

                return;

            }


            if (
                !nominal ||
                nominal <= 0
            ) {

                alert(
                    "Nominal pengeluaran harus lebih dari 0."
                );

                return;

            }


            try {

                // ==========================================
                // UPDATE
                // ==========================================

                if (id) {

                    const hasilUpdate =
                        await supabaseClient
                            .from("keuangan")
                            .update({

                                tanggal:
                                    tanggal,

                                jenis:
                                    jenis,

                                keterangan:
                                    keterangan,

                                nominal:
                                    nominal

                            })
                            .eq(
                                "id",
                                id
                            );


                    if (
                        hasilUpdate.error
                    ) {

                        throw hasilUpdate.error;

                    }


                    alert(
                        "Data pengeluaran berhasil diperbarui."
                    );

                }


                // ==========================================
                // INSERT
                // ==========================================

                else {

                    const hasilInsert =
                        await supabaseClient
                            .from("keuangan")
                            .insert([{

                                tanggal:
                                    tanggal,

                                jenis:
                                    jenis,

                                keterangan:
                                    keterangan,

                                nominal:
                                    nominal

                            }]);


                    if (
                        hasilInsert.error
                    ) {

                        console.error(
                            "❌ Gagal INSERT:",
                            hasilInsert.error
                        );

                        throw hasilInsert.error;

                    }


                    console.log(
                        "✅ INSERT pengeluaran berhasil"
                    );


                    alert(
                        "Data pengeluaran berhasil disimpan."
                    );

                }


                resetFormPengeluaran();

                await loadPengeluaran();

            }

            catch (error) {

                console.error(
                    "❌ ERROR SIMPAN PENGELUARAN:",
                    error
                );

                alert(
                    "Data pengeluaran gagal disimpan."
                );

            }

        }
    );


    // ==========================================
    // BATAL EDIT
    // ==========================================

    btnBatalEditPengeluaran.addEventListener(
        "click",
        function () {

            resetFormPengeluaran();

        }
    );


    // ==========================================
    // INISIALISASI
    // ==========================================

    resetFormPengeluaran();

    console.log(
        "📋 Memuat daftar pengeluaran..."
    );

    loadPengeluaran();

}

else {

    console.error(
        "❌ Element Tab Pengeluaran tidak ditemukan."
    );

}


    // TAB LAPORAN DETAIL

    if (financeTabLaporan) {

        financeTabLaporan.addEventListener(
            "click",
            function () {

                aktifkanFinanceTab(
                    financeTabLaporan,
                    financeContentLaporan
                );

            }
        );

    }


    // DEFAULT: RINGKASAN

    aktifkanFinanceTab(
        financeTabRingkasan,
        financeContentRingkasan
    );

});

// ==========================================
// DEFAULT TANGGAL TAB RINGKASAN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const financeTanggalMulai =
        document.getElementById("financeTanggalMulai");

    const financeTanggalSelesai =
        document.getElementById("financeTanggalSelesai");


    // ==========================================
    // FUNGSI TANGGAL HARI INI
    // ==========================================

    function tanggalHariIni() {

        const sekarang = new Date();

        const tahun =
            sekarang.getFullYear();

        const bulan =
            String(
                sekarang.getMonth() + 1
            ).padStart(2, "0");

        const hari =
            String(
                sekarang.getDate()
            ).padStart(2, "0");

        return `${tahun}-${bulan}-${hari}`;
    }


    // ==========================================
    // DEFAULT = HARI INI
    // ==========================================

    const hariIni =
        tanggalHariIni();


    if (financeTanggalMulai) {

        financeTanggalMulai.value =
            hariIni;
    }


    if (financeTanggalSelesai) {

        financeTanggalSelesai.value =
            hariIni;
    }


    console.log(
        "📅 Default Ringkasan:",
        hariIni
    );

});

// ==========================================
// TAMPILKAN RINGKASAN KEUANGAN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const btnLoadFinance =
        document.getElementById("btnLoadFinance");

    const financeTanggalMulai =
        document.getElementById("financeTanggalMulai");

    const financeTanggalSelesai =
        document.getElementById("financeTanggalSelesai");

    const financeTotalPemasukan =
        document.getElementById("financeTotalPemasukan");

    const financeTotalPengeluaran =
        document.getElementById("financeTotalPengeluaran");

    const financeSaldo =
        document.getElementById("financeSaldo");


    // ==========================================
    // CEK TOMBOL
    // ==========================================

    if (!btnLoadFinance) {

        console.warn(
            "⚠️ Tombol btnLoadFinance tidak ditemukan."
        );

        return;
    }


    // ==========================================
    // FORMAT RUPIAH
    // ==========================================

    function formatRupiah(nilai) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }
        ).format(nilai || 0);
    }


    // ==========================================
    // TAMPILKAN RINGKASAN
    // ==========================================

    btnLoadFinance.addEventListener(
        "click",
        async function () {

            try {

                const tanggalMulai =
                    financeTanggalMulai.value;

                const tanggalSelesai =
                    financeTanggalSelesai.value;


                // ==========================================
                // VALIDASI TANGGAL
                // ==========================================

                if (!tanggalMulai) {

                    alert(
                        "Tanggal mulai belum diisi."
                    );

                    financeTanggalMulai.focus();

                    return;
                }


                if (!tanggalSelesai) {

                    alert(
                        "Tanggal selesai belum diisi."
                    );

                    financeTanggalSelesai.focus();

                    return;
                }


                if (tanggalMulai > tanggalSelesai) {

                    alert(
                        "Tanggal mulai tidak boleh lebih besar dari tanggal selesai."
                    );

                    return;
                }


                console.log(
                    "📊 Memuat ringkasan:",
                    tanggalMulai,
                    "s/d",
                    tanggalSelesai
                );


                // ==========================================
                // AMBIL DATA KEUANGAN
                // ==========================================

                const hasilKeuangan =
                    await supabaseClient
                        .from("keuangan")
                        .select("*")
                        .gte(
                            "tanggal",
                            tanggalMulai
                        )
                        .lte(
                            "tanggal",
                            tanggalSelesai
                        );


                // ==========================================
                // CEK ERROR
                // ==========================================

                if (hasilKeuangan.error) {

                    console.error(
                        "❌ Error mengambil data keuangan:",
                        hasilKeuangan.error
                    );

                    throw hasilKeuangan.error;
                }


                const dataKeuangan =
                    hasilKeuangan.data || [];


                console.log(
                    "📊 Data keuangan:",
                    dataKeuangan
                );


                // ==========================================
                // HITUNG TOTAL PEMASUKAN
                // ==========================================

                let totalPemasukan = 0;

                let totalPengeluaran = 0;


                dataKeuangan.forEach(
                    function (item) {

                        const nominal =
                            Number(item.nominal) || 0;


                        // ----------------------------------
                        // PEMASUKAN
                        // ----------------------------------

                        if (
                            item.jenis === "UMUM" ||
                            item.jenis === "DP"
                        ) {

                            totalPemasukan += nominal;
                        }


                        // ----------------------------------
                        // PENGELUARAN
                        // ----------------------------------

                        if (
                            item.jenis === "PENGELUARAN"
                        ) {

                            totalPengeluaran += nominal;
                        }

                    }
                );


                // ==========================================
                // HITUNG SALDO
                // ==========================================

                const saldo =
                    totalPemasukan -
                    totalPengeluaran;


                // ==========================================
                // TAMPILKAN HASIL
                // ==========================================

                financeTotalPemasukan.textContent =
                    formatRupiah(totalPemasukan);

                financeTotalPengeluaran.textContent =
                    formatRupiah(totalPengeluaran);

                financeSaldo.textContent =
                    formatRupiah(saldo);


                console.log(
                    "✅ Ringkasan berhasil ditampilkan:",
                    {
                        totalPemasukan,
                        totalPengeluaran,
                        saldo
                    }
                );

            } catch (error) {

                console.error(
                    "❌ Gagal memuat ringkasan:",
                    error
                );


                alert(
                    "Gagal memuat ringkasan.\n\n" +
                    (
                        error.message ||
                        "Terjadi kesalahan."
                    )
                );
            }

        }
    );

});


// ==========================================
// LAPORAN DETAIL KEUANGAN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const btnFinanceDetail =
        document.getElementById("btnFinanceDetail");

    const financeDetailGroup =
        document.getElementById("financeDetailGroup");

    if (!btnFinanceDetail || !financeDetailGroup) {
        return;
    }

    btnFinanceDetail.addEventListener(
        "click",
        async function () {

            try {

                // ==========================================
                // TAMPILKAN AREA DETAIL
                // ==========================================

                financeDetailGroup.style.display = "block";

                financeDetailGroup.innerHTML = `
                    <div class="table-card">

                        <h3>
                            <i class="fa-solid fa-list"></i>
                            Laporan Detail Keuangan
                        </h3>

                        <p style="text-align:center;">
                            Memuat data...
                        </p>

                    </div>
                `;


                // ==========================================
                // AMBIL DATA KEUANGAN
                // ==========================================

                const hasilDetail =
                    await supabaseClient
                        .from("keuangan")
                        .select("*")
                        .order("tanggal", {
                            ascending: false
                        });


                // ==========================================
                // CEK ERROR
                // ==========================================

                if (hasilDetail.error) {

                    console.error(
                        "❌ Error mengambil laporan detail:",
                        hasilDetail.error
                    );

                    throw hasilDetail.error;

                }


                const dataDetail =
                    hasilDetail.data || [];


                console.log(
                    "📊 Data laporan detail:",
                    dataDetail
                );


                // ==========================================
                // JIKA DATA KOSONG
                // ==========================================

                if (dataDetail.length === 0) {

                    financeDetailGroup.innerHTML = `
                        <div class="table-card">

                            <h3>
                                <i class="fa-solid fa-list"></i>
                                Laporan Detail Keuangan
                            </h3>

                            <p style="text-align:center; color:#777;">
                                Belum ada data keuangan.
                            </p>

                        </div>
                    `;

                    return;
                }


                // ==========================================
                // BUAT BARIS TABEL
                // ==========================================

                let rows = "";

                dataDetail.forEach(function (item, index) {

                    const tanggal =
                        item.tanggal
                            ? new Date(item.tanggal)
                                .toLocaleDateString("id-ID")
                            : "-";

                    const jenis =
                        item.jenis || "-";

                    const keterangan =
                        item.keterangan || "-";

                    const nominal =
                        Number(item.nominal || 0)
                            .toLocaleString("id-ID");


                    rows += `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${tanggal}
                            </td>

                            <td>
                                ${jenis}
                            </td>

                            <td>
                                ${keterangan}
                            </td>

                            <td style="text-align:right;">
                                Rp ${nominal}
                            </td>

                            <td style="text-align:center;">

                                <button
                                    type="button"
                                    class="btn-secondary btn-delete-finance"
                                    data-id="${item.id}"
                                    style="padding:6px 10px;">

                                    <i class="fa-solid fa-trash"></i>
                                    Hapus

                                </button>

                            </td>

                        </tr>
                    `;

                });


                // ==========================================
                // TAMPILKAN TABEL
                // ==========================================

                financeDetailGroup.innerHTML = `

                    <div class="table-card">

                        <h3>
                            <i class="fa-solid fa-list"></i>
                            Laporan Detail Keuangan
                        </h3>

                        <div style="overflow-x:auto;">

                            <table class="data-table">

                                <thead>

                                    <tr>

                                        <th>No</th>

                                        <th>Tanggal</th>

                                        <th>Jenis</th>

                                        <th>Keterangan</th>

                                        <th style="text-align:right;">
                                            Nominal
                                        </th>

                                        <th style="text-align:center;">
                                            Aksi
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    ${rows}

                                </tbody>

                            </table>

                        </div>

                    </div>

                `;


                // ==========================================
                // TOMBOL HAPUS LAPORAN DETAIL
                // ==========================================

                const tombolHapus =
                    financeDetailGroup.querySelectorAll(
                        ".btn-delete-finance"
                    );


                tombolHapus.forEach(function (button) {

                    button.addEventListener(
                        "click",
                        async function () {

                            const id =
                                this.getAttribute("data-id");


                            if (!id) {
                                return;
                            }


                            // ==========================================
                            // KONFIRMASI HAPUS
                            // ==========================================

                            const konfirmasi =
                                confirm(
                                    "Apakah Anda yakin ingin menghapus data keuangan ini?"
                                );


                            if (!konfirmasi) {
                                return;
                            }


                            try {

                                // ==========================================
                                // HAPUS DATA DARI SUPABASE
                                // ==========================================

                                const hasilHapus =
                                    await supabaseClient
                                        .from("keuangan")
                                        .delete()
                                        .eq("id", id);


                                if (hasilHapus.error) {

                                    console.error(
                                        "❌ Gagal menghapus data keuangan:",
                                        hasilHapus.error
                                    );

                                    throw hasilHapus.error;

                                }


                                alert(
                                    "Data keuangan berhasil dihapus."
                                );


                                // ==========================================
                                // MUAT ULANG LAPORAN DETAIL
                                // ==========================================

                                btnFinanceDetail.click();

                            }

                            catch (error) {

                                console.error(
                                    "❌ Error hapus data keuangan:",
                                    error
                                );

                                alert(
                                    "Data gagal dihapus."
                                );

                            }

                        }
                    );

                });


            }

            catch (error) {

                console.error(
                    "❌ Gagal menampilkan laporan detail:",
                    error
                );

                financeDetailGroup.innerHTML = `

                    <div class="table-card">

                        <h3>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            Laporan Detail Keuangan
                        </h3>

                        <p style="text-align:center; color:red;">
                            Gagal mengambil data laporan detail.
                        </p>

                    </div>

                `;

            }

        }
    );

});



// ==========================================
// SIMPAN PEMASUKAN KE SUPABASE
// UMUM + DP PEMESANAN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENT PEMASUKAN
    // ==========================================

    const btnSimpanPemasukan =
        document.getElementById("btnSimpanPemasukan");

    const financeJenisPemasukan =
        document.getElementById("financeJenisPemasukan");

    const financeTanggalPemasukan =
        document.getElementById("financeTanggalPemasukan");

    const financeNominalPemasukan =
        document.getElementById("financeNominalPemasukan");

    const financeKeteranganPemasukan =
        document.getElementById("financeKeteranganPemasukan");


    // ==========================================
    // ELEMENT KHUSUS DP
    // ==========================================

    const financeDataDP =
        document.getElementById("financeDataDP");

    const financeTanggalPesanan =
        document.getElementById("financeTanggalPesanan");

    const financeNamaPemesan =
        document.getElementById("financeNamaPemesan");

    const financeRoom =
        document.getElementById("financeRoom");


    // ==========================================
    // CEK TOMBOL
    // ==========================================

    if (!btnSimpanPemasukan) {

        console.warn(
            "⚠️ Tombol btnSimpanPemasukan tidak ditemukan."
        );

        return;
    }


    // ==========================================
    // FUNGSI TANGGAL HARI INI
    // ==========================================

    function tanggalHariIni() {

        const sekarang = new Date();

        const tahun =
            sekarang.getFullYear();

        const bulan =
            String(
                sekarang.getMonth() + 1
            ).padStart(2, "0");

        const hari =
            String(
                sekarang.getDate()
            ).padStart(2, "0");

        return `${tahun}-${bulan}-${hari}`;
    }


    // ==========================================
    // SET DEFAULT TANGGAL PEMASUKAN
    // ==========================================

    if (financeTanggalPemasukan) {

        financeTanggalPemasukan.value =
            tanggalHariIni();
    }


    // ==========================================
    // TAMPILKAN / SEMBUNYIKAN DATA DP
    // ==========================================

    if (financeJenisPemasukan) {

        financeJenisPemasukan.addEventListener(
            "change",
            function () {

                if (
                    financeJenisPemasukan.value === "DP"
                ) {

                    if (financeDataDP) {
                        financeDataDP.style.display = "block";
                    }

                } else {

                    if (financeDataDP) {
                        financeDataDP.style.display = "none";
                    }
                }

            }
        );
    }


    // ==========================================
    // SIMPAN PEMASUKAN
    // ==========================================

    btnSimpanPemasukan.addEventListener(
        "click",
        async function () {

            try {

                // ==========================================
                // AMBIL DATA UTAMA
                // ==========================================

                const jenisPemasukan =
                    financeJenisPemasukan
                        ? financeJenisPemasukan.value
                        : "";

                const tanggalPemasukan =
                    financeTanggalPemasukan
                        ? financeTanggalPemasukan.value
                        : "";

                const nominalPemasukan =
                    financeNominalPemasukan
                        ? Number(
                            financeNominalPemasukan.value
                        )
                        : 0;

                const keteranganPemasukan =
                    financeKeteranganPemasukan
                        ? financeKeteranganPemasukan.value.trim()
                        : "";


                // ==========================================
                // VALIDASI JENIS
                // ==========================================

                if (!jenisPemasukan) {

                    alert(
                        "Jenis pemasukan belum dipilih."
                    );

                    if (financeJenisPemasukan) {
                        financeJenisPemasukan.focus();
                    }

                    return;
                }


                // ==========================================
                // VALIDASI TANGGAL PEMASUKAN
                // ==========================================

                if (!tanggalPemasukan) {

                    alert(
                        "Tanggal pemasukan belum diisi."
                    );

                    if (financeTanggalPemasukan) {
                        financeTanggalPemasukan.focus();
                    }

                    return;
                }


                // ==========================================
                // VALIDASI NOMINAL
                // ==========================================

                if (
                    !nominalPemasukan ||
                    nominalPemasukan <= 0
                ) {

                    alert(
                        "Nominal pemasukan harus diisi."
                    );

                    if (financeNominalPemasukan) {
                        financeNominalPemasukan.focus();
                    }

                    return;
                }


                // ==========================================
                // DATA DP
                // ==========================================

                let tanggalPesanan = null;

                let namaPemesan = null;

                let room = null;


                // ==========================================
                // JIKA PEMASUKAN = DP
                // ==========================================

                if (jenisPemasukan === "DP") {

                    tanggalPesanan =
                        financeTanggalPesanan
                            ? financeTanggalPesanan.value
                            : "";

                    namaPemesan =
                        financeNamaPemesan
                            ? financeNamaPemesan.value.trim()
                            : "";

                    room =
                        financeRoom
                            ? financeRoom.value.trim()
                            : "";


                    // ==========================================
                    // VALIDASI TANGGAL PESANAN
                    // ==========================================

                    if (!tanggalPesanan) {

                        alert(
                            "Tanggal pesanan belum diisi."
                        );

                        if (financeTanggalPesanan) {
                            financeTanggalPesanan.focus();
                        }

                        return;
                    }


                    // ==========================================
                    // VALIDASI NAMA PEMESAN
                    // ==========================================

                    if (!namaPemesan) {

                        alert(
                            "Nama pemesan belum diisi."
                        );

                        if (financeNamaPemesan) {
                            financeNamaPemesan.focus();
                        }

                        return;
                    }


                    // ==========================================
                    // VALIDASI ROOM
                    // ==========================================

                    if (!room) {

                        alert(
                            "Room belum diisi."
                        );

                        if (financeRoom) {
                            financeRoom.focus();
                        }

                        return;
                    }
                }


                // ==========================================
                // BENTUK DATA UNTUK SUPABASE
                // ==========================================

                const dataPemasukan = {

                    tanggal:
                        tanggalPemasukan,

                    jenis:
                        jenisPemasukan,

                    nominal:
                        nominalPemasukan,

                    tanggal_pesanan:
                        tanggalPesanan || null,

                    nama_pemesan:
                        namaPemesan || null,

                    room:
                        room || null,

                    keterangan:
                        keteranganPemasukan || null
                };


                // ==========================================
                // DEBUG
                // ==========================================

                console.log(
                    "💰 DATA PEMASUKAN YANG AKAN DISIMPAN:",
                    dataPemasukan
                );


                // ==========================================
                // SIMPAN KE SUPABASE
                // ==========================================

                const hasilInsert =
                    await supabaseClient
                        .from("keuangan")
                        .insert([dataPemasukan])
                        .select();


                // ==========================================
                // CEK ERROR
                // ==========================================

                if (hasilInsert.error) {

                    console.error(
                        "❌ SUPABASE ERROR:",
                        hasilInsert.error
                    );

                    throw hasilInsert.error;
                }


                // ==========================================
                // BERHASIL
                // ==========================================

                console.log(
                    "✅ PEMASUKAN BERHASIL DISIMPAN:",
                    hasilInsert.data
                );


                if (jenisPemasukan === "DP") {

                    alert(
                        "DP pemesanan berhasil disimpan."
                    );

                } else {

                    alert(
                        "Pemasukan umum berhasil disimpan."
                    );
                }


                // ==========================================
                // RESET FORM
                // ==========================================

                if (financeTanggalPemasukan) {

                    financeTanggalPemasukan.value =
                        tanggalHariIni();
                }


                if (financeNominalPemasukan) {

                    financeNominalPemasukan.value = "";
                }


                if (financeKeteranganPemasukan) {

                    financeKeteranganPemasukan.value = "";
                }


                // ==========================================
                // RESET DATA DP
                // ==========================================

                if (financeTanggalPesanan) {

                    financeTanggalPesanan.value = "";
                }


                if (financeNamaPemesan) {

                    financeNamaPemesan.value = "";
                }


                if (financeRoom) {

                    financeRoom.value = "";
                }


                // ==========================================
                // KEMBALIKAN KE PEMASUKAN UMUM
                // ==========================================

                if (financeJenisPemasukan) {

                    financeJenisPemasukan.value =
                        "UMUM";
                }


                if (financeDataDP) {

                    financeDataDP.style.display =
                        "none";
                }


                console.log(
                    "✅ FORM PEMASUKAN BERHASIL DIRESET."
                );


            } catch (error) {

                // ==========================================
                // ERROR
                // ==========================================

                console.error(
                    "❌ GAGAL MENYIMPAN PEMASUKAN:",
                    error
                );


                alert(
                    "Gagal menyimpan pemasukan.\n\n" +
                    (
                        error.message ||
                        "Terjadi kesalahan saat menyimpan data."
                    )
                );
            }

        }
    );

});

