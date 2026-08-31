/* ==========================================================
   KienoraEdu - CORE.JS
   FILE: js/core.js

   CÁC HÀM DÙNG CHUNG TOÀN HỆ THỐNG
========================================================== */


/* ==========================================================
   1. API GOOGLE APPS SCRIPT
========================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyQO3cCXn5aZhAg6W2kQ82z-iMqXmcPl28J_otL7g3xXkRJj8A1wwUGjZm61cJ6_KqLzA/exec";


/* ==========================================================
   2. TÀI KHOẢN DÙNG CHUNG
   Chỉ được khai báo tại core.js
========================================================== */

let currentUser =
  localStorage.getItem(
    "kienora_current_user"
  ) || "";


let currentRole =
  localStorage.getItem(
    "kienora_current_role"
  ) || "";


/* ==========================================================
   3. SESSION DÙNG CHUNG
========================================================== */

const currentSession = {

  maTruong:
    localStorage.getItem(
      "maTruong"
    ) || "",

  maNhanSu:
    localStorage.getItem(
      "maNhanSu"
    ) || "",

  username:
    localStorage.getItem(
      "kienora_current_user"
    ) || "",

  role:
    localStorage.getItem(
      "kienora_current_role"
    ) || "",

  fullName:
    localStorage.getItem(
      "kienora_full_name"
    ) || "",

  email:
    localStorage.getItem(
      "kienora_email"
    ) || ""

};


/* ==========================================================
   4. SET SESSION
========================================================== */

function setCurrentSession(data) {

  data =
    data || {};


  currentUser =
    String(
      data.username ||
      data.taiKhoan ||
      data.maNhanSu ||
      ""
    ).trim();


  currentRole =
    String(
      data.role ||
      data.vaiTro ||
      ""
    ).trim();


  currentSession.maTruong =
    String(
      data.maTruong ||
      currentSession.maTruong ||
      ""
    ).trim();


  currentSession.maNhanSu =
    String(
      data.maNhanSu ||
      currentUser ||
      currentSession.maNhanSu ||
      ""
    ).trim();


  currentSession.username =
    currentUser;


  currentSession.role =
    currentRole;


  currentSession.fullName =
    String(
      data.fullName ||
      data.hoTen ||
      currentSession.fullName ||
      ""
    ).trim();


  currentSession.email =
    String(
      data.email ||
      currentSession.email ||
      ""
    ).trim();


  /* --------------------------------------------------------
     Lưu localStorage
  -------------------------------------------------------- */

  localStorage.setItem(
    "kienora_current_user",
    currentUser
  );


  localStorage.setItem(
    "kienora_current_role",
    currentRole
  );


  if (
    currentSession.maTruong
  ) {

    localStorage.setItem(
      "maTruong",
      currentSession.maTruong
    );

  }


  if (
    currentSession.maNhanSu
  ) {

    localStorage.setItem(
      "maNhanSu",
      currentSession.maNhanSu
    );

  }


  if (
    currentSession.fullName
  ) {

    localStorage.setItem(
      "kienora_full_name",
      currentSession.fullName
    );

  }


  if (
    currentSession.email
  ) {

    localStorage.setItem(
      "kienora_email",
      currentSession.email
    );

  }


  return currentSession;
}


/* ==========================================================
   5. LẤY
