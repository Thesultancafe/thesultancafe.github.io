
/* ==========================================
   THE SULTAN CAFE
   POS KASIR
   POS.JS
   TAHAP 4
   MENU + KATEGORI + SHOPPING CART
   + CATATAN + PEMBAYARAN + KEMBALIAN
   ========================================== */

console.log("✅ pos.js berhasil dimuat");


/* ==========================================
   DATA POS
   ========================================== */

let posMenus = [];

let posCategories = [];

let selectedCategory = "SEMUA";


/* ==========================================
   DATA KERANJANG
   ========================================== */

let posCart = [];

/* ==========================================
   PESANAN CUSTOMER AKTIF
   ========================================== */

let pesananCustomerAktif = null;


/* ==========================================
   CATATAN MENU AKTIF
   ========================================== */

let activeNoteIndex = null;


/* ==========================================
   METODE PEMBAYARAN
   ========================================== */

let selectedPaymentMethod = "CASH";


/* ==========================================
   ELEMENT HTML
   ========================================== */

const posCategoriesContainer =
    document.getElementById("posCategories");

const posMenuGrid =
    document.getElementById("posMenuGrid");

const posSearch =
    document.getElementById("posSearch");

const btnKembaliDashboard =
    document.getElementById("btnKembaliDashboard");


/* ==========================================
   REFERENSI ELEMEN TRANSAKSI
   ========================================== */

const posCustomerName =
    document.getElementById("posCustomerName");

const posTableNumber =
    document.getElementById("posTableNumber");

const posKasir =
    document.getElementById("posKasir");

const btnSaveTransaction =
    document.getElementById("btnSaveTransaction");

const btnNewTransaction =
    document.getElementById("btnNewTransaction");



/* ==========================================
   DATA KASIR
   ========================================== */

function getNamaKasir(){

    return (
        sessionStorage.getItem("posKasirNama") ||
        "Admin"
    );

}


/* ==========================================
   TAMPILKAN NAMA KASIR
   ========================================== */

function tampilkanNamaKasir(){

    if(posKasir){

        posKasir.textContent =
            getNamaKasir();

    }

}


/* ==========================================
   BUAT NOMOR TRANSAKSI
   FORMAT:
   TRX-YYNNNNNN
   Contoh:
   TRX-26000001
   ========================================== */

async function buatNomorTransaksi() {

    const sekarang =
        new Date();


    /* ==========================================
       TAHUN 2 DIGIT
       ========================================== */

    const tahun =
        String(
            sekarang.getFullYear()
        ).slice(-2);


    /* ==========================================
       PREFIX
       ========================================== */

    const prefix =
        "TRX-" +
        tahun;


    /* ==========================================
       AMBIL TRANSAKSI TERAKHIR
       ========================================== */

    const {
        data,
        error
    } = await supabaseClient

        .from("transaksi")

        .select(
            "nomor_transaksi"
        )

        .like(
            "nomor_transaksi",
            prefix + "%"
        )

        .order(
            "nomor_transaksi",
            {
                ascending: false
            }
        )

        .limit(1);


    if (error) {

        console.error(
            "❌ Gagal mengambil nomor transaksi terakhir:",
            error
        );

        throw error;

    }


    /* ==========================================
       NOMOR AWAL
       ========================================== */

    let nomorUrut =
        1;


    if (
        data &&
        data.length > 0 &&
        data[0].nomor_transaksi
    ) {

        const nomorTerakhir =
            data[0].nomor_transaksi;


        const bagianNomor =
            nomorTerakhir.substring(
                prefix.length
            );


        const nomor =
            parseInt(
                bagianNomor,
                10
            );


        if (!isNaN(nomor)) {

            nomorUrut =
                nomor + 1;

        }

    }


    /* ==========================================
       FORMAT 6 DIGIT
       ========================================== */

    const nomor =
        String(
            nomorUrut
        ).padStart(
            6,
            "0"
        );


    return (
        prefix +
        nomor
    );

}

/* ==========================================
   ELEMENT KERANJANG
   ========================================== */

const posCartCount =
    document.getElementById("posCartCount");

const posCartItems =
    document.getElementById("posCartItems");

const posSubtotal =
    document.getElementById("posSubtotal");

const posTotal =
    document.getElementById("posTotal");


/* ==========================================
   ELEMENT PESANAN CUSTOMER
   ========================================== */

const customerOrderPanel =
    document.getElementById("customerOrderPanel");



const customerOrderContent =
    document.getElementById("customerOrderContent");

const btnAcceptCustomerOrder =
    document.getElementById("btnAcceptCustomerOrder");

console.log(
    "🔎 CEK PANEL CUSTOMER:",
    customerOrderPanel
);

console.log(
    "🔎 CEK CONTENT CUSTOMER:",
    customerOrderContent
);

console.log(
    "🔎 CEK TOMBOL TERIMA:",
    btnAcceptCustomerOrder
);



/* ==========================================
   TOMBOL TERIMA PESANAN CUSTOMER
   ========================================== */

if (btnAcceptCustomerOrder) {

    btnAcceptCustomerOrder.addEventListener(
        "click",
        terimaPesananCustomer
    );

}


/* ==========================================
   ELEMENT MODAL CATATAN
   ========================================== */

const posNoteModal =
    document.getElementById("posNoteModal");

const posNoteMenuName =
    document.getElementById("posNoteMenuName");

const posItemNote =
    document.getElementById("posItemNote");

const btnCancelNote =
    document.getElementById("btnCancelNote");

const btnSaveNote =
    document.getElementById("btnSaveNote");


/* ==========================================
   ELEMENT PEMBAYARAN
   ========================================== */

const paymentMethodButtons =
    document.querySelectorAll(".payment-method");

const posAmountPaid =
    document.getElementById("posAmountPaid");

const posChange =
    document.getElementById("posChange");


/* ==========================================
   FORMAT RUPIAH
   ========================================== */

function formatRupiah(value) {

    const number =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);

}


/* ==========================================
   HITUNG TOTAL KERANJANG
   ========================================== */

function hitungTotalKeranjang() {

    return posCart.reduce(
        function(total, item) {

            const harga =
                Number(item.harga) || 0;

            const jumlah =
                Number(item.jumlah) || 0;

            return total +
                (harga * jumlah);

        },
        0
    );

}


/* ==========================================
   LOAD DATA AWAL
   ========================================== */

async function loadPOSData() {

    try {

        console.log("⏳ Memuat data POS...");


        /* ==================================
           AMBIL KATEGORI
           ================================== */

        posCategories =
            await getCategories();


        console.log(
            "✅ Kategori berhasil dimuat:",
            posCategories
        );


        /* ==================================
           AMBIL MENU
           ================================== */

        posMenus =
            await getMenus();


        console.log(
            "✅ Menu berhasil dimuat:",
            posMenus
        );


        /* ==================================
           TAMPILKAN KATEGORI
           ================================== */

        renderPOSCategories();


        /* ==================================
           TAMPILKAN MENU
           ================================== */

        renderPOSMenus();


        /* ==================================
           TAMPILKAN KERANJANG
           ================================== */

        renderPOSCart();


        /* ==================================
           UPDATE PEMBAYARAN
           ================================== */

        updatePaymentDisplay();

        
        /* ==================================
            BUKA PESANAN DARI URL
        ================================== */

        const params = new URLSearchParams(window.location.search);
        const pesananIdDariUrl = params.get("pesanan_id");

        if (pesananIdDariUrl) {

            console.log(
            "📂 Membuka pesanan dari URL:",
            pesananIdDariUrl
            );

            await bukaPesananAktif(
                Number(pesananIdDariUrl)
            );

        }    


    } catch (error) {

        console.error(
            "❌ Gagal memuat data POS:",
            error
        );


        if (posMenuGrid) {

            posMenuGrid.innerHTML = `

                <div class="pos-empty-menu">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Gagal memuat menu
                    </p>

                    <small>
                        Periksa koneksi Supabase
                    </small>

                </div>

            `;

        }

    }

}



