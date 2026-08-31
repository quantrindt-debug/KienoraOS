/* ==========================================================
   KienoraEdu - CORE.JS
   CÁC HÀM DÙNG CHUNG
========================================================== */

let currentRole = "";
/* ================= API ================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyQO3cCXn5aZhAg6W2kQ82z-iMqXmcPl28J_otL7g3xXkRJj8A1wwUGjZm61cJ6_KqLzA/exec";


async function postApi(payload) {

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
          JSON.stringify(payload)
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


async function getApi(params) {

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


/* ================= USER ================= */

let currentUser =
  localStorage.getItem(
    "kienora_current_user"
  ) || null;


let currentRole =
  localStorage.getItem(
    "kienora_current_role"
  ) || null;


function getCurrentUser() {

  return String(
    currentUser ||
    localStorage.getItem(
      "kienora_current_user"
    ) ||
    ""
  ).trim();
}


function getCurrentRole() {

  return String(
    currentRole ||
    localStorage.getItem(
      "kienora_current_role"
    ) ||
    ""
  ).trim();
}


/* ================= HTML SAFETY ================= */

function escapeHtml(value) {

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


/* ================= TEXT ================= */

function normalizeText(value) {

  return String(
    value || ""
  )
    .toLowerCase()
    .normalize("NFD")
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


/* ================= DATE ================= */

function todayISO() {

  const d =
    new Date();

  return (
    d.getFullYear() +
    "-" +
    String(
      d.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      d.getDate()
    ).padStart(2, "0")
  );
}


function formatDate(value) {

  if (!value) {
    return "";
  }

  const text =
    String(value).trim();

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


/* ================= DOM ================= */

function getEl(id) {
  return document.getElementById(id);
}


function getValue(id) {

  const node =
    getEl(id);

  return node
    ? String(
        node.value || ""
      ).trim()
    : "";
}


function setValue(
  id,
  value
) {

  const node =
    getEl(id);

  if (node) {
    node.value =
      value == null
        ? ""
        : value;
  }
}


function setText(
  id,
  value
) {

  const node =
    getEl(id);

  if (node) {
    node.textContent =
      value == null
        ? ""
        : value;
  }
}


/* ================= NUMBER ================= */

function toNumber(value) {

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


/* ================= URL ================= */

function isValidHttpUrl(url) {

  if (!url) {
    return true;
  }

  try {

    const parsed =
      new URL(url);

    return (
      parsed.protocol ===
        "http:" ||
      parsed.protocol ===
        "https:"
    );

  } catch {

    return false;
  }
}


/* ================= ROLE ================= */

function hasRole(
  ...roles
) {

  return roles.includes(
    getCurrentRole()
  );
}


/* ================= LOG ================= */

function coreLog(
  ...args
) {

  console.log(
    "[KienoraEdu]",
    ...args
  );
}
