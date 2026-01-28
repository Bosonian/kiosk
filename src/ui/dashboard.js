/**
 * Dashboard UI - Tailwind Case List View
 */
import { t } from "../../localization/i18n.js";
import { URGENCY_CONFIG, KIOSK_CONFIG } from "../config.js";
import {
  getRiskColor,
  getTimeAgo,
  formatETA,
  isCaseStale,
  getRelevantTimestamp
} from "../utils.js";

export function renderDashboard(cases) {
  const container = document.getElementById("casesContainer");
  if (!container) return;

  // 🩶 Empty state
  if (!cases || cases.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-16 text-gray-500 dark:text-gray-300">
        <div class="text-6xl mb-4">✓</div>
        <h2 class="text-xl font-semibold mb-2">${t("noActiveCases")}</h2>
        <p class="text-sm">${t("activeSystemMessage")}</p>
      </div>
    `;
    return;
  }

  // Sort by urgency & ETA
  const sortedCases = sortCases(cases);

  // Apply display limit
  const displayCases = sortedCases.slice(0, KIOSK_CONFIG.maxCasesDisplay);

  // Generate card HTML
  const cardsHTML = displayCases.map(renderCaseCard).join("");

  // Show truncation warning if applicable
  const truncatedWarning =
    sortedCases.length > KIOSK_CONFIG.maxCasesDisplay
      ? `
        <div class="text-center text-amber-600 dark:text-amber-400 text-sm mb-4" role="alert">
          Showing ${KIOSK_CONFIG.maxCasesDisplay} of ${sortedCases.length} cases
        </div>`
      : "";

  // 🩵 Grid layout with responsive columns
  container.innerHTML = `
    ${truncatedWarning}
    <div class="grid gap-6 px-6 sm:px-3 pb-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      ${cardsHTML}
    </div>
  `;
}

/**
 * Sort cases by urgency priority & ETA
 */
function sortCases(cases) {
  return [...cases].sort((a, b) => {
    const urgencyA = URGENCY_CONFIG[a.urgency]?.priority ?? 10;
    const urgencyB = URGENCY_CONFIG[b.urgency]?.priority ?? 10;
    if (urgencyA !== urgencyB) return urgencyA - urgencyB;
    const etaA = a.tracking?.duration || 9999;
    const etaB = b.tracking?.duration || 9999;
    return etaA - etaB;
  });
}

/**
 * Generate patient code from case ID
 */
function generatePatientCode(caseId) {
  if (!caseId) return "PAT-0000";
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = (hash << 5) - hash + caseId.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash % 10000)
    .toString()
    .padStart(4, "0");
  return `PAT-${code}`;
}

/**
 * Render individual case card (Tailwind)
 */
function renderCaseCard(caseData) {
  const urgencyConfig =
    URGENCY_CONFIG[caseData.urgency] || URGENCY_CONFIG.STANDARD;
  const ichPercent = Math.round(
    (caseData.results?.ich?.probability || 0) * 100
  );
  const lvoPercent = caseData.results?.lvo
    ? Math.round(caseData.results.lvo.probability * 100)
    : null;
  const formattedETA = formatETA(caseData.tracking?.duration);
  const distance = caseData.tracking?.distance ?? "?";
  const isGpsStale = caseData.tracking?.gpsStale || false;
  const relevantTimestamp = getRelevantTimestamp(caseData);
  const caseIsStale = isCaseStale(relevantTimestamp);
  const receivedAgo = getTimeAgo(relevantTimestamp);
  const patientCode = caseData.cityCode || generatePatientCode(caseData.id);

  const ariaLabel = `${caseData.urgency} case, ${patientCode}, ICH risk ${ichPercent}%, ETA ${formattedETA} minutes`;

  function getModuleBadgeClass(type) {
    switch (type.toLowerCase()) {
      case "coma":
        return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100";
      case "full":
        return "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    }
  }
  return `
    <div
      class="case-card relative flex flex-col border-2 rounded-xl shadow-md overflow-hidden 
             transition-all duration-300 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none 
             bg-gray-500 dark:bg-gray-800 hover:scale-[1.02] hover:shadow-lg
             ${
               caseData.urgency.toLowerCase() === "critical"
                 ? "border-red-500"
                 : ""
             }
             ${
               caseData.urgency.toLowerCase() === "high"
                 ? "border-orange-500"
                 : ""
             }
             ${
               caseData.urgency.toLowerCase() === "moderate"
                 ? "border-yellow-400"
                 : ""
             }
             ${
               caseData.urgency.toLowerCase() === "low"
                 ? "border-green-500"
                 : ""
             }
             ${caseData.isNew ? "ring-2 ring-blue-400 animate-pulse" : ""}
             "
      data-case-id="${caseData.id}"
      style="border-color: ${urgencyConfig.color};"
      role="listitem"
      tabindex="0"
      aria-label="${ariaLabel}"
    >

      <!-- Header -->
      <div class="bg-gray-900 text-white flex items-center justify-between px-4 py-2">
        <div class="flex items-center gap-2 font-semibold text-sm tracking-wide">
          ${urgencyConfig.icon} ${caseData.urgency}
        </div>
        <div class="text-xs flex items-center gap-3 opacity-90">
          <span class="font-mono ${caseData.cityCode ? "text-sm font-bold tracking-wider" : ""}">${patientCode}</span>
       <span class="px-2 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wide ${getModuleBadgeClass(
         caseData.moduleType
       )}">
  ${caseData.moduleType}
