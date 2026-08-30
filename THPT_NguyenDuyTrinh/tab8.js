/* =========================================================
   🟫 NHÓM 8 — 8.2
   LẤY VAI TRÒ + DANH SÁCH LỚP
========================================================= */

async function loadNhom8Permission() {

  if (!validateAccountNhom8()) {
    return;
  }


  const select =
    document.getElementById("selectClass");

  if (select) {

    select.innerHTML =
      `<option value="">⏳ Đang kiểm tra quyền...</option>`;

    select.disabled = true;
  }


  try {

    const url =
      API_URL +
      "?action=layDanhSachLop" +
      "&maTruong=" +
      encodeURIComponent(currentUser.maTruong) +
      "&maNhanSu=" +
      encodeURIComponent(currentUser.maNhanSu);


    const response =
      await fetch(url, {
        method: "GET",
        cache: "no-store"
      });


    if (!response.ok) {

      throw new Error(
        "HTTP " + response.status
      );
    }


    const result =
      await response.json();


    console.log(
      "NHÓM 8 — Kết quả quyền:",
      result
    );


    if (
      result.status !== "success"
    ) {

      throw new Error(
        result.message ||
        "API không trả dữ liệu quyền."
      );
    }


    /*
     * Lưu thông tin quyền.
     */

    currentUser.role =
      result.role || "";

    currentUser.isAdmin =
      result.isAdmin === true;


    /*
     * Danh sách lớp.
     */

    danhSachLopNhom8 =
      Array.isArray(result.danhSachLop)
        ? result.danhSachLop
        : [];


    /*
     * Hiển thị vai trò.
     */

    renderRoleNhom8();


    /*
     * Hiển thị danh sách lớp.
     */

    renderClassListNhom8();


  } catch (error) {

    console.error(
      "Lỗi loadNhom8Permission:",
      error
    );

    showNhom8Error(
      "Không thể kết nối API: " +
      error.message
    );
  }
}
/* =========================================================
   🟫 NHÓM 8 — 8.3
   HIỂN THỊ VAI TRÒ
========================================================= */

function renderRoleNhom8() {

  const roleDisplay =
    document.getElementById("roleDisplay");

  if (!roleDisplay) {
    return;
  }


  let roleText =
    currentUser.role || "Không xác định";


  if (currentUser.isAdmin) {

    roleText =
      "ADMIN";

  } else if (
    roleText.toUpperCase().includes("BGH")
  ) {

    roleText =
      "BGH";

  } else if (
    roleText.toUpperCase().includes("GVCN")
  ) {

    roleText =
      "GVCN";
  }


  roleDisplay.innerText =
    "👤 " + roleText;
}
/* =========================================================
   🟫 NHÓM 8 — 8.4
   HIỂN THỊ DANH SÁCH LỚP
========================================================= */

function renderClassListNhom8() {

  const select =
    document.getElementById("selectClass");

  if (!select) {
    return;
  }


  select.innerHTML = "";


  if (
    !danhSachLopNhom8 ||
    danhSachLopNhom8.length === 0
  ) {

    select.innerHTML =
      `<option value="">
        -- Chưa có lớp được phép xem --
      </option>`;

    select.disabled = true;

    return;
  }


  /*
   * GVCN
   *
   * API đã giới hạn danhSachLop.
   * HTML tiếp tục khóa select để tránh chọn nhầm.
   */

  if (!currentUser.isAdmin &&
      danhSachLopNhom8.length === 1) {

    const lop =
      danhSachLopNhom8[0];

    select.innerHTML =
      `<option value="${escapeHtml(lop)}">
        ${escapeHtml(lop)}
      </option>`;

    select.value = lop;

    select.disabled = true;

    lopDangXemNhom8 =
      lop;

    loadReportData();

    return;
  }


  /*
   * ADMIN / BGH
   */

  select.innerHTML =
    `<option value="">
      -- Chọn lớp xem báo cáo --
    </option>`;


  danhSachLopNhom8.forEach(function(lop) {

    const option =
      document.createElement("option");

    option.value =
      lop;

    option.textContent =
      lop;

    select.appendChild(option);

  });


  select.disabled = false;
}
/* =========================================================
   🟫 NHÓM 8 — 8.5
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";
  }


  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
/* =========================================================
   🟫 NHÓM 8 — 8.6
   TẢI DỮ LIỆU SỔ CHỦ NHIỆM
========================================================= */

