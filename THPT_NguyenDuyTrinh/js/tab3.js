/* =========================================================
   🟦 TAB 3 — QUẢN LÝ THI ĐUA
   FILE: js/tab3.js
   PHẦN 3.1 — KHỞI TẠO + TRẠNG THÁI
========================================================= */

let tab3Data = [];

let tab3SelectedClass = "";

let tab3SelectedWeek = "";

let tab3CurrentRole = "";

let tab3IsAdmin = false;


/* =========================================================
   LẤY VAI TRÒ TỪ ACCOUNT.JS
   ---------------------------------------------------------
   Không lấy localStorage trực tiếp ở Tab 3.
========================================================= */

function tab3GetRole() {

    return String(

        window.currentUserRole ||

        window.currentRole ||

        (typeof currentRole !== "undefined"
            ? currentRole
            : "") ||

        "GVCN"

    ).trim();

}


/* =========================================================
   KIỂM TRA QUYỀN ADMIN / BGH
========================================================= */

function tab3CheckPermission() {

    tab3CurrentRole =
        tab3GetRole();


    const role =
        tab3CurrentRole.toLowerCase();


    tab3IsAdmin =
        role === "admin" ||
        role === "administrator" ||
        role.includes("admin") ||
        role.includes("quản trị") ||
        role === "bgh" ||
        role.includes("ban giám hiệu");


    console.log(
        "🟦 TAB 3 - Vai trò:",
        tab3CurrentRole
    );


    console.log(
        "🟦 TAB 3 - Admin/BGH:",
        tab3IsAdmin
    );

}


/* =========================================================
   LẤY LỚP HIỆN TẠI
========================================================= */