/* ==========================================
   RENDER KATEGORI
   ========================================== */

function renderPOSCategories() {

    if (!posCategoriesContainer) {

        return;

    }


    let html = "";


    /* ==================================
       TOMBOL SEMUA
       ================================== */

    html += `

        <button
            type="button"
            class="pos-category-btn active"
            data-category="SEMUA">

            Semua

        </button>

    `;


    /* ==================================
       KATEGORI DATABASE
       ================================== */

    posCategories.forEach(category => {

        const namaKategori =
            category.nama || "";


        if (!namaKategori) {

            return;

        }


        html += `

            <button
                type="button"
                class="pos-category-btn"
                data-category="${escapeAttribute(namaKategori)}">

                ${escapeHTML(namaKategori)}

            </button>

        `;

    });


    posCategoriesContainer.innerHTML =
        html;


    /* ==================================
       EVENT KATEGORI
       ================================== */

    const categoryButtons =
        posCategoriesContainer.querySelectorAll(
            ".pos-category-btn"
        );


    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                selectedCategory =
                    this.dataset.category;


                categoryButtons.forEach(item => {

                    item.classList.remove("active");

                });


                this.classList.add("active");


                renderPOSMenus();

            }
        );

    });

}


/* ==========================================
   RENDER MENU
   ========================================== */

function renderPOSMenus() {

    if (!posMenuGrid) {

        return;

    }


    const searchKeyword =
        posSearch
            ? posSearch.value
                .trim()
                .toLowerCase()
            : "";


    let filteredMenus =
        [...posMenus];


    /* ==================================
       FILTER KATEGORI
       ================================== */

    if (selectedCategory !== "SEMUA") {

        filteredMenus =
            filteredMenus.filter(menu => {

                return String(menu.kategori || "")
                    .toLowerCase()
                    ===
                    String(selectedCategory)
                        .toLowerCase();

            });

    }


    /* ==================================
       FILTER SEARCH
       ================================== */

    if (searchKeyword) {

        filteredMenus =
            filteredMenus.filter(menu => {

                const nama =
                    String(menu.nama || "")
                        .toLowerCase();


                const kategori =
                    String(menu.kategori || "")
                        .toLowerCase();


                const deskripsi =
                    String(menu.deskripsi || "")
                        .toLowerCase();


                return (
                    nama.includes(searchKeyword) ||
                    kategori.includes(searchKeyword) ||
                    deskripsi.includes(searchKeyword)
                );

            });

    }


    /* ==================================
       JIKA TIDAK ADA MENU
       ================================== */

    if (filteredMenus.length === 0) {

        posMenuGrid.innerHTML = `

            <div class="pos-empty-menu">

                <i class="fa-solid fa-utensils"></i>

                <p>
                    Menu tidak ditemukan
                </p>

                <small>
                    Coba kata pencarian atau kategori lain
                </small>

            </div>

        `;

        return;

    }


    /* ==================================
       RENDER CARD
       ================================== */

    posMenuGrid.innerHTML =
        filteredMenus.map(menu => {

            const nama =
                escapeHTML(menu.nama || "Menu");


            const kategori =
                escapeHTML(menu.kategori || "");


            const deskripsi =
                escapeHTML(menu.deskripsi || "");


            const harga =
                formatRupiah(menu.harga);


            const foto =
                menu.foto
                    ? escapeAttribute(menu.foto)
                    : "";


            const menuId =
                escapeAttribute(
                    String(
                        menu.id ?? ""
                    )
                );


            return `

                <div
                    class="pos-menu-card"
                    data-menu-id="${menuId}">

                    ${
                        foto
                            ? `
                                <img
                                    src="${foto}"
                                    alt="${nama}"
                                    class="pos-menu-image"
                                >
                              `
                            : `
                                <div
                                    class="pos-menu-image"
                                    style="
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:40px;
                                        color:#999;
                                    "
                                >

                                    <i class="fa-solid fa-utensils"></i>

                                </div>
                              `
                    }


                    <div class="pos-menu-content">

                        <div class="pos-menu-name">

                            ${nama}

                        </div>


                        <div class="pos-menu-price">

                            ${harga}

                        </div>


                        ${
                            kategori
                                ? `
                                    <div class="pos-menu-category">

                                        ${kategori}

                                    </div>
                                  `
                                : ""
                        }


                        ${
                            deskripsi
                                ? `
                                    <div
                                        style="
                                            margin-top:5px;
                                            font-size:12px;
                                            color:#777;
                                            line-height:1.3;
                                        "
                                    >

                                        ${deskripsi}

                                    </div>
                                  `
                                : ""
                        }


                        <button
                            type="button"
                            class="pos-menu-add"
                            data-menu-id="${menuId}">

                            <i class="fa-solid fa-plus"></i>

                            Tambah

                        </button>

                    </div>

                </div>

            `;

        }).join("");


    /* ==================================
       EVENT TAMBAH MENU
       ================================== */

    const addButtons =
        posMenuGrid.querySelectorAll(
            ".pos-menu-add"
        );


    addButtons.forEach(button => {

        button.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                const menuId =
                    this.dataset.menuId;


                const menu =
                    posMenus.find(item => {

                        return String(item.id)
                            ===
                            String(menuId);

                    });


                if (!menu) {

                    console.warn(
                        "Menu tidak ditemukan:",
                        menuId
                    );

                    return;

                }


                console.log(
                    "🛒 Menu dipilih:",
                    menu
                );


                tambahKeKeranjang(menu);

            }
        );

    });

}


/* ==========================================
   TAMBAH MENU KE KERANJANG
   ========================================== */

function tambahKeKeranjang(menu) {

    const menuId =
        String(menu.id);


    const existingItem =
        posCart.find(item => {

            return String(item.id)
                ===
                menuId;

        });


    /* ==================================
       JIKA SUDAH ADA
       ================================== */

    if (existingItem) {

        existingItem.jumlah += 1;

    }


    /* ==================================
       JIKA BELUM ADA
       ================================== */

    else {

        posCart.push({

            id: menu.id,

            nama: menu.nama,

            harga: Number(menu.harga) || 0,

            jumlah: 1,

            foto: menu.foto || "",

            catatan: ""

        });

    }


    console.log(
        "🛒 Keranjang:",
        posCart
    );


    renderPOSCart();

}


/* ==========================================
   RENDER KERANJANG
   ========================================== */

