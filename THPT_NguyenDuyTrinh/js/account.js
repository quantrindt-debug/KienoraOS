/* ==========================================================
   KienoraEdu - ACCOUNT.JS
   FILE: js/account.js

   NHIỆM VỤ:
   - Đăng nhập
   - Đăng xuất
   - Xác thực tài khoản
   - Lưu tài khoản / vai trò
   - Đồng bộ currentUser / currentRole / currentSession
   - Hiển thị trạng thái tài khoản

   QUAN TRỌNG:
   - KHÔNG khai báo lại:
       API_URL
       currentUser
       currentRole
       currentSession
       escapeHtml
       setText
       postApi
       getApi

   Các biến/hàm trên đã thuộc core.js.
========================================================== */


/* ==========================================================
   1. CẤU HÌNH ID GIAO DIỆN
========================================================== */

const ACCOUNT_UI = {

  usernameInputIds: [
    "loginUsername",
    "username",
    "modalUsername",
    "taiKhoan",
    "txtUsername"
  ],

  passwordInputIds: [
    "loginPassword",
    "password",
    "modalPassword",
    "matKhau",
    "txtPassword"
  ],

  emailInputIds: [
    "loginEmail",
    "email",
    "modalEmail"
  ],

  submitButtonIds: [
    "loginSubmitBtn",
    "loginBtn",
    "authSubmitBtn",
    "btnLogin"
  ],

  userDisplayIds: [
    "currentUserText",
    "usernameDisplay",
    "authUsernameText",
    "roleDisplay"
  ],

  statusIds: [
    "authStatus",
    "authStatusText",
    "accountStatus"
  ],

  loginContainerIds: [
    "loginContainer",
    "loginButtons",
    "authButtons"
  ]
};


/* ==========================================================
   2. TIỆN ÍCH TÌM ELEMENT
========================================================== */

function accountFindElement(ids) {

  if (!Array.isArray(ids)) {
    return null;
  }

  for (const id of ids) {

    const el =
      document.getElementById(id);

    if (el) {
      return el;
    }

  }

  return null;
}


/* ==========================================================
   3. LẤY USERNAME TỪ GIAO DIỆN
========================================================== */

function accountGetUsernameInput() {

  const el =
    accountFindElement(
      ACCOUNT_UI.usernameInputIds
    );

  return el
    ? String(
        el.value || ""
      ).trim()
    : "";

}


/* ==========================================================
   4. LẤY PASSWORD TỪ GIAO DIỆN
========================================================== */

function accountGetPasswordInput() {

  const el =
    accountFindElement(
      ACCOUNT_UI.passwordInputIds
    );

  return el
    ? String(
        el.value || ""
      ).trim()
    : "";

}


/* ==========================================================
   5. LẤY EMAIL TỪ GIAO DIỆN
========================================================== */

function accountGetEmailInput() {

  const el =
    accountFindElement(
      ACCOUNT_UI.emailInputIds
    );

  return el
    ? String(
        el.value || ""
      ).trim()
    : "";

}


/* ==========================================================
   6. LƯU SESSION
========================================================== */

function accountSaveSession(data) {

  data =
    data || {};

  const sessionData = {

    username:
      data.username ||
      data.taiKhoan ||
      data.maNhanSu ||
      "",

    role:
      data.role ||
      data.vaiTro ||
      "",

    maTruong:
      data.maTruong ||
      "",

    maNhanSu:
      data.maNhanSu ||
      "",

    fullName:
      data.fullName ||
      data.hoTen ||
      "",

    email:
      data.email ||
      ""

  };


  /*
   * Dùng hàm chung của core.js.
   */

  setCurrentSession(
    sessionData
  );


  /*
   * Lưu thêm một số thông tin
   * để các tab khác có thể đọc.
   */

  if (sessionData.fullName) {

    localStorage.setItem(
      "kienora_full_name",
      sessionData.fullName
    );

  }

  if (sessionData.email) {

    localStorage.setItem(
      "kienora_email",
      sessionData.email
    );

  }


  return sessionData;
}


/* ==========================================================
   7. ĐỌC THÔNG TIN SESSION
========================================================== */