async function loadReportData() {

  const select =
    document.getElementById("selectClass");

  if (!select) {
    return;
  }


  const selectedClass =
    String(select.value || "").trim();


  if (!selectedClass) {
    return;
  }


  /*
   * Không cho GVCN tự gửi lớp ngoài danh sách API cấp.
   */

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


  const lblClass =
    document.getElementById("lblClass");

  if (lblClass) {

    lblClass.innerText =
      selectedClass;
  }


  /*
   * Thông báo đang tải.
   */

  const tbodyHS =
    document.getElementById("tbHocSinh");

  if (tbodyHS) {

    tbodyHS.innerHTML = `
      <tr>
        <td colspan="7"
            class="text-center">
          ⏳ Đang tải dữ liệu học sinh...
        </td>
      </tr>
    `;
  }


  try {

    const url =
      API_URL +
      "?action=getSoChuNhiemData" +
      "&maTruong=" +
      encodeURIComponent(
        currentUser.maTruong
      ) +
      "&maNhanSu=" +
      encodeURIComponent(
        currentUser.maNhanSu
      ) +
      "&lop=" +
      encodeURIComponent(
        selectedClass
      );


    const response =
      await fetch(url, {
        method: "GET",
        cache: "no-store"
      });


    if (!response.ok) {

      throw new Error(
        "HTTP " + response.status
      );
    }


    const data =
      await response.json();


    console.log(
      "NHÓM 8 — Sổ chủ nhiệm:",
      data
    );


    if (
      data.status &&
      data.status !== "success"
    ) {

      throw new Error(
        data.message ||
        "API từ chối yêu cầu."
      );
    }


    renderSoChuNhiemData(data);


  } catch (error) {

    console.error(
      "Lỗi loadReportData:",
      error
    );


    if (tbodyHS) {

      tbodyHS.innerHTML = `
        <tr>
          <td colspan="7"
              class="text-center"
              style="color:#dc2626;">
            ❌ Không tải được dữ liệu:
            ${escapeHtml(error.message)}
          </td>
        </tr>
      `;
    }

  }
}
/* =========================================================
   🟫 NHÓM 8 — 8.7
   HIỂN THỊ TOÀN BỘ DỮ LIỆU SỔ CHỦ NHIỆM
========================================================= */

