/* ============================================================
   KIENORA NỀ NẾP - API CLIENT
   GitHub Pages → Google Apps Script API
   ============================================================ */

(function () {

    "use strict";


    // ========================================================
    // API CHÍNH THỨC
    // ========================================================
    const API_BASE_URL =
        "https://script.google.com/macros/s/" +
        "AKfycbzeZ0j8mW6hnhbBZ1_W54DJTXDx_SCjWttwsk-18euRuNxZCgR6JLDuudhSY1tpX7gv/exec";


    window.KienoraAPI = {


        // ----------------------------------------------------
        // URL API
        // ----------------------------------------------------
        baseUrl: API_BASE_URL,


        // ====================================================
        // TẠO URL
        // ====================================================
        buildUrl: function (action, params) {

            const url =
                new URL(API_BASE_URL);

            url.searchParams.set(
                "action",
                action
            );


            if (
                params &&
                typeof params === "object"
            ) {

                Object.keys(params).forEach(
                    function (key) {

                        const value =
                            params[key];

                        if (
                            value !== undefined &&
                            value !== null
                        ) {

                            url.searchParams.set(
                                key,
                                String(value)
                            );
                        }
                    }
                );
            }


            return url.toString();
        },


        // ====================================================
        // LẤY THÔNG TIN SESSION
        // ====================================================
        getSessionParams: function () {

            if (
                !window.KienoraSession ||
                !KienoraSession.isValid()
            ) {

                throw new Error(
                    "Phiên đăng nhập từ Kienora OS chưa sẵn sàng."
                );
            }


            const session =
                KienoraSession.get();


            return {

                maTruong:
                    session.maTruong,

                maNhanSu:
                    session.maNhanSu,

                taiKhoan:
                    session.taiKhoan
            };
        },


        // ====================================================
        // GET API
        // ====================================================
        get: async function (
            action,
            params
        ) {

            const sessionParams =
                this.getSessionParams();


            const finalParams =
                Object.assign(
                    {},
                    sessionParams,
                    params || {}
                );


            const url =
                this.buildUrl(
                    action,
                    finalParams
                );


            console.log(
                "[KIENORA API]",
                action,
                finalParams
            );


            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "API HTTP " +
                    response.status
                );
            }


            const result =
                await response.json();


            if (
                result &&
                result.status === "error"
            ) {

                throw new Error(
                    result.message ||
                    "API trả về lỗi."
                );
            }


            return result;
        },


        // ====================================================
        // GỌI API KHÔNG CẦN LẶP SESSION
        // ====================================================
        rawGet: async function (
            action,
            params
        ) {

            const url =
                this.buildUrl(
                    action,
                    params || {}
                );


            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "API HTTP " +
                    response.status
                );
            }


            return await response.json();
        },


        // ====================================================
        // KIỂM TRA KẾT NỐI API
        // ====================================================
        testConnection: async function () {

            try {

                const result =
                    await this.rawGet(
                        "getListWeeksFromConfig"
                    );


                console.log(
                    "API hoạt động:",
                    result
                );


                return result;

            } catch (error) {

                console.error(
                    "API không kết nối được:",
                    error
                );

                throw error;
            }
        }
    };


})();