function accountLoadSession() {

  /*
   * core.js đã đọc localStorage.
   * Ta chỉ đồng bộ lại.
   */

  const storedUsername =
    localStorage.getItem(
      "kienora_current_user"
    ) || "";

  const storedRole =
    localStorage.getItem(
      "kienora_current_role"
    ) || "";

  const storedSchool =
    localStorage.getItem(
      "maTruong"
    ) || "";

  const storedStaff =
    localStorage.getItem(
      "maNhanSu"
    ) || "";


  if (
    storedUsername ||
    storedRole ||
    storedSchool ||
    storedStaff
  ) {

    setCurrentSession({

      username:
        storedUsername,

      role:
        storedRole,

      maTruong:
        storedSchool,

      maNhanSu:
        storedStaff

    });

  }


  return currentSession;
}


/* ==========================================================
   8. KIỂM TRA ĐÃ ĐĂNG NHẬP
========================================================== */

function isLoggedIn() {

  return !!String(
    currentUser || ""
  ).trim();

}


/* ==========================================================
   9. LẤY TÊN HIỂN THỊ
========================================================== */

function getAccountDisplayName() {

  return String(

    localStorage.getItem(
      "kienora_full_name"
    ) ||

    currentSession.fullName ||

    currentUser ||

    "Khách"

  ).trim();

}


/* ==========================================================
   10. LẤY VAI TRÒ HIỂN THỊ
========================================================== */

function getAccountRoleDisplay() {

  const role =
    String(
      currentRole || ""
    ).trim();

  if (!role) {
    return "Khách";
  }

  const upper =
    role.toUpperCase();

  if (upper === "ADMIN") {
    return "ADMIN";
  }

  if (upper === "BGH") {
    return "BGH";
  }

  if (upper === "GVCN") {
    return "GVCN";
  }

  if (
    upper === "CO_DO" ||
    upper === "CỜ ĐỎ"
  ) {
    return "CỜ ĐỎ";
  }

  if (
    upper === "BTĐ" ||
    upper === "BTD"
  ) {
    return "BÍ THƯ ĐOÀN";
  }

  return role;
}


/* ==========================================================
   11. KIỂM TRA QUYỀN
========================================================== */

function accountHasRole(...roles) {

  const role =
    String(
      currentRole || ""
    ).trim().toUpperCase();

  if (!role) {
    return false;
  }

  return roles.some(
    item =>
      String(
        item || ""
      )
        .trim()
        .toUpperCase() === role
  );

}


/* ==========================================================
   12. KIỂM TRA ADMIN / BGH
========================================================== */

function accountIsAdmin() {

  const role =
    String(
      currentRole || ""
    ).trim().toUpperCase();

  return (
    role === "ADMIN" ||
    role === "ADMINISTRATOR" ||
    role.includes("ADMIN")
  );

}


function accountIsBGH() {

  const role =
    String(
      currentRole || ""
    ).trim().toUpperCase();

  return (
    role === "BGH" ||
    role.includes(
      "BAN GIÁM HIỆU"
    )
  );

}


/* ==========================================================
   13. KIỂM TRA QUẢN TRỊ
========================================================== */

function accountIsAdminOrBGH() {

  return (
    accountIsAdmin() ||
    accountIsBGH()
  );

}


/* ==========================================================
   14. HIỂN THỊ THÔNG TIN TÀI KHOẢN
========================================================== */

function renderAccountStatus() {

  const displayName =
    getAccountDisplayName();

  const role =
    getAccountRoleDisplay();


  /*
   * Các ô hiển thị username.
   */

  ACCOUNT_UI.userDisplayIds.forEach(
    function(id) {

      const el =
        document.getElementById(id);

      if (!el) {
        return;
      }

      if (isLoggedIn()) {

        el.textContent =
          displayName +
          " (" +
          role +
          ")";

      } else {

        el.textContent =
          "Khách";

      }

    }
  );


  /*
   * Trạng thái tài khoản.
   */

  ACCOUNT_UI.statusIds.forEach(
    function(id) {

      const el =
        document.getElementById(id);

      if (!el) {
        return;
      }

      if (isLoggedIn()) {

        el.textContent =
          "🟢 " +
          role;

      } else {

        el.textContent =
          "⚪ Chưa đăng nhập";

      }

    }
  );


  /*
   * Các container nút đăng nhập.
   */

  const container =
    accountFindElement(
      ACCOUNT_UI.loginContainerIds
    );

  if (!container) {
    return;
  }


  /*
   * Không tự phá giao diện hiện tại
   * nếu HTML đã có cấu trúc riêng.
   *
   * Chỉ cập nhật thuộc tính data.
   */

  container.dataset.loggedIn =
    isLoggedIn()
      ? "true"
      : "false";

  container.dataset.role =
    currentRole || "";

}