function renderSoChuNhiemData(data) {

  if (!data) {
    return;
  }


  /* =======================================================
     A — THÔNG TIN GVCN
  ======================================================= */

  if (data.teacherInfo) {

    const gv =
      data.teacherInfo;


    setText(
      "lblTeacher",
      gv.hoTen ||
      ".................................................."
    );

    setText(
      "lblSignTeacher",
      gv.hoTen || ""
    );

    setText(
      "gvHoTen",
      gv.hoTen ||
      ".................................................."
    );

    setText(
      "gvNgaySinh",
      gv.ngaySinh ||
      "..../..../........"
    );

    setText(
      "gvGioiTinh",
      gv.gioiTinh ||
      "........"
    );

    setText(
      "gvDanToc",
      gv.danToc ||
      "Kinh"
    );

    setText(
      "gvTrinhDo",
      gv.trinhDo ||
      ".................................................."
    );

    setText(
      "gvMonGiangDay",
      gv.monGiangDay ||
      "...................."
    );

    setText(
      "gvThamNien",
      gv.soNamCongTac ||
      "......"
    );

    setText(
      "gvDienThoai",
      gv.soDienThoai ||
      "........................"
    );

    setText(
      "gvEmail",
      gv.email ||
      ".................................................."
    );
  }



  /* =======================================================
     B — THỐNG KÊ LỚP
  ======================================================= */

  if (data.thongKeB) {

    const tk =
      data.thongKeB;


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
  }


  setText(
    "txtThuanLoi",
    data.thuanLoi ||
    "(Chưa cập nhật nội dung thuận lợi)"
  );

  setText(
    "txtKhoKhan",
    data.khoKhan ||
    "(Chưa cập nhật nội dung khó khăn)"
  );



  /* =======================================================
     C — DANH SÁCH HỌC SINH
  ======================================================= */

  renderHocSinhNhom8(
    data.dsHocSinh
  );



  /* =======================================================
     D — BAN CÁN SỰ
  ======================================================= */

  renderBanCanSuNhom8(
    data.dsBanCanSu
  );



  /* =======================================================
     E — CHỈ TIÊU
  ======================================================= */

  if (data.chiTieu) {

    setText(
      "ctDanhHieu",
      data.chiTieu.danhHieu ||
      "Lớp Tiên Tiến Xuất Sắc"
    );

    setText(
      "ctNeNep",
      data.chiTieu.neNep ||
      "Top 5 Toàn trường"
    );
  }



  /* =======================================================
     J — HỌC SINH CẦN QUAN TÂM
  ======================================================= */

  renderHocSinhQuanTamNhom8(
    data.dsQuanTam
  );



  /* =======================================================
     K — TRAO ĐỔI PHỤ HUYNH
  ======================================================= */

  renderTraoDoiPhuHuynhNhom8(
    data.dsTraoDoiPhuHuynh
  );



  /* =======================================================
     M — NHẬN XÉT THEO THÁNG
  ======================================================= */

  renderNhanXetThangNhom8(
    data.dsNhanXetThang
  );
}
/* =========================================================
   🟫 NHÓM 8 — 8.8
   DANH SÁCH HỌC SINH
========================================================= */

function renderHocSinhNhom8(ds) {

  const tbody =
    document.getElementById("tbHocSinh");

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    ds.length === 0
  ) {

    tbody.innerHTML = `
      <tr>
        <td colspan="7"
            class="text-center">
          Chưa có dữ liệu học sinh
        </td>
      </tr>
    `;

    return;
  }


  let html = "";


  ds.forEach(function(hs) {

    html += `
      <tr>

        <td class="text-center">
          ${escapeHtml(hs.stt)}
        </td>

        <td style="
          text-align:left;
          padding-left:8px;
        ">
          <b>${escapeHtml(hs.hoTen)}</b>
        </td>

        <td class="text-center">
          ${escapeHtml(hs.ngaySinh)}
        </td>

        <td class="text-center">
          ${escapeHtml(hs.gioiTinh)}
        </td>

        <td class="text-center">
          ${escapeHtml(hs.danToc)}
        </td>

        <td style="
          text-align:left;
          padding-left:8px;
        ">
          ${escapeHtml(hs.phuHuynhSDT)}
        </td>

        <td class="text-center">
          ${escapeHtml(hs.ghiChu)}
        </td>

      </tr>
    `;
  });


  tbody.innerHTML =
    html;
}


/* =========================================================
   D — BAN CÁN SỰ
========================================================= */

