/* =========================================================
   KienoraEdu
   THPT NGUYỄN DUY TRINH
   FILE: THPT_NguyenDuyTrinh/ThiDuaLop.js

   BẢN GỘP TẠM THỜI:
   - CORE
   - ACCOUNT
   - TAB 1
   - TAB 2 FIX
   - TAB 3
   - TAB 8

   NGUYÊN TẮC:
   - API_URL chỉ khai báo 1 lần
   - currentUser chỉ khai báo 1 lần
   - currentRole chỉ khai báo 1 lần
   - currentSession chỉ khai báo 1 lần
   - escapeHtml chỉ khai báo 1 lần
   - setText chỉ khai báo 1 lần
   - Không dùng google.script.run
   - Không dùng SpreadsheetApp trong trình duyệt
========================================================= */


/* =========================================================
   1. API
========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyQO3cCXn5aZhAg6W2kQ82z-iMqXmcPl28J_otL7g3xXkRJj8A1wwUGjZm61cJ6_KqLzA/exec";


/* =========================================================
   2. SESSION DÙNG CHUNG
========================================================= */

let currentUser =
  localStorage.getItem("kienora_current_user") || "";

let currentRole =
  localStorage.getItem("kienora_current_role") || "";

const currentSession = {

  maTruong:
    localStorage.getItem("maTruong") || "",

  maNhanSu:
    localStorage.getItem("maNhanSu") || "",

  username:
    localStorage.getItem("kienora_current_user") || "",

  role:
    localStorage.getItem("kienora_current_role") || "",

  fullName:
    localStorage.getItem("kienora_full_name") || "",

  email:
    localStorage.getItem("kienora_email") || ""

};


/* =========================================================
   3. ĐỒNG BỘ SESSION
========================================================= */

function setCurrentSession(data) {

  data = data || {};

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


  localStorage.setItem(
    "kienora_current_user",
    currentUser
  );

  localStorage.setItem(
    "kienora_current_role",
    currentRole
  );

  if (currentSession.maTruong) {
    localStorage.setItem(
      "maTruong",
      currentSession.maTruong
    );
  }

  if (currentSession.maNhanSu) {
    localStorage.setItem(
      "maNhanSu",
      currentSession.maNhanSu
    );
  }

  if (currentSession.fullName) {
    localStorage.setItem(
      "kienora_full_name",
      currentSession.fullName
    );
  }

  if (currentSession.email) {
    localStorage.setItem(
      "kienora_email",
      currentSession.email
    );
  }

  return currentSession;
}


/* =========================================================
   4. NHẬN TÀI KHOẢN TỪ TRANG CHA
========================================================= */

function getAccountFromParent() {

  const rawAccount =
    localStorage.getItem("maNhanSu") ||
    localStorage.getItem("taiKhoan") ||
    localStorage.getItem("username") ||
    localStorage.getItem("kienora_current_user") ||
    "";

  const raw =
    String(rawAccount).trim();

  if (!raw) {
    return "";
  }

  const parts =
    raw.split(".").filter(Boolean);

  if (parts.length >= 3) {

    currentSession.maTruong =
      parts[0] + "." + parts[1];

    currentSession.maNhanSu =
      parts.slice(2).join(".");

  } else if (parts.length === 2) {

    currentSession.maTruong =
      parts[0];

    currentSession.maNhanSu =
      parts[1];

  } else {

    currentSession.maNhanSu =
      raw;
  }

  currentSession.username =
    raw;

  currentUser =
    raw;

  localStorage.setItem(
    "kienora_current_user",
    raw
  );

  localStorage.setItem(
    "maNhanSu",
    raw
  );

  if (currentSession.maTruong) {

    localStorage.setItem(
      "maTruong",
      currentSession.maTruong
    );

  }

  return raw;
}


/* =========================================================
   5. API POST
========================================================= */

async function postApi(payload) {

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(
            payload || {}
          )
      }
    );

  if (!response.ok) {

    throw new Error(
      "HTTP " +
      response.status
    );

  }

  const text =
    await response.text();

  try {

    return JSON.parse(text);

  } catch (error) {

    console.error(
      "API trả về:",
      text
    );

    throw new Error(
      "API không trả về JSON hợp lệ."
    );

  }
}


/* =========================================================
   6. API GET
========================================================= */

