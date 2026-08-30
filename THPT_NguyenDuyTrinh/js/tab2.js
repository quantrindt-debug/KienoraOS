/* ============================================================
   🟦 TAB 2 — THEO DÕI TUẦN
   FILE: js/tab2.js
   PHẦN 2.1 — TẢI DANH SÁCH TUẦN
============================================================ */

function loadWeeksDropdown() {

    if (
        typeof google === 'undefined' ||
        !google.script ||
        !google.script.run
    ) {
        console.warn(
            'Google Apps Script không khả dụng.'
        );
        return;
    }


    google.script.run

        .withSuccessHandler(function(res) {

            const weekSelect =
                document.getElementById(
                    'selectWeek'
                );


            if (!weekSelect) {
                return;
            }


            weekSelect.innerHTML = '';


            if (
                !res ||
                !res.success ||
                !Array.isArray(res.weeks) ||
                res.weeks.length === 0
            ) {

                weekSelect.innerHTML =
                    '<option value="">-- Chưa có cấu hình tuần --</option>';

                return;
            }


            res.weeks.forEach(function(weekName) {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    weekName;


                option.textContent =
                    weekName;


                weekSelect.appendChild(
                    option
                );

            });


            // Sau khi có danh sách tuần,
            // tự động tải tuần đang chọn
            loadWeeklyData();


            if (
                typeof loadWeeklyStatusOverview ===
                'function'
            ) {

                loadWeeklyStatusOverview();

            }

        })

        .withFailureHandler(function(err) {

            console.error(
                'Lỗi nạp danh sách tuần:',
                err
            );


            const weekSelect =
                document.getElementById(
                    'selectWeek'
                );


            if (weekSelect) {

                weekSelect.innerHTML =
                    '<option value="">-- Lỗi tải danh sách tuần --</option>';

            }

        })

        .getListWeeksFromConfig();
  /* ============================================================
   🟦 TAB 2 — PHẦN 2.2
   TẢI DỮ LIỆU THEO TUẦN + LỚP
============================================================ */

function loadWeeklyData() {

    const className =
        typeof getCurrentSelectedClass === 'function'
            ? getCurrentSelectedClass()
            : '';


    const weekElem =
        document.getElementById(
            'selectWeek'
        );


    const selectedWeek =
        weekElem
            ? weekElem.value
            : '';


    if (
        !className ||
        !selectedWeek
    ) {

        return;

    }


    if (
        typeof google === 'undefined' ||
        !google.script ||
        !google.script.run
    ) {

        console.warn(
            'Google Apps Script không khả dụng.'
        );

        return;
    }


    google.script.run

        .withSuccessHandler(
            renderWeeklyData
        )

        .withFailureHandler(function(err) {

            console.error(
                'Lỗi nạp dữ liệu tuần:',
                err
            );

        })

        .getWeeklyMonitoringData(
            className,
            selectedWeek
        );

}
  /* ============================================================
   🟦 TAB 2 — PHẦN 2.3
   RENDER DỮ LIỆU THEO DÕI TUẦN
============================================================ */

function renderWeeklyData(res) {

    if (
        !res ||
        !res.success
    ) {

        return;

    }


    const em =
        res.emulation ||
        res.data ||
        {};


    /* ----------------------------------------------------------
       G. SĨ SỐ / CHUYÊN CẦN
       ----------------------------------------------------------
       Các ID này lấy theo HTML hiện tại.
    ---------------------------------------------------------- */

    const setValue =
        function(id, value) {

            const el =
                document.getElementById(id);

            if (el) {

                el.value =
                    value !== undefined &&
                    value !== null
                        ? value
                        : '';

            }

        };


    setValue(
        'ccSiSo',
        em.siSo
    );


    setValue(
        'ccVangCoPhep',
        em.vangCoPhep
    );


    setValue(
        'ccVangKhongPhep',
        em.vangKhongPhep
    );


    setValue(
        'ccDiMuon',
        em.diMuon
    );


    setValue(
        'ccGhiChu',
        em.ghiChuCC
    );


    /* ----------------------------------------------------------
       H. THI ĐUA
    ---------------------------------------------------------- */

    setValue(
        'tdSDB',
        em.sdb
    );


    setValue(
        'tdCuocThi',
        em.cuocThi
    );


    setValue(
        'tdVeSinh',
        em.veSinh
    );


    setValue(
        'tdCSVC',
        em.csvc
    );


    setValue(
        'tdXepXe',
        em.xepXe
    );


    setValue(
        'tdQDKhac',
        em.qdKhac
    );


    setValue(
        'tdNhanXet',
        em.nhanXet ||
        em.nhanXetTD
    );


    /* ----------------------------------------------------------
       Tổng điểm + vị thứ
    ---------------------------------------------------------- */

    const role =
        String(
            window.currentUserRole ||
            currentRole ||
            'GVCN'
        ).trim().toUpperCase();


    const isBGHOrAdmin =
        role === 'ADMIN' ||
        role === 'BGH';


    const isLocked =
        Boolean(
            res.isLocked
        );


    const txtTongDiem =
        document.getElementById(
            'txtTongDiemThiDua'
        );


    const txtViThu =
        document.getElementById(
            'txtViThuTrongTruong'
        );


    /*
       Admin / BGH hoặc tuần đã khóa:
       hiển thị điểm thật.
    */

    if (
        isBGHOrAdmin ||
        isLocked
    ) {

        if (txtTongDiem) {

            txtTongDiem.value =
                em.diemTong !== undefined
                    ? em.diemTong
                    : '';

        }


        if (txtViThu) {

            txtViThu.value =
                em.viThu !== undefined
                    ? em.viThu
                    : '';

        }

    }

    else {

        /*
           Tuần chưa khóa:
           GVCN / Cờ đỏ không xem
           điểm tổng cuối cùng.
        */

        if (txtTongDiem) {

            txtTongDiem.value =
                'Đang cập nhật...';

        }


        if (txtViThu) {

            txtViThu.value =
                '---';

        }

    }


    /*
       Tính lại điểm hiển thị
       theo các thành phần hiện tại.
    */

    if (
        typeof calculateTotalEmulation ===
        'function'
    ) {

        calculateTotalEmulation();

    }

}
  /* ============================================================
   🟦 TAB 2 — PHẦN 2.4
   TÍNH TỔNG ĐIỂM THI ĐUA
============================================================ */

function calculateTotalEmulation() {

    const getNum =
        function(id) {

            const el =
                document.getElementById(id);


            return el
                ? (
                    parseFloat(
                        el.value
                    ) || 0
                )
                : 0;

        };


    const sdb =
        getNum('tdSDB');


    const cuocThi =
        getNum('tdCuocThi');


    const veSinh =
        getNum('tdVeSinh');


    const csvc =
        getNum('tdCSVC');


    const xepXe =
        getNum('tdXepXe');


    const qdKhac =
        getNum('tdQDKhac');


    /*
       Công thức hiện tại:

       SĐB       × 3
       Cuộc thi  × 1
       Vệ sinh   × 1
       CSVC      × 1
       Xếp xe    × 1
       QĐ khác   × 3

       Tổng hệ số = 10
    */

    const rawScore =
        (sdb * 3) +
        (cuocThi * 1) +
        (veSinh * 1) +
        (csvc * 1) +
        (xepXe * 1) +
        (qdKhac * 3);


    const finalScore =
        (
            rawScore / 10
        ).toFixed(2);


    const inputTotal =
        document.getElementById(
            'txtTongDiemThiDua'
        );


    const role =
        String(
            window.currentUserRole ||
            currentRole ||
            'GVCN'
        ).trim().toUpperCase();


    /*
       Chỉ Admin / BGH được tính
       và hiển thị tổng điểm cuối.
    */

    if (
        inputTotal &&
        (
            role === 'ADMIN' ||
            role === 'BGH'
        )
    ) {

        inputTotal.value =
            finalScore;

    }

}
  /* ============================================================
   🟦 TAB 2 — PHẦN 2.5
   LƯU THEO DÕI TUẦN
============================================================ */

function submitWeeklyData() {

    const getVal =
        function(
            id,
            defaultVal = ''
        ) {

            const el =
                document.getElementById(id);


            return el
                ? el.value
                : defaultVal;

        };


    const className =
        typeof getActiveClassName === 'function'
            ? getActiveClassName()
            : '';


    const week =
        getVal(
            'selectWeek'
        ) || '1';


    if (!className) {

        alert(
            'Vui lòng chọn Lớp trước khi lưu dữ liệu!'
        );

        return;
    }


    /* ----------------------------------------------------------
       Payload giữ nguyên cấu trúc API hiện tại
    ---------------------------------------------------------- */

    const payload = {

        className:
            className,

        week:
            week,

        dateRange:
            getVal(
                'txtDateRange'
            ),

        siSo:
            getVal(
                'ccSiSo'
            ),

        vangCoPhep:
            getVal(
                'ccVangCoPhep',
                0
            ),

        vangKhongPhep:
            getVal(
                'ccVangKhongPhep',
                0
            ),

        diMuon:
            getVal(
                'ccDiMuon',
                0
            ),

        ghiChuCC:
            getVal(
                'ccGhiChu'
            ),

        sdb:
            getVal(
                'tdSDB'
            ),

        cuocThi:
            getVal(
                'tdCuocThi'
            ),

        veSinh:
            getVal(
                'tdVeSinh'
            ),

        csvc:
            getVal(
                'tdCSVC'
            ),

        xepXe:
            getVal(
                'tdXepXe'
            ),

        qdKhac:
            getVal(
                'tdQDKhac'
            ),

        diemTong:
            getVal(
                'txtTongDiemThiDua'
            ),

        viThu:
            getVal(
                'tdViThu'
            ),

        nhanXetTD:
            getVal(
                'tdNhanXet'
            )

    };


    const btnSave =
        document.getElementById(
            'btnSaveWeekly'
        );


    let oldText = '';


    if (btnSave) {

        oldText =
            btnSave.innerHTML;

        btnSave.disabled =
            true;

        btnSave.innerHTML =
            '⏳ Đang lưu...';

    }


    /*
       Lấy role và tài khoản từ
       account.js dùng chung.
    */

    const role =
        String(
            window.currentUserRole ||
            currentRole ||
            'GVCN'
        ).trim().toUpperCase();


    const userAcc =
        window.currentUsername ||
        (
            typeof currentSession !== 'undefined'
                ? currentSession.maNhanSu
                : ''
        ) ||
        role;


    google.script.run

        .withSuccessHandler(function(res) {

            if (btnSave) {

                btnSave.disabled =
                    false;

                btnSave.innerHTML =
                    oldText;

            }


            if (
                res &&
                res.success
            ) {

                alert(
                    res.message ||
                    '✓ Lưu dữ liệu thành công!'
                );


                if (
                    typeof loadWeeklyStatusOverview ===
                    'function'
                ) {

                    loadWeeklyStatusOverview();

                }

            }

            else {

                alert(
                    '❌ Lỗi: ' +
                    (
                        res
                            ? res.message
                            : 'Không lưu được dữ liệu'
                    )
                );

            }

        })

        .withFailureHandler(function(err) {

            if (btnSave) {

                btnSave.disabled =
                    false;

                btnSave.innerHTML =
                    oldText;

            }


            console.error(
                'Lỗi lưu theo dõi tuần:',
                err
            );


            alert(
                '❌ Lỗi kết nối máy chủ: ' +
                err.toString()
            );

        })

        .saveWeeklyMonitoring(
            payload,
            role,
            userAcc
        );

}
  

}
/* ============================================================
   🟦 TAB 2 — PHẦN 2.6
   KHỞI TẠO TAB 2
============================================================ */

document.addEventListener(
    'DOMContentLoaded',
    function() {

        loadWeeksDropdown();


        /*
           Gắn sự kiện tính điểm tự động.
        */

        [
            'tdSDB',
            'tdCuocThi',
            'tdVeSinh',
            'tdCSVC',
            'tdXepXe',
            'tdQDKhac'

        ].forEach(function(id) {

            const el =
                document.getElementById(id);


            if (el) {

                el.addEventListener(
                    'input',
                    calculateTotalEmulation
                );

            }

        });

    }
);