function tab3GetCurrentClass() {

    /*
       Ưu tiên hàm dùng chung của hệ thống.
    */

    if (
        typeof getCurrentSelectedClass ===
        "function"
    ) {

        const cls =
            getCurrentSelectedClass();

        if (cls) {

            return String(
                cls
            ).trim();

        }

    }


    if (
        typeof getActiveClassName ===
        "function"
    ) {

        const cls =
            getActiveClassName();

        if (cls) {

            return String(
                cls
            ).trim();

        }

    }


    /*
       Fallback nếu giao diện Tab 3
       có select riêng.
    */

    const selectors = [

        "selectClass",

        "tab3Class",

        "selectTab3Class",

        "classSelect"

    ];


    for (
        let i = 0;
        i < selectors.length;
        i++
    ) {

        const el =
            document.getElementById(
                selectors[i]
            );


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


/* =========================================================
   LẤY TUẦN HIỆN TẠI
========================================================= */

function tab3GetCurrentWeek() {

    const selectors = [

        "selectWeek",

        "tab3Week",

        "selectTab3Week",

        "weekSelect"

    ];


    for (
        let i = 0;
        i < selectors.length;
        i++
    ) {

        const el =
            document.getElementById(
                selectors[i]
            );


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


/* =========================================================
   KHỞI TẠO TAB 3
========================================================= */

function initTab3() {

    console.log(
        "🟦 TAB 3 - Bắt đầu khởi tạo..."
    );


    tab3CheckPermission();


    tab3SelectedClass =
        tab3GetCurrentClass();


    tab3SelectedWeek =
        tab3GetCurrentWeek();


    console.log(
        "🟦 TAB 3 - Lớp:",
        tab3SelectedClass
    );


    console.log(
        "🟦 TAB 3 - Tuần:",
        tab3SelectedWeek
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initTab3();

    }
);
/* =========================================================
   🟦 TAB 3 — HỌC SINH CẦN QUAN TÂM
   FILE: js/tab3.js
   PHẦN 3.2 — TẢI DANH SÁCH HỌC SINH
========================================================= */

let tab3Students = [];


/* =========================================================
   TẢI DANH SÁCH HỌC SINH THEO LỚP
========================================================= */

async function tab3LoadStudents() {

    const selectStudent =
        document.getElementById(
            "jSelectStudent"
        );

    const studentClass =
        document.getElementById(
            "jStudentClass"
        );


    if (!selectStudent) {

        console.warn(
            "TAB 3: Không tìm thấy jSelectStudent."
        );

        return;

    }


    const className =
        tab3GetCurrentClass();


    if (!className) {

        selectStudent.innerHTML =
            '<option value="">-- Chưa xác định lớp --</option>';

        if (studentClass) {

            studentClass.value = "";

        }

        return;

    }


    tab3SelectedClass =
        className;


    /*
       Hiển thị trạng thái đang tải.
    */

    selectStudent.innerHTML =
        '<option value="">⏳ Đang tải học sinh...</option>';

    selectStudent.disabled =
        true;


    try {

        /*
           Sử dụng API_URL dùng chung của hệ thống.
           
           Không lấy tài khoản trực tiếp ở đây.
           Tài khoản đã được xử lý trong account.js.
        */

        const url =
            `${API_URL}?action=getStudentsByClass` +
            `&maTruong=${encodeURIComponent(
                currentSession.maTruong
            )}` +
            `&maNhanSu=${encodeURIComponent(
                currentSession.maNhanSu
            )}` +
            `&lop=${encodeURIComponent(
                className
            )}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            result.status &&
            result.status !== "success"
        ) {

            throw new Error(
                result.message ||
                "API không trả về dữ liệu học sinh."
            );

        }


        /*
           API có thể trả về:
             result.rows
             hoặc result.data
             hoặc result.students
        */

        let students =
            Array.isArray(result.rows)
                ? result.rows
                : (
                    Array.isArray(result.students)
                        ? result.students
                        : (
                            Array.isArray(result.data)
                                ? result.data
                                : []
                          )
                  );


        tab3Students =
            students;


        /*
           Xóa danh sách cũ.
        */

        selectStudent.innerHTML =
            '<option value="">-- Chọn học sinh --</option>';


        if (
            !students ||
            students.length === 0
        ) {

            selectStudent.innerHTML =
                '<option value="">-- Lớp chưa có học sinh --</option>';

            if (studentClass) {

                studentClass.value =
                    className;

            }

            return;

        }


        /*
           Đổ danh sách học sinh.
        */

        students.forEach(
            function(student, index) {

                const option =
                    document.createElement(
                        "option"
                    );


                /*
                   Hỗ trợ nhiều tên trường
                   để tránh phụ thuộc cứng
                   vào một kiểu API.
                */

                const maHS =
                    student.maHS ||
                    student.maHocSinh ||
                    student.id ||
                    student.ID ||
                    "";


                const hoTen =
                    student.hoTen ||
                    student.hoTenHocSinh ||
                    student.hocSinh ||
                    student.name ||
                    "";


                option.value =
                    maHS || String(index);


                option.textContent =
                    hoTen ||
                    ("Học sinh " + (index + 1));


                /*
                   Lưu nguyên object để
                   bước 3.3 sử dụng lại.
                */

                option.dataset.index =
                    String(index);


                selectStudent.appendChild(
                    option
                );

            }
        );


        selectStudent.disabled =
            false;


        /*
           Hiển thị lớp hiện tại.
        */

        if (studentClass) {

            studentClass.value =
                className;

        }


        console.log(
            "🟦 TAB 3 - Đã tải:",
            students.length,
            "học sinh | Lớp:",
            className
        );

    }

    catch (error) {

        console.error(
            "TAB 3 - Lỗi tải danh sách học sinh:",
            error
        );


        selectStudent.innerHTML =
            '<option value="">❌ Không tải được danh sách</option>';


        selectStudent.disabled =
            false;


        if (studentClass) {

            studentClass.value =
                className;

        }

    }

}
/* =========================================================
   🟦 TAB 3 — HỌC SINH CẦN QUAN TÂM
   FILE: js/tab3.js
   PHẦN 3.3 — CHỌN HỌC SINH + ĐỔ THÔNG TIN
========================================================= */


/* =========================================================
   HÀM TIỆN ÍCH — LẤY GIÁ TRỊ AN TOÀN
========================================================= */

function tab3SetValue(id, value) {

    const el =
        document.getElementById(id);


    if (!el) {
        return;
    }


    el.value =
        value !== undefined &&
        value !== null
            ? value
            : "";

}


/* =========================================================
   XÓA NỘI DUNG FORM
========================================================= */

function tab3ClearStudentForm() {

    tab3SetValue(
        "jStudentClass",
        tab3SelectedClass || ""
    );


    tab3SetValue(
        "jBieuHien",
        ""
    );


    tab3SetValue(
        "jBienPhap",
        ""
    );


    tab3SetValue(
        "jKetQua",
        ""
    );

}


/* =========================================================
   XỬ LÝ KHI CHỌN HỌC SINH
========================================================= */

async function tab3StudentChanged() {

    const selectStudent =
        document.getElementById(
            "jSelectStudent"
        );


    if (!selectStudent) {
        return;
    }


    const selectedValue =
        selectStudent.value;


    /*
       Chưa chọn học sinh
    */

    if (!selectedValue) {

        tab3ClearStudentForm();

        return;

    }


    /*
       Tìm học sinh trong dữ liệu
       đã tải ở phần 3.2.
    */

    const selectedIndex =
        selectStudent
            .selectedOptions[0]
            ?.dataset.index;


    let student =
        null;


    if (
        selectedIndex !== undefined &&
        tab3Students[selectedIndex]
    ) {

        student =
            tab3Students[selectedIndex];

    }


    /*
       Luôn hiển thị lớp hiện tại.
    */

    tab3SetValue(
        "jStudentClass",
        tab3SelectedClass
    );


    /*
       Nếu API đã trả về dữ liệu
       theo dõi thì điền luôn.
    */

    if (student) {

        const bieuHien =
            student.bieuHien ||
            student.bieuHienVanDe ||
            student.vanDe ||
            "";


        const bienPhap =
            student.bienPhap ||
            student.phuongAn ||
            "";


        const ketQua =
            student.ketQua ||
            student.ketQuaTheoDoi ||
            "";


        tab3SetValue(
            "jBieuHien",
            bieuHien
        );


        tab3SetValue(
            "jBienPhap",
            bienPhap
        );


        tab3SetValue(
            "jKetQua",
            ketQua
        );

    }


    /*
       Nếu API chỉ trả danh sách học sinh,
       bước này sẽ tìm hồ sơ theo dõi riêng.
    */

    await tab3LoadStudentCareData(
        selectedValue
    );

}


/* =========================================================
   TẢI HỒ SƠ "HỌC SINH CẦN QUAN TÂM"
   CỦA HỌC SINH ĐANG CHỌN
========================================================= */

async function tab3LoadStudentCareData(
    studentId
) {

    if (!studentId) {
        return;
    }


    /*
       Kiểm tra API_URL.
    */

    if (
        typeof API_URL === "undefined" ||
        !API_URL
    ) {

        console.warn(
            "TAB 3: Chưa có API_URL."
        );

        return;

    }


    try {

        const url =
            `${API_URL}?action=getStudentCareData` +
            `&maTruong=${encodeURIComponent(
                currentSession.maTruong
            )}` +
            `&maNhanSu=${encodeURIComponent(
                currentSession.maNhanSu
            )}` +
            `&lop=${encodeURIComponent(
                tab3SelectedClass
            )}` +
            `&maHS=${encodeURIComponent(
                studentId
            )}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        /*
           API không có dữ liệu
           thì giữ nguyên form hiện tại.
        */

        if (
            !result ||
            result.status === "empty" ||
            result.status === "not_found"
        ) {

            return;

        }


        if (
            result.status &&
            result.status !== "success"
        ) {

            console.warn(
                "TAB 3 - API:",
                result.message || result
            );

            return;

        }


        /*
           Hỗ trợ nhiều dạng trả về:
             result.data
             result.student
             result.row
        */

        const data =
            result.data ||
            result.student ||
            result.row ||
            result;


        if (!data) {
            return;
        }


        tab3SetValue(
            "jStudentClass",
            data.lop ||
            data.className ||
            tab3SelectedClass
        );


        tab3SetValue(
            "jBieuHien",
            data.bieuHien ||
            data.bieuHienVanDe ||
            data.vanDe ||
            ""
        );


        tab3SetValue(
            "jBienPhap",
            data.bienPhap ||
            data.phuongAn ||
            ""
        );


        tab3SetValue(
            "jKetQua",
            data.ketQua ||
            data.ketQuaTheoDoi ||
            ""
        );


        console.log(
            "🟦 TAB 3 - Đã tải hồ sơ quan tâm:",
            studentId
        );

    }

    catch (error) {

        /*
           Không chặn người dùng nhập mới
           nếu API hồ sơ theo dõi chưa có.
        */

        console.warn(
            "TAB 3 - Chưa tải được hồ sơ theo dõi:",
            error
        );

    }

}


/* =========================================================
   GẮN SỰ KIỆN CHỌN HỌC SINH
========================================================= */

function tab3BindStudentEvents() {

    const selectStudent =
        document.getElementById(
            "jSelectStudent"
        );


    if (!selectStudent) {

        console.warn(
            "TAB 3: Không tìm thấy jSelectStudent."
        );

        return;

    }


    /*
       Tránh gắn sự kiện nhiều lần.
    */

    if (
        selectStudent.dataset.tab3Bound ===
        "true"
    ) {

        return;

    }


    selectStudent.addEventListener(
        "change",
        tab3StudentChanged
    );


    selectStudent.dataset.tab3Bound =
        "true";

}


/* =========================================================
   KHỞI TẠO RIÊNG PHẦN 3.3
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        tab3BindStudentEvents();

    }
);
/* =========================================================
   🟦 TAB 3 — HỌC SINH CẦN QUAN TÂM
   FILE: js/tab3.js
   PHẦN 3.4 — LƯU THÔNG TIN THEO DÕI
========================================================= */


/* =========================================================
   LẤY NỘI DUNG FORM
========================================================= */

function tab3GetValue(id) {

    const el =
        document.getElementById(id);

    return el
        ? String(el.value || "").trim()
        : "";

}


/* =========================================================
   LƯU HỌC SINH CẦN QUAN TÂM
========================================================= */

function submitCareStudentLog() {

    const selectStudent =
        document.getElementById(
            "jSelectStudent"
        );


    const maHS =
        tab3GetValue("jMaHS") ||
        (
            selectStudent
                ? selectStudent.value
                : ""
        );


    let hoTen =
        tab3GetValue("jHoTen");


    const bieuHien =
        tab3GetValue("jBieuHien");


    const bienPhap =
        tab3GetValue("jBienPhap");


    const ketQua =
        tab3GetValue("jKetQua");


    const lop =
        tab3GetValue("jStudentClass") ||
        tab3GetCurrentClass();


    /* =======================================================
       KIỂM TRA
    ======================================================= */

    if (!selectStudent || !selectStudent.value) {

        alert(
            "Vui lòng chọn học sinh cần theo dõi!"
        );

        if (selectStudent) {

            selectStudent.focus();

        }

        return;

    }


    if (!bieuHien) {

        alert(
            "Vui lòng nhập biểu hiện hoặc hoàn cảnh của học sinh!"
        );


        const input =
            document.getElementById(
                "jBieuHien"
            );


        if (input) {

            input.focus();

        }


        return;

    }


    /*
       Nếu chưa có họ tên,
       lấy trực tiếp từ option đang chọn.
    */

    if (!hoTen) {

        const option =
            selectStudent.options[
                selectStudent.selectedIndex
            ];


        if (option) {

            hoTen =
                option.textContent
                    .replace(
                        /^\s*[^-]+\s*-\s*/,
                        ""
                    )
                    .trim();

        }

    }


    /* =======================================================
       PAYLOAD
    ======================================================= */

    const payload = {

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
            new Date()
                .toLocaleDateString(
                    "vi-VN"
                )

    };


    console.log(
        "🟦 TAB 3 - Payload lưu:",
        payload
    );


    /* =======================================================
       KHÓA NÚT TRONG KHI LƯU
    ======================================================= */

    /*
       Không phụ thuộc event toàn cục.
       Tìm nút lưu của Tab 3.
    */

    const buttons =
        document.querySelectorAll(
            "#tabHocSinhQuanTam button"
        );


    let saveButton =
        null;


    buttons.forEach(
        function(btn) {

            const text =
                String(
                    btn.innerText ||
                    btn.textContent ||
                    ""
                ).toLowerCase();


            if (
                text.includes("lưu") ||
                text.includes("save")
            ) {

                saveButton =
                    btn;

            }

        }
    );


    const oldText =
        saveButton
            ? saveButton.innerHTML
            : "";


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.innerHTML =
            "⏳ Đang lưu...";

    }


    /* =======================================================
       GỌI GOOGLE APPS SCRIPT
    ======================================================= */

    if (
        typeof google === "undefined" ||
        !google.script ||
        !google.script.run
    ) {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                oldText;

        }


        alert(
            "Không thể kết nối máy chủ."
        );


        return;

    }


    google.script.run

        .withSuccessHandler(
            function(res) {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.innerHTML =
                        oldText;

                }


                if (
                    res &&
                    res.success
                ) {

                    alert(
                        res.message ||
                        "✅ Lưu thông tin theo dõi học sinh thành công!"
                    );


                    /*
                       Xóa nội dung nhập,
                       nhưng không xóa danh sách học sinh.
                    */

                    tab3SetValue(
                        "jBieuHien",
                        ""
                    );


                    tab3SetValue(
                        "jBienPhap",
                        ""
                    );


                    tab3SetValue(
                        "jKetQua",
                        ""
                    );


                    /*
                       Giữ lớp hiện tại.
                    */

                    tab3SetValue(
                        "jStudentClass",
                        lop
                    );


                    /*
                       Cho người dùng chọn
                       học sinh khác.
                    */

                    if (selectStudent) {

                        selectStudent.value =
                            "";

                    }


                    console.log(
                        "🟦 TAB 3 - Lưu thành công:",
                        res
                    );

                }

                else {

                    alert(
                        "❌ Lưu thất bại: " +
                        (
                            res &&
                            res.message
                                ? res.message
                                : "Có lỗi xảy ra."
                        )
                    );

                }

            }
        )

        .withFailureHandler(
            function(error) {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.innerHTML =
                        oldText;

                }


                console.error(
                    "TAB 3 - Lỗi saveCareStudentLog:",
                    error
                );


                alert(
                    "❌ Lỗi kết nối máy chủ: " +
                    (
                        error &&
                        error.message
                            ? error.message
                            : error
                    )
                );

            }
        )

        .saveCareStudentLog(
            payload
        );

}