function getApi(params) {

  return new Promise(
    function(resolve, reject) {

      const callbackName =
        "__kienora_jsonp_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 100000
        );

      const script =
        document.createElement("script");

      const queryParams = {
        ...(params || {}),
        callback: callbackName
      };

      const query =
        new URLSearchParams(
          queryParams
        ).toString();

      const url =
        API_URL +
        "?" +
        query;


      const timeout =
        setTimeout(
          function() {

            cleanup();

            reject(
              new Error(
                "API hết thời gian phản hồi."
              )
            );

          },
          15000
        );


      function cleanup() {

        clearTimeout(
          timeout
        );

        delete window[
          callbackName
        ];

        if (script.parentNode) {

          script.parentNode.removeChild(
            script
          );

        }

      }


      window[
        callbackName
      ] =
        function(data) {

          cleanup();

          resolve(data);

        };


      script.onerror =
        function() {

          cleanup();

          reject(
            new Error(
              "Không thể kết nối Google Apps Script."
            )
          );

        };


      script.src =
        url;

      script.async =
        true;

      document
        .head
        .appendChild(
          script
        );

    }
  );

}
/* =========================================================
   7. HÀM CHUNG
========================================================= */

function getCurrentUser() {
  return String(
    currentUser || ""
  ).trim();
}


function getCurrentRole() {
  return String(
    currentRole || ""
  ).trim();
}


function getEl(id) {
  return document.getElementById(id);
}


function getValue(id) {

  const el =
    getEl(id);

  return el
    ? String(
        el.value || ""
      ).trim()
    : "";

}


function setValue(id, value) {

  const el =
    getEl(id);

  if (el) {
    el.value =
      value == null
        ? ""
        : value;
  }

}


function setText(id, value) {

  const el =
    getEl(id);

  if (el) {

    el.textContent =
      value == null
        ? ""
        : value;

  }

}


