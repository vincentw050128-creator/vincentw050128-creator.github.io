(function () {
  const sessionKey = "xinye:v1-login";
  const toastTimers = new WeakMap();

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function showToast(message) {
    const toast = $("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    const previous = toastTimers.get(toast);
    if (previous) clearTimeout(previous);
    const timer = setTimeout(() => toast.classList.remove("show"), 2400);
    toastTimers.set(toast, timer);
  }

  function installImageFallbacks() {
    document.querySelectorAll("img").forEach((image) => {
      image.addEventListener("error", () => {
        const holder = document.createElement("div");
        holder.className = "image-fallback";
        holder.textContent = "图片暂时无法显示，请稍后重试";
        const parent = image.parentElement;
        image.style.display = "none";
        if (parent && !parent.querySelector(".image-fallback")) parent.appendChild(holder);
        showToast("图片暂时无法显示，请稍后重试");
      }, { once: true });
    });
  }

  function isLoggedIn() {
    return localStorage.getItem(sessionKey) === "yes";
  }

  function setLoggedIn(value) {
    if (value) localStorage.setItem(sessionKey, "yes");
    else localStorage.removeItem(sessionKey);
  }

  function initSplash() {
    const screen = $("[data-screen='splash']");
    if (!screen) return;
    const status = $("[data-splash-status]");
    const mainButton = $("[data-splash-primary]");
    const ghostButton = $("[data-reset-login]");

    function paint() {
      const logged = isLoggedIn();
      if (status) {
        status.innerHTML = logged
          ? "<span>欢迎回来，继续导览</span>"
          : "<span class='spinner' aria-hidden='true'></span><span>正在准备导览…</span>";
      }
      if (mainButton) {
        mainButton.textContent = logged ? "快速进入首页" : "开始探索";
        mainButton.setAttribute("aria-label", logged ? "快速进入首页" : "前往登录页");
      }
    }

    paint();
    setTimeout(() => {
      if (!isLoggedIn() && status) status.innerHTML = "<span>导览已准备好</span>";
    }, 900);

    if (mainButton) {
      mainButton.addEventListener("click", () => {
        window.location.href = isLoggedIn() ? "p03-home.html" : "p02-login.html";
      });
    }

    if (ghostButton) {
      ghostButton.addEventListener("click", () => {
        setLoggedIn(false);
        paint();
        showToast("已返回初始状态");
      });
    }
  }

  function initLogin() {
    const screen = $("[data-screen='login']");
    if (!screen) return;
    const checkbox = $("[data-protocol-check]");
    const loginButton = $("[data-login-demo]");
    const phoneButton = $("[data-phone-demo]");
    const guestButton = $("[data-guest-demo]");

    if (loginButton) {
      loginButton.addEventListener("click", () => {
        if (!checkbox || !checkbox.checked) {
          showToast("请先阅读并同意用户协议与隐私政策");
          return;
        }
        loginButton.disabled = true;
        loginButton.textContent = "登录中…";
        showToast("登录成功，正在进入首页");
        setLoggedIn(true);
        setTimeout(() => {
          window.location.href = "p03-home.html";
        }, 850);
      });
    }

    if (phoneButton) {
      phoneButton.addEventListener("click", () => {
        showToast("手机号登录暂未开放，请先使用微信登录或游客浏览");
      });
    }

    if (guestButton) {
      guestButton.addEventListener("click", () => {
        window.location.href = "p03-home.html?guest=1";
      });
    }
  }

  function initHome() {
    const screen = $("[data-screen='home']");
    if (!screen) return;
    const params = new URLSearchParams(window.location.search);
    const isGuest = params.get("guest") === "1";
    const profile = $("[data-profile-chip]");
    if (profile) profile.textContent = isGuest ? "游客浏览" : "欢迎使用";

    document.querySelectorAll("[data-future]").forEach((button) => {
      button.addEventListener("click", () => {
        showToast("该功能正在完善，敬请期待");
      });
    });

    const homePage = $(".home-page", screen);
    const state = params.get("state") || window.location.hash.replace("#", "");
    if (homePage && state === "scroll") {
      requestAnimationFrame(() => {
        homePage.scrollTop = Math.round(homePage.scrollHeight * 0.46);
      });
    }
  }

  function initMine() {
    const screen = $("[data-screen='mine']");
    if (!screen) return;
    const params = new URLSearchParams(window.location.search);
    const homeButton = $("[data-go-home]", screen);
    const minePage = $(".mine-page", screen);

    if (homeButton) {
      homeButton.addEventListener("click", () => {
        window.location.href = "p03-home.html";
      });
    }

    const state = params.get("state") || window.location.hash.replace("#", "");
    if (minePage && state === "scroll") {
      requestAnimationFrame(() => {
        minePage.scrollTop = Math.round(minePage.scrollHeight * 0.42);
      });
    }
  }

  function initLauncher() {
    const reset = $("[data-launcher-reset]");
    if (!reset) return;
    reset.addEventListener("click", () => {
      setLoggedIn(false);
      reset.textContent = "已重置为未登录状态";
      setTimeout(() => { reset.textContent = "重置登录状态"; }, 1600);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    installImageFallbacks();
    initLauncher();
    initSplash();
    initLogin();
    initHome();
    initMine();
  });
})();