</span>

        </div>
      </div>

      <!-- City Code Banner -->
      ${caseData.cityCode ? `
      <div class="flex flex-col items-center justify-center py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <span class="text-[10px] uppercase tracking-[0.2em] opacity-60">Patient-Code</span>
        <span class="text-2xl font-black tracking-wider leading-tight">${caseData.cityCode}</span>
      </div>
      ` : ""}

      <!-- Risk Section -->
      <div class="flex items-center justify-center gap-6 py-4 bg-blue-200 dark:bg-gray-800">
        <div class="flex justify-center items-center">
          ${renderRiskRingSVG(ichPercent, "ICH")}
        </div>
        ${
          lvoPercent !== null
            ? `<div class="flex justify-center items-center">${renderRiskRingSVG(
                lvoPercent,
                "LVO"
              )}</div>`
            : ""
        }
      </div>

      <!-- ETA Section -->
      <div class="flex flex-col items-center justify-center py-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div class="flex items-end gap-1 text-2xl font-bold ${
          isGpsStale ? "text-yellow-500" : "text-blue-600 dark:text-blue-400"
        }">
          <span>${formattedETA}</span>
          <span class="text-sm font-medium">
            ${formattedETA === "Arrived" || formattedETA === "?" ? "" : "min"}
          </span>
        </div>
        <div class="text-xs mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span>${
            typeof distance === "number" ? distance.toFixed(1) : distance
          } km</span>
          ${
            isGpsStale
              ? '<span class="text-yellow-600 dark:text-yellow-400 font-semibold" role="alert">⚠️ GPS stale</span>'
              : ""
          }
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        <span>${receivedAgo}</span>
        <span class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">View Details →</span>
      </div>
    </div>
  `;
}

/**
 * Render SVG risk ring (Tailwind)
 */
function renderRiskRingSVG(percent, label) {
  const color = getRiskColor(percent);
  const circumference = Math.PI * 100;
  const offset = circumference * (1 - percent / 100);
  const riskClass =
    percent > 70
      ? "text-red-500"
      : percent > 50
        ? "text-orange-500"
        : percent > 30
          ? "text-yellow-400"
          : "text-green-500";

  return `
    <div class="flex flex-col items-center">
      <svg class="w-20 h-20 ${riskClass}" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="${color}"
          stroke-width="8"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          stroke-linecap="round"
          transform="rotate(-90 60 60)"/>
        <text x="60" y="65" text-anchor="middle" class="font-bold text-lg fill-black dark:fill-white">
          ${percent}%
        </text>
      </svg>
      <div class="text-xs mt-1 uppercase tracking-wide text-gray-600 dark:text-gray-300">${label}</div>
    </div>
  `;
}