function escapeHtml(value) {

  return String(
    value == null
      ? ""
      : value
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function coreLog(...args) {

  console.log(
    "[KienoraEdu]",
    ...args
  );

}


/* =========================================================
   8. ACCOUNT
========================================================= */

function isLoggedIn() {

  return !!String(
    currentUser || ""
  ).trim();

}


function accountIsAdmin() {

  const role =
    String(
      currentRole || ""
    )
      .trim()
      .toUpperCase();

  return (
    role === "ADMIN" ||
    role === "ADMINISTRATOR" ||
    role.includes("ADMIN")
  );

}


function accountIsBGH() {

  const role =
    String(
      currentRole || ""
    )
      .trim()
      .toUpperCase();

  return (
    role === "BGH" ||
    role.includes("BAN GIÁM HIỆU")
  );

}


function getAccountDisplayName() {

  return String(

    localStorage.getItem(
      "kienora_full_name"
    ) ||

    currentSession.fullName ||

    currentUser ||

    "Khách"

  ).trim();

}


function renderAccountStatus() {

  const name =
    getAccountDisplayName();

  const role =
    currentRole || "Khách";


  const displayIds = [
    "currentUserText",
    "usernameDisplay",
    "authUsernameText"
  ];


  displayIds.forEach(
    id => {

      const el =
        document.getElementById(id);

      if (el) {

        el.textContent =
          isLoggedIn()
            ? name + " (" + role + ")"
            : "Khách";

      }

    }
  );


  const roleDisplay =
    document.getElementById(
      "roleDisplay"
    );

  if (roleDisplay) {

    roleDisplay.textContent =
      isLoggedIn()
        ? "👤 " + role
        : "Chưa đăng nhập";

  }

}


async function loginAccount(
  username,
  password
) {

  username =
    String(username || "").trim();

  password =
    String(password || "").trim();


  if (!username) {
    throw new Error(
      "Vui lòng nhập tên đăng nhập."
    );
  }

  if (!password) {
    throw new Error(
      "Vui lòng nhập mật khẩu."
    );
  }


  const result =
    await postApi({

      action:
        "authenticateUser",

      username:
        username,

      password:
        password

    });


  if (
    !result ||
    (
      result.status !== "success" &&
      result.success !== true
    )
  ) {

    throw new Error(
      result?.message ||
      "Sai tên đăng nhập, mật khẩu hoặc tài khoản chưa được phép đăng nhập."
    );

  }


  setCurrentSession(
    result
  );

  renderAccountStatus();

  return result;
}


async function submitLoginForm() {

  const username =
    getValue("loginUsername") ||
    getValue("username") ||
    getValue("taiKhoan") ||
    getValue("txtUsername");

  const password =
    getValue("loginPassword") ||
    getValue("password") ||
    getValue("matKhau") ||
    getValue("txtPassword");


  try {

    const result =
      await loginAccount(
        username,
        password
      );

    alert(
      result.message ||
      "Đăng nhập thành công."
    );

    return result;

  } catch (error) {

    console.error(
      "Lỗi đăng nhập:",
      error
    );

    alert(
      "❌ " +
      error.message
    );

    return null;

  }
}


function login() {
  return submitLoginForm();
}


function logoutAccount() {

  currentUser = "";
  currentRole = "";

  currentSession.username = "";
  currentSession.role = "";
  currentSession.maTruong = "";
  currentSession.maNhanSu = "";
  currentSession.fullName = "";
  currentSession.email = "";


  [
    "kienora_current_user",
    "kienora_current_role",
    "kienora_full_name",
    "kienora_email",
    "maTruong",
    "maNhanSu"
  ].forEach(
    key =>
      localStorage.removeItem(key)
  );


  renderAccountStatus();

  coreLog(
    "Đã đăng xuất."
  );
}


function logout() {
  return logoutAccount();
}


/* =========================================================
   9. TAB 1
========================================================= */

let hocSinhDangChon = null;
let cauHinh = [];
let isAdmin = false;


function taiVaiTro() {

  return getApi({

    action:
      "checkRole",

    maTruong:
      currentSession.maTruong,

    maNhanSu:
      currentSession.maNhanSu

  }).then(
    data => {

      if (
        data.status !==
        "success"
      ) {

        throw new Error(
          data.message ||
          "Không lấy được vai trò."
        );

      }


      currentRole =
        String(
          data.role ||
          "GVCN"
        ).trim();


      currentSession.role =
        currentRole;


      isAdmin =
        accountIsAdmin();


      localStorage.setItem(
        "kienora_current_role",
        currentRole
      );


      renderAccountStatus();


      return data;

    }
  );

}


async function taiCauHinh() {

  const data =
    await getApi({
      action:
        "getConfig"
    });

  if (
    data.status !==
    "success"
  ) {

    throw new Error(
      data.message ||
      "Không lấy được cấu hình."
    );

  }

  cauHinh =
    Array.isArray(
      data.configs
    )
      ? data.configs
      : [];

  return cauHinh;
}


async function taiDanhSachLop() {

  const select =
    document.getElementById(
      "selectLop"
    );

  if (!select) {
    return;
  }


  const data =
    await getApi({

      action:
        "layDanhSachLop",

      maTruong:
        currentSession.maTruong,

      maNhanSu:
        currentSession.maNhanSu

    });


  if (
    data.status !==
    "success"
  ) {

    throw new Error(
      data.message ||
      "Không lấy được danh sách lớp."
    );

  }


  const list =
    Array.isArray(
      data.danhSachLop
    )
      ? data.danhSachLop
      : [];


  select.innerHTML =
    `<option value="">
       -- Chọn lớp quản lý --
     </option>`;


  list.forEach(
    tenLop => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        tenLop;

      option.textContent =
        tenLop;

      select.appendChild(
        option
      );

    }
  );


  return list;
}


function capNhatElement(
  id,
  value
) {

  setText(
    id,
    value
  );

}


function capNhatThongKe(
  danhSach
) {

  if (!Array.isArray(
    danhSach
  )) {

    danhSach = [];

  }


  const tongHS =
    danhSach.length;


  let soDu = 0;
  let soThieu = 0;


  danhSach.forEach(
    hs => {

      const thieu =
        Array.isArray(
          hs.thieuBatBuoc
        )
          ? hs.thieuBatBuoc
          : [];


      if (
        thieu.length > 0
      ) {

        soThieu++;

      } else {

        soDu++;

      }

    }
  );


  setText(
    "statTongHS",
    tongHS
  );

  setText(
    "statHoSoDu",
    soDu
  );

  setText(
    "statHoSoThieu",
    soThieu
  );

  setText(
    "statTyLeHoSo",
    tongHS > 0
      ? Math.round(
          soDu * 100 / tongHS
        ) + "%"
      : "0%"
  );

}


async function khoiTaoDuLieu() {

  try {

    getAccountFromParent();

    await taiVaiTro();

    await taiCauHinh();

    await taiDanhSachLop();

    coreLog(
      "Tab 1 đã khởi tạo."
    );

  } catch (error) {

    console.error(
      "Lỗi khởi tạo Tab 1:",
      error
    );

  }

}


/* =========================================================
   10. TAB 2 — HÀM TÍNH ĐIỂM
========================================================= */

function calculateTotalEmulation() {

  const sdb =
    Number(
      getValue("tdSDB")
    ) || 0;

  const cuocThi =
    Number(
      getValue("tdCuocThi")
    ) || 0;

  const veSinh =
    Number(
      getValue("tdVeSinh")
    ) || 0;

  const csvc =
    Number(
      getValue("tdCSVC")
    ) || 0;

  const xepXe =
    Number(
      getValue("tdXepXe")
    ) || 0;

  const qdKhac =
    Number(
      getValue("tdQDKhac")
    ) || 0;


  const raw =
      sdb * 3
    + cuocThi
    + veSinh
    + csvc
    + xepXe
    + qdKhac * 3;


  const total =
    raw / 10;


  setValue(
    "txtTongDiemThiDua",
    total.toFixed(1)
  );


  return total;
}


/* =========================================================
   11. TAB 3 — HỌC SINH CẦN QUAN TÂM
========================================================= */

let tab3Data = [];
let tab3Students = [];
let tab3CareList = [];
let tab3EditingRecord = null;
let tab3SelectedClass = "";
let tab3SelectedWeek = "";
let tab3CurrentRole = "";
let tab3IsAdmin = false;


function tab3GetRole() {

  return String(
    currentRole ||
    "GVCN"
  ).trim();

}


function tab3CheckPermission() {

  tab3CurrentRole =
    tab3GetRole();

  const role =
    tab3CurrentRole
      .toLowerCase();

  tab3IsAdmin =
    role === "admin" ||
    role.includes("admin") ||
    role === "bgh" ||
    role.includes("ban giám hiệu");

}


function tab3GetCurrentClass() {

  if (
    typeof getCurrentSelectedClass ===
    "function"
  ) {

    const value =
      getCurrentSelectedClass();

    if (value) {
      return String(value).trim();
    }

  }


  const ids = [
    "selectLop",
    "selectClass",
    "jStudentClass",
    "tab3Class"
  ];


  for (
    const id of ids
  ) {

    const el =
      document.getElementById(id);

    if (
      el &&
      el.value
    ) {

      return String(
        el.value
      ).trim();

    }

  }


  return "";

}


async function tab3LoadStudents() {

  const select =
    document.getElementById(
      "jSelectStudent"
    );

  if (!select) {
    return;
  }


  const className =
    tab3GetCurrentClass();


  if (!className) {

    select.innerHTML =
      `<option value="">
         -- Chưa xác định lớp --
       </option>`;

    return;
  }


  tab3SelectedClass =
    className;


  select.innerHTML =
    `<option value="">
       ⏳ Đang tải học sinh...
     </option>`;

  select.disabled =
    true;


  try {

    const result =
      await getApi({

        action:
          "getStudentsByClass",

        maTruong:
          currentSession.maTruong,

        maNhanSu:
          currentSession.maNhanSu,

        lop:
          className

      });


    if (
      result.status &&
      result.status !==
      "success"
    ) {

      throw new Error(
        result.message ||
        "Không tải được học sinh."
      );

    }


    const students =
      Array.isArray(
        result.students
      )
        ? result.students
        : (
            Array.isArray(
              result.data
            )
              ? result.data
              : (
                  Array.isArray(
                    result.rows
                  )
                    ? result.rows
                    : []
                )
          );


    tab3Students =
      students;


    select.innerHTML =
      `<option value="">
         -- Chọn học sinh --
       </option>`;


    students.forEach(
      function(
        student,
        index
      ) {

        const option =
          document.createElement(
            "option"
          );

        const maHS =
          student.maHS ||
          student.maHocSinh ||
          student.id ||
          "";

        const hoTen =
          student.hoTen ||
          student.hoTenHocSinh ||
          student.hocSinh ||
          student.name ||
          "";

        option.value =
          maHS ||
          String(index);

        option.textContent =
          hoTen ||
          "Học sinh " +
          (index + 1);

        option.dataset.index =
          String(index);

        select.appendChild(
          option
        );

      }
    );


    select.disabled =
      false;

    setValue(
      "jStudentClass",
      className
    );


  } catch (error) {

    console.error(
      "Tab 3 load students:",
      error
    );

    select.innerHTML =
      `<option value="">
         ❌ Không tải được danh sách
       </option>`;

    select.disabled =
      false;

  }

}


function tab3SetValue(
  id,
  value
) {

  setValue(
    id,
    value
  );

}


function tab3ClearStudentForm() {

  setValue(
    "jStudentClass",
    tab3SelectedClass
  );

  setValue(
    "jBieuHien",
    ""
  );

  setValue(
    "jBienPhap",
    ""
  );

  setValue(
    "jKetQua",
    ""
  );

}


async function tab3StudentChanged() {

  const select =
    document.getElementById(
      "jSelectStudent"
    );

  if (!select) {
    return;
  }


  const selected =
    select.value;


  if (!selected) {

    tab3ClearStudentForm();

    return;
  }


  const option =
    select.selectedOptions[0];


  const index =
    option
      ? Number(
          option.dataset.index
        )
      : -1;


  const student =
    index >= 0
      ? tab3Students[index]
      : null;


  setValue(
    "jStudentClass",
    tab3SelectedClass
  );


  if (student) {

    setValue(
      "jBieuHien",
      student.bieuHien ||
      student.bieuHienVanDe ||
      ""
    );

    setValue(
      "jBienPhap",
      student.bienPhap ||
      ""

    );

    setValue(
      "jKetQua",
      student.ketQua ||
      ""

    );

  }


  await tab3LoadStudentCareData(
    selected
  );

}


async function tab3LoadStudentCareData(
  studentId
) {

  if (!studentId) {
    return;
  }


  try {

    const result =
      await getApi({

        action:
          "getStudentCareData",

        maTruong:
          currentSession.maTruong,

        maNhanSu:
          currentSession.maNhanSu,

        lop:
          tab3SelectedClass,

        maHS:
          studentId

      });


    if (
      !result ||
      result.status ===
        "not_found" ||
      result.status ===
        "empty"
    ) {

      return;

    }


    const data =
      result.data ||
      result.student ||
      result.row;


    if (!data) {
      return;
    }


    setValue(
      "jStudentClass",
      data.lop ||
      data.className ||
      tab3SelectedClass
    );

    setValue(
      "jBieuHien",
      data.bieuHien ||
      data.bieuHienVanDe ||
      data.vanDe ||
      ""
    );

    setValue(
      "jBienPhap",
      data.bienPhap ||
      data.phuongAn ||
      ""
    );

    setValue(
      "jKetQua",
      data.ketQua ||
      data.ketQuaTheoDoi ||
      ""
    );


  } catch (error) {

    console.warn(
      "Không có dữ liệu quan tâm:",
      error
    );

  }

}


async function submitCareStudentLog() {

  const select =
    document.getElementById(
      "jSelectStudent"
    );


  if (
    !select ||
    !select.value
  ) {

    alert(
      "Vui lòng chọn học sinh."
    );

    return null;
  }


  const index =
    Number(
      select.selectedOptions[0]
        ?.dataset.index || -1
    );


  const student =
    index >= 0
      ? tab3Students[index]
      : null;


  const maHS =
    select.value;


  const hoTen =
    student?.hoTen ||
    student?.name ||
    select.selectedOptions[0]?.textContent ||
    "";


  const lop =
    getValue(
      "jStudentClass"
    ) ||
    tab3SelectedClass;


  const bieuHien =
    getValue(
      "jBieuHien"
    );


  const bienPhap =
    getValue(
      "jBienPhap"
    );


  const ketQua =
    getValue(
      "jKetQua"
    );


  if (!bieuHien) {

    alert(
      "Vui lòng nhập biểu hiện / hoàn cảnh."
    );

    return null;
  }


  try {

    const result =
      await postApi({

        action:
          "saveCareStudentLog",

        maHS:
          maHS,

        hoTen:
          hoTen,

        bieuLop:
          lop,

        bieuHien:
          bieuHien,

        bienPhap:
          bienPhap,

        ketQua:
          ketQua,

        ngayTao:
          new Date().toISOString(),

        username:
          currentUser,

        maTruong:
          currentSession.maTruong

      });


    if (
      result.status !==
      "success" &&
      result.success !== true
    ) {

      throw new Error(
        result.message ||
        "Lưu thất bại."
      );

    }


    alert(
      result.message ||
      "✅ Đã lưu thành công."
    );


    return result;


  } catch (error) {

    console.error(
      "Lưu học sinh cần quan tâm:",
      error
    );

    alert(
      "❌ " +
      error.message
    );

    return null;

  }

}


/* Giữ tương thích HTML hiện tại */

function saveHocSinhQuanTam() {
  return submitCareStudentLog();
}


function onJStudentChange() {
  return tab3StudentChanged();
}


function onCareStudentSelectChange() {
  return tab3StudentChanged();
}


async function tab3LoadCareList() {

  const tbody =
    document.getElementById(
      "tbHocSinhQuanTam"
    );

  if (!tbody) {
    return;
  }


  const className =
    tab3GetCurrentClass();


  if (!className) {
    return;
  }


  try {

    const result =
      await getApi({

        action:
          "getCareStudentLogs",

        maTruong:
          currentSession.maTruong,

        maNhanSu:
          currentSession.maNhanSu,

        lop:
          className

      });


    const rows =
      Array.isArray(
        result.logs
      )
        ? result.logs
        : (
            Array.isArray(
              result.data
            )
              ? result.data
              : []
          );


    tab3CareList =
      rows;


    if (
      rows.length === 0
    ) {

      tbody.innerHTML =
        `<tr>
          <td colspan="5"
              style="text-align:center;padding:15px;">
            Chưa có dữ liệu
          </td>
        </tr>`;

      return;
    }


    tbody.innerHTML =
      rows.map(
        function(
          item,
          index
        ) {

          return `
            <tr>

              <td>
                ${index + 1}
              </td>

              <td>
                ${escapeHtml(
                  item.hoTen || ""
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.bieuHien || ""
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.bienPhap || ""
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.ketQua || ""
                )}
              </td>

            </tr>
          `;

        }
      ).join("");


  } catch (error) {

    console.error(
      "Load care list:",
      error
    );

  }

}


function onOpenTab3() {

  tab3CheckPermission();

  tab3SelectedClass =
    tab3GetCurrentClass();

  tab3LoadStudents();
  tab3LoadCareList();

}


/* =========================================================
   12. TAB 8 — SỔ CHỦ NHIỆM
========================================================= */

let danhSachLopNhom8 = [];
let lopDangXemNhom8 = "";


async function loadNhom8Permission() {

  getAccountFromParent();


  const select =
    document.getElementById(
      "selectClass"
    );


  if (select) {

    select.innerHTML =
      `<option value="">
        ⏳ Đang kiểm tra quyền...
       </option>`;

    select.disabled =
      true;

  }


  try {

    const result =
      await getApi({

        action:
          "layDanhSachLop",

        maTruong:
          currentSession.maTruong,

        maNhanSu:
          currentSession.maNhanSu

      });


    if (
      result.status !==
      "success"
    ) {

      throw new Error(
        result.message ||
        "Không lấy được danh sách lớp."
      );

    }


    currentRole =
      String(
        result.role ||
        currentRole ||
        ""
      ).trim();


    currentSession.role =
      currentRole;


    isAdmin =
      accountIsAdmin();


    danhSachLopNhom8 =
      Array.isArray(
        result.danhSachLop
      )
        ? result.danhSachLop
        : [];


    renderRoleNhom8();

    renderClassListNhom8();


  } catch (error) {

    console.error(
      "Lỗi loadNhom8Permission:",
      error
    );

    showNhom8Error(
      error.message
    );

  }

}


function renderRoleNhom8() {

  const roleDisplay =
    document.getElementById(
      "roleDisplay"
    );

  if (!roleDisplay) {
    return;
  }


  const role =
    String(
      currentRole ||
      "Không xác định"
    );


  roleDisplay.innerText =
    "👤 " +
    role;

}


function renderClassListNhom8() {

  const select =
    document.getElementById(
      "selectClass"
    );

  if (!select) {
    return;
  }


  select.innerHTML =
    "";


  if (
    !danhSachLopNhom8.length
  ) {

    select.innerHTML =
      `<option value="">
        -- Chưa có lớp được phép xem --
       </option>`;

    select.disabled =
      true;

    return;
  }


  if (
    !isAdmin &&
    !accountIsBGH() &&
    danhSachLopNhom8.length === 1
  ) {

    const lop =
      danhSachLopNhom8[0];


    const option =
      document.createElement(
        "option"
      );

    option.value =
      lop;

    option.textContent =
      lop;

    select.appendChild(
      option
    );


    select.value =
      lop;

    select.disabled =
      true;


    lopDangXemNhom8 =
      lop;


    loadReportData();

    return;
  }


  select.innerHTML =
    `<option value="">
      -- Chọn lớp xem báo cáo --
     </option>`;


  danhSachLopNhom8.forEach(
    function(lop) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        lop;

      option.textContent =
        lop;

      select.appendChild(
        option
      );

    }
  );


  select.disabled =
    false;

}


