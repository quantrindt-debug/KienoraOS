/* ==========================================================
   KienoraEdu - JS5
   TAB 5: ĐOÀN TRƯỜNG - THI ĐUA CUỐI TUẦN

   HTML:
   #tabDoanTruong

   Chức năng:
   1. Chọn tuần
   2. Chọn học kỳ
   3. Chọn lớp
   4. Tải dữ liệu tuần
   5. Tổng hợp dữ liệu từ Cờ đỏ
   6. Nhập / điều chỉnh điểm cuối tuần
   7. Tự tính tổng điểm
   8. Xếp hạng
   9. Xếp loại
  10. Lưu điểm
  11. Khóa tuần
  12. Phân quyền

   ROLE:
   BTD
   BGH
   admin

   CO_DO:
   Có thể xem dữ liệu được phép,
   nhưng không có quyền chốt điểm cuối tuần.
========================================================== */

(function () {

  "use strict";

  /* ========================================================
     1. VERSION
  ======================================================== */

  const JS5_VERSION = "1.0.0";


  /* ========================================================
     2. ROLE
  ======================================================== */

  const ROLE_CO_DO = "CO_DO";
  const ROLE_BTD   = "BTD";
  const ROLE_BGH   = "BGH";
  const ROLE_ADMIN = "admin";


  /* ========================================================
     3. TRỌNG SỐ THI ĐUA
     
     Theo giao diện Tab 4:
       Sổ đầu bài     x3
       Các cuộc thi   x1
       Vệ sinh        x1
       CSVC           x1
       Xếp xe         x1
       Quy định khác  x3

     Có thể thay đổi tại đây nếu quy chế
     của trường sử dụng trọng số khác.
  ======================================================== */

  const SCORE_WEIGHT = {

    veSinh: 1,

    csvc: 1,

    xe: 1,

    cuocThi: 1,

    qdKhac: 3,

    sdb: 3
  };


  /* ========================================================
     4. STATE
  ======================================================== */

  const state = {

    initialized: false,

    loading: false,

    currentWeek: "",

    currentHocKy: "",

    currentClass: "",

    currentClassName: "",

    weeks: [],

    classes: [],

    weeklyRows: [],

    score: {

      veSinh: 0,

      csvc: 0,

      xe: 0,

      cuocThi: 0,

      qdKhac: 0,

      sdb: 0,

      total: 0

    },

    rank: null,

    classification: "",

    note: "",

    locked: false,

    dataLoaded: false
  };


  /* ========================================================
     5. DOM
  ======================================================== */

  function el(id) {

    return document.getElementById(id);
  }


  function getValue(id) {

    const node =
      el(id);

    if (!node) {
      return "";
    }

    return String(
      node.value || ""
    ).trim();
  }


  function setValue(
    id,
    value
  ) {

    const node =
      el(id);

    if (!node) {
      return;
    }

    node.value =
      value == null
        ? ""
        : String(value);
  }


  function setText(
    id,
    value
  ) {

    const node =
      el(id);

    if (!node) {
      return;
    }

    node.textContent =
      value == null
        ? ""
        : String(value);
  }


  function escapeHtml(
    value
  ) {

    return String(
      value == null
        ? ""
        : value
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }


  /* ========================================================
     6. API
  ======================================================== */

  async function callPostApi(
    payload
  ) {

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


  async function callGetApi(
    params
  ) {

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
     7. USER / ROLE
  ======================================================== */

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


  /* ========================================================
     8. PHÂN QUYỀN TAB 5
  ======================================================== */

  function canView() {

    return [
      ROLE_CO_DO,
      ROLE_BTD,
      ROLE_BGH,
      ROLE_ADMIN
    ].includes(
      getCurrentRole()
    );
  }


  function canEditScore() {

    return [
      ROLE_BTD,
      ROLE_BGH,
      ROLE_ADMIN
    ].includes(
      getCurrentRole()
    );
  }


  function canLock() {

    return [
      ROLE_BGH,
      ROLE_ADMIN
    ].includes(
      getCurrentRole()
    );
  }


  /* ========================================================
     9. STATUS
  ======================================================== */

  function setStatus(
    message,
    type
  ) {

    const node =
      el("doanTuanStatus");

    if (!node) {
      return;
    }


    node.textContent =
      message || "";


    if (
      type === "success"
    ) {

      node.style.background =
        "#dcfce7";

      node.style.color =
        "#166534";

    }
    else if (
      type === "warning"
    ) {

      node.style.background =
        "#fef3c7";

      node.style.color =
        "#92400e";

    }
    else if (
      type === "danger"
    ) {

      node.style.background =
        "#fee2e2";

      node.style.color =
        "#991b1b";

    }
    else {

      node.style.background =
        "#f1f5f9";

      node.style.color =
        "#475569";
    }
  }


  /* ========================================================
     10. CHUẨN HÓA TUẦN
  ======================================================== */

  function normalizeWeek(
    raw
  ) {

    raw =
      raw || {};


    if (
      typeof raw ===
        "string" ||
      typeof raw ===
        "number"
    ) {

      return {

        value:
          String(raw),

        label:
          "Tuần " +
          String(raw),

        weekNumber:
          Number(raw) || 0,

        hocKy:
          ""
      };
    }


    return {

      value:
        String(
          raw.value ??
          raw.id ??
          raw.week ??
          raw.weekNumber ??
          raw.tuan ??
          ""
        ).trim(),

      label:
        String(
          raw.label ??
          raw.name ??
          raw.tenTuan ??
          (
            raw.weekNumber
              ? "Tuần " +
                raw.weekNumber
              : "Tuần"
          )
        ).trim(),

      weekNumber:
        Number(
          raw.weekNumber ??
          raw.tuan ??
          raw.week ??
          0
        ) || 0,

      hocKy:
        String(
          raw.hocKy ??
          raw.semester ??
          ""
        ).trim()
    };
  }


  /* ========================================================
     11. CHUẨN HÓA LỚP
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
     12. CHUẨN HÓA DÒNG THEO DÕI
  ======================================================== */

  function normalizeWeeklyRow(
    raw
  ) {

    raw =
      raw || {};


    return {

      ngay:
        String(
          raw.ngay ??
          raw.date ??
          raw.Ngay ??
          ""
        ).trim(),

      veSinh:
        Number(
          raw.veSinh ??
          raw.VeSinh ??
          raw.diemVeSinh ??
          raw.scoreVeSinh ??
          0
        ) || 0,

      csvc:
        Number(
          raw.csvc ??
          raw.CSVC ??
          raw.diemCSVC ??
          raw.scoreCSVC ??
          0
        ) || 0,

      xe:
        Number(
          raw.xe ??
          raw.Xe ??
          raw.xepXe ??
          raw.diemXe ??
          0
        ) || 0,

      cuocThi:
        Number(
          raw.cuocThi ??
          raw.CuocThi ??
          raw.diemCuocThi ??
          raw.scoreCuocThi ??
          0
        ) || 0,

      qdKhac:
        Number(
          raw.qdKhac ??
          raw.QDKhac ??
          raw.quyDinhKhac ??
          raw.diemQDKhac ??
          0
        ) || 0,

      sdb:
        Number(
          raw.sdb ??
          raw.SDB ??
          raw.soDauBai ??
          raw.diemSDB ??
          0
        ) || 0,

      diemNgay:
        Number(
          raw.diemNgay ??
          raw.total ??
          raw.tongDiem ??
          0
        ) || 0
    };
  }


  /* ========================================================
     13. TẢI CONTEXT
  ======================================================== */

  async function loadDoanContext() {

    try {

      const result =
        await callPostApi({

          action:
            "get_doan_context",

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


      state.weeks =
        Array.isArray(
          data.weeks
        )
          ? data.weeks.map(
              normalizeWeek
            )
          : [];


      state.classes =
        Array.isArray(
          data.classes
        )
          ? data.classes.map(
              normalizeClass
            )
          : [];


      renderWeekSelect();
      renderHocKySelect();
      renderClassSelect();


      return true;

    } catch (error) {

      console.error(
        "[JS5] loadDoanContext:",
        error
      );

      setStatus(
        "Không tải được cấu hình Đoàn trường.",
        "danger"
      );

      return false;
    }
  }


  /* ========================================================
     14. RENDER TUẦN
  ======================================================== */

  function renderWeekSelect() {

    const select =
      el("doanSelectWeek");

    if (!select) {
      return;
    }


    const old =
      select.value;


    select.innerHTML =
      `
      <option value="">
        -- Chọn tuần --
      </option>
      `;


    state.weeks.forEach(
      function (week) {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          week.value;

        option.textContent =
          week.label;

        option.dataset.hocKy =
          week.hocKy || "";

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
     15. RENDER HỌC KỲ
  ======================================================== */

  function renderHocKySelect() {

    const select =
      el("doanSelectHocKy");

    if (!select) {
      return;
    }


    /*
      Giữ nguyên 2 học kỳ
      như giao diện HTML hiện tại.
    */

    if (
      select.value
    ) {
      state.currentHocKy =
        select.value;
    }
  }


  /* ========================================================
     16. RENDER LỚP
  ======================================================== */

  function renderClassSelect() {

    const select =
      el("doanSelectClass");

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
     17. CHỌN TUẦN
  ======================================================== */

  window.onDoanWeekChange =
    async function () {

      state.currentWeek =
        getValue(
          "doanSelectWeek"
        );


      const selected =
        state.weeks.find(
          function (week) {

            return (
              week.value ===
              state.currentWeek
            );
          }
        );


      /*
        Nếu tuần đã có thông tin
        học kỳ thì tự điền.
      */

      if (
        selected &&
        selected.hocKy &&
        !getValue(
          "doanSelectHocKy"
        )
      ) {

        setValue(
          "doanSelectHocKy",
          selected.hocKy
        );

        state.currentHocKy =
          selected.hocKy;
      }


      setStatus(
        state.currentWeek
          ? "Đã chọn " +
            (
              selected?.label ||
              "tuần"
            )
          : "Chưa chọn tuần",
        state.currentWeek
          ? "success"
          : "warning"
      );


      if (
        state.currentClass
      ) {

        await loadDoanWeeklyData();
      }
    };


  /* ========================================================
     18. CHỌN LỚP
  ======================================================== */

  window.onDoanClassChange =
    async function () {

      state.currentClass =
        getValue(
          "doanSelectClass"
        );


      const selected =
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
        selected
          ? (
              selected.label ||
              selected.name
            )
          : state.currentClass;


      setText(
        "doanSummaryClass",
        state.currentClassName ||
          "--"
      );


      if (
        state.currentWeek
      ) {

        await loadDoanWeeklyData();
      }
    };


  /* ========================================================
     19. CHỌN HỌC KỲ
  ======================================================== */

  const hocKySelect =
    el("doanSelectHocKy");


  if (hocKySelect) {

    hocKySelect.addEventListener(
      "change",
      function () {

        state.currentHocKy =
          getValue(
            "doanSelectHocKy"
          );
      }
    );
  }


  /* ========================================================
     20. TẢI DỮ LIỆU TUẦN
  ======================================================== */

  window.loadDoanWeeklyData =
    async function () {

      if (
        !canView()
      ) {

        alert(
          "⛔ Bạn không có quyền xem Tab Đoàn trường."
        );

        return;
      }


      const week =
        getValue(
          "doanSelectWeek"
        );

      const hocKy =
        getValue(
          "doanSelectHocKy"
        );

      const classId =
        getValue(
          "doanSelectClass"
        );


      if (!week) {

        alert(
          "Vui lòng chọn tuần."
        );

        return;
      }


      if (!hocKy) {

        alert(
          "Vui lòng chọn học kỳ."
        );

        return;
      }


      if (!classId) {

        alert(
          "Vui lòng chọn lớp."
        );

        return;
      }


      state.currentWeek =
        week;

      state.currentHocKy =
        hocKy;

      state.currentClass =
        classId;


      try {

        setStatus(
          "Đang tải dữ liệu tuần...",
          "warning"
        );


        const result =
          await callPostApi({

            action:
              "get_doan_weekly_data",

            username:
              getCurrentUser(),

            role:
              getCurrentRole(),

            tuan:
              week,

            week:
              week,

            hocKy:
              hocKy,

            semester:
              hocKy,

            maLop:
              classId,

            classId:
              classId
          });


        if (
          result.status &&
          result.status !==
            "success"
        ) {

          throw new Error(
            result.message ||
            "Không tải được dữ liệu."
          );
        }


        const data =
          result.data ||
          result;


        /*
          Thông tin lớp
        */

        setText(
          "doanSummaryClass",
          data.className ||
          data.tenLop ||
          state.currentClassName ||
          classId
        );


        setText(
          "doanSummarySiSo",
          data.siSo ??
          data.totalStudents ??
          0
        );


        /*
          Tổng số lỗi
        */

        setText(
          "doanSummaryLoi",
          data.totalErrors ??
          data.tongLoi ??
          0
        );


        /*
          Dữ liệu từng ngày
        */

        const rawRows =
          Array.isArray(
            data.dailyRows
          )
            ? data.dailyRows
            : Array.isArray(
                data.dailyData
              )
              ? data.dailyData
              : Array.isArray(
                  result.dailyRows
                )
                ? result.dailyRows
                : [];


        state.weeklyRows =
          rawRows.map(
            normalizeWeeklyRow
          );


        renderDailyTable();


        /*
          Điểm đã lưu
        */

        const savedScore =
          data.score ||
          data.weeklyScore ||
          {};


        setScoreFields(
          savedScore
        );


        /*
          Nếu backend đã trả tổng,
          ưu tiên tổng đó.
        */

        if (
          savedScore.total !=
            null
        ) {

          state.score.total =
            Number(
              savedScore.total
            ) || 0;

          setText(
            "doanTongDiem",
            state.score.total
              .toFixed(1)
          );
        }
        else {

          calculateDoanTotal();
        }


        /*
          Xếp hạng
        */

        state.rank =
          data.rank ??
          data.viThu ??
          data.position ??
          null;


        setText(
          "doanViThu",
          state.rank != null
            ? String(
                state.rank
              )
            : "--"
        );


        /*
          Xếp loại
        */

        state.classification =
          data.classification ??
          data.xepLoai ??
          classifyScore(
            state.score.total
          );


        setText(
          "doanXepLoai",
          state.classification ||
          "--"
        );


        /*
          Ghi chú
        */

        state.note =
          String(
            data.note ??
            data.ghiChu ??
            ""
          );


        setValue(
          "doanGhiChu",
          state.note
        );


        /*
          Khóa
        */

        state.locked =
          Boolean(
            data.locked ??
            result.locked ??
            false
          );


        updateLockUI();


        state.dataLoaded =
          true;


        updateProgress();


        setStatus(
          state.locked
            ? "🔒 Tuần này đã khóa."
            : "✅ Đã tải dữ liệu tuần.",
          state.locked
            ? "warning"
            : "success"
        );


      } catch (error) {

        console.error(
          "[JS5] loadDoanWeeklyData:",
          error
        );


        state.weeklyRows =
          [];

        state.dataLoaded =
          false;

        state.locked =
          false;


        renderDailyTable();
        calculateDoanTotal();
        updateLockUI();


        setStatus(
          "❌ Không tải được dữ liệu.",
          "danger"
        );
      }
    };


  /* ========================================================
     21. HIỂN THỊ BẢNG NGÀY
  ======================================================== */

  function renderDailyTable() {

    const tbody =
      el(
        "doanDailyTableBody"
      );

    if (!tbody) {
      return;
    }


    if (
      !state.weeklyRows.length
    ) {

      tbody.innerHTML =
        `
        <tr>

          <td
            colspan="9"
            style="
              text-align:center;
              padding:25px;
              color:#94a3b8;
            "
          >
            Chưa có dữ liệu
          </td>

        </tr>
        `;


      updateProgress();

      return;
    }


    let html =
      "";


    state.weeklyRows.forEach(
      function (
        row,
        index
      ) {

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
              ${
                escapeHtml(
                  formatDateDisplay(
                    row.ngay
                  )
                )
              }
            </td>

            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${formatNumber(
                row.veSinh
              )}
            </td>

            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${formatNumber(
                row.csvc
              )}
            </td>

            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${formatNumber(
                row.xe
              )}
            </td>

            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${formatNumber(
                row.cuocThi
              )}
            </td>

            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${formatNumber(
                row.qdKhac
              )}
            </td>

            <td
              style="
                padding:9px;
                text-align:center;
              "
            >
              ${formatNumber(
                row.sdb
              )}
            </td>

            <td
              style="
                padding:9px;
                text-align:center;
                font-weight:bold;
                color:#047857;
              "
            >
              ${formatNumber(
                row.diemNgay
              )}
            </td>

          </tr>
          `;
      }
    );


    tbody.innerHTML =
      html;


    updateProgress();
  }


  /* ========================================================
     22. ĐỊNH DẠNG NGÀY
  ======================================================== */

  function formatDateDisplay(
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

      const p =
        text.split("-");

      return (
        p[2] +
        "/" +
        p[1] +
        "/" +
        p[0]
      );
    }


    return text;
  }


  /* ========================================================
     23. ĐỊNH DẠNG SỐ
  ======================================================== */

  function formatNumber(
    value
  ) {

    const number =
      Number(value || 0);


    if (
      Number.isInteger(
        number
      )
    ) {

      return String(
        number
      );
    }


    return number
      .toFixed(1);
  }


  /* ========================================================
     24. SET CÁC Ô ĐIỂM
  ======================================================== */

  function setScoreFields(
    score
  ) {

    score =
      score || {};


    setValue(
      "doanDiemVeSinh",
      score.veSinh ??
      score.VeSinh ??
      ""
    );


    setValue(
      "doanDiemCSVC",
      score.csvc ??
      score.CSVC ??
      ""
    );


    setValue(
      "doanDiemXe",
      score.xe ??
      score.Xe ??
      score.xepXe ??
      ""
    );


    setValue(
      "doanDiemCuocThi",
      score.cuocThi ??
      score.CuocThi ??
      ""
    );


    setValue(
      "doanDiemQDKhac",
      score.qdKhac ??
      score.QDKhac ??
      score.quyDinhKhac ??
      ""
    );


    setValue(
      "doanDiemSDB",
      score.sdb ??
      score.SDB ??
      score.soDauBai ??
      ""
    );


    state.score.veSinh =
      toNumber(
        score.veSinh
      );


    state.score.csvc =
      toNumber(
        score.csvc
      );


    state.score.xe =
      toNumber(
        score.xe
      );


    state.score.cuocThi =
      toNumber(
        score.cuocThi
      );


    state.score.qdKhac =
      toNumber(
        score.qdKhac
      );


    state.score.sdb =
      toNumber(
        score.sdb
      );


    calculateDoanTotal();
  }


  /* ========================================================
     25. NUMBER
  ======================================================== */

  function toNumber(
    value
  ) {

    const number =
      Number(
        String(
          value == null
            ? ""
            : value
        ).replace(
          ",",
          "."
        )
      );


    return Number.isFinite(
      number
    )
      ? number
      : 0;
  }


  /* ========================================================
     26. TÍNH ĐIỂM CUỐI TUẦN
  ======================================================== */

  window.calculateDoanTotal =
    function () {

      const veSinh =
        toNumber(
          getValue(
            "doanDiemVeSinh"
          )
        );


      const csvc =
        toNumber(
          getValue(
            "doanDiemCSVC"
          )
        );


      const xe =
        toNumber(
          getValue(
            "doanDiemXe"
          )
        );


      const cuocThi =
        toNumber(
          getValue(
            "doanDiemCuocThi"
          )
        );


      const qdKhac =
        toNumber(
          getValue(
            "doanDiemQDKhac"
          )
        );


      const sdb =
        toNumber(
          getValue(
            "doanDiemSDB"
          )
        );


      state.score = {

        veSinh:
          veSinh,

        csvc:
          csvc,

        xe:
          xe,

        cuocThi:
          cuocThi,

        qdKhac:
          qdKhac,

        sdb:
          sdb,

        total:

          veSinh *
            SCORE_WEIGHT.veSinh +

          csvc *
            SCORE_WEIGHT.csvc +

          xe *
            SCORE_WEIGHT.xe +

          cuocThi *
            SCORE_WEIGHT.cuocThi +

          qdKhac *
            SCORE_WEIGHT.qdKhac +

          sdb *
            SCORE_WEIGHT.sdb
      };


      setText(
        "doanTongDiem",
        state.score.total
          .toFixed(1)
      );


      /*
        Nếu backend chưa trả xếp loại,
        frontend tự tính.
      */

      if (
        !state.rank
      ) {

        state.classification =
          classifyScore(
            state.score.total
          );

        setText(
          "doanXepLoai",
          state.classification
        );
      }
    };


  /* ========================================================
     27. AUTO CALCULATE
  ======================================================== */

  [
    "doanDiemVeSinh",
    "doanDiemCSVC",
    "doanDiemXe",
    "doanDiemCuocThi",
    "doanDiemQDKhac",
    "doanDiemSDB"
  ].forEach(
    function (id) {

      const node =
        el(id);

      if (
        node &&
        !node.dataset.js5Bound
      ) {

        node.dataset.js5Bound =
          "1";

        node.addEventListener(
          "input",
          function () {

            if (
              !state.locked &&
              canEditScore()
            ) {

              calculateDoanTotal();
            }
          }
        );
      }
    }
  );


  /* ========================================================
     28. XẾP LOẠI
     
     Đây là mức mặc định để giao diện
     hoạt động khi backend chưa trả
     xếp loại.
     
     Có thể thay đổi sau khi chốt
     theo quy chế thực tế.
  ======================================================== */

  function classifyScore(
    total
  ) {

    total =
      Number(total || 0);


    if (
      total >= 80
    ) {

      return "Tốt";

    }


    if (
      total >= 65
    ) {

      return "Khá";

    }


    if (
      total >= 50
    ) {

      return "Đạt";

    }


    return "Cần cố gắng";
  }


  /* ========================================================
     29. TÍNH TỔNG LỖI TỪ DỮ LIỆU
  ======================================================== */

  function calculateTotalErrors() {

    /*
      Nếu backend không trả totalErrors,
      thử tính từ các dòng ngày.
    */

    if (
      !state.weeklyRows.length
    ) {

      return 0;
    }


    let total =
      0;


    state.weeklyRows
      .forEach(
        function (row) {

          /*
            Dữ liệu Tab 4 có thể truyền
            số lỗi trực tiếp.
          */

          if (
            row.totalErrors !=
              null
          ) {

            total +=
              Number(
                row.totalErrors
              ) || 0;
          }
        }
      );


    return total;
  }


  /* ========================================================
     30. TIẾN ĐỘ
  ======================================================== */

  function updateProgress() {

    const node =
      el(
        "doanDailyProgress"
      );

    if (!node) {
      return;
    }


    if (
      !state.weeklyRows.length
    ) {

      node.textContent =
        "Chưa có dữ liệu";

      return;
    }


    node.textContent =
      "Đã có " +
      state.weeklyRows.length +
      " ngày dữ liệu";
  }


  /* ========================================================
     31. LƯU ĐIỂM CUỐI TUẦN
  ======================================================== */

  window.saveDoanWeeklyData =
    async function () {

      if (
        !canEditScore()
      ) {

        alert(
          "⛔ Chỉ BTD, BGH hoặc Admin mới được nhập/điều chỉnh điểm cuối tuần."
        );

        return;
      }


      if (
        state.locked
      ) {

        alert(
          "🔒 Tuần này đã bị khóa."
        );

        return;
      }


      const week =
        getValue(
          "doanSelectWeek"
        );

      const hocKy =
        getValue(
          "doanSelectHocKy"
        );

      const classId =
        getValue(
          "doanSelectClass"
        );


      if (!week) {

        alert(
          "Vui lòng chọn tuần."
        );

        return;
      }


      if (!hocKy) {

        alert(
          "Vui lòng chọn học kỳ."
        );

        return;
      }


      if (!classId) {

        alert(
          "Vui lòng chọn lớp."
        );

        return;
      }


      calculateDoanTotal();


      const note =
        getValue(
          "doanGhiChu"
        );


      state.note =
        note;


      const btn =
        el("btnDoanSave");


      if (btn) {

        btn.disabled =
          true;

        btn.textContent =
          "⏳ Đang lưu...";
      }


      try {

        const result =
          await callPostApi({

            action:
              "save_doan_weekly_data",

            username:
              getCurrentUser(),

            role:
              getCurrentRole(),

            tuan:
              week,

            week:
              week,

            hocKy:
              hocKy,

            semester:
              hocKy,

            maLop:
              classId,

            classId:
              classId,

            tenLop:
              state.currentClassName,

            score: {

              veSinh:
                state.score.veSinh,

              csvc:
                state.score.csvc,

              xe:
                state.score.xe,

              cuocThi:
                state.score.cuocThi,

              qdKhac:
                state.score.qdKhac,

              sdb:
                state.score.sdb,

              total:
                state.score.total
            },

            tongDiem:
              state.score.total,

            ghiChu:
              note
          });


        if (
          result.status &&
          result.status !==
            "success"
        ) {

          throw new Error(
            result.message ||
            "Không thể lưu."
          );
        }


        const data =
          result.data ||
          result;


        /*
          Backend có thể trả lại
          xếp hạng và xếp loại.
        */

        if (
          data.rank !=
            null
        ) {

          state.rank =
            data.rank;

          setText(
            "doanViThu",
            data.rank
          );
        }


        if (
          data.viThu !=
            null
        ) {

          state.rank =
            data.viThu;

          setText(
            "doanViThu",
            data.viThu
          );
        }


        state.classification =
          data.classification ??
          data.xepLoai ??
          classifyScore(
            state.score.total
          );


        setText(
          "doanXepLoai",
          state.classification
        );


        /*
          Tổng điểm
        */

        setText(
          "doanTongDiem",
          state.score.total
            .toFixed(1)
        );


        alert(
          "✅ Đã lưu điểm thi đua cuối tuần."
        );


        setStatus(
          "✅ Đã lưu điểm tuần thành công.",
          "success"
        );


      } catch (error) {

        console.error(
          "[JS5] saveDoanWeeklyData:",
          error
        );


        alert(
          "❌ Không thể lưu điểm cuối tuần.\n\n" +
          (
            error.message ||
            "Lỗi không xác định."
          )
        );


      } finally {

        if (btn) {

          btn.disabled =
            false;

          btn.textContent =
            "💾 Lưu điểm cuối tuần";
        }
      }
    };


  /* ========================================================
     32. KHÓA TUẦN
  ======================================================== */

  window.lockDoanWeeklyData =
    async function () {

      if (
        !canLock()
      ) {

        alert(
          "⛔ Chỉ BGH/Admin mới được khóa tuần."
        );

        return;
      }


      if (
        state.locked
      ) {

        alert(
          "Tuần này đã khóa."
        );

        return;
      }


      const week =
        getValue(
          "doanSelectWeek"
        );

      const hocKy =
        getValue(
          "doanSelectHocKy"
        );

      const classId =
        getValue(
          "doanSelectClass"
        );


      if (!week) {

        alert(
          "Vui lòng chọn tuần."
        );

        return;
      }


      if (!classId) {

        alert(
          "Vui lòng chọn lớp."
        );

        return;
      }


      const confirmed =
        confirm(
          "Bạn có chắc muốn KHÓA điểm thi đua tuần này?\n\n" +
          "Sau khi khóa, BTD sẽ không thể điều chỉnh."
        );


      if (!confirmed) {
        return;
      }


      const btn =
        el("btnDoanLock");


      if (btn) {

        btn.disabled =
          true;

        btn.textContent =
          "⏳ Đang khóa...";
      }


      try {

        const result =
          await callPostApi({

            action:
              "lock_doan_weekly_data",

            username:
              getCurrentUser(),

            role:
              getCurrentRole(),

            tuan:
              week,

            week:
              week,

            hocKy:
              hocKy,

            semester:
              hocKy,

            maLop:
              classId,

            classId:
              classId
          });


        if (
          result.status &&
          result.status !==
            "success"
        ) {

          throw new Error(
            result.message ||
            "Không thể khóa."
          );
        }


        state.locked =
          true;


        updateLockUI();


        alert(
          "🔒 Đã khóa điểm thi đua tuần."
        );


        setStatus(
          "🔒 Tuần đã khóa.",
          "warning"
        );


      } catch (error) {

        console.error(
          "[JS5] lockDoanWeeklyData:",
          error
        );


        alert(
          "❌ Không thể khóa tuần."
        );


      } finally {

        if (btn) {

          btn.disabled =
            false;

          btn.textContent =
            state.locked
              ? "🔒 Đã khóa"
              : "🔒 Khóa tuần";
        }
      }
    };


  /* ========================================================
     33. CẬP NHẬT UI THEO TRẠNG THÁI
  ======================================================== */

  function updateLockUI() {

    const ids = [

      "doanDiemVeSinh",
      "doanDiemCSVC",
      "doanDiemXe",
      "doanDiemCuocThi",
      "doanDiemQDKhac",
      "doanDiemSDB",
      "doanGhiChu"
    ];


    ids.forEach(
      function (id) {

        const node =
          el(id);

        if (!node) {
          return;
        }


        node.disabled =
          state.locked ||
          !canEditScore();
      }
    );


    const saveBtn =
      el("btnDoanSave");


    if (saveBtn) {

      saveBtn.disabled =
        state.locked ||
        !canEditScore();

      saveBtn.style.opacity =
        (
          state.locked ||
          !canEditScore()
        )
          ? "0.55"
          : "1";
    }


    const lockBtn =
      el("btnDoanLock");


    if (lockBtn) {

      lockBtn.disabled =
        state.locked ||
        !canLock();

      lockBtn.style.opacity =
        (
          state.locked ||
          !canLock()
        )
          ? "0.55"
          : "1";

      lockBtn.textContent =
        state.locked
          ? "🔒 Đã khóa"
          : "🔒 Khóa tuần";
    }
  }


  /* ========================================================
     34. THỐNG KÊ LỖI TỪ TAB 4
  ======================================================== */

  function updateSummaryFallback() {

    const total =
      calculateTotalErrors();


    if (
      total > 0
    ) {

      setText(
        "doanSummaryLoi",
        total
      );
    }
  }


  /* ========================================================
     35. RESET GIAO DIỆN
  ======================================================== */

  function resetWeeklyDisplay() {

    state.weeklyRows =
      [];

    state.score = {

      veSinh: 0,

      csvc: 0,

      xe: 0,

      cuocThi: 0,

      qdKhac: 0,

      sdb: 0,

      total: 0
    };


    state.rank =
      null;

    state.classification =
      "";

    state.note =
      "";


    setText(
      "doanSummaryClass",
      "--"
    );

    setText(
      "doanSummarySiSo",
      "--"
    );

    setText(
      "doanSummaryLoi",
      "0"
    );

    setText(
      "doanSummaryDiem",
      "--"
    );

    setText(
      "doanTongDiem",
      "0"
    );

    setText(
      "doanViThu",
      "--"
    );

    setText(
      "doanXepLoai",
      "--"
    );

    setValue(
      "doanDiemVeSinh",
      ""
    );

    setValue(
      "doanDiemCSVC",
      ""
    );

    setValue(
      "doanDiemXe",
      ""
    );

    setValue(
      "doanDiemCuocThi",
      ""
    );

    setValue(
      "doanDiemQDKhac",
      ""
    );

    setValue(
      "doanDiemSDB",
      ""
    );

    setValue(
      "doanGhiChu",
      ""
    );


    state.locked =
      false;

    state.dataLoaded =
      false;


    renderDailyTable();
    updateLockUI();
  }


  /* ========================================================
     36. KHI CHUYỂN LỚP
  ======================================================== */

  function resetOnClassChange() {

    resetWeeklyDisplay();


    setText(
      "doanSummaryClass",
      state.currentClassName ||
      "--"
    );
  }


  /* ========================================================
     37. INIT TAB 5
  ======================================================== */

  async function initTabDoanTruong() {

    const tab =
      el("tabDoanTruong");


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


    if (
      !canView()
    ) {

      setStatus(
        "⛔ Tài khoản không có quyền truy cập Tab Đoàn trường.",
        "danger"
      );

      updateLockUI();

      return;
    }


    setStatus(
      "Đang khởi tạo Tab Đoàn trường...",
      "warning"
    );


    await loadDoanContext();


    renderDailyTable();
    updateLockUI();


    setStatus(
      "Sẵn sàng.",
      "success"
    );
  }


  /* ========================================================
     38. ALIAS
  ======================================================== */

  window.initTabDoanTruong =
    initTabDoanTruong;


  window.initTab5 =
    initTabDoanTruong;


  window.loadTab5 =
    initTabDoanTruong;


  /* ========================================================
     39. DOM READY
  ======================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      initTabDoanTruong()
        .catch(
          function (error) {

            console.error(
              "[JS5] init error:",
              error
            );
          }
        );
    }
  );


  /* ========================================================
     40. DEBUG
  ======================================================== */

  window.KienoraEduDoanTruong = {

    version:
      JS5_VERSION,

    state:
      state,

    reload:
      loadDoanWeeklyData,

    reloadContext:
      loadDoanContext,

    calculate:
      calculateDoanTotal,

    canView:
      canView,

    canEdit:
      canEditScore,

    canLock:
      canLock
  };


})();