/* ==========================================================
   15. XÓA FORM ĐĂNG NHẬP
========================================================== */

function clearLoginForm() {

  ACCOUNT_UI.usernameInputIds.forEach(
    function(id) {

      const el =
        document.getElementById(id);

      if (el) {
        el.value = "";
      }

    }
  );


  ACCOUNT_UI.passwordInputIds.forEach(
    function(id) {

      const el =
        document.getElementById(id);

      if (el) {
        el.value = "";
      }

    }
  );


  ACCOUNT_UI.emailInputIds.forEach(
    function(id) {

      const el =
        document.getElementById(id);

      if (el) {
        el.value = "";
      }

    }
  );

}


/* ==========================================================
   16. ĐẶT TRẠNG THÁI NÚT ĐĂNG NHẬP
========================================================== */

function setLoginButtonState(
  loading
) {

  const button =
    accountFindElement(
      ACCOUNT_UI.submitButtonIds
    );

  if (!button) {
    return;
  }


  if (loading) {

    if (
      !button.dataset.oldText
    ) {

      button.dataset.oldText =
        button.innerHTML;

    }

    button.disabled =
      true;

    button.innerHTML =
      "⏳ Đang đăng nhập...";

  } else {

    button.disabled =
      false;

    if (
      button.dataset.oldText
    ) {

      button.innerHTML =
        button.dataset.oldText;

      delete button.dataset.oldText;

    }

  }

}


/* ==========================================================
   17. ĐĂNG NHẬP
========================================================== */

async function loginAccount(
  username,
  password
) {

  username =
    String(
      username ||
      ""
    ).trim();

  password =
    String(
      password ||
      ""
    ).trim();


  if (!username) {

    throw new Error(
      "Vui lòng nhập tên đăng nhập."
    );

  }


  if (!password) {

    throw new Error(
      "Vui lòng nhập mật khẩu."
    );

  }


  /*
   * Backend Code.gs cần xử lý:
   *
   * action = authenticateUser
   */

  const result =
    await postApi({

      action:
        "authenticateUser",

      username:
        username,

      password:
        password

    });


  /*
   * Chấp nhận cả:
   * status = success
   * success = true
   */

  const success =
    result &&
    (
      result.status === "success" ||
      result.success === true
    );


  if (!success) {

    throw new Error(
      result.message ||
      "Sai tên đăng nhập, mật khẩu hoặc tài khoản chưa được phép đăng nhập."
    );

  }


  accountSaveSession(
    result
  );


  renderAccountStatus();


  coreLog(
    "Đăng nhập thành công:",
    {
      username:
        currentUser,

      role:
        currentRole,

      maTruong:
        currentSession.maTruong,

      maNhanSu:
        currentSession.maNhanSu
    }
  );


  return result;
}


/* ==========================================================
   18. ĐĂNG NHẬP TỪ FORM HTML
========================================================== */

async function submitLoginForm() {

  const username =
    accountGetUsernameInput();

  const password =
    accountGetPasswordInput();


  setLoginButtonState(
    true
  );


  try {

    const result =
      await loginAccount(
        username,
        password
      );


    alert(
      result.message ||
      "✅ Đăng nhập thành công."
    );


    /*
     * Gọi lại hàm khởi tạo của các module
     * nếu chúng tồn tại.
     */

    accountNotifyModules();


    return result;

  }

  catch (error) {

    console.error(
      "Lỗi đăng nhập:",
      error
    );


    alert(
      "❌ " +
      (
        error.message ||
        "Không thể đăng nhập."
      )
    );


    throw error;

  }

  finally {

    setLoginButtonState(
      false
    );

  }

}


/* ==========================================================
   19. THÔNG BÁO CHO CÁC MODULE SAU ĐĂNG NHẬP
========================================================== */

function accountNotifyModules() {

  /*
   * Không bắt buộc module nào phải tồn tại.
   */

  try {

    if (
      typeof loadNhom8Permission ===
      "function"
    ) {

      loadNhom8Permission();

    }

  } catch (error) {

    console.warn(
      "Không thể khởi tạo Nhóm 8:",
      error
    );

  }


  try {

    if (
      typeof onOpenTab3 ===
      "function"
    ) {

      onOpenTab3();

    }

  } catch (error) {

    console.warn(
      "Không thể khởi tạo Tab 3:",
      error
    );

  }

}


/* ==========================================================
   20. ĐĂNG XUẤT
========================================================== */

