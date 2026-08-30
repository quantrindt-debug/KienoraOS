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
