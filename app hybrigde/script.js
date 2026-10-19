const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const forgotPasswordLink = document.querySelector("#forgot-password");
const formMessage = document.querySelector("#form-message");
const loginView = document.querySelector("#login-view");
const dashboardView = document.querySelector("#dashboard-view");
const logoutButton = document.querySelector("#logout-button");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");
const installButton = document.querySelector("#install-button");
const installMessage = document.querySelector("#install-message");
const deliveryCount = document.querySelector("#delivery-count");
const loginCount = document.querySelector("#login-count");
const deliveryUnit = document.querySelector("#delivery-unit");
const loginUnit = document.querySelector("#login-unit");
const recordDeliveryButton = document.querySelector("#record-delivery");
const deliveryMessage = document.querySelector("#delivery-message");
const navigationButtons = document.querySelectorAll(".nav-item");
const dashboardPanels = document.querySelectorAll(".dashboard-panel");
const studentStatsStoragePrefix = "hybrigde.student-stats.v1:";
let activeStudentEmail = "";
let pendingInstallPrompt = null;

function isRunningAsInstalledApp() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

if ("serviceWorker" in navigator && !window.Capacitor?.isNativePlatform?.()) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("No se pudo activar el modo sin conexión de Hybrigde.", error);
    });
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  pendingInstallPrompt = event;
  installButton.hidden = false;
});

window.addEventListener("appinstalled", () => {
  pendingInstallPrompt = null;
  installButton.hidden = true;
  installMessage.hidden = true;
  installMessage.textContent = "";
});

installButton.addEventListener("click", async () => {
  installMessage.hidden = true;
  installMessage.textContent = "";

  if (pendingInstallPrompt) {
    const installPrompt = pendingInstallPrompt;
    pendingInstallPrompt = null;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        installButton.hidden = true;
      }
    } catch (error) {
      console.error("No se pudo iniciar la instalación de Hybrigde.", error);
      installMessage.textContent = "No se pudo iniciar la instalación. Inténtalo de nuevo desde el menú del navegador.";
      installMessage.hidden = false;
    }
    return;
  }

  const isAppleMobileDevice =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAppleMobileDevice && !isRunningAsInstalledApp()) {
    installMessage.textContent = "Para instalarla, toca Compartir y luego “Añadir a pantalla de inicio”.";
    installMessage.hidden = false;
  }
});

if (
  !isRunningAsInstalledApp() &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
) {
  installButton.hidden = false;
}

function getStatsStorageKey(email) {
  return `${studentStatsStoragePrefix}${email.trim().toLocaleLowerCase()}`;
}

function loadStudentStats(email) {
  let storedStats;

  try {
    storedStats = localStorage.getItem(getStatsStorageKey(email));
  } catch {
    throw new Error("No se pudieron leer tus estadísticas guardadas en este navegador.");
  }

  if (storedStats === null) {
    return { deliveries: 0, logins: 0 };
  }

  let stats;
  try {
    stats = JSON.parse(storedStats);
  } catch {
    throw new Error("No se pudieron leer tus estadísticas guardadas. Los datos locales no son válidos.");
  }

  if (
    typeof stats !== "object" ||
    stats === null ||
    !Number.isSafeInteger(stats.deliveries) ||
    stats.deliveries < 0 ||
    !Number.isSafeInteger(stats.logins) ||
    stats.logins < 0
  ) {
    throw new Error("No se pudieron leer tus estadísticas guardadas. Los datos locales no son válidos.");
  }

  return { deliveries: stats.deliveries, logins: stats.logins };
}

function saveStudentStats(email, stats) {
  try {
    localStorage.setItem(getStatsStorageKey(email), JSON.stringify(stats));
  } catch {
    throw new Error("No se pudieron guardar tus estadísticas en este navegador.");
  }
}

function renderStudentStats(stats) {
  deliveryCount.textContent = String(stats.deliveries);
  loginCount.textContent = String(stats.logins);
  deliveryUnit.textContent = stats.deliveries === 1 ? "trabajo" : "trabajos";
  loginUnit.textContent = stats.logins === 1 ? "conexión" : "conexiones";
}