function renderPOSCart() {

    if (!posCartItems) {

        return;

    }


    /* ==================================
       JIKA KOSONG
       ================================== */

    if (posCart.length === 0) {

        posCartItems.innerHTML = `

            <div class="pos-empty-cart">

                <i class="fa-solid fa-cart-shopping"></i>

                <p>
                    Keranjang masih kosong
                </p>

            </div>

        `;


        updatePOSCartSummary();

        return;

    }


    /* ==================================
       RENDER ITEM
       ================================== */

    posCartItems.innerHTML =
        posCart.map((item, index) => {

            const subtotal =
                Number(item.harga)
                *
                Number(item.jumlah);


            return `

                <div
                    class="pos-cart-item"
                    data-cart-index="${index}">


                    <div class="pos-cart-item-info">

                        <div class="pos-cart-item-name">

                            ${escapeHTML(item.nama)}

                        </div>


                        <div class="pos-cart-item-price">

                            ${formatRupiah(item.harga)}

                            ×

                            ${item.jumlah}

                        </div>


                        <div class="pos-cart-item-subtotal">

                            ${formatRupiah(subtotal)}

                        </div>


                        ${
                            item.catatan
                                ? `
                                    <div
                                        class="pos-cart-item-note"
                                        style="
                                            margin-top:6px;
                                            font-size:12px;
                                            color:#555;
                                        "
                                    >

                                        <i class="fa-solid fa-note-sticky"></i>

                                        ${escapeHTML(item.catatan)}

                                    </div>
                                  `
                                : ""
                        }

                    </div>


                    <div class="pos-cart-item-actions">


                        <button
                            type="button"
                            class="pos-cart-minus"
                            data-index="${index}">

                            −

                        </button>


                        <span class="pos-cart-qty">

                            ${item.jumlah}

                        </span>


                        <button
                            type="button"
                            class="pos-cart-plus"
                            data-index="${index}">

                            +

                        </button>


                        <button
                            type="button"
                            class="pos-cart-note"
                            data-index="${index}"
                            title="Catatan">

                            <i class="fa-solid fa-note-sticky"></i>

                        </button>


                        <button
                            type="button"
                            class="pos-cart-remove"
                            data-index="${index}"
                            title="Hapus">

                            <i class="fa-solid fa-trash"></i>

                        </button>


                    </div>

                </div>

            `;

        }).join("");


    /* ==================================
       EVENT KURANG
       ================================== */

    const minusButtons =
        posCartItems.querySelectorAll(
            ".pos-cart-minus"
        );


    minusButtons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const index =
                    Number(this.dataset.index);


                if (!posCart[index]) {

                    return;

                }


                posCart[index].jumlah -= 1;


                if (posCart[index].jumlah <= 0) {

                    posCart.splice(index, 1);

                }


                renderPOSCart();

            }
        );

    });


    /* ==================================
       EVENT TAMBAH JUMLAH
       ================================== */

    const plusButtons =
        posCartItems.querySelectorAll(
            ".pos-cart-plus"
        );


    plusButtons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const index =
                    Number(this.dataset.index);


                if (!posCart[index]) {

                    return;

                }


                posCart[index].jumlah += 1;


                renderPOSCart();

            }
        );

    });


    /* ==================================
       EVENT CATATAN
       ================================== */

    const noteButtons =
        posCartItems.querySelectorAll(
            ".pos-cart-note"
        );


    noteButtons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const index =
                    Number(this.dataset.index);


                bukaModalCatatan(index);

            }
        );

    });


    /* ==================================
       EVENT HAPUS
       ================================== */

    const removeButtons =
        posCartItems.querySelectorAll(
            ".pos-cart-remove"
        );


    removeButtons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const index =
                    Number(this.dataset.index);


                if (!posCart[index]) {

                    return;

                }


                posCart.splice(index, 1);


                renderPOSCart();

            }
        );

    });


    updatePOSCartSummary();

}


/* ==========================================
   BUKA MODAL CATATAN
   ========================================== */

function bukaModalCatatan(index) {

    if (!posCart[index]) {

        return;

    }


    if (!posNoteModal) {

        console.warn(
            "Modal catatan tidak ditemukan."
        );

        return;

    }


    activeNoteIndex =
        index;


    const item =
        posCart[index];


    if (posNoteMenuName) {

        posNoteMenuName.textContent =
            item.nama;

    }


    if (posItemNote) {

        posItemNote.value =
            item.catatan || "";

    }


    posNoteModal.style.display =
        "flex";


    if (posItemNote) {

        setTimeout(function() {

            posItemNote.focus();

        }, 50);

    }


    console.log(
        "📝 Membuka catatan:",
        item.nama
    );

}


/* ==========================================
   TUTUP MODAL CATATAN
   ========================================== */

function tutupModalCatatan() {

    activeNoteIndex =
        null;


    if (posNoteModal) {

        posNoteModal.style.display =
            "none";

    }

}


/* ==========================================
   SIMPAN CATATAN
   ========================================== */

function simpanCatatan() {

    if (
        activeNoteIndex === null ||
        !posCart[activeNoteIndex]
    ) {

        return;

    }


    const catatan =
        posItemNote
            ? posItemNote.value.trim()
            : "";


    posCart[activeNoteIndex].catatan =
        catatan;


    console.log(
        "📝 Catatan disimpan:",
        posCart[activeNoteIndex]
    );


    tutupModalCatatan();


    renderPOSCart();

}


/* ==========================================
   EVENT MODAL CATATAN
   ========================================== */

if (btnCancelNote) {

    btnCancelNote.addEventListener(
        "click",
        function() {

            tutupModalCatatan();

        }
    );

}


if (btnSaveNote) {

    btnSaveNote.addEventListener(
        "click",
        function() {

            simpanCatatan();

        }
    );

}


/* ==========================================
   KLIK DI LUAR MODAL
   ========================================== */

if (posNoteModal) {

    posNoteModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                posNoteModal
            ) {

                tutupModalCatatan();

            }

        }
    );

}


/* ==========================================
   UPDATE TOTAL KERANJANG
   ========================================== */

function updatePOSCartSummary() {

    /* ==================================
       TOTAL JUMLAH ITEM
       ================================== */

    const totalItem =
        posCart.reduce(
            function(total, item) {

                return total +
                    (Number(item.jumlah) || 0);

            },
            0
        );


    /* ==================================
       TOTAL HARGA
       ================================== */

    const totalHarga =
        posCart.reduce(
            function(total, item) {

                const harga =
                    Number(item.harga) || 0;

                const jumlah =
                    Number(item.jumlah) || 0;

                return total +
                    (harga * jumlah);

            },
            0
        );


    /* ==================================
       JUMLAH ITEM DI KERANJANG
       ================================== */

    if (posCartCount) {

        posCartCount.textContent =
            totalItem;

    }


    /* ==================================
       SUBTOTAL
       ================================== */

    if (posSubtotal) {

        posSubtotal.textContent =
            formatRupiah(totalHarga);

    }


    /* ==================================
       TOTAL
       ================================== */

    if (posTotal) {

        posTotal.textContent =
            formatRupiah(totalHarga);

    }


    /* ==================================
       UPDATE PEMBAYARAN
       ================================== */

    updatePaymentDisplay();

}

