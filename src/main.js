/**
 * Kiosk Main Application
 * Entry point for Notaufnahme kiosk display
 * Supports end-to-end encryption for patient data protection
 */
import "./index.css";
import { i18n, t } from "../localization/i18n.js";
import { KIOSK_CONFIG, ENCRYPTION_CONFIG } from "./config.js";
import { caseListener } from "./services/case-listener.js";
import { renderDashboard } from "./ui/dashboard.js";
import { CONSTANTS } from "./utils.js";
import { safeAsync, ERROR_CATEGORIES } from "./utils/error-handler.js";
import { cryptoService } from "./services/crypto-service.js";

// Application state
let currentCases = [];
let audioContext = null;
let clockIntervalId = null;
let isFirstLoad = true;

/**
 * Initialize kiosk application
 */
async function initializeKiosk() {
  console.log("[Kiosk] Initializing...", KIOSK_CONFIG);

  // Initialize end-to-end encryption for patient data protection
  if (ENCRYPTION_CONFIG.enabled && ENCRYPTION_CONFIG.encryptionKey) {
    try {
      await cryptoService.init(ENCRYPTION_CONFIG.encryptionKey);
      console.log("[Kiosk] End-to-end encryption initialized");
    } catch (error) {
      console.warn("[Kiosk] Encryption initialization failed:", error.message);
      // Continue without encryption - graceful degradation
    }
  } else {
    console.log("[Kiosk] Encryption disabled or no key configured");
  }

  // Initialize hospital selector
  initializeHospitalSelector();

  // Initialize theme
  initializeTheme();

  // Start clock
  updateClock();
  clockIntervalId = setInterval(updateClock, 1000);

  // Initialize audio if enabled
  if (KIOSK_CONFIG.playAudioAlert) {
    initializeAudio();
  }

  // Start case listener
  caseListener.start(
    (data) => handleCaseUpdate(data),
    (error) => handleError(error)
  );

  // Add event listeners
  attachEventListeners();

  // Add cleanup on page unload
  window.addEventListener("beforeunload", cleanup);

  console.log("[Kiosk] Initialized successfully");

  initializeLanguage();
}
function initializeLanguage() {
  setTimeout(() => {
    const savedLang = localStorage.getItem("language") || "en";
    const languageToggle = document.getElementById("languageToggle");
    if (!languageToggle) return;

    languageToggle.innerHTML =
      savedLang === "en" ? renderUKFlag() : renderGermanyFlag();
    languageToggle.addEventListener("click", toggleLanguage);
    console.log("[Kiosk] Language toggle ready");
  }, 200);
}

function toggleLanguage() {
  safeAsync(
    async () => {
      i18n.toggleLanguage();
      updateLanguage();
    },
    (error) => console.warn("[Kiosk] Language toggle failed", error),
    {
      category: ERROR_CATEGORIES.RENDERING,
      context: { operation: "language_toggle" }
    }
  );
}

function updateButtonAttributes(id, label) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.title = label;
    btn.setAttribute("aria-label", label);
  }
}

function updateLanguage() {
  document.documentElement.lang = i18n.getCurrentLanguage();
  updateElementText(".app-header h1", t("appTitle"));
  updateElementText(".emergency-badge", t("emergencyBadge"));
  updateButtonAttributes("languageToggle", t("languageToggle"));
  updateButtonAttributes("helpButton", t("helpButton"));
  updateButtonAttributes("darkModeToggle", t("darkModeButton"));
  updateElementText("#modalTitle", t("helpTitle"));

  if (i18n.updateUI) i18n.updateUI(); // optional auto-refresh

  const languageToggle = document.getElementById("languageToggle");
  if (languageToggle) {
    const currentLang = i18n.getCurrentLanguage();
    languageToggle.innerHTML =
      currentLang === "en" ? renderUKFlag() : renderGermanyFlag();
  }
}

function renderUKFlag() {
  return ` <svg
              width="20px"
              height="20px"
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              class="iconify iconify--twemoji"
              preserveAspectRatio="xMidYMid meet"
            >
              <path fill="#FFCD05" d="M0 27a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4v-4H0v4z"></path>
              <path fill="#ED1F24" d="M0 14h36v9H0z"></path>
              <path fill="#141414" d="M32 5H4a4 4 0 0 0-4 4v5h36V9a4 4 0 0 0-4-4z"></path>
            </svg>`; // your flag SVG
}