function showNhom8Error(
  message
) {

  const select =
    document.getElementById(
      "selectClass"
    );

  if (select) {

    select.innerHTML =
      `<option value="">
        ❌ ${escapeHtml(
          message || "Lỗi"
        )}
       </option>`;

  }

}


async function loadReportData() {

  const select =
    document.getElementById(
      "selectClass"
    );

  if (!select) {
    return;
  }


  const selectedClass =
    String(
      select.value || ""
    ).trim();


  if (!selectedClass) {
    return;
  }


  if (
    !danhSachLopNhom8.includes(
      selectedClass
    )
  ) {

    alert(
      "Bạn không có quyền xem lớp này."
    );

    return;
  }


  lopDangXemNhom8 =
    selectedClass;


  try {

    const result =
      await getApi({

        action:
          "getSoChuNhiemData",

        maTruong:
          currentSession.maTruong,

        maNhanSu:
          currentSession.maNhanSu,

        lop:
          selectedClass

      });


    if (
      result.status &&
      result.status !==
      "success"
    ) {

      throw new Error(
        result.message ||
        "API từ chối yêu cầu."
      );

    }


    renderSoChuNhiemData(
      result
    );


  } catch (error) {

    console.error(
      "Lỗi loadReportData:",
      error
    );

    const tbody =
      document.getElementById(
        "tbHocSinh"
      );

    if (tbody) {

      tbody.innerHTML =
        `<tr>
          <td colspan="7"
              style="color:#dc2626;">
            ❌ ${escapeHtml(
              error.message
            )}
          </td>
        </tr>`;

    }

  }

}


