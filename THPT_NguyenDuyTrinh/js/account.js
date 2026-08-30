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