function renderBanCanSuNhom8(ds) {

  const tbody =
    document.getElementById("tbBanCanSu");

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    ds.length === 0
  ) {

    return;
  }


  let html = "";


  ds.forEach(function(bcs, index) {

    html += `
      <tr>

        <td class="text-center">
          ${index + 1}
        </td>

        <td style="
          text-align:left;
          padding-left:8px;
        ">
          <b>${escapeHtml(bcs.chucVu)}</b>
        </td>

        <td style="
          text-align:left;
          padding-left:8px;
        ">
          ${escapeHtml(bcs.hoTen)}
        </td>

        <td style="
          text-align:left;
          padding-left:8px;
        ">
          ${escapeHtml(bcs.nhiemVu)}
        </td>

      </tr>
    `;
  });


  tbody.innerHTML =
    html;
}
function renderHocSinhQuanTamNhom8(ds) {

  const tbody =
    document.getElementById(
      "tbHocSinhQuanTam"
    );

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    ds.length === 0
  ) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5"
            class="text-center"
            style="
              color:#666;
              font-style:italic;
              padding:10px;
            ">
          Chưa có dữ liệu theo dõi học sinh cần quan tâm
        </td>
      </tr>
    `;

    return;
  }


  let html = "";


  ds.forEach(function(item) {

    html += `
      <tr>

        <td class="text-center">
          ${escapeHtml(item.stt)}
        </td>

        <td>
          <b>${escapeHtml(item.hoTen)}</b>
        </td>

        <td>
          ${escapeHtml(item.bieuHien)}
        </td>

        <td>
          ${escapeHtml(item.bienPhap)}
        </td>

        <td>
          ${escapeHtml(item.ketQua)}
        </td>

      </tr>
    `;
  });


  tbody.innerHTML =
    html;
}
function renderTraoDoiPhuHuynhNhom8(ds) {

  const tbody =
    document.getElementById(
      "tbTraoDoiPhuHuynh"
    );

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    ds.length === 0
  ) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5"
            class="text-center">
          Chưa có nhật ký trao đổi phụ huynh
        </td>
      </tr>
    `;

    return;
  }


  let html = "";


  ds.forEach(function(item) {

    html += `
      <tr>

        <td class="text-center">
          ${escapeHtml(item.ngay)}
        </td>

        <td>
          ${escapeHtml(item.hoTen)}
        </td>

        <td class="text-center">
          ${escapeHtml(item.hinhThuc)}
        </td>

        <td>
          ${escapeHtml(item.noiDung)}
        </td>

        <td>
          ${escapeHtml(item.ketQua)}
        </td>

      </tr>
    `;
  });


  tbody.innerHTML =
    html;
}
function renderNhanXetThangNhom8(ds) {

  const tbody =
    document.getElementById("tbThang");

  if (!tbody) {
    return;
  }


  if (
    !Array.isArray(ds) ||
    ds.length === 0
  ) {

    tbody.innerHTML = `
      <tr>
        <td colspan="4"
            class="text-center"
            style="
              color:#666;
              font-style:italic;
              padding:10px;
            ">
          Chưa có dữ liệu nhận xét đánh giá tháng
        </td>
      </tr>
    `;

    return;
  }


  let html = "";


  ds.forEach(function(item) {

    html += `
      <tr>

        <td class="text-center">
          <b>${escapeHtml(item.thang)}</b>
        </td>

        <td>
          ${escapeHtml(item.uuDiem)}
        </td>

        <td>
          ${escapeHtml(item.tonTai)}
        </td>

        <td>
          ${escapeHtml(item.bienPhap)}
        </td>

      </tr>
    `;
  });


  tbody.innerHTML =
    html;
}
/* =========================================================
   🟫 NHÓM 8 — 8.12
   GÁN TEXT AN TOÀN
========================================================= */

function setText(id, value) {

  const el =
    document.getElementById(id);

  if (!el) {
    return;
  }

  el.innerText =
    value === null ||
    value === undefined
      ? ""
      : value;
}
/* =========================================================
   🟫 NHÓM 8 — 8.13
   KHỞI ĐỘNG SỔ CHỦ NHIỆM
========================================================= */

window.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "🟫 NHÓM 8 — Khởi động Sổ chủ nhiệm"
    );


    /*
     * 1. Nhận tài khoản từ trang cha
     */

    getAccountFromParent();


    /*
     * 2. Kiểm tra quyền
     * 3. Lấy danh sách lớp
     */

    loadNhom8Permission();

  }
);
