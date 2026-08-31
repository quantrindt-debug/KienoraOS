function setCurrentSession(data) {

  currentUser =
    String(
      data.username ||
      data.maNhanSu ||
      ""
    ).trim();

  currentRole =
    String(
      data.role ||
      ""
    ).trim();

  currentSession.maTruong =
    String(
      data.maTruong ||
      ""
    ).trim();

  currentSession.maNhanSu =
    String(
      data.maNhanSu ||
      currentUser ||
      ""
    ).trim();

  localStorage.setItem(
    "kienora_current_user",
    currentUser
  );

  localStorage.setItem(
    "kienora_current_role",
    currentRole
  );
}
