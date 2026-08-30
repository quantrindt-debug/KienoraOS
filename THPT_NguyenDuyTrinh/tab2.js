/* =========================================================
   🟦 TAB 1 — QUẢN LÝ HỒ SƠ HỌC SINH
   FILE: js/tab1.js
   PHẦN 1.1 — KHỞI TẠO + TÀI KHOẢN + VAI TRÒ
========================================================= */

let hocSinhDangChon = null;
let cauHinh = [];
let currentRole = "";
let isAdmin = false;


/* =========================================================
   NHẬN TÀI KHOẢN TỪ TRANG CHA
========================================================= */

const rawAccount =
    localStorage.getItem('maNhanSu') ||
    localStorage.getItem('taiKhoan') ||
    'c3ndtnl.nan.hieu';


let parts =
    rawAccount.split('.');


let maTruongVal =
    parts.length >= 2
        ? parts[0] + "." + parts[1]
        : (
            localStorage.getItem('maTruong') ||
            "c3ndtnl.nan"
          );


let maNhanSuVal =
    parts.length >= 3
        ? parts[2]
        : (
            parts.length === 2
                ? parts[1]
                : rawAccount
          );


const currentSession = {

    maTruong: maTruongVal,

    maNhanSu: maNhanSuVal

};


/* =========================================================
   HIỂN THỊ THÔNG TIN TÀI KHOẢN
========================================================= */

const userInfoBadge =
    document.getElementById('userInfoBadge');


if (userInfoBadge) {

    userInfoBadge.innerText =
        `Trường: ${currentSession.maTruong} | ` +
        `Tài khoản: ${currentSession.maNhanSu}`;

}


/* =========================================================
   KHỞI TẠO TAB 1
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        khoiTaoDuLieu();

    }
);


/* =========================================================
   KHỞI TẠO DỮ LIỆU
========================================================= */

async function khoiTaoDuLieu() {

    try {

        await taiVaiTro();

        await taiCauHinh();

        await taiDanhSachLop();

    }

    catch (err) {

        console.error(
            "Lỗi khởi tạo:",
            err
        );

        alert(
            "Không thể khởi tạo dữ liệu quản lý hồ sơ."
        );

    }

}


/* =========================================================
   LẤY VAI TRÒ TỪ API
========================================================= */

async function taiVaiTro() {

    const url =
        `${API_URL}?action=checkRole` +
        `&maTruong=${encodeURIComponent(currentSession.maTruong)}` +
        `&maNhanSu=${encodeURIComponent(currentSession.maNhanSu)}`;


    const res =
        await fetch(url);


    const data =
        await res.json();


    if (data.status !== "success") {

        throw new Error(
            data.message ||
            "Không lấy được vai trò."
        );

    }


    currentRole =
        String(
            data.role || "GVCN"
        ).trim();


    const roleLower =
        currentRole.toLowerCase();


    isAdmin =
        roleLower === "admin" ||
        roleLower === "administrator" ||
        roleLower.includes("admin") ||
        roleLower.includes("quản trị");


    hienThiQuyen();


    console.log(
        "Vai trò từ API:",
        currentRole
    );

}
