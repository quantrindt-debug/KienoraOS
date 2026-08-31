/* =========================================================
   🟦 TAB 1 — QUẢN LÝ HỒ SƠ HỌC SINH
   FILE: js/tab1.js
   PHẦN 1.1 — KHỞI TẠO + TÀI KHOẢN + VAI TRÒ
========================================================= */

let hocSinhDangChon = null;
let cauHinh = [];
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
/* ============================================================
   🟦 TAB 1 — PHẦN 1.2
   HIỂN THỊ QUYỀN + LẤY CẤU HÌNH + DANH SÁCH LỚP
============================================================ */


/* ============================================================
   HIỂN THỊ QUYỀN
============================================================ */

function hienThiQuyen() {

    const container =
        document.getElementById(
            'adminConfigBtnContainer'
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // ----------------------------------------------------------
    // Không phải Admin → không hiện nút cấu hình
    // ----------------------------------------------------------

    if (!isAdmin) {
        return;
    }


    // ----------------------------------------------------------
    // Admin → hiện nút cấu hình
    // ----------------------------------------------------------

    container.innerHTML = `
        <button
            onclick="moModalAdmin()"
            class="text-xs bg-emerald-50
                   text-emerald-600
                   hover:bg-emerald-100
                   px-3 py-1.5 rounded-xl
                   font-medium
                   border border-emerald-100
                   transition">

            ⚙️ Cấu hình hồ sơ

        </button>
    `;


    // ----------------------------------------------------------
    // Hiển thị vai trò
    // ----------------------------------------------------------

    const badge =
        document.getElementById(
            'userInfoBadge'
        );


    if (badge) {

        badge.innerText =
            `Trường: ${currentSession.maTruong} | ` +
            `Tài khoản: ${currentSession.maNhanSu} | ` +
            `Quyền: ${currentRole}`;

    }

}


/* ============================================================
   LẤY CẤU HÌNH TỪ SHEET CauHinh
============================================================ */

async function taiCauHinh() {

    const res =
        await fetch(
            `${API_URL}?action=getConfig`
        );


    const data =
        await res.json();


    if (data.status !== "success") {

        throw new Error(
            data.message ||
            "Không lấy được cấu hình."
        );

    }


    cauHinh =
        Array.isArray(data.configs)
            ? data.configs
            : [];


    console.log(
        "Cấu hình CauHinh:",
        cauHinh
    );

}


/* ============================================================
   LẤY DANH SÁCH LỚP
============================================================ */

async function taiDanhSachLop() {

    const selectLop =
        document.getElementById(
            'selectLop'
        );


    if (!selectLop) {
        console.warn(
            "Không tìm thấy selectLop."
        );
        return;
    }


    selectLop.innerHTML =
        `<option value="">
            -- Đang tải danh sách lớp... --
         </option>`;


    const url =
        `${API_URL}?action=layDanhSachLop` +
        `&maTruong=${encodeURIComponent(currentSession.maTruong)}` +
        `&maNhanSu=${encodeURIComponent(currentSession.maNhanSu)}`;


    const res =
        await fetch(url);


    const data =
        await res.json();


    if (data.status !== "success") {

        selectLop.innerHTML =
            `<option value="">
                -- Lỗi tải danh sách lớp --
             </option>`;


        throw new Error(
            data.message ||
            "Không lấy được danh sách lớp."
        );

    }


    selectLop.innerHTML =
        `<option value="">
            -- Chọn lớp quản lý --
         </option>`;


    const danhSachLop =
        Array.isArray(data.danhSachLop)
            ? data.danhSachLop
            : [];


    danhSachLop.forEach(
        function(tenLop) {

            const option =
                document.createElement(
                    'option'
                );

            option.value =
                tenLop;

            option.textContent =
                tenLop;

            selectLop.appendChild(
                option
            );

        }
    );


    // ----------------------------------------------------------
    // GVCN chỉ được xem lớp được API cấp quyền
    // ----------------------------------------------------------

    if (
        !isAdmin &&
        danhSachLop.length === 1
    ) {

        selectLop.value =
            danhSachLop[0];

        taiDuLieuLop();

    }


    console.log(
        "Danh sách lớp:",
        danhSachLop
    );

}
//---------------------------------------
/* ============================================================
   🟦 TAB 1 — PHẦN 1.4
   CẬP NHẬT THỐNG KÊ HỒ SƠ HỌC SINH
============================================================ */

function capNhatThongKe(danhSach) {

    if (!Array.isArray(danhSach)) {
        danhSach = [];
    }


    /* ----------------------------------------------------------
       Tổng số học sinh
    ---------------------------------------------------------- */

    const tongHS =
        danhSach.length;


    /* ----------------------------------------------------------
       Đếm học sinh thiếu thông tin
    ---------------------------------------------------------- */

    let soDu = 0;
    let soThieu = 0;


    danhSach.forEach(function(hs) {

        /*
         * API đã trả sẵn trạng thái hồ sơ:
         *   thieuBatBuoc
         *   thieuNeuCo
         *   ghiChuBR
         *
         * Hồ sơ được xem là thiếu nếu còn trường bắt buộc.
         */

        const thieuBatBuoc =
            Array.isArray(hs.thieuBatBuoc)
                ? hs.thieuBatBuoc
                : [];


        if (thieuBatBuoc.length > 0) {
            soThieu++;
        } else {
            soDu++;
        }

    });


    /* ----------------------------------------------------------
       Cập nhật tổng số
    ---------------------------------------------------------- */

    capNhatElement(
        'statTongHS',
        tongHS
    );


    capNhatElement(
        'statHoSoDu',
        soDu
    );


    capNhatElement(
        'statHoSoThieu',
        soThieu
    );


    /* ----------------------------------------------------------
       Nếu giao diện có các ô thống kê khác
       thì cập nhật theo dữ liệu thực tế.
    ---------------------------------------------------------- */

    const tyLe =
        tongHS > 0
            ? Math.round(
                soDu * 100 / tongHS
              )
            : 0;


    capNhatElement(
        'statTyLeHoSo',
        tyLe + '%'
    );


    console.log(
        'Thống kê hồ sơ:',
        {
            tongHS: tongHS,
            hoSoDu: soDu,
            hoSoThieu: soThieu,
            tyLe: tyLe + '%'
        }
    );

}


/* ============================================================
   HÀM PHỤ — CẬP NHẬT ELEMENT AN TOÀN
============================================================ */

function capNhatElement(id, value) {

    const el =
        document.getElementById(id);


    if (!el) {
        return;
    }


    el.innerText =
        value == null
            ? ''
            : value;

}
/* ============================================================
   🟦 TAB 1 — PHẦN 1.5
   HIỂN THỊ DANH SÁCH HỌC SINH
============================================================ */

function hienThiDanhSachHS(danhSach) {

    const container =
        document.getElementById(
            'danhSachHSContainer'
        );


    if (!container) {
        console.warn(
            'Không tìm thấy danhSachHSContainer.'
        );
        return;
    }


    container.innerHTML = '';


    /* ----------------------------------------------------------
       Không có học sinh
    ---------------------------------------------------------- */

    if (
        !Array.isArray(danhSach) ||
        danhSach.length === 0
    ) {

        container.innerHTML = `
            <div class="p-4
                        text-sm
                        text-slate-400
                        italic">

                Lớp này chưa có dữ liệu học sinh.

            </div>
        `;

        return;
    }


    /* ----------------------------------------------------------
       Tạo danh sách học sinh
    ---------------------------------------------------------- */

    danhSach.forEach(function(hs) {

        const thieu =
            Array.isArray(hs.thieuBatBuoc)
                ? hs.thieuBatBuoc
                : [];


        const soLuongThieu =
            thieu.length;


        const badgeColor =
            soLuongThieu === 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700";


        const div =
            document.createElement(
                'div'
            );


        div.className =
            "p-3.5 bg-slate-50 " +
            "hover:bg-blue-50 cursor-pointer " +
            "rounded-xl border border-slate-100 " +
            "flex justify-between items-center " +
            "transition";


        div.innerHTML = `

            <div>

                <p class="text-sm font-semibold
                          text-slate-800">

                    ${escapeHtml(
                        hs.tenHS || ""
                    )}

                </p>


                <p class="text-xs
                          text-slate-500">

                    Mã:
                    ${escapeHtml(
                        String(
                            hs.maHS || ""
                        )
                    )}

                </p>

            </div>


            <span
                class="text-xs font-bold
                       px-2.5 py-1 rounded-lg
                       ${badgeColor}">

                ${
                    soLuongThieu === 0
                        ? "✓ Đủ hồ sơ"
                        : soLuongThieu + " thiếu"
                }

            </span>

        `;


        /* ------------------------------------------------------
           Click vào học sinh
        ------------------------------------------------------ */

        div.onclick =
            function() {

                chonHocSinh(hs);

            };


        container.appendChild(
            div
        );

    });

}
/* ============================================================
   🟦 TAB 1 — PHẦN 1.6
   CHỌN HỌC SINH + HIỂN THỊ TÌNH TRẠNG HỒ SƠ
============================================================ */

function chonHocSinh(hs) {

    // ----------------------------------------------------------
    // Lưu học sinh đang được chọn
    // ----------------------------------------------------------

    hocSinhDangChon = hs;


    const card =
        document.getElementById(
            'chiTietHSCard'
        );

    const khungBR =
        document.getElementById(
            'khungNhanTinBR'
        );

    const noiDungBR =
        document.getElementById(
            'noiDungBR'
        );


    if (!card) {
        console.warn(
            'Không tìm thấy chiTietHSCard.'
        );
        return;
    }


    // ----------------------------------------------------------
    // Hiện khung ghi chú BR
    // ----------------------------------------------------------

    if (khungBR) {
        khungBR.classList.remove(
            'hidden'
        );
    }


    // ----------------------------------------------------------
    // Nạp ghi chú BR đã lưu
    // ----------------------------------------------------------

    if (noiDungBR) {

        noiDungBR.value =
            hs.ghiChuBR || "";

    }


    // ----------------------------------------------------------
    // Lấy danh sách thông tin bắt buộc còn thiếu
    // ----------------------------------------------------------

    const thieuBB =
        Array.isArray(
            hs.thieuBatBuoc
        )
            ? hs.thieuBatBuoc
            : [];


    // ----------------------------------------------------------
    // Lấy danh sách thông tin "nếu có" còn thiếu
    // ----------------------------------------------------------

    const thieuNC =
        Array.isArray(
            hs.thieuNeuCo
        )
            ? hs.thieuNeuCo
            : [];


    // ----------------------------------------------------------
    // Tạo HTML thông tin bắt buộc
    // ----------------------------------------------------------

    const htmlBB =
        thieuBB.length > 0

            ? thieuBB
                .map(
                    function(item) {

                        return `
                            <span
                                class="bg-rose-50
                                       text-rose-600
                                       border
                                       border-rose-100
                                       text-xs
                                       px-2.5 py-1
                                       rounded-lg
                                       font-medium">

                                ${escapeHtml(
                                    item.colName
                                )}

                            </span>
                        `;

                    }
                )
                .join(" ")

            : `
                <span
                    class="text-xs
                           text-emerald-600
                           font-medium">

                    ✓ Đã đủ tất cả
                    thông tin bắt buộc.

                </span>
              `;


    // ----------------------------------------------------------
    // Tạo HTML thông tin nếu có
    // ----------------------------------------------------------

    const htmlNC =
        thieuNC.length > 0

            ? thieuNC
                .map(
                    function(item) {

                        return `
                            <span
                                class="bg-amber-50
                                       text-amber-600
                                       border
                                       border-amber-100
                                       text-xs
                                       px-2.5 py-1
                                       rounded-lg
                                       font-medium">

                                ${escapeHtml(
                                    item.colName
                                )}

                            </span>
                        `;

                    }
                )
                .join(" ")

            : `
                <span
                    class="text-xs
                           text-slate-400
                           italic">

                    Không thiếu thông tin
                    tùy chọn.

                </span>
              `;


    // ----------------------------------------------------------
    // Đổ toàn bộ thông tin vào card chi tiết
    // ----------------------------------------------------------

    card.innerHTML = `

        <div>

            <p class="text-sm
                      font-semibold
                      text-slate-800">

                Học sinh:

                <span class="text-blue-600">

                    ${escapeHtml(
                        hs.tenHS || ""
                    )}

                </span>

            </p>

        </div>


        <div>

            <p class="text-xs
                      font-bold
                      text-rose-600
                      mb-1.5
                      uppercase
                      tracking-wider">

                🔴 Thông tin bắt buộc
                còn thiếu:

            </p>


            <div class="flex flex-wrap gap-1.5">

                ${htmlBB}

            </div>

        </div>


        <div class="border-t
                    border-slate-200
                    pt-2">

            <p class="text-xs
                      font-bold
                      text-amber-600
                      mb-1.5
                      uppercase
                      tracking-wider">

                🟡 Thông tin nếu có:

            </p>


            <div class="flex flex-wrap gap-1.5">

                ${htmlNC}

            </div>

        </div>

    `;


    console.log(
        "Đã chọn học sinh:",
        hs
    );

}
/* ============================================================
   🟦 TAB 1 — PHẦN 1.7
   HIỂN THỊ CHI TIẾT HỒ SƠ HỌC SINH ĐANG CHỌN
============================================================ */

function hienThiChiTietHoSo(hs) {

    if (!hs) {
        return;
    }


    const card =
        document.getElementById(
            'chiTietHSCard'
        );


    if (!card) {
        console.warn(
            'Không tìm thấy chiTietHSCard.'
        );
        return;
    }


    /* ----------------------------------------------------------
       Các giá trị cơ bản
    ---------------------------------------------------------- */

    const maHS =
        hs.maHS || '';

    const tenHS =
        hs.tenHS || '';

    const lop =
        hs.lop || '';

    const ngaySinh =
        hs.ngaySinh || '';

    const gioiTinh =
        hs.gioiTinh || '';

    const ghiChu =
        hs.ghiChu || '';

    const ghiChuBR =
        hs.ghiChuBR || '';


    /* ----------------------------------------------------------
       Danh sách thông tin còn thiếu
    ---------------------------------------------------------- */

    const thieuBatBuoc =
        Array.isArray(hs.thieuBatBuoc)
            ? hs.thieuBatBuoc
            : [];

    const thieuNeuCo =
        Array.isArray(hs.thieuNeuCo)
            ? hs.thieuNeuCo
            : [];


    /* ----------------------------------------------------------
       HTML thông tin thiếu bắt buộc
    ---------------------------------------------------------- */

    let htmlThieuBB = '';

    if (thieuBatBuoc.length > 0) {

        htmlThieuBB =
            thieuBatBuoc
                .map(function(item) {

                    const tenCot =
                        typeof item === 'object'
                            ? item.colName
                            : item;

                    return `
                        <span
                            class="bg-rose-50
                                   text-rose-600
                                   border
                                   border-rose-100
                                   text-xs
                                   px-2.5 py-1
                                   rounded-lg
                                   font-medium">

                            ${escapeHtml(
                                tenCot || ''
                            )}

                        </span>
                    `;

                })
                .join(' ');

    } else {

        htmlThieuBB = `
            <span
                class="text-xs
                       text-emerald-600
                       font-medium">

                ✓ Hồ sơ đã đủ thông tin bắt buộc

            </span>
        `;

    }


    /* ----------------------------------------------------------
       HTML thông tin nếu có còn thiếu
    ---------------------------------------------------------- */

    let htmlThieuNC = '';

    if (thieuNeuCo.length > 0) {

        htmlThieuNC =
            thieuNeuCo
                .map(function(item) {

                    const tenCot =
                        typeof item === 'object'
                            ? item.colName
                            : item;

                    return `
                        <span
                            class="bg-amber-50
                                   text-amber-600
                                   border
                                   border-amber-100
                                   text-xs
                                   px-2.5 py-1
                                   rounded-lg
                                   font-medium">

                            ${escapeHtml(
                                tenCot || ''
                            )}

                        </span>
                    `;

                })
                .join(' ');

    } else {

        htmlThieuNC = `
            <span
                class="text-xs
                       text-slate-400
                       italic">

                Không có thông tin tùy chọn
                còn thiếu.

            </span>
        `;

    }


    /* ----------------------------------------------------------
       Hiển thị chi tiết
    ---------------------------------------------------------- */

    card.innerHTML = `

        <div class="space-y-3">

            <!-- THÔNG TIN CƠ BẢN -->

            <div>

                <p class="text-sm
                          font-semibold
                          text-slate-800">

                    Học sinh:

                    <span class="text-blue-600">

                        ${escapeHtml(
                            tenHS
                        )}

                    </span>

                </p>


                <div class="grid
                            grid-cols-2
                            md:grid-cols-4
                            gap-2
                            mt-2">

                    <div>
                        <span class="text-xs
                                     text-slate-400">
                            Mã học sinh
                        </span>

                        <p class="text-sm
                                  font-medium
                                  text-slate-700">

                            ${escapeHtml(
                                String(maHS)
                            )}

                        </p>
                    </div>


                    <div>
                        <span class="text-xs
                                     text-slate-400">
                            Lớp
                        </span>

                        <p class="text-sm
                                  font-medium
                                  text-slate-700">

                            ${escapeHtml(
                                String(lop)
                            )}

                        </p>
                    </div>


                    <div>
                        <span class="text-xs
                                     text-slate-400">
                            Ngày sinh
                        </span>

                        <p class="text-sm
                                  font-medium
                                  text-slate-700">

                            ${escapeHtml(
                                String(ngaySinh)
                            )}

                        </p>
                    </div>


                    <div>
                        <span class="text-xs
                                     text-slate-400">
                            Giới tính
                        </span>

                        <p class="text-sm
                                  font-medium
                                  text-slate-700">

                            ${escapeHtml(
                                String(gioiTinh)
                            )}

                        </p>
                    </div>

                </div>

            </div>


            <!-- BẮT BUỘC -->

            <div>

                <p class="text-xs
                          font-bold
                          text-rose-600
                          mb-1.5
                          uppercase
                          tracking-wider">

                    🔴 Thông tin bắt buộc còn thiếu

                </p>


                <div class="flex
                            flex-wrap
                            gap-1.5">

                    ${htmlThieuBB}

                </div>

            </div>


            <!-- NẾU CÓ -->

            <div class="border-t
                        border-slate-200
                        pt-2">

                <p class="text-xs
                          font-bold
                          text-amber-600
                          mb-1.5
                          uppercase
                          tracking-wider">

                    🟡 Thông tin nếu có

                </p>


                <div class="flex
                            flex-wrap
                            gap-1.5">

                    ${htmlThieuNC}

                </div>

            </div>


            <!-- GHI CHÚ -->

            <div class="border-t
                        border-slate-200
                        pt-2">

                <p class="text-xs
                          font-bold
                          text-slate-500
                          mb-1">

                    📝 Ghi chú hồ sơ

                </p>

                <div class="text-sm
                            text-slate-600">

                    ${escapeHtml(
                        ghiChu || 'Chưa có ghi chú.'
                    )}

                </div>

            </div>


            <!-- GHI CHÚ BR -->

            <div class="border-t
                        border-slate-200
                        pt-2">

                <p class="text-xs
                          font-bold
                          text-blue-600
                          mb-1">

                    📌 Ghi chú BR

                </p>

                <div class="text-sm
                            text-slate-600">

                    ${escapeHtml(
                        ghiChuBR ||
                        'Chưa có ghi chú BR.'
                    )}

                </div>

            </div>

        </div>

    `;


    /* ----------------------------------------------------------
       Đánh dấu học sinh đang chọn
    ---------------------------------------------------------- */

    hocSinhDangChon =
        hs;


    console.log(
        'Đã hiển thị chi tiết hồ sơ:',
        hs
    );

}
/* ============================================================
   🟦 TAB 1 — PHẦN 1.8
   LƯU GHI CHÚ / CỘT BR
============================================================ */

async function luuNoiDungBR(btnElement) {

    /* ----------------------------------------------------------
       Kiểm tra đã chọn học sinh chưa
    ---------------------------------------------------------- */

    if (!hocSinhDangChon) {

        alert(
            "Chưa chọn học sinh."
        );

        return;
    }


    /* ----------------------------------------------------------
       Lấy nội dung BR
    ---------------------------------------------------------- */

    const input =
        document.getElementById(
            "noiDungBR"
        );


    if (!input) {

        alert(
            "Không tìm thấy ô nhập ghi chú BR."
        );

        return;
    }


    const noiDung =
        input.value;


    /* ----------------------------------------------------------
       Kiểm tra nút
    ---------------------------------------------------------- */

    const originalText =
        btnElement
            ? btnElement.innerText
            : "";


    if (btnElement) {

        btnElement.innerText =
            "⏳ Đang lưu...";

        btnElement.disabled =
            true;
    }


    try {

        /* ------------------------------------------------------
           Gửi dữ liệu lên API
           KHÔNG ghi đè hồ sơ học sinh.
           Chỉ cập nhật cột BR của đúng dòng.
        ------------------------------------------------------ */

        const res =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "luuBR",

                            rowNum:
                                hocSinhDangChon.rowNum,

                            noiDung:
                                noiDung,

                            maTruong:
                                currentSession.maTruong

                        })
                }
            );


        const data =
            await res.json();


        /* ------------------------------------------------------
           Kiểm tra kết quả API
        ------------------------------------------------------ */

        if (
            data.status !== "success"
        ) {

            throw new Error(
                data.message ||
                "Không thể lưu BR."
            );

        }


        /* ------------------------------------------------------
           Cập nhật dữ liệu đang giữ trên trình duyệt
           để không phải tải lại toàn bộ hồ sơ.
        ------------------------------------------------------ */

        hocSinhDangChon.ghiChuBR =
            noiDung;


        /* ------------------------------------------------------
           Thông báo
        ------------------------------------------------------ */

        alert(
            "✓ Đã lưu ghi chú BR."
        );


        console.log(
            "Đã lưu BR:",
            {
                rowNum:
                    hocSinhDangChon.rowNum,

                maHS:
                    hocSinhDangChon.maHS,

                noiDung:
                    noiDung
            }
        );


    } catch (err) {

        console.error(
            "Lỗi lưu ghi chú BR:",
            err
        );


        alert(
            "Lỗi lưu ghi chú: " +
            err.message
        );


    } finally {

        /* ------------------------------------------------------
           Khôi phục nút
        ------------------------------------------------------ */

        if (btnElement) {

            btnElement.innerText =
                originalText;

            btnElement.disabled =
                false;

        }

    }

}
/* ============================================================
   🟦 TAB 1 — PHẦN 1.9
   CẬP NHẬT HỒ SƠ HỌC SINH
   ------------------------------------------------------------
   Nguyên tắc:
   - Chỉ gửi những trường được người dùng chỉnh sửa.
   - Không ghi đè toàn bộ dòng học sinh.
   - Không thay đổi dữ liệu cũ nếu không chỉnh sửa.
============================================================ */