function renderSoChuNhiemData(
  data
) {

  if (!data) {
    return;
  }


  const gv =
    data.teacherInfo || {};


  setText(
    "lblTeacher",
    gv.hoTen || ""
  );

  setText(
    "lblSignTeacher",
    gv.hoTen || ""
  );

  setText(
    "gvHoTen",
    gv.hoTen || ""
  );

  setText(
    "gvNgaySinh",
    gv.ngaySinh || ""
  );

  setText(
    "gvGioiTinh",
    gv.gioiTinh || ""
  );

  setText(
    "gvDanToc",
    gv.danToc || ""
  );

  setText(
    "gvTrinhDo",
    gv.trinhDo || ""
  );

  setText(
    "gvMonGiangDay",
    gv.monGiangDay || ""
  );

  setText(
    "gvThamNien",
    gv.soNamCongTac || ""
  );

  setText(
    "gvDienThoai",
    gv.soDienThoai || ""
  );

  setText(
    "gvEmail",
    gv.email || ""
  );


  const tk =
    data.thongKeB || {};


  setText(
    "statTongHS",
    tk.tongHS || 0
  );

  setText(
    "statNu",
    tk.nu || 0
  );

  setText(
    "statDoanVien",
    tk.doanVien || 0
  );

  setText(
    "statDTTS",
    tk.danTocTS || 0
  );

  setText(
    "statThuongBinh",
    tk.thuongBinh || 0
  );

  setText(
    "statHoNgheo",
    tk.hoNgheo || 0
  );

  setText(
    "statKhuyetTat",
    tk.khuyetTat || 0
  );

  setText(
    "statOXa",
    tk.oXa || 0
  );

  setText(
    "statDacBiet",
    tk.dacBiet || 0
  );


  setText(
    "statChuyenDenDi",
    (tk.chuyenDen || 0) +
    " / " +
    (tk.chuyenDi || 0)
  );


  setText(
    "txtThuanLoi",
    data.thuanLoi || ""
  );

  setText(
    "txtKhoKhan",
    data.khoKhan || ""
  );


  renderHocSinhNhom8(
    data.dsHocSinh
  );

  renderBanCanSuNhom8(
    data.dsBanCanSu
  );

  renderHocSinhQuanTamNhom8(
    data.dsQuanTam
  );

  renderTraoDoiPhuHuynhNhom8(
    data.dsTraoDoiPhuHuynh
  );

  renderNhanXetThangNhom8(
    data.dsNhanXetThang
  );

}