function showDashboardView(viewName) {
  navigationButtons.forEach((button) => {
    const isActive = button.dataset.view === viewName;

    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  dashboardPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== viewName;
  });
}

function formatStudentName(email) {
  const username = email.split("@")[0].replace(/[._-]+/g, " ").trim();

  if (!username) {
    return "Alumno";
  }

  return username.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());
}

themeToggle.addEventListener("click", () => {
  const isDarkTheme = document.documentElement.dataset.theme !== "dark";

  document.documentElement.dataset.theme = isDarkTheme ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDarkTheme));
  themeToggle.setAttribute(
    "aria-label",
    isDarkTheme ? "Activar modo claro" : "Activar modo oscuro",
  );
  themeIcon.textContent = isDarkTheme ? "☀" : "☾";
  themeLabel.textContent = isDarkTheme ? "Modo claro" : "Modo oscuro";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!loginForm.reportValidity()) {
    return;
  }

  const studentEmail = emailInput.value.trim();
  let studentStats;

  try {
    studentStats = loadStudentStats(studentEmail);
    studentStats.logins += 1;
    saveStudentStats(studentEmail, studentStats);
  } catch (error) {
    formMessage.textContent = error.message;
    return;
  }

  const studentName = formatStudentName(emailInput.value);
  const initial = studentName.charAt(0).toLocaleUpperCase();

  activeStudentEmail = studentEmail;
  renderStudentStats(studentStats);
  deliveryMessage.textContent = "";
  document.querySelector("#welcome-name").textContent = studentName;
  document.querySelector("#sidebar-student-name").textContent = studentName;
  document.querySelector("#profile-name").textContent = studentName;
  document.querySelector("#profile-full-name").textContent = studentName;
  document.querySelector("#profile-email").textContent = emailInput.value.trim();
  document.querySelector("#student-avatar").textContent = initial;
  document.querySelector("#profile-avatar").textContent = initial;
  loginView.hidden = true;
  dashboardView.hidden = false;
  logoutButton.hidden = false;
  document.title = "Panel del alumno | Hybrigde";
  showDashboardView("overview");
});

passwordToggle.addEventListener("click", () => {
  const isPasswordHidden = passwordInput.type === "password";

  passwordInput.type = isPasswordHidden ? "text" : "password";
  passwordToggle.textContent = isPasswordHidden ? "Ocultar" : "Mostrar";
  passwordToggle.setAttribute("aria-label", isPasswordHidden ? "Ocultar contraseña" : "Mostrar contraseña");
  passwordToggle.setAttribute("aria-pressed", String(isPasswordHidden));
});

forgotPasswordLink.addEventListener("click", (event) => {
  event.preventDefault();

  if (!emailInput.value.trim() || !emailInput.validity.valid) {
    formMessage.textContent = "Escribe un correo electrónico válido para continuar.";
    emailInput.focus();
    return;
  }

  formMessage.textContent =
    "La recuperación de contraseña aún no está configurada. Contacta con soporte de tu universidad.";
});

navigationButtons.forEach((button) => {
  button.addEventListener("click", () => showDashboardView(button.dataset.view));
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showDashboardView(button.dataset.go));
});

logoutButton.addEventListener("click", () => {
  loginForm.reset();
  formMessage.textContent = "";
  deliveryMessage.textContent = "";
  passwordInput.type = "password";
  passwordToggle.textContent = "Mostrar";
  passwordToggle.setAttribute("aria-label", "Mostrar contraseña");
  passwordToggle.setAttribute("aria-pressed", "false");
  dashboardView.hidden = true;
  loginView.hidden = false;
  logoutButton.hidden = true;
  document.title = "Iniciar sesión | Hybrigde";
  emailInput.focus();
});

recordDeliveryButton.addEventListener("click", () => {
  let studentStats;

  try {
    studentStats = loadStudentStats(activeStudentEmail);
    studentStats.deliveries += 1;
    saveStudentStats(activeStudentEmail, studentStats);
  } catch (error) {
    deliveryMessage.textContent = error.message;
    return;
  }

  renderStudentStats(studentStats);
  deliveryMessage.textContent = "Entrega registrada. ¡Sigue así!";
});