function renderGermanyFlag() {
  return `<svg width=\"20px\" height=\"20px\" viewBox=\"0 0 36 36\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" role=\"img\" class=\"iconify iconify--twemoji\" preserveAspectRatio=\"xMidYMid meet\"><path fill=\"#00247D\" d=\"M0 9.059V13h5.628zM4.664 31H13v-5.837zM23 25.164V31h8.335zM0 23v3.941L5.63 23zM31.337 5H23v5.837zM36 26.942V23h-5.631zM36 13V9.059L30.371 13zM13 5H4.664L13 10.837z\"></path><path fill=\"#CF1B2B\" d=\"M25.14 23l9.712 6.801a3.977 3.977 0 0 0 .99-1.749L28.627 23H25.14zM13 23h-2.141l-9.711 6.8c.521.53 1.189.909 1.938 1.085L13 23.943V23zm10-10h2.141l9.711-6.8a3.988 3.988 0 0 0-1.937-1.085L23 12.057V13zm-12.141 0L1.148 6.2a3.994 3.994 0 0 0-.991 1.749L7.372 13h3.487z\"></path><path fill=\"#EEE\" d=\"M36 21H21v10h2v-5.836L31.335 31H32a3.99 3.99 0 0 0 2.852-1.199L25.14 23h3.487l7.215 5.052c.093-.337.158-.686.158-1.052v-.058L30.369 23H36v-2zM0 21v2h5.63L0 26.941V27c0 1.091.439 2.078 1.148 2.8l9.711-6.8H13v.943l-9.914 6.941c.294.07.598.116.914.116h.664L13 25.163V31h2V21H0zM36 9a3.983 3.983 0 0 0-1.148-2.8L25.141 13H23v-.943l9.915-6.942A4.001 4.001 0 0 0 32 5h-.663L23 10.837V5h-2v10h15v-2h-5.629L36 9.059V9zM13 5v5.837L4.664 5H4a3.985 3.985 0 0 0-2.852 1.2l9.711 6.8H7.372L.157 7.949A3.968 3.968 0 0 0 0 9v.059L5.628 13H0v2h15V5h-2z\"></path><path fill=\"#CF1B2B\" d=\"M21 15V5h-6v10H0v6h15v10h6V21h15v-6z\"></path></svg>`;
}

function updateElementText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

/**
 * Cleanup resources before page unload
 */
function cleanup() {
  console.log("[Kiosk] Cleaning up resources...");

  // Stop polling
  caseListener.stop();

  // Clear clock interval
  if (clockIntervalId) {
    clearInterval(clockIntervalId);
    clockIntervalId = null;
  }

  // Close audio context
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().catch((err) => {
      console.warn("[Kiosk] Error closing audio context:", err);
    });
  }
}

/**
 * Handle case updates
 */
function handleCaseUpdate(data) {
  const previousCount = currentCases.length;
  currentCases = data.cases || [];

  console.log("[Kiosk] Cases updated:", {
    count: currentCases.length,
    previous: previousCount
  });

  // Update UI
  renderDashboard(currentCases);
  updateHeader(data);

  // Check for new cases (skip alert on first load)
  const newCases = currentCases.filter((c) => c.isNew);
  if (newCases.length > 0 && !isFirstLoad) {
    // Show alert for new cases
    playNewCaseAlert();
    flashScreen();

    // Mark as viewed after showing alert
    setTimeout(() => {
      newCases.forEach((c) => caseListener.markViewed(c.id));
    }, CONSTANTS.NEW_CASE_VIEWED_DELAY_MS);
  }

  // Mark first load complete
  if (isFirstLoad) {
    isFirstLoad = false;
  }

  // Update connection status
  updateConnectionStatus(true);
}

/**
 * Handle errors
 */
