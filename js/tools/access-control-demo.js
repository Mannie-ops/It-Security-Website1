(() => {
  const USERS = {
    user: { password: "user123", role: "Regular User" },
    admin: { password: "admin123", role: "Administrator" }
  };

  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const authStatus = document.getElementById("auth-status");
  const currentRole = document.getElementById("current-role");
  const logoutButton = document.getElementById("logout-button");
  const protectedActions = document.getElementById("protected-actions");
  const actionResult = document.getElementById("action-result");
  const protectedTitle = document.getElementById("protected-title");

  let session = null;

  function renderSession() {
    document.body.classList.toggle("admin-view", session?.role === "Administrator");
    if (!session) {
      currentRole.textContent = "Guest";
      authStatus.textContent = "Not authenticated";
      authStatus.className = "security-status";
      protectedActions.hidden = true;
      logoutButton.hidden = true;
      protectedTitle.textContent = "Protected actions";
      return;
    }

    currentRole.textContent = session.role;
    authStatus.textContent = `Authenticated as ${session.username}. Authorization is now based on the ${session.role} role.`;
    authStatus.className = "security-status success";
    protectedActions.hidden = false;
    logoutButton.hidden = false;
    protectedTitle.textContent = `${session.role} protected actions`;
  }

  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!USERS[username] || USERS[username].password !== password) {
      session = null;
      authStatus.textContent = "Authentication failed: incorrect username or password.";
      authStatus.className = "security-status error";
      currentRole.textContent = "Guest";
      protectedActions.hidden = true;
      logoutButton.hidden = true;
      document.body.classList.remove("admin-view");
      return;
    }

    session = { username, role: USERS[username].role };
    passwordInput.value = "";
    actionResult.textContent = "";
    renderSession();
  });

  logoutButton.addEventListener("click", () => {
    session = null;
    usernameInput.value = "";
    passwordInput.value = "";
    actionResult.textContent = "";
    renderSession();
  });

  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      if (!session) return;

      const action = button.dataset.action;
      const adminActions = ["users", "logs", "content"];

      if (adminActions.includes(action) && session.role !== "Administrator") {
        actionResult.textContent = "Authorization denied: this action requires the Administrator role.";
        return;
      }

      const messages = {
        profile: "Authorized: Regular Users can view and edit their personal profile.",
        users: "Authorized: Administrator can manage users.",
        logs: "Authorized: Administrator can view security logs.",
        content: "Authorized: Administrator can manage website content."
      };

      actionResult.textContent = messages[action] || "Action authorized.";
    });
  });

  renderSession();
})();
