(function () {
  "use strict";

  var ACCOUNTS_KEY = "adspAccounts";
  var CURRENT_USER_KEY = "adspCurrentUser";
  var LEGACY_STUDY_KEY = "adspStudyData";

  function normalizeUsername(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getAccounts() {
    try {
      var raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  function simpleHash(value) {
    var hash = 2166136261;
    for (var i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return ("00000000" + (hash >>> 0).toString(16)).slice(-8);
  }

  function setCurrentUser(account) {
    var current = {
      username: account.username,
      displayName: account.displayName || account.username,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));
    migrateGuestStudyData(account.username);
    window.dispatchEvent(new Event("adspAuthChanged"));
    return current;
  }

  function getCurrentUser() {
    try {
      var raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function userStudyKey(username) {
    return "adspStudyData:user:" + encodeURIComponent(username);
  }

  function migrateGuestStudyData(username) {
    var legacy = localStorage.getItem(LEGACY_STUDY_KEY);
    var targetKey = userStudyKey(username);
    if (legacy && !localStorage.getItem(targetKey)) {
      localStorage.setItem(targetKey, legacy);
    }
  }

  function validate(username, password) {
    if (!username || username.length < 3) {
      throw new Error("아이디는 3자 이상이어야 합니다.");
    }
    if (!/^[a-z0-9._-]+$/.test(username)) {
      throw new Error("아이디는 영문 소문자, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.");
    }
    if (!password || password.length < 4) {
      throw new Error("비밀번호는 4자 이상이어야 합니다.");
    }
  }

  function signUp(usernameInput, password, displayNameInput) {
    var username = normalizeUsername(usernameInput);
    var displayName = String(displayNameInput || username).trim() || username;
    validate(username, password);
    var accounts = getAccounts();
    if (accounts[username]) {
      throw new Error("이미 가입된 아이디입니다.");
    }
    var now = new Date().toISOString();
    accounts[username] = {
      username: username,
      displayName: displayName,
      passwordHash: simpleHash(username + ":" + password),
      createdAt: now,
      lastLoginAt: now
    };
    saveAccounts(accounts);
    return setCurrentUser(accounts[username]);
  }

  function login(usernameInput, password) {
    var username = normalizeUsername(usernameInput);
    var accounts = getAccounts();
    var account = accounts[username];
    if (!account || account.passwordHash !== simpleHash(username + ":" + password)) {
      throw new Error("아이디 또는 비밀번호가 맞지 않습니다.");
    }
    account.lastLoginAt = new Date().toISOString();
    accounts[username] = account;
    saveAccounts(accounts);
    return setCurrentUser(account);
  }

  function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event("adspAuthChanged"));
  }

  function renderAuthStatus() {
    var nodes = document.querySelectorAll("[data-auth-status]");
    var user = getCurrentUser();
    nodes.forEach(function (node) {
      var loginHref = node.getAttribute("data-login") || "./account/login.html";
      var profileHref = node.getAttribute("data-profile") || "./account/profile.html";
      if (user) {
        node.innerHTML = '<span class="auth-name">' + escapeHtml(user.displayName || user.username) + '</span><a class="button secondary" href="' + profileHref + '">내 학습기록</a><button type="button" class="auth-logout">로그아웃</button>';
        node.querySelector(".auth-logout").addEventListener("click", function () {
          logout();
          renderAuthStatus();
        });
      } else {
        node.innerHTML = '<a class="button primary" href="' + loginHref + '">로그인/회원가입</a><span class="auth-hint">로그인하면 이 브라우저에서 계정별 학습기록을 분리해 볼 수 있습니다.</span>';
      }
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.ADSPAuth = {
    getAccounts: getAccounts,
    getCurrentUser: getCurrentUser,
    signUp: signUp,
    login: login,
    logout: logout,
    renderAuthStatus: renderAuthStatus,
    userStudyKey: userStudyKey
  };

  document.addEventListener("DOMContentLoaded", renderAuthStatus);
  window.addEventListener("adspAuthChanged", renderAuthStatus);
})();