function handleError(error) {
  console.error("[Kiosk] Error:", error);
  updateConnectionStatus(false);

  // Show error in UI if no cases
  if (currentCases.length === 0) {
    const container = document.getElementById("casesContainer");
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${
            error.message || "Unable to connect to case monitoring system"
          }</p>
          <p class="error-hint">Checking again in ${
            KIOSK_CONFIG.pollInterval / 1000
          } seconds...</p>
        </div>
      `;
    }
  }
}

/**
 * Initialize hospital selector
 */
function initializeHospitalSelector() {
  // Import available hospitals and setHospital function
  const selector = document.getElementById("hospitalSelector");
  if (!selector) return;

  // Dynamically import hospitals list
  import("./config.js").then(({ AVAILABLE_HOSPITALS, setHospital }) => {
    const currentHospitalId = KIOSK_CONFIG.hospitalId || "ALL";

    // 🔒 Ensure ALL is always present and first
    const hospitals = [
      { id: "ALL", name: "🌐 All Hospitals (Show All Cases)" },
      ...AVAILABLE_HOSPITALS.filter((h) => h.id !== "ALL")
    ];

    selector.innerHTML = hospitals
      .map(
        (h) => `
      <option value="${h.id}">
        ${h.name}
      </option>
    `
      )
      .join("");

    // ✅ This will now ALWAYS work
    selector.value = currentHospitalId;

    // 🔐 Safety fallback
    if (!selector.value) {
      selector.value = "ALL";
    }

    selector.addEventListener("change", (e) => {
      const hospitalId = e.target.value;
      if (
        confirm(
          `Switch to ${
            e.target.options[e.target.selectedIndex].text
          }?\n\nThis will reload the page.`
        )
      ) {
        setHospital(hospitalId);
      } else {
        selector.value = currentHospitalId;
      }
    });
  });
}

/**
 * Initialize theme
 */
function initializeTheme() {
  // Get saved theme or use default from config
  const savedTheme = localStorage.getItem("kiosk_theme") || KIOSK_CONFIG.theme;
  applyTheme(savedTheme);

  // Add theme toggle button listener
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  console.log("[Kiosk] Theme initialized:", savedTheme);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle("dark"); // Tailwind looks for this
  const newTheme = isDark ? "dark" : "light";

  localStorage.setItem("kiosk_theme", newTheme);
  applyTheme(newTheme);

  console.log("[Kiosk] Theme switched to:", newTheme);
}

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  const themeIcon = document.querySelector(".theme-icon");
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

/**
 * Update header information
 */
function updateHeader(data) {
  // Update case count
  const countBadge = document.getElementById("caseCount");
  if (countBadge) {
    const count = data.count || 0;
    countBadge.textContent = `${count} ${count === 1 ? "Case" : "Cases"}`;
    countBadge.className = `case-count-badge ${count > 0 ? "has-cases" : ""}`;
  }
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
  const status = document.getElementById("connectionStatus");
  if (status) {
    status.className = `status-indicator ${
      connected ? "connected" : "disconnected"
    }`;
    status.title = connected ? "Connected" : "Disconnected";
    status.setAttribute(
      "aria-label",
      `Connection status: ${connected ? "connected" : "disconnected"}`
    );
  }
}

/**
 * Update clock
 */
function updateClock() {
  const clockElement = document.getElementById("currentTime");
  if (clockElement) {
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
}

/**
 * Initialize audio context
 */
function initializeAudio() {
  // Create audio context on first user interaction
  document.addEventListener(
    "click",
    () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("[Kiosk] Audio initialized");
      }
    },
    { once: true }
  );
}

/**
 * Play new case alert with audio context resume
 */
async function playNewCaseAlert() {
  if (!KIOSK_CONFIG.playAudioAlert || !audioContext) {
    return;
  }

  try {
    // Resume audio context if suspended (browser throttling)
    if (audioContext.state === "suspended") {
      await audioContext.resume();
      console.log("[Kiosk] Audio context resumed");
    }

    // Generate alert beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = CONSTANTS.ALERT_BEEP_FREQUENCY_HZ;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(
      CONSTANTS.ALERT_BEEP_VOLUME,
      audioContext.currentTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + CONSTANTS.ALERT_BEEP_DURATION_SEC
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(
      audioContext.currentTime + CONSTANTS.ALERT_BEEP_DURATION_SEC
    );

    console.log("[Kiosk] Alert sound played");
  } catch (error) {
    console.warn("[Kiosk] Audio playback failed:", error);
  }
}

/**
 * Flash screen for new case
 */
function flashScreen() {
  document.body.classList.add("flash-alert");

  setTimeout(() => {
    document.body.classList.remove("flash-alert");
  }, 1000);
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Click on case card to navigate to PWA results page
  document.addEventListener("click", (e) => {
    const caseCard = e.target.closest(".case-card");
    if (caseCard) {
      const caseId = caseCard.dataset.caseId;
      if (caseId) {
        // Navigate to PWA results page in kiosk mode
        const pwaUrl = `${KIOSK_CONFIG.pwaUrl}#results?display=kiosk&caseId=${caseId}`;
        window.location.href = pwaUrl;
        caseListener.markViewed(caseId);
      }
    }

    // Dismiss case button
    const dismissButton = e.target.closest(".dismiss-case-button");
    if (dismissButton) {
      const caseId = dismissButton.dataset.caseId;
      if (caseId) {
        handleDismissCase(caseId);
      }
    }

    // Close modal
    if (
      e.target.classList.contains("modal-overlay") ||
      e.target.classList.contains("close-modal")
    ) {
      closeModal();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    // ESC key to close modal
    if (e.key === "Escape") {
      closeModal();
      return;
    }

    // Enter or Space on case card to navigate to PWA results
    if (e.key === "Enter" || e.key === " ") {
      const caseCard = e.target.closest(".case-card");
      if (caseCard) {
        e.preventDefault(); // Prevent scroll on Space
        const caseId = caseCard.dataset.caseId;
        if (caseId) {
          // Navigate to PWA results page in kiosk mode
          const pwaUrl = `https://igfap.eu/0825/#results?display=kiosk&caseId=${caseId}`;
          window.location.href = pwaUrl;
          caseListener.markViewed(caseId);
        }
      }
    }
  });

  // Visibility change - resume polling if tab becomes visible
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("[Kiosk] Tab visible - fetching latest cases");
      caseListener.fetchCases();
    }
  });

  // Listen for custom dismissCase event from case detail modal
  window.addEventListener("dismissCase", (e) => {
    const caseId = e.detail?.caseId;
    if (caseId) {
      console.log("[Kiosk] Received dismissCase event for:", caseId);
      handleDismissCase(caseId);
    } else {
      console.error("[Kiosk] dismissCase event missing caseId");
    }
  });
}