/* =========================================================
   ALIAS CHO HTML CŨ
   ---------------------------------------------------------
   HTML có thể gọi:
       onJStudentChange()
       onCareStudentSelectChange()

   Cả hai cùng chạy một hàm.
========================================================= */

function onJStudentChange() {

    tab3StudentChanged();

}


function onCareStudentSelectChange() {

    tab3StudentChanged();

}
/* =========================================================
   🟦 TAB 3 — HỌC SINH CẦN QUAN TÂM
   FILE: js/tab3.js
   PHẦN 3.5 — HIỂN THỊ DANH SÁCH ĐÃ GHI NHẬN
========================================================= */


/* =========================================================
   TẢI DANH SÁCH HỌC SINH CẦN QUAN TÂM
========================================================= */

async function tab3LoadCareList() {

    const tbody =
        document.getElementById(
            "tbHocSinhQuanTam"
        );


    if (!tbody) {

        console.warn(
            "TAB 3: Không tìm thấy tbHocSinhQuanTam."
        );

        return;

    }


    const className =
        tab3GetCurrentClass();


    if (!className) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center">
                    Chưa xác định được lớp.
                </td>
            </tr>
        `;

        return;

    }


    tab3SelectedClass =
        className;


    tbody.innerHTML = `
        <tr>
            <td colspan="5"
                class="text-center"
                style="padding:15px;">
                ⏳ Đang tải danh sách học sinh cần quan tâm...
            </td>
        </tr>
    `;


    try {

        /*
           Gọi API lấy danh sách theo dõi.

           Nếu GS của dự án dùng action khác,
           chỉ cần thay action tại đây.
        */

        const url =
            `${API_URL}?action=getCareStudentLogs` +
            `&maTruong=${encodeURIComponent(
                currentSession.maTruong
            )}` +
            `&maNhanSu=${encodeURIComponent(
                currentSession.maNhanSu
            )}` +
            `&lop=${encodeURIComponent(
                className
            )}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            result.status &&
            result.status !== "success"
        ) {

            throw new Error(
                result.message ||
                "Không lấy được danh sách."
            );

        }


        /*
           Hỗ trợ nhiều kiểu dữ liệu trả về.
        */

        const rows =
            Array.isArray(result.rows)
                ? result.rows
                : (
                    Array.isArray(result.data)
                        ? result.data
                        : (
                            Array.isArray(result.logs)
                                ? result.logs
                                : []
                          )
                  );


        if (
            !rows ||
            rows.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center"
                        style="
                            color:#666;
                            font-style:italic;
                            padding:15px;
                        ">
                        Chưa có học sinh cần quan tâm.
                    </td>
                </tr>
            `;

            return;

        }


        /*
           Render bảng.
        */

        let html = "";


        rows.forEach(
            function(item, index) {

                const stt =
                    item.stt ||
                    item.STT ||
                    (index + 1);


                const hoTen =
                    item.hoTen ||
                    item.hoTenHocSinh ||
                    item.name ||
                    "-";


                const bieuHien =
                    item.bieuHien ||
                    item.bieuHienVanDe ||
                    item.vanDe ||
                    "-";


                const bienPhap =
                    item.bienPhap ||
                    item.phuongAn ||
                    "-";


                const ketQua =
                    item.ketQua ||
                    item.ketQuaTheoDoi ||
                    "-";


                html += `
                    <tr>

                        <td class="text-center">
                            ${tab3EscapeHtml(stt)}
                        </td>

                        <td style="
                            text-align:left;
                            padding-left:8px;
                        ">
                            <b>
                                ${tab3EscapeHtml(hoTen)}
                            </b>
                        </td>

                        <td style="
                            text-align:left;
                            padding-left:8px;
                        ">
                            ${tab3EscapeHtml(bieuHien)}
                        </td>

                        <td style="
                            text-align:left;
                            padding-left:8px;
                        ">
                            ${tab3EscapeHtml(bienPhap)}
                        </td>

                        <td style="
                            text-align:left;
                            padding-left:8px;
                        ">
                            ${tab3EscapeHtml(ketQua)}
                        </td>

                    </tr>
                `;

            }
        );


        tbody.innerHTML =
            html;


        /*
           Lưu lại dữ liệu để các phần
           tiếp theo có thể sử dụng.
        */

        tab3CareList =
            rows;


        console.log(
            "🟦 TAB 3 - Đã hiển thị:",
            rows.length,
            "bản ghi."
        );

    }

    catch (error) {

        console.error(
            "TAB 3 - Lỗi tải danh sách:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center"
                    style="
                        color:#dc2626;
                        padding:15px;
                    ">
                    ❌ Không tải được dữ liệu học sinh cần quan tâm.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   BIẾN LƯU DANH SÁCH
========================================================= */

let tab3CareList = [];


/* =========================================================
   CHỐNG CHÈN HTML KHÔNG MONG MUỐN
========================================================= */

function tab3EscapeHtml(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)
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


/* =========================================================
   KHI MỞ TAB 3
========================================================= */

function onOpenTab3() {

    tab3CheckPermission();


    tab3SelectedClass =
        tab3GetCurrentClass();


    /*
       Tải danh sách học sinh.
    */

    tab3LoadStudents();


    /*
       Tải danh sách đang theo dõi.
    */

    tab3LoadCareList();

}
/* =========================================================
   🟦 TAB 3 — HỌC SINH CẦN QUAN TÂM
   FILE: js/tab3.js
   PHẦN 3.6 — SỬA / CẬP NHẬT BẢN GHI
========================================================= */


/* =========================================================
   BIẾN LƯU BẢN GHI ĐANG SỬA
========================================================= */

let tab3EditingRecord = null;


/* =========================================================
   BẮT ĐẦU CHỈNH SỬA
========================================================= */

function tab3EditCareRecord(index) {

    if (
        !Array.isArray(tab3CareList) ||
        !tab3CareList[index]
    ) {

        console.warn(
            "TAB 3: Không tìm thấy bản ghi cần sửa."
        );

        return;

    }


    const item =
        tab3CareList[index];


    tab3EditingRecord =
        item;


    /* -----------------------------------------------------
       Đổ dữ liệu bản ghi vào form
    ----------------------------------------------------- */

    const selectStudent =
        document.getElementById(
            "jSelectStudent"
        );


    const maHS =
        item.maHS ||
        item.maHocSinh ||
        item.id ||
        "";


    /*
       Chọn đúng học sinh trong danh sách.
    */

    if (
        selectStudent &&
        maHS
    ) {

        selectStudent.value =
            maHS;


        /*
           Nếu value của select không phải
           mã học sinh thì thử tìm theo text.
        */

        if (
            selectStudent.value !== maHS
        ) {

            const options =
                Array.from(
                    selectStudent.options
                );


            const option =
                options.find(
                    function(opt) {

                        return (
                            opt.dataset.mahs === maHS ||
                            opt.dataset.maHS === maHS
                        );

                    }
                );


            if (option) {

                selectStudent.value =
                    option.value;

            }

        }

    }


    tab3SetValue(
        "jStudentClass",
        item.bieuLop ||
        item.lop ||
        tab3SelectedClass
    );


    tab3SetValue(
        "jBieuHien",
        item.bieuHien ||
        item.bieuHienVanDe ||
        item.vanDe ||
        ""
    );


    tab3SetValue(
        "jBienPhap",
        item.bienPhap ||
        item.phuongAn ||
        ""
    );


    tab3SetValue(
        "jKetQua",
        item.ketQua ||
        item.ketQuaTheoDoi ||
        ""
    );


    /* -----------------------------------------------------
       Đổi trạng thái nút Lưu
    ----------------------------------------------------- */

    tab3SetEditingMode(true);


    /*
       Cuộn về khu vực nhập liệu.
    */

    const form =
        document.getElementById(
            "jBieuHien"
        );


    if (form) {

        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        setTimeout(
            function() {

                form.focus();

            },
            400
        );

    }


    console.log(
        "🟦 TAB 3 - Đang sửa bản ghi:",
        item
    );

}


/* =========================================================
   CHUYỂN FORM SANG CHẾ ĐỘ SỬA
========================================================= */

function tab3SetEditingMode(isEditing) {

    const buttons =
        document.querySelectorAll(
            "#tabHocSinhQuanTam button"
        );


    buttons.forEach(
        function(btn) {

            const text =
                String(
                    btn.innerText ||
                    btn.textContent ||
                    ""
                ).toLowerCase();


            if (
                text.includes("lưu") ||
                text.includes("save")
            ) {

                if (isEditing) {

                    btn.innerHTML =
                        "💾 Cập nhật";

                    btn.dataset.tab3Mode =
                        "edit";

                }

                else {

                    btn.innerHTML =
                        "💾 Lưu";

                    btn.dataset.tab3Mode =
                        "new";

                }

            }

        }
    );


    /*
       Hiện nút Hủy sửa nếu giao diện đã có.
    */

    const cancelBtn =
        document.getElementById(
            "btnCancelCareEdit"
        );


    if (cancelBtn) {

        cancelBtn.style.display =
            isEditing
                ? "inline-block"
                : "none";

    }

}


/* =========================================================
   HỦY CHẾ ĐỘ SỬA
========================================================= */

function tab3CancelCareEdit() {

    tab3EditingRecord =
        null;


    tab3ClearStudentForm();


    const selectStudent =
        document.getElementById(
            "jSelectStudent"
        );


    if (selectStudent) {

        selectStudent.value =
            "";

    }


    tab3SetEditingMode(
        false
    );


    console.log(
        "🟦 TAB 3 - Đã hủy sửa."
    );

}


/* =========================================================
   TẠO PAYLOAD CẬP NHẬT
========================================================= */

function tab3BuildUpdatePayload() {

    if (!tab3EditingRecord) {

        return null;

    }


    const old =
        tab3EditingRecord;


    return {

        /*
           Giữ lại khóa bản ghi cũ.
           Backend sẽ dùng trường này để
           xác định dòng cần cập nhật.
        */

        rowIndex:
            old.rowIndex ||
            old.row ||
            old.index ||
            old.stt ||
            null,


        maHS:
            old.maHS ||
            old.maHocSinh ||
            old.id ||
            tab3GetValueSafe(
                "jMaHS"
            ),


        hoTen:
            old.hoTen ||
            old.hoTenHocSinh ||
            "",


        bieuLop:
            tab3GetValueSafe(
                "jStudentClass"
            ) ||
            tab3SelectedClass,


        bieuHien:
            tab3GetValueSafe(
                "jBieuHien"
            ),


        bienPhap:
            tab3GetValueSafe(
                "jBienPhap"
            ),


        ketQua:
            tab3GetValueSafe(
                "jKetQua"
            ),


        ngayTao:
            old.ngayTao ||
            old.ngay ||
            ""

    };

}


/* =========================================================
   HÀM LẤY VALUE AN TOÀN
========================================================= */

function tab3GetValueSafe(id) {

    const el =
        document.getElementById(id);


    return el
        ? String(el.value || "").trim()
        : "";

}


/* =========================================================
   CẬP NHẬT BẢN GHI
========================================================= */

function tab3UpdateCareRecord() {

    const payload =
        tab3BuildUpdatePayload();


    if (!payload) {

        alert(
            "Không xác định được bản ghi cần cập nhật."
        );

        return;

    }


    if (!payload.bieuHien) {

        alert(
            "Vui lòng nhập biểu hiện / hoàn cảnh."
        );

        return;

    }


    /*
       Chưa có khóa dòng.
       Không tự đoán dòng để tránh cập nhật nhầm.
    */

    if (
        payload.rowIndex === null ||
        payload.rowIndex === undefined ||
        payload.rowIndex === ""
    ) {

        alert(
            "Bản ghi này chưa có mã dòng để cập nhật. " +
            "Ta cần đối chiếu thêm hàm GS đọc dữ liệu."
        );


        console.warn(
            "TAB 3 - Thiếu rowIndex:",
            tab3EditingRecord
        );


        return;

    }


    console.log(
        "🟦 TAB 3 - Payload cập nhật:",
        payload
    );


    /*
       Phần gọi API cập nhật sẽ được nối
       với đúng hàm GS sau khi xác định
       tên hàm backend hiện tại.
    */

    if (
        typeof google === "undefined" ||
        !google.script ||
        !google.script.run
    ) {

        alert(
            "Không thể kết nối máy chủ."
        );

        return;

    }


    google.script.run

        .withSuccessHandler(
            function(res) {

                if (
                    res &&
                    res.success
                ) {

                    alert(
                        res.message ||
                        "✅ Đã cập nhật thông tin thành công!"
                    );


                    tab3EditingRecord =
                        null;


                    tab3SetEditingMode(
                        false
                    );


                    tab3ClearStudentForm();


                    const selectStudent =
                        document.getElementById(
                            "jSelectStudent"
                        );


                    if (selectStudent) {

                        selectStudent.value =
                            "";

                    }


                    /*
                       Tải lại danh sách.
                    */

                    tab3LoadCareList();

                }

                else {

                    alert(
                        "❌ Cập nhật thất bại: " +
                        (
                            res &&
                            res.message
                                ? res.message
                                : "Không rõ nguyên nhân."
                        )
                    );

                }

            }
        )

        .withFailureHandler(
            function(error) {

                console.error(
                    "TAB 3 - Lỗi cập nhật:",
                    error
                );


                alert(
                    "❌ Lỗi máy chủ: " +
                    (
                        error &&
                        error.message
                            ? error.message
                            : error
                    )
                );

            }
        )

        /*
           ⚠️ TẠM THỜI KHÔNG GỌI TÊN HÀM GS
           Ở ĐÂY CHO ĐẾN KHI ĐỐI CHIẾU
           BACKEND THỰC TẾ.
        */

        .updateCareStudentLog(
            payload
        );

}
/* =========================================================
   🟦 TAB 3 — MỤC J
   3.7 — LẤY DANH SÁCH HỌC SINH CẦN QUAN TÂM
========================================================= */

function getCareStudentLogs(className) {

  try {

    const ss =
      SpreadsheetApp.getActiveSpreadsheet();

    const sheet =
      ss.getSheetByName("NhatKy_QuanTam") ||
      ss.getSheetByName("TheoDoiQuanTam");


    if (!sheet) {

      return {
        success: true,
        logs: []
      };

    }


    const data =
      sheet.getDataRange().getValues();


    if (
      !data ||
      data.length <= 1
    ) {

      return {
        success: true,
        logs: []
      };

    }


    const logs = [];


    /*
       Cấu trúc sheet hiện tại:

       A = Ngày tạo
       B = Mã HS
       C = Họ và tên
       D = Biểu hiện / Hoàn cảnh
       E = Biện pháp giúp đỡ
       F = Kết quả / Tiến bộ

       LƯU Ý:
       saveCareStudentLog hiện tại chưa lưu LỚP.

       Vì vậy trước mắt ta tìm theo Mã HS /
       Họ tên nếu cần.
    */


    for (
      let i = 1;
      i < data.length;
      i++
    ) {

      const row =
        data[i];


      if (
        !row ||
        row.length < 6
      ) {

        continue;

      }


      const ngayTao =
        row[0];

      const maHS =
        String(
          row[1] || ""
        ).trim();

      const hoTen =
        String(
          row[2] || ""
        ).trim();

      const bieuHien =
        String(
          row[3] || ""
        ).trim();

      const bienPhap =
        String(
          row[4] || ""
        ).trim();

      const ketQua =
        String(
          row[5] || ""
        ).trim();


      /*
         Nếu có mã HS thì đưa ra dữ liệu.
         Việc lọc theo lớp sẽ thực hiện thông qua
         danh sách học sinh của lớp ở frontend/backend
         sau khi ta bổ sung cột Lớp.
      */

      logs.push({

        rowId:
          i + 1,

        maHS:
          maHS,

        hoTen:
          hoTen,

        lop:
          className || "",

        ngayGhi:
          ngayTao,

        bieuHien:
          bieuHien,

        bienPhap:
          bienPhap,

        ketQua:
          ketQua

      });

    }


    return {

      success: true,

      logs:
        logs.reverse()

    };


  }
  catch (err) {

    console.error(
      "getCareStudentLogs:",
      err
    );


    return {

      success: false,

      logs: [],

      message:
        err.toString()

    };

  }

}
/* =========================================================
   🟦 TAB 3
   3.7.1 — CẬP NHẬT BẢN GHI HỌC SINH CẦN QUAN TÂM
========================================================= */

function updateCareStudentLog(payload) {

  try {

    if (!payload) {

      return {
        success: false,
        message: "Không có dữ liệu cập nhật."
      };

    }


    const rowIndex =
      Number(
        payload.rowIndex
      );


    if (
      !rowIndex ||
      rowIndex < 2
    ) {

      return {
        success: false,
        message:
          "Không xác định được dòng dữ liệu cần cập nhật."
      };

    }


    const ss =
      SpreadsheetApp.getActiveSpreadsheet();


    const sheet =
      ss.getSheetByName("NhatKy_QuanTam") ||
      ss.getSheetByName("TheoDoiQuanTam");


    if (!sheet) {

      return {
        success: false,
        message:
          "Không tìm thấy sheet NhatKy_QuanTam."
      };

    }


    /*
       Kiểm tra dòng có tồn tại.
    */

    if (
      rowIndex >
      sheet.getLastRow()
    ) {

      return {
        success: false,
        message:
          "Dòng dữ liệu không tồn tại."
      };

    }


    /*
       Cấu trúc:

       A = Ngày tạo
       B = Mã HS
       C = Họ và tên
       D = Biểu hiện
       E = Biện pháp
       F = Kết quả
    */


    if (
      payload.maHS !== undefined
    ) {

      sheet
        .getRange(
          rowIndex,
          2
        )
        .setValue(
          payload.maHS
        );

    }


    if (
      payload.hoTen !== undefined
    ) {

      sheet
        .getRange(
          rowIndex,
          3
        )
        .setValue(
          payload.hoTen
        );

    }


    sheet
      .getRange(
        rowIndex,
        4
      )
      .setValue(
        payload.bieuHien || ""
      );


    sheet
      .getRange(
        rowIndex,
        5
      )
      .setValue(
        payload.bienPhap || ""
      );


    sheet
      .getRange(
        rowIndex,
        6
      )
      .setValue(
        payload.ketQua || ""
      );


    /*
       Không thay đổi ngày tạo
       khi chỉnh sửa.
    */


    return {

      success: true,

      message:
        "Đã cập nhật thông tin học sinh cần quan tâm."

    };


  }
  catch (err) {

    console.error(
      "updateCareStudentLog:",
      err
    );


    return {

      success: false,

      message:
        "Lỗi cập nhật dữ liệu: " +
        err.toString()

    };

  }

}