function renderHocSinhNhom8(ds) {

  const tbody =
    document.getElementById(
      "tbHocSinh"
    );

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    !ds.length
  ) {

    tbody.innerHTML =
      `<tr>
        <td colspan="7"
            style="text-align:center;">
          Chưa có dữ liệu học sinh
        </td>
      </tr>`;

    return;
  }


  tbody.innerHTML =
    ds.map(
      hs => `
        <tr>

          <td>
            ${escapeHtml(hs.stt)}
          </td>

          <td>
            ${escapeHtml(hs.hoTen)}
          </td>

          <td>
            ${escapeHtml(hs.ngaySinh)}
          </td>

          <td>
            ${escapeHtml(hs.gioiTinh)}
          </td>

          <td>
            ${escapeHtml(hs.danToc)}
          </td>

          <td>
            ${escapeHtml(hs.phuHuynhSDT)}
          </td>

          <td>
            ${escapeHtml(hs.ghiChu)}
          </td>

        </tr>
      `
    ).join("");

}


function renderBanCanSuNhom8(ds) {

  const tbody =
    document.getElementById(
      "tbBanCanSu"
    );

  if (!tbody) {
    return;
  }


  if (!Array.isArray(ds)) {
    return;
  }


  tbody.innerHTML =
    ds.map(
      (item, index) => `
        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            ${escapeHtml(
              item.chucVu
            )}
          </td>

          <td>
            ${escapeHtml(
              item.hoTen
            )}
          </td>

          <td>
            ${escapeHtml(
              item.nhiemVu
            )}
          </td>

        </tr>
      `
    ).join("");

}