/* ==========================================
   UPDATE TAMPILAN PEMBAYARAN
   ========================================== */

function updatePaymentDisplay() {

    if (
        !posAmountPaid ||
        !posChange
    ) {

        return;

    }


    const total =
        hitungTotalKeranjang();


    /* ==================================
       KERANJANG KOSONG
       ================================== */

    if (total <= 0) {

        posAmountPaid.value = "";

        posAmountPaid.disabled = false;

        posChange.textContent =
            formatRupiah(0);

        posChange.style.color =
            "";

        return;

    }


    /* ==================================
       QRIS / TRANSFER
       ================================== */

    if (
        selectedPaymentMethod === "QRIS" ||
        selectedPaymentMethod === "TRANSFER"
    ) {

        posAmountPaid.value =
            total;

        posAmountPaid.disabled =
            true;

        posChange.textContent =
            formatRupiah(0);

        posChange.style.color =
            "";

        return;

    }


    /* ==================================
       CASH
       ================================== */

    posAmountPaid.disabled =
        false;


    const paid =
        Number(posAmountPaid.value) || 0;


    /* ==================================
       BELUM ADA PEMBAYARAN
       ================================== */

    if (paid <= 0) {

        posChange.textContent =
            "Kurang " +
            formatRupiah(total);

        posChange.style.color =
            "#dc2626";

        return;

    }


    /* ==================================
       PEMBAYARAN KURANG
       ================================== */

    const difference =
        paid - total;


    if (difference < 0) {

        posChange.textContent =
            "Kurang " +
            formatRupiah(
                Math.abs(difference)
            );

        posChange.style.color =
            "#dc2626";

        return;

    }


    /* ==================================
       PEMBAYARAN CUKUP
       ================================== */

    posChange.textContent =
        formatRupiah(difference);

    posChange.style.color =
        "";

}


/* ==========================================
   EVENT METODE PEMBAYARAN
   ========================================== */

paymentMethodButtons.forEach(button => {

    button.addEventListener(
        "click",
        function() {

            paymentMethodButtons.forEach(item => {

                item.classList.remove("active");

            });


            this.classList.add("active");


            selectedPaymentMethod =
                this.dataset.method ||
                "CASH";


            console.log(
                "💳 Metode pembayaran:",
                selectedPaymentMethod
            );


            /* ==============================
               CASH
               ============================== */

            if (
                selectedPaymentMethod ===
                "CASH"
            ) {

                if (posAmountPaid) {

                    posAmountPaid.disabled =
                        false;

                    posAmountPaid.value =
                        "";

                }

            }


            updatePaymentDisplay();


            /* ==============================
               FOKUS INPUT CASH
               ============================== */

            if (
                selectedPaymentMethod ===
                "CASH" &&
                posAmountPaid
            ) {

                setTimeout(function() {

                    posAmountPaid.focus();

                }, 50);

            }

        }
    );

});


/* ==========================================
   EVENT JUMLAH DIBAYAR
   ========================================== */

if (posAmountPaid) {

    posAmountPaid.addEventListener(
        "input",
        function() {

            /* ==============================
               HANYA CASH
               ============================== */

            if (
                selectedPaymentMethod !==
                "CASH"
            ) {

                return;

            }


            updatePaymentDisplay();

        }
    );

}


/* ==========================================
   VALIDASI PEMBAYARAN
   ========================================== */

function validasiPembayaran() {

    const total =
        hitungTotalKeranjang();


    /* ==================================
       KERANJANG KOSONG
       ================================== */

    if (total <= 0) {

        return {

            valid: false,

            message:
                "Keranjang masih kosong."

        };

    }


    /* ==================================
       QRIS / TRANSFER
       ================================== */

    if (
        selectedPaymentMethod === "QRIS" ||
        selectedPaymentMethod === "TRANSFER"
    ) {

        return {

            valid: true,

            jumlahDibayar:
                total,

            kembalian:
                0

        };

    }


    /* ==================================
       CASH
       ================================== */

    const jumlahDibayar =
        Number(posAmountPaid?.value) || 0;


    if (jumlahDibayar < total) {

        return {

            valid: false,

            message:
                "Jumlah pembayaran masih kurang " +
                formatRupiah(
                    total - jumlahDibayar
                )

        };

    }


    return {

        valid: true,

        jumlahDibayar:
            jumlahDibayar,

        kembalian:
            jumlahDibayar - total

    };

}

/* ==========================================
   FORMAT BARIS NOTA 58MM - 32 KARAKTER
   ========================================== */

function formatBarisNota(kiri, kanan) {

    const LEBAR =
        32;

    kiri =
        String(kiri || "");

    kanan =
        String(kanan || "");


    /* Jika terlalu panjang,
       potong bagian kiri */

    const panjangMaksKiri =
        LEBAR -
        kanan.length -
        1;


    if (
        kiri.length >
        panjangMaksKiri
    ) {

        kiri =
            kiri.substring(
                0,
                panjangMaksKiri
            );

    }


    const jumlahSpasi =
        LEBAR -
        kiri.length -
        kanan.length;


    return (
        kiri +
        " ".repeat(
            Math.max(
                1,
                jumlahSpasi
            )
        ) +
        kanan
    );

}

/* ==========================================
   SUARA NOTIFIKASI PESANAN BARU
   ========================================== */

let audioContextPesanan = null;
let intervalSuaraPesanan = null;


/* ==========================================
   MULAI SUARA PESANAN BARU
   ========================================== */

function mulaiSuaraPesananBaru() {

    try {

        // Jika suara sudah berjalan, jangan membuat suara baru
        if (intervalSuaraPesanan) {
            return;
        }

       if (!audioContextPesanan) {
        
        audioContextPesanan =
            new (window.AudioContext || window.webkitAudioContext)();

        }        

        if (audioContextPesanan.state === "suspended") {
            audioContextPesanan.resume();
        }


        function bunyiSekali() {

            const oscillator =
                audioContextPesanan.createOscillator();

            const gainNode =
                audioContextPesanan.createGain();


            oscillator.type = "sine";

            oscillator.frequency.setValueAtTime(
                880,
                audioContextPesanan.currentTime
            );

            oscillator.frequency.setValueAtTime(
                660,
                audioContextPesanan.currentTime + 0.15
            );


            gainNode.gain.setValueAtTime(
                0.25,
                audioContextPesanan.currentTime
            );

            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContextPesanan.currentTime + 0.5
            );


            oscillator.connect(gainNode);

            gainNode.connect(
                audioContextPesanan.destination
            );


            oscillator.start();

            oscillator.stop(
                audioContextPesanan.currentTime + 0.5
            );

        }


        // Bunyi pertama
        bunyiSekali();


        // Ulangi setiap 1,5 detik
        intervalSuaraPesanan =
            setInterval(
                bunyiSekali,
                1500
            );


        console.log(
            "🔊 Suara notifikasi pesanan DIMULAI"
        );

    } catch (error) {

        console.error(
            "❌ Gagal memulai suara pesanan:",
            error
        );

    }

}


/* ==========================================
   HENTIKAN SUARA PESANAN BARU
   ========================================== */

