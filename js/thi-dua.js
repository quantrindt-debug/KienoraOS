/* ============================================================
   KIENORA - THEO DÕI THI ĐUA
   PHẦN 3
   GitHub Pages → KienoraAPI → Google Apps Script
   ============================================================ */

(function () {

    "use strict";

    // ========================================================
    // DỮ LIỆU BẢNG THI ĐUA
    // ========================================================

    let thiDuaData = [];

    let thiDuaColumns = [
        {
            key: "lop",
            label: "Lớp",
            defaultVisible: true
        },
        {
            key: "siSo",
            label: "Sĩ số",
            defaultVisible: true
        },
        {
            key: "dVeSinh",
            label: "VS",
            defaultVisible: true
        },
        {
            key: "dCSVC",
            label: "CSVC",
            defaultVisible: true
        },
        {
            key: "dXepXe",
            label: "Xe",
            defaultVisible: true
        },
        {
            key: "dCuocThi",
            label: "C.Thi",
            defaultVisible: true
        },
        {
            key: "dQDKhac",
            label: "QĐ khác",
            defaultVisible: true
        },
        {
            key: "dSDB",
            label: "SĐB",
            defaultVisible: true
        },
        {
            key: "diemThiDua",
            label: "Đ.Thi đua",
            defaultVisible: true
        },
        {
            key: "xepHang",
            label: "Hạng",
            defaultVisible: true
        }
    ];


    let thiDuaVisibleColumns =
        thiDuaColumns
            .filter(c => c.defaultVisible)
            .map(c => c.key);


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ========================================================
    // ĐỊNH DẠNG ĐIỂM
    // ========================================================

    function formatScore(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        const n = Number(value);

        if (Number.isNaN(n)) {
            return escapeHtml(value);
        }

        return n.toFixed(1);
    }


    // ========================================================
    // HUY HIỆU XẾP HẠNG
    // ========================================================

    function renderRank(rank) {

        const n = Number(rank);

        if (n === 1) {
            return "🥇 1";
        }

        if (n === 2) {
            return "🥈 2";
        }

        if (n === 3) {
            return "🥉 3";
        }

        return escapeHtml(rank ?? "");
    }


    // ========================================================
    // LẤY GIÁ TRỊ CỘT
    // ========================================================

    function getColumnValue(item, key) {

        if (!item) return "";

        if (key === "lop") {
            return item.lop ?? "";
        }

        if (key === "siSo") {
            return item.siSo ?? "";
        }

        if (key === "dVeSinh") {
            return formatScore(item.dVeSinh);
        }

        if (key === "dCSVC") {
            return formatScore(item.dCSVC);
        }

        if (key === "dXepXe") {
            return formatScore(item.dXepXe);
        }

        if (key === "dCuocThi") {
            return formatScore(item.dCuocThi);
        }

        if (key === "dQDKhac") {
            return formatScore(item.dQDKhac);
        }

        if (key === "dSDB") {
            return formatScore(item.dSDB);
        }

        if (key === "diemThiDua") {
            return formatScore(item.diemThiDua);
        }

        if (key === "xepHang") {
            return renderRank(item.xepHang);
        }

        return escapeHtml(item[key] ?? "");
    }


    // ========================================================
    // KHỞI TẠO BỘ CHỌN CỘT
    // ========================================================

    function initThiDuaColumnSelector() {

        const box =
            document.getElementById(
                "thiDuaColumnSelector"
            );

        if (!box) return;

        box.innerHTML = "";

        thiDuaColumns.forEach(function (column) {

            const label =
                document.createElement("label");

            label.style.display = "inline-flex";
            label.style.alignItems = "center";
            label.style.gap = "6px";
            label.style.padding = "5px 8px";
            label.style.border = "1px solid #e2e8f0";
            label.style.borderRadius = "6px";
            label.style.background = "#fff";
            label.style.cursor = "pointer";
            label.style.fontSize = "12px";

            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.value =
                column.key;

            checkbox.checked =
                thiDuaVisibleColumns.includes(
                    column.key
                );

            checkbox.addEventListener(
                "change",
                function () {

                    capNhatCotThiDua();

                }
            );


            const text =
                document.createElement("span");

            text.textContent =
                column.label;


            label.appendChild(checkbox);
            label.appendChild(text);

            box.appendChild(label);
        });
    }


    // ========================================================
    // CẬP NHẬT CỘT ĐANG HIỂN THỊ
    // ========================================================

    function capNhatCotThiDua() {

        const box =
            document.getElementById(
                "thiDuaColumnSelector"
            );

        if (!box) return;

        const checked =
            box.querySelectorAll(
                'input[type="checkbox"]:checked'
            );


        thiDuaVisibleColumns =
            Array.from(checked)
                .map(input => input.value);


        renderBangThiDua();
    }


    // ========================================================
    // CHỌN TẤT CẢ
    // ========================================================

    function chonTatCaCotThiDua() {

        thiDuaColumns.forEach(
            column => {

                if (
                    !thiDuaVisibleColumns.includes(
                        column.key
                    )
                ) {

                    thiDuaVisibleColumns.push(
                        column.key
                    );
                }
            }
        );


        initThiDuaColumnSelector();

        renderBangThiDua();
    }


    // ========================================================
    // BỎ CHỌN TẤT CẢ
    // ========================================================

    function boChonTatCaCotThiDua() {

        // Không cho bảng mất hoàn toàn.
        // Luôn giữ cột Lớp.
        thiDuaVisibleColumns = ["lop"];

        initThiDuaColumnSelector();

        renderBangThiDua();
    }


    // ========================================================
    // RENDER HEADER
    // ========================================================

    function renderThiDuaHeader() {

        const thead =
            document.getElementById(
                "coDoTableHead"
            );

        if (!thead) return;


        thead.innerHTML = "";


        const tr =
            document.createElement("tr");


        tr.style.background = "#f8fafc";
        tr.style.borderBottom =
            "2px solid #e2e8f0";
        tr.style.color = "#334155";


        thiDuaVisibleColumns.forEach(
            function (key) {

                const column =
                    thiDuaColumns.find(
                        c => c.key === key
                    );

                if (!column) return;


                const th =
                    document.createElement("th");

                th.textContent =
                    column.label;

                th.style.padding =
                    "10px";

                th.style.fontWeight =
                    "bold";

                th.style.whiteSpace =
                    "nowrap";


                if (key === "lop") {
                    th.style.textAlign =
                        "left";
                }


                if (key === "diemThiDua") {

                    th.style.color =
                        "#047857";

                    th.style.background =
                        "#ecfdf5";
                }


                tr.appendChild(th);
            }
        );


        thead.appendChild(tr);
    }


    // ========================================================
    // RENDER BODY
    // ========================================================

    function renderBangThiDua() {

        const tbody =
            document.getElementById(
                "coDoTableBody"
            );

        if (!tbody) return;


        renderThiDuaHeader();


        if (!thiDuaVisibleColumns.length) {

            tbody.innerHTML =
                '<tr>' +
                '<td colspan="1" style="' +
                'padding:20px;' +
                'text-align:center;' +
                'color:#64748b;' +
                '">' +
                'Vui lòng chọn ít nhất một cột.' +
                '</td>' +
                '</tr>';

            return;
        }


        if (!thiDuaData.length) {

            tbody.innerHTML =
                '<tr>' +
                '<td colspan="' +
                thiDuaVisibleColumns.length +
                '" style="' +
                'padding:20px;' +
                'text-align:center;' +
                'color:#64748b;' +
                '">' +
                'Không có dữ liệu.' +
                '</td>' +
                '</tr>';

            return;
        }


        tbody.innerHTML = "";


        thiDuaData.forEach(
            function (item) {

                const tr =
                    document.createElement("tr");


                tr.style.borderBottom =
                    "1px solid #f1f5f9";

                tr.style.textAlign =
                    "center";


                thiDuaVisibleColumns.forEach(
                    function (key) {

                        const td =
                            document.createElement("td");

                        td.style.padding =
                            "6px 8px";

                        td.style.whiteSpace =
                            "nowrap";


                        const value =
                            getColumnValue(
                                item,
                                key
                            );


                        if (key === "lop") {

                            td.style.textAlign =
                                "left";

                            td.style.fontWeight =
                                "bold";
                        }


                        if (key === "siSo") {

                            td.style.color =
                                "#2563eb";

                            td.style.fontWeight =
                                "bold";
                        }


                        if (
                            key === "diemThiDua"
                        ) {

                            td.style.background =
                                "#f0fdf4";

                            td.style.color =
                                "#166534";

                            td.style.fontWeight =
                                "bold";
                        }


                        td.textContent =
                            value;


                        tr.appendChild(td);
                    }
                );


                tbody.appendChild(tr);
            }
        );
    }


    // ========================================================
    // TẢI DỮ LIỆU THI ĐUA
    // ========================================================

    async function taiDuLieuThiDua() {

        const tbody =
            document.getElementById(
                "coDoTableBody"
            );

        if (!tbody) return;


        const selectWeek =
            document.getElementById(
                "selectWeekBatch"
            );


        const selectedWeek =
            selectWeek
                ? selectWeek.value
                : "";


        if (!selectedWeek) {

            tbody.innerHTML =
                '<tr><td colspan="10" ' +
                'style="padding:20px;text-align:center">' +
                'Vui lòng chọn tuần.' +
                '</td></tr>';

            return;
        }


        tbody.innerHTML =
            '<tr><td colspan="10" ' +
            'style="padding:20px;text-align:center">' +
            '⏳ Đang tải dữ liệu thi đua...' +
            '</td></tr>';


        try {

            /*
             * API hiện tại của bạn đang có nghiệp vụ
             * lấy dữ liệu theo tuần.
             *
             * Phần này gọi action API mới theo mô hình
             * GitHub → Apps Script.
             */

            const result =
                await KienoraAPI.get(
                    "getWeeklyMonitoringData",
                    {
                        className:
                            window.currentSelectedClass || "",

                        selectedWeek:
                            selectedWeek
                    }
                );


            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result?.message ||
                    "Không lấy được dữ liệu thi đua."
                );
            }


            /*
             * Hỗ trợ nhiều dạng response để không
             * phá cấu trúc API hiện tại.
             */

            let data =
                result.emuData ||
                result.data ||
                result.rows ||
                [];


            if (!Array.isArray(data)) {
                data = [];
            }


            thiDuaData = data;


            renderBangThiDua();


        } catch (error) {

            console.error(
                "Lỗi tải dữ liệu thi đua:",
                error
            );


            tbody.innerHTML =
                '<tr>' +
                '<td colspan="10" style="' +
                'padding:20px;' +
                'text-align:center;' +
                'color:#dc2626;' +
                '">' +
                escapeHtml(
                    error.message ||
                    "Không tải được dữ liệu."
                ) +
                '</td>' +
                '</tr>';
        }
    }


    // ========================================================
    // PUBLIC API
    // ========================================================

    window.KienoraThiDua = {

        init:
            function () {

                initThiDuaColumnSelector();

            },

        load:
            taiDuLieuThiDua,

        render:
            renderBangThiDua,

        selectAll:
            chonTatCaCotThiDua,

        clearAll:
            boChonTatCaCotThiDua,

        setData:
            function (data) {

                thiDuaData =
                    Array.isArray(data)
                        ? data
                        : [];

                renderBangThiDua();
            },

        getVisibleColumns:
            function () {

                return [
                    ...thiDuaVisibleColumns
                ];
            }
    };


})();
