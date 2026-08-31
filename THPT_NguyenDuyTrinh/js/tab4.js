function getCurrentRole() {
  if (typeof currentRole !== "undefined" && currentRole) {
    return String(currentRole).trim();
  }

  return String(
    localStorage.getItem("kienora_current_role") || ""
  ).trim();
}

function canInputCoDo() {
  const role = getCurrentRole();

  return [
    "CO_DO",
    "BTD",
    "BGH",
    "admin"
  ].includes(role);
}

function canEditCoDo() {
  const role = getCurrentRole();

  return [
    "CO_DO",
    "BTD",
    "BGH",
    "admin"
  ].includes(role);
}

function canDeleteCoDo() {
  const role = getCurrentRole();

  return [
    "BGH",
    "admin"
  ].includes(role);
}

function canLockCoDo() {
  const role = getCurrentRole();

  return [
    "BGH",
    "admin"
  ].includes(role);
}
