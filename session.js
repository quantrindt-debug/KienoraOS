/* ============================================================
   KIENORA NỀ NẾP - SESSION
   Nhận tài khoản từ Kienora OS
   Không lưu mật khẩu
   ============================================================ */

(function () {

    "use strict";

    window.KienoraSession = {

        data: null,

        // ------------------------------------------------------
        // Nhận session từ hệ điều hành
        // ------------------------------------------------------
        init: function () {

            /*
             * Ưu tiên session do trang cha truyền sang.
             *
             * Ví dụ:
             *
             * window.KIENORA_SESSION = {
             *     maTruong: "...",
             *     maNhanSu: "...",
             *     taiKhoan: "...",
             *     role: "GVCN"
             * };
             */

            if (
                window.KIENORA_SESSION &&
                typeof window.KIENORA_SESSION === "object"
            ) {

                this.setSession(
                    window.KIENORA_SESSION
                );

                return true;
            }


            // --------------------------------------------------
            // Hỗ trợ trường hợp trang cha truyền qua URL
            // --------------------------------------------------
            const params =
                new URLSearchParams(
                    window.location.search
                );

            const sessionParam =
                params.get("session");


            if (sessionParam) {

                try {

                    const decoded =
                        JSON.parse(
                            decodeURIComponent(
                                sessionParam
                            )
                        );

                    this.setSession(decoded);

                    return true;

                } catch (err) {

                    console.error(
                        "Không đọc được session:",
                        err
                    );
                }
            }


            // --------------------------------------------------
            // Không có session
            // --------------------------------------------------
            console.warn(
                "Trang nề nếp chưa nhận được session từ Kienora OS."
            );

            return false;
        },


        // ------------------------------------------------------
        // Lưu session vào bộ nhớ trang
        // ------------------------------------------------------
        setSession: function (session) {

            if (!session || typeof session !== "object") {
                return false;
            }

            this.data = {

                maTruong:
                    String(
                        session.maTruong || ""
                    ).trim(),

                maNhanSu:
                    String(
                        session.maNhanSu || ""
                    ).trim(),

                taiKhoan:
                    String(
                        session.taiKhoan ||
                        session.username ||
                        ""
                    ).trim(),

                role:
                    String(
                        session.role || ""
                    ).trim(),

                hoTen:
                    String(
                        session.hoTen ||
                        session.tenNhanSu ||
                        ""
                    ).trim()
            };


            // Đồng bộ với các biến mà HTML cũ đang sử dụng
            window.currentUserSession =
                this.data;

            window.currentUsername =
                this.data.taiKhoan;

            window.currentUserRole =
                this.data.role;

            window.currentMaTruong =
                this.data.maTruong;

            window.currentMaNhanSu =
                this.data.maNhanSu;


            return true;
        },


        // ------------------------------------------------------
        // Lấy session
        // ------------------------------------------------------
        get: function () {

            return this.data;
        },


        // ------------------------------------------------------
        // Kiểm tra session
        // ------------------------------------------------------
        isValid: function () {

            return !!(
                this.data &&
                this.data.maTruong &&
                this.data.maNhanSu &&
                this.data.taiKhoan
            );
        },


        // ------------------------------------------------------
        // Xóa session
        // Không dùng logout riêng của trang
        // ------------------------------------------------------
        clear: function () {

            this.data = null;

            window.currentUserSession = null;
            window.currentUsername = "";
            window.currentUserRole = "";
            window.currentMaTruong = "";
            window.currentMaNhanSu = "";
        }
    };


    // Khởi tạo sau khi trang tải
    document.addEventListener(
        "DOMContentLoaded",
        function () {

            KienoraSession.init();

        }
    );

})();