async function capNhatHoSoHocSinh(btnElement) {

    /* ----------------------------------------------------------
       1. Kiểm tra học sinh đang chọn
    ---------------------------------------------------------- */

    if (!hocSinhDangChon) {

        alert(
            "Vui lòng chọn học sinh cần cập nhật."
        );

        return;
    }


    /* ----------------------------------------------------------
       2. Kiểm tra API
    ---------------------------------------------------------- */

    if (
        typeof API_URL === "undefined" ||
        !API_URL
    ) {

        alert(
            "Chưa cấu hình API_URL."
        );

        return;
    }


    /* ----------------------------------------------------------
       3. Xác định mã học sinh
    ---------------------------------------------------------- */

    const maHS =
        String(
            hocSinhDangChon.maHS || ""
        ).trim();


    const rowNum =
        Number(
            hocSinhDangChon.rowNum
        );


    if (!maHS) {

        alert(
            "Không xác định được Mã học sinh."
        );

        return;
    }


    if (
        !Number.isFinite(rowNum) ||
        rowNum < 3
    ) {

        alert(
            "Không xác định được dòng dữ liệu học sinh."
        );

        return;
    }


    /* ----------------------------------------------------------
       4. Lấy các trường được phép chỉnh sửa
       
       Chỉ lấy những input có thuộc tính:
       
           data-student-col="SỐ_CỘT"
       
       Ví dụ:
       
           <input
               data-student-col="5"
               ...>
       
       Như vậy JS không tự ý ghi những cột khác.
    ---------------------------------------------------------- */

    const fields =
        document.querySelectorAll(
            '[data-student-col]'
        );


    const updates = {};


    fields.forEach(function(el) {

        const colIndex =
            Number(
                el.dataset.studentCol
            );


        if (
            !Number.isFinite(colIndex) ||
            colIndex < 1
        ) {

            return;

        }


        let value;


        if (
            el.type === "checkbox"
        ) {

            value =
                el.checked;

        } else {

            value =
                el.value;

        }


        updates[colIndex] =
            value;

    });


    /* ----------------------------------------------------------
       5. Không có trường nào để cập nhật
    ---------------------------------------------------------- */

    if (
        Object.keys(updates).length === 0
    ) {

        alert(
            "Chưa có trường dữ liệu nào được phép cập nhật."
        );

        return;
    }


    /* ----------------------------------------------------------
       6. Xác nhận trước khi ghi
    ---------------------------------------------------------- */

    const confirmSave =
        confirm(
            "Bạn có chắc chắn muốn cập nhật hồ sơ học sinh này?"
        );


    if (!confirmSave) {
        return;
    }


    /* ----------------------------------------------------------
       7. Trạng thái nút
    ---------------------------------------------------------- */

    let originalText = "";


    if (btnElement) {

        originalText =
            btnElement.innerHTML;

        btnElement.disabled =
            true;

        btnElement.innerHTML =
            "⏳ Đang lưu...";
    }


    try {

        /* ------------------------------------------------------
           8. Payload gửi API
           
           QUAN TRỌNG:
           Không gửi toàn bộ hồ sơ.
           Chỉ gửi updates.
        ------------------------------------------------------ */

        const payload = {

            action:
                "updateStudentProfile",

            maHS:
                maHS,

            rowNum:
                rowNum,

            maTruong:
                currentSession.maTruong,

            maNhanSu:
                currentSession.maNhanSu,

            updates:
                updates

        };


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const result =
            await response.json();


        /* ------------------------------------------------------
           9. Kiểm tra phản hồi API
        ------------------------------------------------------ */

        if (
            result.status !== "success"
        ) {

            throw new Error(
                result.message ||
                "API không thể cập nhật hồ sơ."
            );

        }


        /* ------------------------------------------------------
           10. Cập nhật object hiện tại
           
           Không cần tải lại toàn bộ danh sách.
        ------------------------------------------------------ */

        Object.keys(updates)
            .forEach(function(colIndex) {

                hocSinhDangChon[
                    "col_" + colIndex
                ] =
                    updates[colIndex];

            });


        alert(
            result.message ||
            "✓ Đã cập nhật hồ sơ học sinh."
        );


        console.log(
            "Cập nhật hồ sơ thành công:",
            result
        );


    } catch (err) {

        console.error(
            "Lỗi cập nhật hồ sơ:",
            err
        );


        alert(
            "❌ Không thể cập nhật hồ sơ:\n" +
            err.message
        );


    } finally {

        if (btnElement) {

            btnElement.innerHTML =
                originalText;

            btnElement.disabled =
                false;

        }

    }

}