/**
 * Handle case dismissal with confirmation
 */
async function handleDismissCase(caseId) {
  const caseData = caseListener.getCase(caseId);
  if (!caseData) {
    console.warn("[Kiosk] Case not found:", caseId);
    return;
  }

  // Show confirmation dialog
  const confirmMessage =
    `Are you sure you want to dismiss this case?\n\n` +
    `Ambulance: ${caseData.ambulanceId}\n` +
    `Module: ${caseData.moduleType}\n` +
    `ICH Risk: ${Math.round(
      (caseData.results?.ich?.probability || 0) * 100
    )}%\n\n` +
    `This action will archive the case.`;

  const confirmed = confirm(confirmMessage);

  if (!confirmed) {
    console.log("[Kiosk] Case dismissal cancelled");
    return;
  }

  try {
    // Disable button to prevent double-click
    const dismissButton = document.querySelector(`[data-case-id="${caseId}"]`);
    if (dismissButton) {
      dismissButton.disabled = true;
      dismissButton.textContent = "Dismissing...";
    }

    // Call API to dismiss case
    await caseListener.dismissCase(caseId);

    console.log("[Kiosk] Case dismissed successfully:", caseId);

    // Close modal
    closeModal();

    // Show success feedback (optional flash)
    document.body.classList.add("flash-success");
    setTimeout(() => {
      document.body.classList.remove("flash-success");
    }, 500);
  } catch (error) {
    console.error("[Kiosk] Failed to dismiss case:", error);

    // Show error alert
    alert(
      `Failed to dismiss case:\n${error.message}\n\nPlease try again or contact support.`
    );

    // Re-enable button
    const dismissButton = document.querySelector(`[data-case-id="${caseId}"]`);
    if (dismissButton) {
      dismissButton.disabled = false;
      dismissButton.textContent = "🗑️ Dismiss Case";
    }
  }
}

/**
 * Close case detail modal
 */
function closeModal() {
  const modal = document.getElementById("caseDetailModal");
  if (modal) {
    modal.style.display = "none";
    modal.querySelector(".modal-content").innerHTML = "";
  }
}

/**
 * Handle application errors
 */
window.addEventListener("error", (event) => {
  console.error("[Kiosk] Unhandled error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[Kiosk] Unhandled rejection:", event.reason);
});

/**
 * Start application when DOM ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeKiosk);
} else {
  initializeKiosk();
}

/**
 * Export for debugging
 */
window.kioskApp = {
  getCases: () => currentCases,
  getStatus: () => caseListener.getStatus(),
  refresh: () => caseListener.fetchCases(),
  playAlert: () => playNewCaseAlert()
};
