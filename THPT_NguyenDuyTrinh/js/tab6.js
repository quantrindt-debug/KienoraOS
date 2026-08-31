/* ==========================================================
   KienoraEdu - JS6
   TAB 6: QUẢN LÝ / THỐNG KÊ HỌC SINH

   HTML:
   #tabQuanLyThongKe

   Chức năng:
   1. Tải danh sách lớp
   2. Chọn lớp
   3. Xem năm học
   4. Tải danh sách học sinh
   5. Thống kê sĩ số
   6. Thống kê Nam / Nữ
   7. Thống kê hồ sơ đủ / thiếu
   8. Lọc theo giới tính
   9. Lọc theo tình trạng hồ sơ
  10. Tìm kiếm học sinh
  11. Xem chi tiết học sinh
  12. Làm mới
  13. Xuất danh sách

   Phân quyền:
   - GVCN
   - BGH
   - ADMIN
   - Các vai trò khác chỉ xem theo quyền backend.

   Lưu ý:
   JS6 KHÔNG tự sửa dữ liệu hồ sơ.
   Đây là module đọc / thống kê.
========================================================== */

(function () {

  "use strict";

  /* ========================================================
     1. VERSION
  ======================================================== */

  const JS6_VERSION = "1.0.0";


  /* ========================================================
     2. STATE
  ======================================================== */

  const state = {

    initialized: false,

    loading: false,

    currentClass: "",

    currentClassName: "",

    currentSchoolYear: "",

    students: [],

    filteredStudents: [],

    selectedStudent: null,

    classes: [],

    role: "",

    lastLoadedAt: null
  };


  /* ========================================================
     3. DOM HELPER
  ======================================================== */

  function el(id) {
    return document.getElementById(id);
  }


  function getValue(id) {

    const node = el(id);

    if (!node) {
      return "";
    }

    return String(
      node.value || ""
    ).trim();
  }


  function setValue(id, value) {

    const node = el(id);

    if (!node) {
      return;
    }

    node.value =
      value == null
        ? ""
        : String(value);
  }


  function setText(id, value) {

    const node = el(id);

    if (!node) {
      return;
    }

    node.textContent =
      value == null
        ? ""
        : String(value);
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


  /* ========================================================
     4. API
  ======================================================== */

  async function callPostApi(payload) {

    if (
      typeof postApi ===
      "function"
    ) {

      return await postApi(
        payload
      );
    }


    if (
      typeof API_URL ===
        "undefined" ||
      !API_URL
    ) {

      throw new Error(
        "Không tìm thấy API_URL."
      );
    }


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
              payload
            )
        }
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " +
        response.status
      );
    }


    return await response.json();
  }


  async function callGetApi(params) {

    if (
      typeof getApi ===
      "function"
    ) {

      return await getApi(
        params
      );
    }


    if (
      typeof API_URL ===
        "undefined" ||
      !API_URL
    ) {

      throw new Error(
        "Không tìm thấy API_URL."
      );
    }


    const query =
      new URLSearchParams(
        params
      ).toString();


    const response =
      await fetch(
        API_URL +
        "?" +
        query
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " +
        response.status
      );
    }


    return await response.json();
  }


  /* ========================================================
     5. USER / ROLE
  ======================================================== */

  function getCurrentUser() {

    if (
      typeof currentUser !==
        "undefined" &&
      currentUser
    ) {

      return String(
        currentUser
      ).trim();
    }


    return String(
      localStorage.getItem(
        "kienora_current_user"
      ) || ""
    ).trim();
  }


  function getCurrentRole() {

    if (
      typeof currentRole !==
        "undefined" &&
      currentRole
    ) {

      return String(
        currentRole
      ).trim();
    }


    return String(
      localStorage.getItem(
        "kienora_current_role"
      ) || ""
    ).trim();
  }


  /* ========================================================
     6. CHUẨN HÓA STUDENT
  ======================================================== */

  function normalizeStudent(
    raw
  ) {

    raw =
      raw || {};


    return {

      index:
        Number(
          raw.index ??
          raw.stt ??
          raw.STT ??
          0
        ) || 0,

      maHS:
        String(
          raw.maHS ??
          raw.MaHS ??
          raw.ma_hs ??
          raw.studentId ??
          raw.studentCode ??
          raw.id ??
          ""
        ).trim(),

      hoTen:
        String(
          raw.hoTen ??
          raw.HoTen ??
          raw.hoten ??
          raw.fullName ??
          raw.studentName ??
          raw.name ??
          raw.ten ??
          ""
        ).trim(),

      gioiTinh:
        String(
          raw.gioiTinh ??
          raw.GioiTinh ??
          raw.gender ??
          raw.Gender ??
          ""
        ).trim(),

      ngaySinh:
        String(
          raw.ngaySinh ??
          raw.NgaySinh ??
          raw.birthDate ??
          raw.BirthDate ??
          raw.dob ??
          ""
        ).trim(),

      lop:
        String(
          raw.lop ??
          raw.Lop ??
          raw.maLop ??
          raw.MaLop ??
          raw.classId ??
          raw.className ??
          raw.class ??
          ""
        ).trim(),

      trangThai:
        String(
          raw.trangThai ??
          raw.TrangThai ??
          raw.status ??
          raw.Status ??
          ""
        ).trim(),

      hoSoDayDu:
        normalizeBoolean(
          raw.hoSoDayDu ??
          raw.HoSoDayDu ??
          raw.profileComplete ??
          raw.dayDu
        ),

      duThongTin:
        normalizeBoolean(
          raw.duThongTin ??
          raw.DuThongTin ??
          raw.profileComplete ??
          raw.hoSoDayDu ??
          raw.dayDu
        ),

      email:
        String(
          raw.email ??
          raw.Email ??
          ""
        ).trim(),

      soDienThoai:
        String(
          raw.soDienThoai ??
          raw.SoDienThoai ??
          raw.phone ??
          raw.Phone ??
          ""
        ).trim(),

      diaChi:
        String(
          raw.diaChi ??
          raw.DiaChi ??
          raw.address ??
          raw.Address ??
          ""
        ).trim(),

      danToc:
        String(
          raw.danToc ??
          raw.DanToc ??
          ""
        ).trim(),

      tonGiao:
        String(
          raw.tonGiao ??
          raw.TonGiao ??
          ""
        ).trim(),

      ghiChu:
        String(
          raw.ghiChu ??
          raw.GhiChu ??
          raw.note ??
          ""
        ).trim(),

      raw:
        raw
    };
  }


  /* ========================================================
     7. BOOLEAN
  ======================================================== */

  function normalizeBoolean(
    value
  ) {

    if (
      value === true
    ) {
      return true;
    }


    if (
      value === false
    ) {
      return false;
    }


    const text =
      String(
        value == null
          ? ""
          : value
      )
        .trim()
        .toLowerCase();


    if (
      [
        "true",
        "1",
        "yes",
        "y",
        "có",
        "co",
        "đủ",
        "du",
        "daydu",
        "đầy đủ",
        "day du"
      ].includes(
        text
      )
    ) {

      return true;
    }


    return false;
  }


  /* ========================================================
     8. CLASS
  ======================================================== */

  function normalizeClass(
    raw
  ) {

    raw =
      raw || {};


    if (
      typeof raw ===
      "string"
    ) {

      return {

        value:
          raw,

        label:
          raw,

        name:
          raw
      };
    }


    return {

      value:
        String(
          raw.value ??
          raw.id ??
          raw.maLop ??
          raw.MaLop ??
          raw.lop ??
          ""
        ).trim(),

      label:
        String(
          raw.label ??
          raw.name ??
          raw.tenLop ??
          raw.TenLop ??
          raw.lop ??
          ""
        ).trim(),

      name:
        String(
          raw.name ??
          raw.tenLop ??
          raw.TenLop ??
          raw.lop ??
          ""
        ).trim()
    };
  }


  /* ========================================================
     9. PHÂN QUYỀN XEM
  ======================================================== */

  function canView() {

    const role =
      getCurrentRole();

    /*
      Backend vẫn phải kiểm tra.
      Frontend chỉ khóa giao diện.
    */

    return Boolean(
      role
    );
  }


  /* ========================================================
     10. LOAD CONTEXT
  ======================================================== */

  async function loadQLTKContext() {

    try {

      const result =
        await callPostApi({

          action:
            "get_qltk_context",

          username:
            getCurrentUser(),

          role:
            getCurrentRole()
        });


      if (
        result.status &&
        result.status !==
          "success"
      ) {

        throw new Error(
          result.message ||
          "Không tải được cấu hình."
        );
      }


      const data =
        result.data ||
        result;


      state.classes =
        Array.isArray(
          data.classes
        )
          ? data.classes.map(
              normalizeClass
            )
          : Array.isArray(
              result.classes
            )
              ? result.classes.map(
                  normalizeClass
                )
              : [];


      state.currentSchoolYear =
        String(
          data.namHoc ??
          data.schoolYear ??
          result.namHoc ??
          result.schoolYear ??
          ""
        ).trim();


      renderClassSelect();


      setValue(
        "qltkNamHoc",
        state.currentSchoolYear
      );


      return true;

    } catch (error) {

      console.error(
        "[JS6] loadQLTKContext:",
        error
      );

      setText(
        "qltkRoleStatus",
        "Không tải được cấu hình"
      );

      return false;
    }
  }


  /* ========================================================
     11. RENDER CLASS
  ======================================================== */

  function renderClassSelect() {

    const select =
      el("qltkSelectClass");

    if (!select) {
      return;
    }


    const old =
      select.value;


    select.innerHTML =
      `
      <option value="">
        -- Chọn lớp --
      </option>
      `;


    state.classes.forEach(
      function (item) {

        const value =
          item.value ||
          item.label;

        const label =
          item.label ||
          item.value;


        if (!value) {
          return;
        }


        const option =
          document.createElement(
            "option"
          );

        option.value =
          value;

        option.textContent =
          label;

        select.appendChild(
          option
        );
      }
    );


    if (old) {

      select.value =
        old;
    }
  }


  /* ========================================================
     12. CHỌN LỚP
  ======================================================== */

  window.onQLTKClassChange =
    async function () {

      state.currentClass =
        getValue(
          "qltkSelectClass"
        );


      const item =
        state.classes.find(
          function (item) {

            return (
              item.value ===
                state.currentClass ||
              item.label ===
                state.currentClass
            );
          }
        );


      state.currentClassName =
        item
          ? (
              item.label ||
              item.name
            )
          : state.currentClass;


      /*
        Reset số liệu trước khi tải.
      */

      resetQLTKView();


      setText(
        "qltkRoleStatus",
        (
          getCurrentRole() ||
          ""
        ) +
        (
          state.currentClassName
            ? " | " +
              state.currentClassName
            : ""
        )
      );
    };


  /* ========================================================
     13. TẢI DỮ LIỆU LỚP
  ======================================================== */

  window.loadQLTKClassData =
    async function () {

      if (
        !canView()
      ) {

        alert(
          "⛔ Bạn chưa đăng nhập hoặc không có quyền xem dữ liệu."
        );

        return;
      }


      const classId =
        getValue(
          "qltkSelectClass"
        );


      if (!classId) {

        alert(
          "Vui lòng chọn lớp."
        );

        return;
      }


      if (
        state.loading
      ) {
        return;
      }


      state.loading =
        true;


      try {

        setText(
          "qltkRoleStatus",
          "⏳ Đang tải dữ liệu..."
        );


        const result =
          await callPostApi({

            action:
              "get_qltk_class_data",

            username:
              getCurrentUser(),

            role:
              getCurrentRole(),

            maLop:
              classId,

            classId:
              classId,

            lop:
              classId,

            namHoc:
              getValue(
                "qltkNamHoc"
              )
          });


        if (
          result.status &&
          result.status !==
            "success"
        ) {

          throw new Error(
            result.message ||
            "Không tải được danh sách học sinh."
          );
        }


        const data =
          result.data ||
          result;


        /*
          Năm học.
        */

        state.currentSchoolYear =
          String(
            data.namHoc ??
            data.schoolYear ??
            getValue(
              "qltkNamHoc"
            ) ??
            ""
          ).trim();


        setValue(
          "qltkNamHoc",
          state.currentSchoolYear
        );


        /*
          Danh sách học sinh.
        */

        const rawStudents =
          Array.isArray(
            data.students
          )
            ? data.students
            : Array.isArray(
                result.students
              )
                ? result.students
                : [];


        state.students =
          rawStudents.map(
            normalizeStudent
          );


        state.filteredStudents =
          [
            ...state.students
          ];


        state.lastLoadedAt =
          new Date();


        /*
          Nếu backend trả sẵn
          thống kê thì dùng luôn.
        */

        renderQLTKSummary(
          data.summary
        );


        filterQLTKStudents();


        setText(
          "qltkRoleStatus",
          (
            getCurrentRole() ||
            ""
          ) +
          " | " +
          (
            state.currentClassName ||
            classId
          ) +
          " | " +
          (
            state.students.length
          ) +
          " học sinh"
        );


      } catch (error) {

        console.error(
          "[JS6] loadQLTKClassData:",
          error
        );


        state.students =
          [];

        state.filteredStudents =
          [];


        renderQLTKSummary();


        renderStudentTable();


        setText(
          "qltkRoleStatus",
          "❌ Không tải được dữ liệu"
        );


        alert(
          "❌ Không thể tải dữ liệu lớp.\n\n" +
          (
            error.message ||
            "Lỗi không xác định."
          )
        );


      } finally {

        state.loading =
          false;
      }
    };


  /* ========================================================
     14. TÍNH THỐNG KÊ
  ======================================================== */

  function calculateSummary() {

    const list =
      Array.isArray(
        state.students
      )
        ? state.students
        : [];


    const total =
      list.length;


    const male =
      list.filter(
        function (student) {

          return normalizeGender(
            student.gioiTinh
          ) === "Nam";
        }
      ).length;


    const female =
      list.filter(
        function (student) {

          return normalizeGender(
            student.gioiTinh
          ) === "Nữ";
        }
      ).length;


    const complete =
      list.filter(
        function (student) {

          return isProfileComplete(
            student
          );
        }
      ).length;


    const incomplete =
      total -
      complete;


    return {

      total:
        total,

      male:
        male,

      female:
        female,

      complete:
        complete,

      incomplete:
        incomplete
    };
  }


  /* ========================================================
     15. CHUẨN HÓA GIỚI TÍNH
  ======================================================== */

  function normalizeGender(
    value
  ) {

    const text =
      String(
        value || ""
      )
        .trim()
        .toLowerCase();


    if (
      [
        "nam",
        "male",
        "m"
      ].includes(
        text
      )
    ) {

      return "Nam";
    }


    if (
      [
        "nữ",
        "nu",
        "female",
        "f"
      ].includes(
        text
      )
    ) {

      return "Nữ";
    }


    return text
      ? String(value).trim()
      : "";
  }


  /* ========================================================
     16. KIỂM TRA HỒ SƠ
     
     Ưu tiên giá trị backend trả về.
     Nếu backend chưa trả cờ hoàn chỉnh,
     kiểm tra một số trường cơ bản.
  ======================================================== */

  function isProfileComplete(
    student
  ) {

    if (
      student.hoSoDayDu === true ||
      student.duThongTin === true
    ) {
      return true;
    }


    if (
      student.hoSoDayDu === false ||
      student.duThongTin === false
    ) {
      return false;
    }


    /*
      Không tự quy định danh sách
      hồ sơ bắt buộc.
      Chỉ dùng kiểm tra fallback.
    */

    const requiredFields = [

      student.maHS,

      student.hoTen,

      student.gioiTinh,

      student.ngaySinh
    ];


    return requiredFields.every(
      function (value) {

        return String(
          value || ""
        ).trim() !== "";
      }
    );
  }


  /* ========================================================
     17. RENDER SUMMARY
  ======================================================== */

  function renderQLTKSummary(
    serverSummary
  ) {

    let summary;


    if (
      serverSummary
    ) {

      summary = {

        total:
          Number(
            serverSummary.total ??
            serverSummary.siSo ??
            serverSummary.SiSo ??
            0
          ) || 0,

        male:
          Number(
            serverSummary.male ??
            serverSummary.nam ??
            serverSummary.Nam ??
            0
          ) || 0,

        female:
          Number(
            serverSummary.female ??
            serverSummary.nu ??
            serverSummary.Nu ??
            0
          ) || 0,

        complete:
          Number(
            serverSummary.complete ??
            serverSummary.duThongTin ??
            serverSummary.dayDu ??
            0
          ) || 0,

        incomplete:
          Number(
            serverSummary.incomplete ??
            serverSummary.thieuThongTin ??
            serverSummary.thieu ??
            0
          ) || 0
      };

    } else {

      summary =
        calculateSummary();
    }


    setText(
      "qltkSiSo",
      summary.total
    );


    setText(
      "qltkNam",
      summary.male
    );


    setText(
      "qltkNu",
      summary.female
    );


    setText(
      "qltkDuThongTin",
      summary.complete
    );


    setText(
      "qltkThieuThongTin",
      summary.incomplete
    );
  }


  /* ========================================================
     18. FILTER
  ======================================================== */

  window.filterQLTKStudents =
    function () {

      const gender =
        getValue(
          "qltkFilterGender"
        );


      const profile =
        getValue(
          "qltkFilterProfile"
        );


      const keyword =
        normalizeText(
          getValue(
            "qltkSearchStudent"
          )
        );


      state.filteredStudents =
        state.students.filter(
          function (student) {

            /*
              Giới tính
            */

            if (
              gender
            ) {

              if (
                normalizeGender(
                  student.gioiTinh
                ) !==
                gender
              ) {

                return false;
              }
            }


            /*
              Hồ sơ
            */

            const complete =
              isProfileComplete(
                student
              );


            if (
              profile ===
              "daydu" &&
              !complete
            ) {

              return false;
            }


            if (
              profile ===
              "thieu" &&
              complete
            ) {

              return false;
            }


            /*
              Tìm kiếm
            */

            if (
              keyword
            ) {

              const haystack =
                normalizeText(
                  [
                    student.maHS,

                    student.hoTen,

                    student.gioiTinh,

                    student.ngaySinh,

                    student.lop,

                    student.trangThai
                  ]
                    .join(" ")
                );


              if (
                !haystack.includes(
                  keyword
                )
              ) {

                return false;
              }
            }


            return true;
          }
        );


      renderStudentTable();


      updateStudentCount();
    };


  /* ========================================================
     19. NORMALIZE SEARCH
  ======================================================== */

  function normalizeText(
    value
  ) {

    return String(
      value || ""
    )
      .toLowerCase()
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /đ/g,
        "d"
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }


  /* ========================================================
     20. RENDER TABLE
  ======================================================== */

  function renderStudentTable() {

    const tbody =
      el(
        "qltkStudentTableBody"
      );


    if (!tbody) {
      return;
    }


    const list =
      state.filteredStudents;


    if (
      !list.length
    ) {

      tbody.innerHTML =
        `
        <tr>

          <td
            colspan="7"
            style="
              text-align:center;
              padding:30px;
              color:#94a3b8;
            "
          >
            Không tìm thấy học sinh phù hợp.
          </td>

        </tr>
        `;

      return;
    }


    let html =
      "";


    list.forEach(
      function (
        student,
        index
      ) {

        const complete =
          isProfileComplete(
            student
          );


        const statusText =
          complete
            ? "Đủ thông tin"
            : "Thiếu thông tin";


        const statusColor =
          complete
            ? "#166534"
            : "#b91c1c";


        const statusBackground =
          complete
            ? "#dcfce7"
            : "#fee2e2";


        html +=
          `
          <tr
            style="
              border-bottom:
                1px solid #e2e8f0;
            "
          >

            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${index + 1}
            </td>


            <td
              style="
                padding:9px;
                text-align:left;
              "
            >
              ${escapeHtml(
                student.maHS ||
                ""
              )}
            </td>


            <td
              style="
                padding:9px;
                text-align:left;
                font-weight:bold;
              "
            >
              ${escapeHtml(
                student.hoTen ||
                ""
              )}
            </td>


            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${escapeHtml(
                normalizeGender(
                  student.gioiTinh
                ) ||
                "--"
              )}
            </td>


            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${escapeHtml(
                formatDate(
                  student.ngaySinh
                )
              )}
            </td>


            <td
              style="
                padding:9px;
                text-align:center;
              "
            >

              <span
                style="
                  display:inline-block;
                  padding:4px 8px;
                  border-radius:12px;
                  background:
                    ${statusBackground};
                  color:
                    ${statusColor};
                  font-size:11px;
                  font-weight:bold;
                "
              >
                ${statusText}
              </span>

            </td>


            <td
              style="
                padding:9px;
                text-align:center;
              "
            >

              <button
                type="button"
                onclick="showQLTKStudentDetail(${index})"
                style="
                  padding:6px 10px;
                  border:1px solid #cbd5e1;
                  border-radius:5px;
                  background:#fff;
                  color:#2563eb;
                  cursor:pointer;
                  font-weight:bold;
                  font-size:12px;
                "
              >
                👁️ Xem
              </button>

            </td>

          </tr>
          `;
      }
    );


    tbody.innerHTML =
      html;
  }


  /* ========================================================
     21. COUNT
  ======================================================== */

  function updateStudentCount() {

    setText(
      "qltkStudentCount",
      state.filteredStudents.length +
      " học sinh"
    );
  }


  /* ========================================================
     22. FORMAT DATE
  ======================================================== */

  function formatDate(
    value
  ) {

    if (!value) {
      return "";
    }


    const text =
      String(value)
        .trim();


    if (
      /^\d{4}-\d{2}-\d{2}$/
        .test(text)
    ) {

      const parts =
        text.split("-");


      return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
      );
    }


    return text;
  }


  /* ========================================================
     23. XEM CHI TIẾT
  ======================================================== */

  window.showQLTKStudentDetail =
    function (index) {

      const student =
        state.filteredStudents[
          index
        ];


      if (!student) {
        return;
      }


      state.selectedStudent =
        student;


      const box =
        el(
          "qltkStudentDetail"
        );


      const content =
        el(
          "qltkStudentDetailContent"
        );


      if (
        !box ||
        !content
      ) {

        return;
      }


      const complete =
        isProfileComplete(
          student
        );


      const fields = [

        [
          "Mã học sinh",
          student.maHS
        ],

        [
          "Họ và tên",
          student.hoTen
        ],

        [
          "Lớp",
          student.lop ||
          state.currentClassName
        ],

        [
          "Giới tính",
          normalizeGender(
            student.gioiTinh
          )
        ],

        [
          "Ngày sinh",
          formatDate(
            student.ngaySinh
          )
        ],

        [
          "Email",
          student.email
        ],

        [
          "Số điện thoại",
          student.soDienThoai
        ],

        [
          "Địa chỉ",
          student.diaChi
        ],

        [
          "Dân tộc",
          student.danToc
        ],

        [
          "Tôn giáo",
          student.tonGiao
        ],

        [
          "Trạng thái",
          student.trangThai
        ],

        [
          "Tình trạng hồ sơ",
          complete
            ? "Đủ thông tin"
            : "Thiếu thông tin"
        ],

        [
          "Ghi chú",
          student.ghiChu
        ]
      ];


      let html =
        "";


      fields.forEach(
        function (
          pair
        ) {

          html +=
            `
            <div
              style="
                padding:12px;
                background:#f8fafc;
                border:
                  1px solid #e2e8f0;
                border-radius:6px;
              "
            >

              <div
                style="
                  font-size:11px;
                  color:#64748b;
                  margin-bottom:4px;
                  font-weight:bold;
                "
              >
                ${escapeHtml(
                  pair[0]
                )}
              </div>

              <div
                style="
                  font-size:13px;
                  color:#1e293b;
                  font-weight:600;
                  white-space:
                    pre-wrap;
                  word-break:
                    break-word;
                "
              >
                ${escapeHtml(
                  pair[1] ||
                  "--"
                )}
              </div>

            </div>
            `;
        }
      );


      content.innerHTML =
        html;


      box.style.display =
        "block";


      box.scrollIntoView({
        behavior:
          "smooth",
        block:
          "nearest"
      });
    };


  /* ========================================================
     24. ĐÓNG CHI TIẾT
  ======================================================== */

  window.closeQLTKStudentDetail =
    function () {

      const box =
        el(
          "qltkStudentDetail"
        );


      if (box) {

        box.style.display =
          "none";
      }


      state.selectedStudent =
        null;
    };


  /* ========================================================
     25. RESET FILTER
  ======================================================== */

  window.resetQLTKFilter =
    function () {

      setValue(
        "qltkFilterGender",
        ""
      );


      setValue(
        "qltkFilterProfile",
        ""
      );


      setValue(
        "qltkSearchStudent",
        ""
      );


      state.filteredStudents =
        [
          ...state.students
        ];


      renderStudentTable();
      updateStudentCount();


      const detail =
        el(
          "qltkStudentDetail"
        );


      if (detail) {

        detail.style.display =
          "none";
      }
    };


  /* ========================================================
     26. RESET VIEW
  ======================================================== */

  function resetQLTKView() {

    state.students =
      [];

    state.filteredStudents =
      [];

    state.selectedStudent =
      null;


    setText(
      "qltkSiSo",
      "0"
    );

    setText(
      "qltkNam",
      "0"
    );

    setText(
      "qltkNu",
      "0"
    );

    setText(
      "qltkDuThongTin",
      "0"
    );

    setText(
      "qltkThieuThongTin",
      "0"
    );

    setText(
      "qltkStudentCount",
      "0 học sinh"
    );


    const detail =
      el(
        "qltkStudentDetail"
      );


    if (detail) {

      detail.style.display =
        "none";
    }


    renderStudentTable();
  }


  /* ========================================================
     27. EXPORT EXCEL
  ======================================================== */

  window.exportQLTKStudents =
    function () {

      if (
        !state.students.length
      ) {

        alert(
          "Không có dữ liệu học sinh để xuất."
        );

        return;
      }


      /*
        Ưu tiên SheetJS nếu đã được
        index.html tải.
      */

      if (
        typeof XLSX !==
        "undefined"
      ) {

        exportWithXLSX();

        return;
      }


      /*
        Fallback CSV.
      */

      exportCSV();
    };


  /* ========================================================
     28. EXPORT XLSX
  ======================================================== */

  function exportWithXLSX() {

    const rows =
      state.filteredStudents.map(
        function (
          student,
          index
        ) {

          return {

            "STT":
              index + 1,

            "Mã HS":
              student.maHS,

            "Họ và tên":
              student.hoTen,

            "Giới tính":
              normalizeGender(
                student.gioiTinh
              ),

            "Ngày sinh":
              formatDate(
                student.ngaySinh
              ),

            "Lớp":
              student.lop ||
              state.currentClassName,

            "Tình trạng hồ sơ":
              isProfileComplete(
                student
              )
                ? "Đủ thông tin"
                : "Thiếu thông tin",

            "Email":
              student.email,

            "Số điện thoại":
              student.soDienThoai,

            "Địa chỉ":
              student.diaChi,

            "Dân tộc":
              student.danToc,

            "Tôn giáo":
              student.tonGiao,

            "Ghi chú":
              student.ghiChu
          };
        }
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );


    worksheet["!cols"] = [

      {
        wch: 6
      },

      {
        wch: 15
      },

      {
        wch: 28
      },

      {
        wch: 12
      },

      {
        wch: 14
      },

      {
        wch: 12
      },

      {
        wch: 20
      },

      {
        wch: 28
      },

      {
        wch: 18
      },

      {
        wch: 35
      },

      {
        wch: 15
      },

      {
        wch: 15
      },

      {
        wch: 40
      }
    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "DanhSachHocSinh"
    );


    const fileName =
      "KienoraEdu_" +
      "DanhSachHocSinh_" +
      (
        state.currentClassName ||
        state.currentClass ||
        "Lop"
      ) +
      "_" +
      (
        state.currentSchoolYear ||
        ""
      ) +
      ".xlsx";


    XLSX.writeFile(
      workbook,
      fileName
    );
  }


  /* ========================================================
     29. EXPORT CSV FALLBACK
  ======================================================== */

  function exportCSV() {

    const headers = [

      "STT",

      "Mã HS",

      "Họ và tên",

      "Giới tính",

      "Ngày sinh",

      "Lớp",

      "Tình trạng hồ sơ",

      "Email",

      "Số điện thoại",

      "Địa chỉ",

      "Dân tộc",

      "Tôn giáo",

      "Ghi chú"
    ];


    const rows =
      state.filteredStudents.map(
        function (
          student,
          index
        ) {

          return [

            index + 1,

            student.maHS,

            student.hoTen,

            normalizeGender(
              student.gioiTinh
            ),

            formatDate(
              student.ngaySinh
            ),

            student.lop ||
            state.currentClassName,

            isProfileComplete(
              student
            )
              ? "Đủ thông tin"
              : "Thiếu thông tin",

            student.email,

            student.soDienThoai,

            student.diaChi,

            student.danToc,

            student.tonGiao,

            student.ghiChu
          ];
        }
      );


    const csv =
      [
        headers,
        ...rows
      ]
        .map(
          function (row) {

            return row
              .map(
                function (value) {

                  return (
                    '"' +
                    String(
                      value == null
                        ? ""
                        : value
                    )
                      .replace(
                        /"/g,
                        '""'
                      ) +
                    '"'
                  );
                }
              )
              .join(",");
          }
        )
        .join("\n");


    const blob =
      new Blob(
        [
          "\uFEFF" +
          csv
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      "KienoraEdu_" +
      "DanhSachHocSinh_" +
      (
        state.currentClassName ||
        state.currentClass ||
        "Lop"
      ) +
      ".csv";


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );
  }


  /* ========================================================
     30. LOAD ROLE DISPLAY
  ======================================================== */

  function updateRoleDisplay() {

    state.role =
      getCurrentRole();


    const roleNode =
      el(
        "qltkRoleStatus"
      );


    if (!roleNode) {
      return;
    }


    let roleName =
      state.role ||
      "Chưa xác định";


    const roleMap = {

      GVCN:
        "Giáo viên chủ nhiệm",

      BGH:
        "Ban Giám hiệu",

      ADMIN:
        "Quản trị hệ thống",

      admin:
        "Quản trị hệ thống",

      CO_DO:
        "Cờ đỏ",

      BTD:
        "Bí thư Đoàn"
    };


    if (
      roleMap[
        state.role
      ]
    ) {

      roleName =
        roleMap[
          state.role
        ];
    }


    roleNode.textContent =
      roleName;
  }


  /* ========================================================
     31. EVENT BINDING
  ======================================================== */

  function bindEvents() {

    const search =
      el(
        "qltkSearchStudent"
      );


    if (
      search &&
      !search.dataset.js6Bound
    ) {

      search.dataset.js6Bound =
        "1";


      search.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key ===
            "Enter"
          ) {

            event.preventDefault();

            filterQLTKStudents();
          }
        }
      );
    }


    const gender =
      el(
        "qltkFilterGender"
      );


    if (
      gender &&
      !gender.dataset.js6Bound
    ) {

      gender.dataset.js6Bound =
        "1";


      gender.addEventListener(
        "change",
        function () {

          filterQLTKStudents();
        }
      );
    }


    const profile =
      el(
        "qltkFilterProfile"
      );


    if (
      profile &&
      !profile.dataset.js6Bound
    ) {

      profile.dataset.js6Bound =
        "1";


      profile.addEventListener(
        "change",
        function () {

          filterQLTKStudents();
        }
      );
    }
  }


  /* ========================================================
     32. INIT TAB 6
  ======================================================== */

  async function initTabQuanLyThongKe() {

    const tab =
      el(
        "tabQuanLyThongKe"
      );


    if (!tab) {
      return;
    }


    if (
      state.initialized
    ) {
      return;
    }


    state.initialized =
      true;


    state.role =
      getCurrentRole();


    updateRoleDisplay();


    if (
      !canView()
    ) {

      setText(
        "qltkRoleStatus",
        "⛔ Chưa đăng nhập"
      );


      return;
    }


    bindEvents();


    await loadQLTKContext();


    renderStudentTable();


    updateStudentCount();
  }


  /* ========================================================
     33. PUBLIC ALIAS
  ======================================================== */

  window.initTabQuanLyThongKe =
    initTabQuanLyThongKe;


  window.initTab6 =
    initTabQuanLyThongKe;


  window.loadTab6 =
    initTabQuanLyThongKe;


  /* ========================================================
     34. DOM READY
  ======================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      initTabQuanLyThongKe()
        .catch(
          function (error) {

            console.error(
              "[JS6] init:",
              error
            );
          }
        );
    }
  );


  /* ========================================================
     35. DEBUG
  ======================================================== */

  window.KienoraEduQLTK = {

    version:
      JS6_VERSION,

    state:
      state,

    reloadContext:
      loadQLTKContext,

    load:
      loadQLTKClassData,

    filter:
      filterQLTKStudents,

    export:
      exportQLTKStudents
  };


})();