function hentikanSuaraPesananBaru() {

    try {

        if (intervalSuaraPesanan) {

            clearInterval(
                intervalSuaraPesanan
            );

            intervalSuaraPesanan = null;

        }


        if (audioContextPesanan) {

            audioContextPesanan.close();

            audioContextPesanan = null;

        }


        console.log(
            "🔇 Suara notifikasi pesanan DIHENTIKAN"
        );

    } catch (error) {

        console.error(
            "❌ Gagal menghentikan suara pesanan:",
            error
        );

    }

}

/* ==========================================
   CETAK ORDER CUSTOMER - CLEANter
   ========================================== */

async function cetakOrderCustomer(pesanan, detail) {

    try {

        /* ==========================================
           SIAPKAN ISI ORDER
           ========================================== */

        const content = [];


        /* ==========================================
           HEADER
           ========================================== */

        content.push({

            type: "text",

            text: "THE SULTAN CAFE",

            align: "center",

            bold: true,

            size: "large"

        });


        content.push({

            type: "text",

            text: "Palembang Tempo Doeloe",

            align: "center"

        });


        content.push({

            type: "text",

            text: "=== ORDER PESANAN ===",

            align: "center",

            bold: true

        });


        content.push({

            type: "text",

            text: "--------------------------------"

        });


        /* ==========================================
           INFORMASI ORDER
           ========================================== */

        content.push({

            type: "row",

            left: "Order",

            right:
                pesanan.kode_pesanan

        });


        if (pesanan.nama_pelanggan) {

            content.push({

                type: "row",

                left: "Pelanggan",

                right:
                    pesanan.nama_pelanggan

            });

        }


        if (pesanan.nomor_meja) {

            content.push({

                type: "row",

                left: "Meja",

                right:
                    pesanan.nomor_meja

            });

        }


        content.push({

            type: "text",

            text: "--------------------------------"

        });


        /* ==========================================
           DAFTAR MENU
           ========================================== */

        detail.forEach(

            function(item) {

                const namaItem =
                    item.nama_menu +
                    " x" +
                    item.jumlah;


                content.push({

                    type: "text",

                    text: namaItem,

                    bold: true

                });


                /* ==========================================
                   CATATAN MENU
                   ========================================== */

                if (
                    item.catatan &&
                    item.catatan !== "-"
                ) {

                    content.push({

                        type: "text",

                        text:
                            "  Catatan: " +
                            item.catatan

                    });

                }

            }

        );


        /* ==========================================
           TOTAL
           ========================================== */

        content.push({

            type: "text",

            text:
                "--------------------------------"

        });


        content.push({

            type: "text",

            text:
                formatBarisNota(

                    "TOTAL",

                    formatRupiah(
                        pesanan.total
                    )

                ),

            bold: true

        });


        /* ==========================================
           FOOTER ORDER
           ========================================== */

        content.push({

            type: "text",

            text:
                "--------------------------------"

        });


        content.push({

            type: "text",

            text: "SEGERA DIPROSES",

            align: "center",

            bold: true

        });


        content.push({

            type: "feed",

            lines: 3

        });


        /* ==========================================
           KIRIM KE CLEANter
           ========================================== */

        const response =

            await fetch(

                "http://localhost:9100/print",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            cut: true,

                            content:
                                content

                        })

                }

            );


        /* ==========================================
           CEK HASIL PRINT
           ========================================== */

        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(
                        () => ({})
                    );


            throw new Error(

                errorData.error ||
                "Printer tidak dapat mencetak ORDER."

            );

        }


        const result =
            await response.json();


        console.log(

            "🧾 ORDER customer berhasil dikirim ke printer:",

            result

        );


        return true;


    } catch (error) {

        console.error(

            "❌ Gagal mencetak ORDER customer:",

            error

        );


        alert(

            "Pesanan sudah diterima,\n" +
            "tetapi ORDER belum dapat dicetak.\n\n" +
            "Periksa koneksi printer POS58B."

        );


        return false;

    }

}

/* ==========================================
   CETAK STRUK 58MM - CLEANter
   ========================================== */

async function cetakStruk58mm(dataTransaksi) {

    try {

        /* ==========================================
           SIAPKAN ISI STRUK
           ========================================== */

        const content = [];


/* ==========================================
   HEADER STRUK + LOGO
   ========================================== */

    

/* NAMA CAFE */

content.push({

    type: "text",

    text: "THE SULTAN CAFE",

    align: "center",

    bold: true,

    size: "large"

});


        content.push({

            type: "text",

            text: "Palembang Tempo Doeloe",

            align: "center"

        });


        content.push({

            type: "text",
            text: "--------------------------------"

        });


        /* ==========================================
           INFORMASI TRANSAKSI
           ========================================== */

        content.push({

            type: "row",

            left: "No. Transaksi",

            right:
                dataTransaksi.nomorTransaksi

        });


        content.push({

            type: "row",

            left: "Kasir",

            right:
                dataTransaksi.kasir

        });


        if (dataTransaksi.namaPelanggan) {

            content.push({

                type: "row",

                left: "Pelanggan",

                right:
                    dataTransaksi.namaPelanggan

            });

        }


        if (dataTransaksi.nomorMeja) {

            content.push({

                type: "row",

                left: "Meja",

                right:
                    dataTransaksi.nomorMeja

            });

        }


        content.push({

    type: "text",

    text:
        "--------------------------------"

});


/* ==========================================
   DAFTAR MENU
   ========================================== */

dataTransaksi.items.forEach(

    function(item) {

        const namaItem =
            item.nama +
            " x" +
            item.jumlah;

        const subtotalItem =
            formatRupiah(
                Number(item.harga) *
                Number(item.jumlah)
            );


        content.push({

            type: "text",

            text:
                formatBarisNota(
                    namaItem,
                    subtotalItem
                )

        });


        if (item.catatan) {

            content.push({

                type: "text",

                text:
                    "  Catatan: " +
                    item.catatan

            });

        }

    }

);

/* ==========================================
   TOTAL PEMBAYARAN
   ========================================== */

content.push({

    type: "text",
    text:
    "--------------------------------"

});


content.push({

    type: "text",

    text:
        formatBarisNota(
            "TOTAL",
            formatRupiah(
                dataTransaksi.total
            )
        ),

    bold: true

});


content.push({

    type: "text",

    text:
        formatBarisNota(
            "Pembayaran",
            dataTransaksi.metodePembayaran
        )

});


content.push({

    type: "text",

    text:
        formatBarisNota(
            "Dibayar",
            formatRupiah(
                dataTransaksi.jumlahDibayar
            )
        )

});


content.push({

    type: "text",

    text:
        formatBarisNota(
            "Kembalian",
            formatRupiah(
                dataTransaksi.kembalian
            )
        )

});

        /* ==========================================
           FOOTER
           ========================================== */

        content.push({

          type: "text",

         text:
            "--------------------------------"

    });


        content.push({

            type: "text",

            text: "Terima kasih",

            align: "center",

            bold: true

        });


        content.push({

            type: "text",

            text: "Selamat menikmati",

            align: "center"

        });


        content.push({

            type: "feed",

            lines: 3

        });


    /* ==========================================
   KIRIM KE CLEANter
   ========================================== */

const response =

    await fetch(
        "http://localhost:9100/print",
        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify({

                    cut: true,

                    content:
                        content

                })

        }
    );

        /* ==========================================
           CEK HASIL PRINT
           ========================================== */

        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(
                        () => ({})
                    );

            throw new Error(

                errorData.error ||
                "Printer tidak dapat mencetak."

            );

        }


        const result =
            await response.json();


        console.log(
            "🧾 Struk berhasil dikirim ke printer:",
            result
        );


        return true;


    } catch (error) {

        console.error(
            "❌ Gagal mencetak struk:",
            error
        );


        alert(
            "Transaksi berhasil disimpan,\n" +
            "tetapi struk belum dapat dicetak.\n\n" +
            "Periksa koneksi printer POS58B."
        );


        return false;

    }

}