function logoutAccount() {

  currentUser =
    "";

  currentRole =
    "";


  currentSession.username =
    "";

  currentSession.role =
    "";

  currentSession.maTruong =
    "";

  currentSession.maNhanSu =
    "";


  localStorage.removeItem(
    "kienora_current_user"
  );

  localStorage.removeItem(
    "kienora_current_role"
  );

  localStorage.removeItem(
    "kienora_full_name"
  );

  localStorage.removeItem(
    "kienora_email"
  );

  localStorage.removeItem(
    "maTruong"
  );

  localStorage.removeItem(
    "maNhanSu"
  );


  renderAccountStatus();


  clearLoginForm();


  coreLog(
    "Đã đăng xuất."
  );


  /*
   * Cho các module biết tài khoản đã thoát.
   */

  try {

    if (
      typeof onAccountLogout ===
      "function"
    ) {

      onAccountLogout();

    }

  } catch (error) {

    console.warn(
      "Lỗi thông báo đăng xuất:",
      error
    );

  }


  return true;
}


/* ==========================================================
   21. ALIAS ĐỂ GIỮ HTML CŨ
========================================================== */

function login() {
  return submitLoginForm();
}


function logout() {
  return logoutAccount();
}


/* ==========================================================
   22. ĐỒNG BỘ TÀI KHOẢN TỪ TRANG CHA
========================================================== */

function syncAccountFromParent() {

  /*
   * Dùng hàm chung của core.js.
   */

  const raw =
    getAccountFromParent();


  if (!raw) {

    renderAccountStatus();

    return "";

  }


  /*
   * Nếu trang cha đã lưu role,
   * core.js đã đọc role từ localStorage.
   */

  accountLoadSession();


  renderAccountStatus();


  coreLog(
    "Đã nhận tài khoản từ trang cha:",
    {
      account:
        raw,

      role:
        currentRole,

      maTruong:
        currentSession.maTruong,

      maNhanSu:
        currentSession.maNhanSu
    }
  );


  return raw;
}


/* ==========================================================
   23. KIỂM TRA ROLE TỪ BACKEND
========================================================== */

async function refreshAccountRole() {

  const maTruong =
    String(
      currentSession.maTruong ||
      ""
    ).trim();

  const maNhanSu =
    String(
      currentSession.maNhanSu ||
      ""
    ).trim();


  if (!maTruong && !maNhanSu) {
    return null;
  }


  try {

    /*
     * Backend Code.gs cần có action:
     * checkRole
     */

    const result =
      await getApi({

        action:
          "checkRole",

        maTruong:
          maTruong,

        maNhanSu:
          maNhanSu

      });


    if (
      result &&
      result.status ===
      "success"
    ) {

      currentRole =
        String(
          result.role ||
          ""
        ).trim();


      currentSession.role =
        currentRole;


      localStorage.setItem(
        "kienora_current_role",
        currentRole
      );


      renderAccountStatus();


      return result;

    }


  } catch (error) {

    console.warn(
      "Không thể cập nhật vai trò:",
      error
    );

  }


  return null;
}


/* ==========================================================
   24. NHẬN THÔNG TIN TÀI KHOẢN
========================================================== */

function getAccountInfo() {

  return {

    username:
      currentUser || "",

    role:
      currentRole || "",

    maTruong:
      currentSession.maTruong || "",

    maNhanSu:
      currentSession.maNhanSu || "",

    fullName:
      localStorage.getItem(
        "kienora_full_name"
      ) || "",

    email:
      localStorage.getItem(
        "kienora_email"
      ) || ""

  };

}


/* ==========================================================
   25. KHỞI TẠO ACCOUNT
========================================================== */

function initAccount() {

  try {

    /*
     * 1. Đọc session hiện có.
     */

    accountLoadSession();


    /*
     * 2. Nhận tài khoản từ trang cha.
     */

    syncAccountFromParent();


    /*
     * 3. Hiển thị tài khoản.
     */

    renderAccountStatus();


    /*
     * 4. Nếu đã đăng nhập,
     *    thử cập nhật role từ server.
     */

    if (
      isLoggedIn()
    ) {

      refreshAccountRole();

    }


    coreLog(
      "Account.js đã khởi động.",
      getAccountInfo()
    );

  }

  catch (error) {

    console.error(
      "Lỗi khởi tạo account.js:",
      error
    );

  }

}


/* ==========================================================
   26. DOM READY
========================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    initAccount();

  }
);