function renderHocSinhQuanTamNhom8(
  ds
) {

  const tbody =
    document.getElementById(
      "tbHocSinhQuanTam"
    );

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    !ds.length
  ) {

    tbody.innerHTML =
      `<tr>
        <td colspan="5"
            style="text-align:center;">
          Chưa có dữ liệu
        </td>
      </tr>`;

    return;
  }


  tbody.innerHTML =
    ds.map(
      item => `
        <tr>

          <td>
            ${escapeHtml(
              item.stt
            )}
          </td>

          <td>
            ${escapeHtml(
              item.hoTen
            )}
          </td>

          <td>
            ${escapeHtml(
              item.bieuHien
            )}
          </td>

          <td>
            ${escapeHtml(
              item.bienPhap
            )}
          </td>

          <td>
            ${escapeHtml(
              item.ketQua
            )}
          </td>

        </tr>
      `
    ).join("");

}


function renderTraoDoiPhuHuynhNhom8(
  ds
) {

  const tbody =
    document.getElementById(
      "tbTraoDoiPhuHuynh"
    );

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    !ds.length
  ) {

    tbody.innerHTML =
      `<tr>
        <td colspan="5"
            style="text-align:center;">
          Chưa có dữ liệu
        </td>
      </tr>`;

    return;
  }


  tbody.innerHTML =
    ds.map(
      item => `
        <tr>

          <td>
            ${escapeHtml(
              item.ngay
            )}
          </td>

          <td>
            ${escapeHtml(
              item.hoTen
            )}
          </td>

          <td>
            ${escapeHtml(
              item.hinhThuc
            )}
          </td>

          <td>
            ${escapeHtml(
              item.noiDung
            )}
          </td>

          <td>
            ${escapeHtml(
              item.ketQua
            )}
          </td>

        </tr>
      `
    ).join("");

}