/* ==========================================
   TEST PRINT POS58B
   ========================================== */

async function testPrintPOS58B() {

    try {

        const response =
            await fetch(
                "http://localhost:9100/print",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            content: [

                                {
                                    type: "text",
                                    text: "THE SULTAN CAFE",
                                    align: "center",
                                    bold: true,
                                    size: "large"
                                },

                                {
                                    type: "text",
                                    text: "TEST PRINT POS58B",
                                    align: "center"
                                },

                                {
                                    type: "divider"
                                },

                                {
                                    type: "text",
                                    text: "Printer berhasil terhubung.",
                                    align: "center"
                                },

                                {
                                    type: "text",
                                    text: "Cleanter OK",
                                    align: "center"
                                },

                                {
                                    type: "feed",
                                    lines: 3
                                }

                            ],

                            cut: true

                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Cleanter gagal mengirim perintah print."
            );

        }

        const result =
            await response.json();

        console.log(
            "🧾 TEST PRINT BERHASIL:",
            result
        );

    } catch (error) {

        console.error(
            "❌ TEST PRINT GAGAL:",
            error
        );

        alert(
            "Test print gagal.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   SIMPAN TRANSAKSI KE SUPABASE
   ========================================== */

async function simpanTransaksi() {

    /* ==========================================
       VALIDASI PEMBAYARAN
       ========================================== */

    const hasilPembayaran =
        validasiPembayaran();


    if (!hasilPembayaran.valid) {

        alert(
            hasilPembayaran.message
        );

        return;

    }


    /* ==========================================
       DATA TRANSAKSI
       ========================================== */

    const namaPelanggan =
        posCustomerName?.value.trim() || null;

    const nomorMeja =
        posTableNumber?.value.trim() || null;

    const kasir =
        getNamaKasir();

    const nomorTransaksi =
        await buatNomorTransaksi();

    const total =
        hitungTotalKeranjang();

    const idPesananCustomer =
    pesananCustomerId;    
    
        
    const jumlahDibayar =
        hasilPembayaran.jumlahDibayar;

    const kembalian =
        hasilPembayaran.kembalian;


    /* ==========================================
       NONAKTIFKAN TOMBOL SIMPAN
       ========================================== */

    if (btnSaveTransaction) {

        btnSaveTransaction.disabled =
            true;

        btnSaveTransaction.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

    }


    try {

        /* ==========================================
           SIMPAN TRANSAKSI UTAMA
           ========================================== */

        const {
            data: transaksi,
            error
        } = await supabaseClient

            .from("transaksi")

            .insert([{

                nomor_transaksi:
                    nomorTransaksi,

                kasir:
                    kasir,

                nama_pelanggan:
                    namaPelanggan,

                nomor_meja:
                    nomorMeja,

                pesanan_customer_id:
                    idPesananCustomer,   

                total:
                    total,

                metode_pembayaran:
                    selectedPaymentMethod,

                jumlah_dibayar:
                    jumlahDibayar,

                kembalian:
                    kembalian,

                status:
                    "SELESAI"

            }])

            .select()

            .single();


        if (error) {

            throw error;

        }


        /* ==========================================
           SIAPKAN DETAIL TRANSAKSI
           ========================================== */

        const detailTransaksi =
            posCart.map(item => ({

                transaksi_id:
                    transaksi.id,

                menu_id:
                    String(item.id),

                nama_menu:
                    item.nama,

                harga:
                    Number(item.harga),

                jumlah:
                    Number(item.jumlah),

                subtotal:
                    Number(item.harga) *
                    Number(item.jumlah),

                catatan:
                    item.catatan ||
                    null

            }));


        /* ==========================================
           SIMPAN DETAIL TRANSAKSI
           ========================================== */

        const {
            error: detailError
        } = await supabaseClient

            .from("detail_transaksi")

            .insert(detailTransaksi);


        /* ==========================================
           JIKA DETAIL GAGAL
           HAPUS TRANSAKSI UTAMA
           ========================================== */

        if (detailError) {

            await supabaseClient

                .from("transaksi")

                .delete()

                .eq(
                    "id",
                    transaksi.id
                );

            throw detailError;

        }


        /* ==========================================
           BERHASIL
           ========================================== */

        alert(
            "Transaksi berhasil disimpan.\n\n" +
            "No. Transaksi: " +
            nomorTransaksi
        );

   /* ==========================================
   DATA UNTUK CETAK STRUK
   ========================================== */

const dataStruk = {

    nomorTransaksi:
        nomorTransaksi,

    kasir:
        kasir,

    namaPelanggan:
        namaPelanggan,

    nomorMeja:
        nomorMeja,

    items:
        posCart.map(item => ({

            nama:
                item.nama,

            harga:
                Number(item.harga),

            jumlah:
                Number(item.jumlah),

            catatan:
                item.catatan ||
                null

        })),

    total:
        total,

    metodePembayaran:
        selectedPaymentMethod,

    jumlahDibayar:
        jumlahDibayar,

    kembalian:
        kembalian

};


/* ==========================================
   CETAK STRUK
   ========================================== */

await cetakStruk58mm(
    dataStruk
);


        /* ==========================================
           RESET POS
           ========================================== */

        resetPOS();


    } catch (error) {

        console.error(
            "❌ Gagal menyimpan transaksi:",
            error
        );

        alert(
            "Gagal menyimpan transaksi.\n\n" +
            error.message
        );


    } finally {

        if (btnSaveTransaction) {

            btnSaveTransaction.disabled =
                false;

            btnSaveTransaction.innerHTML =
                '<i class="fa-solid fa-check"></i> Simpan Transaksi';

        }

    }

}


/* ==========================================
   SEARCH EVENT
   ========================================== */

if (posSearch) {

    posSearch.addEventListener(
        "input",
        function() {

            renderPOSMenus();

        }
    );

}


/* ==========================================
   KEMBALI KE DASHBOARD
   ========================================== */

if (btnKembaliDashboard) {

    btnKembaliDashboard.addEventListener(
        "click",
        function() {

            window.location.href =
                "../index.html";

        }
    );

}


/* ==========================================
   ESCAPE HTML
   ========================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================
   ESCAPE ATTRIBUTE
   ========================================== */

function escapeAttribute(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


/* ==========================================
   START POS
   ========================================== */

loadPOSData();

/* ==========================================
   AMBIL DETAIL PESANAN CUSTOMER
   ========================================== */

async function ambilDetailPesananCustomer(
    pesananId
) {

    try {

        console.log(
            "⏳ Mengambil detail pesanan customer:",
            pesananId
        );


        const { data, error } =
            await supabaseClient
                .from("detail_pesanan_customer")
                .select("*")
                .eq("pesanan_id", pesananId)
                .order("id", {
                    ascending: true
                });


        if (error) {

            console.error(
                "❌ Gagal mengambil detail pesanan customer:",
                error
            );

            return [];

        }


        console.log(
            "✅ Detail pesanan customer:",
            data
        );


        return data || [];


    } catch (error) {

        console.error(
            "❌ Error detail pesanan customer:",
            error
        );

        return [];

    }

}



/* ==========================================
   TAMPILKAN PESANAN CUSTOMER
   ========================================== */

function tampilkanPesananCustomer(
    pesanan,
    detail
) {

    console.log(
    "🔎 CEK SAAT TAMPILKAN:",
    customerOrderPanel,
    customerOrderContent
);

    if (
        !customerOrderPanel ||
        !customerOrderContent
    ) {
        console.error(
            "❌ Panel pesanan customer tidak ditemukan"
        );
        return;
    }

    let html = "";

    /* ======================================
       INFORMASI PESANAN
       ====================================== */

    html += `
        <div class="customer-order-info">

            <div>
                <strong>Kode Pesanan</strong>
                <span>
                    ${pesanan.kode_pesanan || "-"}
                </span>
            </div>

            <div>
                <strong>Pelanggan</strong>
                <span>
                    ${pesanan.nama_pelanggan || "-"}
                </span>
            </div>

            <div>
                <strong>Meja</strong>
                <span>
                    ${pesanan.nomor_meja || "-"}
                </span>
            </div>

        </div>
    `;

    /* ======================================
       DAFTAR ITEM
       ====================================== */

    html += `
        <div class="customer-order-items">
    `;

    if (
        !detail ||
        detail.length === 0
    ) {

        html += `
            <div>
                Tidak ada detail pesanan.
            </div>
        `;

    } else {

        detail.forEach(function(item) {

            html += `
                <div class="customer-order-item">

                    <div>

                        <strong>
                            ${item.nama_menu || "-"}
                        </strong>

                        ${
                            item.catatan
                                ? `
                                    <small>
                                        Catatan:
                                        ${item.catatan}
                                    </small>
                                  `
                                : ""
                        }

                    </div>

                    <span>
                        ${item.jumlah || 0} x
                        ${formatRupiah(
                            item.harga || 0
                        )}
                    </span>

                </div>
            `;

        });

    }

    html += `
        </div>
    `;

    /* ======================================
       TOTAL PESANAN
       ====================================== */

    html += `
        <div class="customer-order-total">

            <span>
                TOTAL
            </span>

            <strong>
                ${formatRupiah(
                    pesanan.total || 0
                )}
            </strong>

        </div>
    `;

    /* ======================================
       TAMPILKAN KE PANEL
       ====================================== */

    customerOrderContent.innerHTML =
        html;

    customerOrderPanel.style.display =
        "block";

    console.log(
        "📋 Pesanan customer ditampilkan"
    );
}

/* ==========================================
   MASUKKAN PESANAN CUSTOMER KE KERANJANG
   ========================================== */

function masukkanPesananCustomerKeKeranjang(
    detail
) {

    if (
        !detail ||
        detail.length === 0
    ) {

        console.warn(
            "⚠️ Detail pesanan customer kosong"
        );

        return false;

    }

    console.log(
        "⏳ Memasukkan pesanan customer ke keranjang:",
        detail
    );

    for (
        const itemCustomer of detail
    ) {

        const namaCustomer =
            String(
                itemCustomer.nama_menu || ""
            )
                .trim()
                .toLowerCase();

        const menuPOS =
            posMenus.find(function(menu) {

                const namaPOS =
                    String(
                        menu.nama || ""
                    )
                        .trim()
                        .toLowerCase();

                return namaPOS === namaCustomer;

            });

        if (!menuPOS) {

            console.error(
                "❌ Menu customer tidak ditemukan di POS:",
                itemCustomer.nama_menu
            );

            return false;

        }

        const existingItem =
            posCart.find(function(item) {

                return String(item.id)
                    ===
                    String(menuPOS.id);

            });

        if (existingItem) {

            existingItem.jumlah +=
                Number(
                    itemCustomer.jumlah || 0
                );

            if (
                itemCustomer.catatan
            ) {

                existingItem.catatan =
                    itemCustomer.catatan;

            }

        } else {

            posCart.push({

                id:
                    menuPOS.id,

                nama:
                    menuPOS.nama,

                harga:
                    Number(
                        itemCustomer.harga ||
                        menuPOS.harga ||
                        0
                    ),

                jumlah:
                    Number(
                        itemCustomer.jumlah || 0
                    ),

                foto:
                    menuPOS.foto || "",

                catatan:
                    itemCustomer.catatan || ""

            });

        }

    }

    renderPOSCart();

    console.log(
        "✅ Pesanan customer berhasil masuk ke keranjang:",
        posCart
    );

    return true;
}

/* ==========================================
   BUKA PESANAN AKTIF
   ========================================== */

async function bukaPesananAktif(
    pesananId
) {

    console.log(
        "⏳ Membuka pesanan aktif:",
        pesananId
    );


    try {

        /* ======================================
           AMBIL DATA PESANAN
           ====================================== */

        const {
            data: pesanan,
            error: pesananError
        } = await supabaseClient

            .from("pesanan_customer")

            .select("*")

            .eq(
                "id",
                pesananId
            )

            .single();


        if (pesananError) {

            throw pesananError;

        }


        /* ======================================
           AMBIL DETAIL PESANAN
           ====================================== */

        const detail =
            await ambilDetailPesananCustomer(
                pesananId
            );


        if (
            !detail ||
            detail.length === 0
        ) {

            alert(
                "Detail pesanan kosong."
            );

            return;

        }


        /* ======================================
           MASUKKAN KE KERANJANG
           ====================================== */

        const berhasil =
            masukkanPesananCustomerKeKeranjang(
                detail
            );


        if (!berhasil) {

            alert(
                "Pesanan gagal dibuka ke POS."
            );

            return;

        }


        /* ======================================
           ISI DATA PELANGGAN
           ====================================== */

        if (posCustomerName) {

            posCustomerName.value =
                pesanan.nama_pelanggan || "";

        }


        if (posTableNumber) {

            posTableNumber.value =
                pesanan.nomor_meja || "";

        }


        /* ======================================
           SIMPAN ID PESANAN CUSTOMER
           ====================================== */

        pesananCustomerId =
            pesanan.id;


        console.log(
            "✅ Pesanan aktif berhasil dibuka:",
            pesanan
        );

        console.log(
            "🛒 Pesanan masuk ke keranjang POS:",
            posCart
        );


    } catch (error) {

        console.error(
            "❌ Gagal membuka pesanan aktif:",
            error
        );

        alert(
            "Gagal membuka pesanan.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   EVENT TOMBOL BUKA PESANAN AKTIF
   ========================================== */

const activeCustomerOrdersContent =
    document.getElementById("activeCustomerOrdersContent");

if (activeCustomerOrdersContent) {

    activeCustomerOrdersContent.addEventListener(
        "click",
        async function (event) {

            const tombol =
                event.target.closest(
                    ".btn-call-active-order"
                );

            if (!tombol) {

                return;

            }

            const pesananId =
                tombol.dataset.id;

            if (!pesananId) {

                console.warn(
                    "⚠️ ID pesanan aktif tidak ditemukan"
                );

                return;

            }

            await bukaPesananAktif(
                pesananId
            );

        }
    );

}

/* ==========================================
   TERIMA PESANAN CUSTOMER
   ========================================== */

async function terimaPesananCustomer() {

    try {

        if (!pesananCustomerAktif) {

            console.warn(
                "⚠️ Tidak ada pesanan customer aktif"
            );

            return;

        }

        const pesananId =
            pesananCustomerAktif.id;

        console.log(
            "⏳ Menerima pesanan customer:",
            pesananId
        );


        /* ==========================================
           AMBIL DETAIL TERBARU
           ========================================== */

        const detail =
            await ambilDetailPesananCustomer(
                pesananId
            );

        if (
            !detail ||
            detail.length === 0
        ) {

            console.error(
                "❌ Detail pesanan customer kosong"
            );

            return;

        }


        /* ==========================================
           MASUKKAN KE KERANJANG POS
           ========================================== */

        const berhasil =
            masukkanPesananCustomerKeKeranjang(
                detail
            );

        if (!berhasil) {

            console.error(
                "❌ Pesanan customer gagal dimasukkan ke keranjang"
            );

            return;

        }


        /* ==========================================
           ISI DATA PELANGGAN
           ========================================== */

        if (posCustomerName) {

            posCustomerName.value =
                pesananCustomerAktif.nama_pelanggan || "";

        }


        if (posTableNumber) {

            posTableNumber.value =
                pesananCustomerAktif.nomor_meja || "";

        }


        /* ==========================================
           UPDATE STATUS
           ========================================== */

        const { data, error } =
            await supabaseClient
                .from("pesanan_customer")
                .update({
                    status: "DITERIMA"
                })
                .eq("id", pesananId)
                .select()
                .single();

        if (error) {

            console.error(
                "❌ Gagal menerima pesanan customer:",
                error
            );

            return;

        }


        console.log(
            "✅ Pesanan customer diterima:",
            data
        );


        /* ==========================================
           HENTIKAN SUARA
           ========================================== */

        hentikanSuaraPesananBaru();


        /* ==========================================
           KOSONGKAN PESANAN AKTIF
           ========================================== */

        pesananCustomerAktif =
            null;

        pesananCustomerId =
            pesananId;    


        /* ==========================================
           SEMBUNYIKAN PANEL
           ========================================== */

        if (customerOrderPanel) {

            customerOrderPanel.style.display =
                "none";

        }


        if (customerOrderContent) {

            customerOrderContent.innerHTML =
                "";

        }


        console.log(
            "✅ Pesanan customer masuk ke keranjang POS"
        );

        console.log(
            "✅ Panel pesanan customer dikosongkan"
        );

    } catch (error) {

        console.error(
            "❌ Error menerima pesanan customer:",
            error
        );

    }

}


/* ==========================================
   REALTIME PESANAN CUSTOMER
   ========================================== */

async function mulaiRealtimePesananCustomer() {

    console.log(
        "⏳ Menunggu pesanan customer..."
    );


    /* ==========================================
       CEK PESANAN CUSTOMER OPEN SAAT POS DIBUKA
       ========================================== */

    const { data: pesananOpen, error: errorPesananOpen } =
        await supabaseClient
            .from("pesanan_customer")
            .select("*")
            .eq("status", "OPEN")
            .order("created_at", {
                ascending: false
            })
            .limit(1);


    if (errorPesananOpen) {

        console.error(
            "❌ Gagal mengambil pesanan customer OPEN:",
            errorPesananOpen
        );

    } else if (
        pesananOpen &&
        pesananOpen.length > 0
    ) {

        console.log(
            "📋 Pesanan customer OPEN ditemukan:",
            pesananOpen[0]
        );


        pesananCustomerAktif =
            pesananOpen[0];


        const detail =
            await ambilDetailPesananCustomer(
                pesananOpen[0].id
            );


        console.log(
            "📋 Detail pesanan OPEN:",
            detail
        );


        tampilkanPesananCustomer(
            pesananOpen[0],
            detail
        );

    } else {

        console.log(
            "ℹ️ Tidak ada pesanan customer OPEN."
        );

    }


    /* ==========================================
       REALTIME PESANAN CUSTOMER BARU
       ========================================== */

    const channel =
        supabaseClient
            .channel(
                "pesanan-customer-pos"
            )

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "pesanan_customer"
                },

                async function(payload) {

                    console.log(
                        "🔔 PESANAN CUSTOMER BARU:",
                        payload.new
                    );


                    pesananCustomerAktif =
                        payload.new;


                    mulaiSuaraPesananBaru();


                    const detail =
                        await ambilDetailPesananCustomer(
                            payload.new.id
                        );


                    console.log(
                        "📋 Detail pesanan diterima:",
                        detail
                    );


                    tampilkanPesananCustomer(
                        payload.new,
                        detail
                    );
                    
                    await cetakOrderCustomer(
                        payload.new,
                        detail
                    );


                }
            )

            .subscribe(function(status) {

                console.log(
                    "📡 Status Realtime Pesanan:",
                    status
                );

            });

}


mulaiRealtimePesananCustomer();


/* ==========================================
   RESET POS
   ========================================== */

function resetPOS() {

    /* ==========================================
       KOSONGKAN KERANJANG
       ========================================== */

    posCart = [];


    /* ==========================================
       RESET DATA PELANGGAN
       ========================================== */

    if (posCustomerName) {

        posCustomerName.value = "";

    }


    if (posTableNumber) {

        posTableNumber.value = "";

    }


    /* ==========================================
       RESET CATATAN
       ========================================== */

    activeNoteIndex = null;


    if (posItemNote) {

        posItemNote.value = "";

    }


    /* ==========================================
       RESET PEMBAYARAN
       ========================================== */

    selectedPaymentMethod =
        "CASH";


    if (posAmountPaid) {

        posAmountPaid.value = "";

    }


    /* ==========================================
       RENDER ULANG KERANJANG
       ========================================== */

    renderPOSCart();


    /* ==========================================
       UPDATE PEMBAYARAN
       ========================================== */

    updatePaymentDisplay();

}


/* ==========================================
   EVENT SIMPAN TRANSAKSI
   ========================================== */

if (btnSaveTransaction) {

    btnSaveTransaction.addEventListener(
        "click",
        function () {

            simpanTransaksi();

        }
    );

}


/* ==========================================
   EVENT TRANSAKSI BARU
   ========================================== */

if (btnNewTransaction) {

    btnNewTransaction.addEventListener(
        "click",
        function () {

            if (posCart.length > 0) {

                const konfirmasi =
                    confirm(
                        "Transaksi saat ini akan dikosongkan.\n\n" +
                        "Apakah Anda yakin ingin memulai transaksi baru?"
                    );


                if (!konfirmasi) {

                    return;

                }

            }


            resetPOS();

        }
    );

}