function renderNhanXetThangNhom8(
  ds
) {

  const tbody =
    document.getElementById(
      "tbThang"
    );

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    !ds.length
  ) {

    tbody.innerHTML =
      `<tr>
        <td colspan="4"
            style="text-align:center;">
          Chưa có dữ liệu
        </td>
      </tr>`;

    return;
  }


  tbody.innerHTML =
    ds.map(
      item => `
        <tr>

          <td>
            ${escapeHtml(
              item.thang
            )}
          </td>

          <td>
            ${escapeHtml(
              item.uuDiem
            )}
          </td>

          <td>
            ${escapeHtml(
              item.tonTai
            )}
          </td>

          <td>
            ${escapeHtml(
              item.bienPhap
            )}
          </td>

        </tr>
      `
    ).join("");

}


/* =========================================================
   13. DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    coreLog(
      "ThiDuaLop.js bắt đầu."
    );


    try {

      getAccountFromParent();

      renderAccountStatus();


      /*
       * Tab 1 chỉ khởi tạo nếu giao diện có
       * các phần tử tương ứng.
       */

      if (
        document.getElementById(
          "selectLop"
        )
      ) {

        await khoiTaoDuLieu();

      }


      /*
       * Tab 8
       */

      if (
        document.getElementById(
          "selectClass"
        )
      ) {

        await loadNhom8Permission();

      }


      /*
       * Tab 3
       */

      if (
        document.getElementById(
          "jSelectStudent"
        )
      ) {

        tab3CheckPermission();

        tab3SelectedClass =
          tab3GetCurrentClass();

      }


      /*
       * Gắn sự kiện Tab 3.
       */

      const studentSelect =
        document.getElementById(
          "jSelectStudent"
        );

      if (
        studentSelect &&
        studentSelect.dataset.bound !==
        "true"
      ) {

        studentSelect.addEventListener(
          "change",
          tab3StudentChanged
        );

        studentSelect.dataset.bound =
          "true";

      }


      /*
       * Gắn tính điểm Tab 2.
       */

      [
        "tdSDB",
        "tdCuocThi",
        "tdVeSinh",
        "tdCSVC",
        "tdXepXe",
        "tdQDKhac"
      ].forEach(
        id => {

          const el =
            document.getElementById(id);

          if (el) {

            el.addEventListener(
              "input",
              calculateTotalEmulation
            );

          }

        }
      );


      coreLog(
        "ThiDuaLop.js khởi động hoàn tất."
      );


    } catch (error) {

      console.error(
        "Lỗi khởi động ThiDuaLop:",
        error
      );

    }

  }
);
