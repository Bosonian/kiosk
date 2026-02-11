/**
 * Case Detail Modal
 * Shows full assessment results for a case
 * Enhanced with PWA-style beautiful results display
 */
import {
  getRiskLevel,
  formatTime,
  formatLabel,
  formatDriverName,
  formatSummaryLabel,
  formatDisplayValue
} from "../utils.js";
import {
  renderCircularBrainDisplay,
  initializeVolumeAnimations
} from "./components/brain-visualization.js";

/**
 * Get risk level classification for styling
 * @param {number} percent - Risk percentage (0-100)
 * @returns {string} Risk level ('critical', 'high', 'normal')
 */
function getRiskLevelClass(percent) {
  if (percent > 70) return "critical";
  if (percent > 50) return "high";
  return "normal";
}

/**
 * Generate unique patient code from case ID
 */
function generatePatientCode(caseId) {
  if (!caseId) return "PAT-0000";

  // Create a simple hash from the case ID
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = (hash << 5) - hash + caseId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to positive 4-digit number
  const code = Math.abs(hash % 10000)
    .toString()
    .padStart(4, "0");
  return `PAT-${code}`;
}

/**
 * Check if a value is a valid user input (not default/placeholder)
 * CRITICAL: Only show values that were actually input by the user
 * @param {any} value - The value to check
 * @returns {boolean} - True if value should be displayed
 */
function isValidInputValue(value) {
  // Always skip null, undefined, empty string
  if (value === null || value === undefined || value === "") {
    return false;
  }

  // Skip false (default checkbox state)
  if (value === false) {
    return false;
  }

  // Skip 0 or "0" (might be default number)
  if (value === 0 || value === "0") {
    return false;
  }

  // Skip negative/default string patterns (case insensitive)
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase().trim();

    // Check for explicit "No" patterns
    const defaultPatterns = [
      "no",
      "nein",
      "none",
      "keine",
      "unknown",
      "unbekannt",
      "n/a",
      "not applicable"
    ];

    if (defaultPatterns.includes(lowerValue)) {
      return false;
    }

    // Check for "× Nein / No" or "X No" patterns with symbols
    if (lowerValue.match(/^[×x✗✘]\s*(nein|no)/i)) {
      return false;
    }

    // Check for "No" suffix patterns like "Nein / No"
    if (lowerValue.match(/\/(no|nein)$/i)) {
      return false;
    }
  }

  // Skip empty arrays
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  // All other values are considered valid input
  return true;
}

export function showCaseDetail(caseData) {
  const modal = document.getElementById("caseDetailModal");
  if (!modal) {
    console.error("[CaseDetail] Modal element not found");
    return;
  }

  const modalContent = modal.querySelector(".modal-content");
  if (!modalContent) {
    console.error("[CaseDetail] Modal content element not found");
    return;
  }

  // CRITICAL: Deep clone caseData to prevent data mixing between cases
  const safeCaseData = JSON.parse(JSON.stringify(caseData));

  console.log("[CaseDetail] Showing case:", {
    id: safeCaseData.id,
    moduleType: safeCaseData.moduleType,
    formDataKeys: Object.keys(safeCaseData.formData || {})
  });

  // Render detail view with isolated data
  modalContent.innerHTML = renderDetailView(safeCaseData);

  // Show modal
  modal.style.display = "flex";

  // Initialize volume animations after DOM update
  setTimeout(() => {
    initializeVolumeAnimations();
  }, 50);

  // Attach dismiss button handler after rendering
  setTimeout(() => {
    attachDismissHandler(safeCaseData.id);
  }, 100);
}

/**
 * Attach dismiss button handler to the rendered button
 * @param {string} caseId - Case ID
 */
function attachDismissHandler(caseId) {
  const dismissButton = document.querySelector(".dismiss-case-button");
  if (dismissButton) {
    // Remove any existing listeners
    const newButton = dismissButton.cloneNode(true);
    dismissButton.parentNode.replaceChild(newButton, dismissButton);

    // Add fresh click listener
    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("[CaseDetail] Dismiss button clicked for case:", caseId);

      // Dispatch custom event that main.js will handle
      window.dispatchEvent(
        new CustomEvent("dismissCase", { detail: { caseId } })
      );
    });

    console.log(
      "[CaseDetail] Dismiss button handler attached for case:",
      caseId
    );
  } else {
    console.warn("[CaseDetail] Dismiss button not found in DOM");
  }
}

function renderDetailView(caseData) {
  const {
    results,
    formData,
    moduleType,
    tracking,
    urgency,
    createdAt,
    updatedAt
  } = caseData;
  const patientCode = caseData.cityCode || generatePatientCode(caseData.id);

  // Calculate risk percentages
  const ichPercent = Math.round((results?.ich?.probability || 0) * 100);
  const lvoPercent = results?.lvo
    ? Math.round(results.lvo.probability * 100)
    : null;

  // Determine risk levels for styling
  const ichLevel = getRiskLevelClass(ichPercent);
  const lvoLevel = lvoPercent ? getRiskLevelClass(lvoPercent) : "normal";

  // Determine card layout (single, dual, or triple)
  let cardCount = 1; // Always have ICH
  if (lvoPercent !== null && lvoPercent > 0) {
    cardCount++;
  }

  const layoutClass =
    cardCount === 1 ? "risk-results-single" : "risk-results-dual";

  return `
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2 id="modalTitle">🩺 Detaillierte Fallanalyse / Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge" style="background: ${getUrgencyColor(urgency)}">${urgency}</span>
            <span class="badge module-badge">${moduleType}</span>
            <span class="badge patient-code-badge" ${caseData.cityCode ? 'style="font-size:1.1rem; letter-spacing:0.05em;"' : ""}>${patientCode}</span>
          </div>
        </div>
        <button class="close-modal" aria-label="Close modal">✕</button>
      </div>

      <div class="detail-content">
        <!-- City Code Banner -->
        ${caseData.cityCode ? `
        <div style="text-align:center; padding:20px 16px; margin-bottom:16px; background:linear-gradient(135deg,#1e3a8a,#2563eb); border-radius:12px; color:white;">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.2em; opacity:0.6; margin-bottom:4px;">Patient-Code</div>
          <div style="font-size:2.5rem; font-weight:900; letter-spacing:0.08em; line-height:1.1;">${caseData.cityCode}</div>
        </div>
        ` : ""}

        <!-- Enhanced Risk Assessment Cards -->
        <div class="content-section">
          <h3>🎯 Risikobewertung / Risk Assessment</h3>
          <div class="${layoutClass}">
            ${renderEnhancedRiskCard("ich", ichPercent, ichLevel, results)}
            ${lvoPercent !== null ? renderEnhancedRiskCard("lvo", lvoPercent, lvoLevel, results) : ""}
          </div>
        </div>

        <!-- ICH Volume Card (separate, like PWA) -->
        ${ichPercent >= 50 ? renderVolumeCard(formData) : ""}

        <!-- Entscheidungshilfe Speedometer (shown if meaningful signal) -->
        ${renderEntscheidungshilfe(ichPercent, lvoPercent)}

        <!-- Enhanced Drivers Section -->
        ${renderEnhancedDriversSection(results)}

        <!-- Tracking Information -->
        <div class="content-section">
          <h3>📍 Standort & Ankunftszeit / Tracking Information</h3>
          <div class="tracking-grid">
            <div class="tracking-item">
              <div class="tracking-label">ETA</div>
              <div class="tracking-value">${tracking?.duration || "?"} min</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Entfernung / Distance</div>
              <div class="tracking-value">${tracking?.distance ? tracking.distance.toFixed(1) : "?"} km</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Letzte Aktualisierung / Last Update</div>
              <div class="tracking-value">${tracking?.lastUpdated ? formatTime(tracking.lastUpdated) : "Unknown"}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Voraussichtliche Ankunft / Estimated Arrival</div>
              <div class="tracking-value">${tracking?.estimatedArrival ? formatTime(tracking.estimatedArrival) : "Unknown"}</div>
            </div>
          </div>
        </div>

        <!-- Assessment Data -->
        <div class="content-section">
          <h3>📋 Bewertungsdaten / Assessment Data</h3>
          <div class="data-table">
            ${renderFormData(formData)}
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <div class="footer-meta">
          <span class="timestamp">Empfangen / Received: ${formatTime(createdAt || new Date())}</span>
        </div>
        <div class="footer-actions">
          <button class="dismiss-case-button" data-case-id="${caseData.id}">
            🗑️ Dismiss Case
          </button>
          <button class="close-modal secondary-button">Schließen / Close</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render enhanced risk card with circular SVG progress ring (PWA style)
 * @param {string} type - Risk type ('ich' or 'lvo')
 * @param {number} percent - Risk percentage (0-100)
 * @param {string} level - Risk level ('critical', 'high', 'normal')
 * @param {object} results - Full results object
 * @returns {string} HTML for enhanced risk card
 */
function renderEnhancedRiskCard(type, percent, level, results) {
  const icons = { ich: "🩸", lvo: "🧠" };
  const titles = {
    ich: "ICH Risiko / ICH Risk",
    lvo: "LVO Risiko / LVO Risk"
  };

  const color =
    level === "critical" ? "#ff4444" : level === "high" ? "#ff8800" : "#0066cc";
  const riskLevelText = getRiskLevel(percent);

  // SVG circle progress
  const circumference = Math.PI * 100; // For radius 50
  const offset = circumference * (1 - percent / 100);

  return `
    <div class="enhanced-risk-card ${type} ${level}">
      <div class="risk-header">
        <div class="risk-icon">${icons[type]}</div>
        <div class="risk-title">
          <h3>${titles[type]}</h3>
          <span class="risk-module">${type === "ich" ? "Blutungsrisiko" : "Verschlussrisiko"}</span>
        </div>
      </div>

      <div class="risk-probability">
        <div class="circles-container">
          <div class="circle-item">
            <div class="probability-circle">
              <svg class="probability-svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke="${color}"
                  stroke-width="10"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}"
                  stroke-linecap="round"
                  transform="rotate(-90 60 60)"
                  class="probability-progress"/>
                <text x="60" y="70"
                  text-anchor="middle"
                  font-family="system-ui, -apple-system, sans-serif"
                  font-size="32"
                  font-weight="bold"
                  fill="#ffffff">
                  ${percent}%
                </text>
              </svg>
            </div>
            <div class="circle-label">${type.toUpperCase()} Wahrscheinlichkeit</div>
          </div>
          <div class="risk-level ${level}">${riskLevelText}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render volume card as separate card (PWA style with animated canvas)
 * @param {object} formData - Form data containing GFAP
 * @returns {string} HTML for volume card
 */
function renderVolumeCard(formData) {
  const gfapValue = getGFAPValue(formData);
  if (!gfapValue || gfapValue <= 0) {
    return "";
  }

  const estimatedVolume = estimateICHVolume(gfapValue);
  const mortality = estimateMortalityFromVolume(estimatedVolume);

  return `
    <div class="content-section">
      <h3>🧮 ICH Blutungsvolumen / ICH Volume Estimate</h3>
      <div class="enhanced-risk-card volume-card normal">
        <div class="risk-probability">
          <div class="circles-container">
            <div class="circle-item">
              <div class="volume-display-container">
                ${renderCircularBrainDisplay(estimatedVolume)}
              </div>
              <div class="circle-label">Blutungsvolumen / Bleed Volume</div>
            </div>
          </div>
          <div class="volume-info">
            <div class="mortality-estimate">
              <span class="mortality-label">Voraussichtliche 30-Tage-Mortalität / Predicted 30-day Mortality:</span>
              <span class="mortality-value">${mortality}</span>
            </div>
            <div class="volume-note">
              <small>Geschätzt von GFAP / Estimated from GFAP: ${gfapValue} pg/mL</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Estimate mortality from volume
 * @param {number} volume - ICH volume in ml
 * @returns {string} Mortality range
 */
function estimateMortalityFromVolume(volume) {
  if (volume < 30) return "<30%";
  if (volume < 60) return "30-50%";
  return ">50%";
}

/**
 * Render enhanced drivers section with split-view layout (PWA style)
 * @param {object} results - Results object containing drivers
 * @returns {string} HTML for drivers section
 */
function renderEnhancedDriversSection(results) {
  if (!results?.ich?.drivers && !results?.lvo?.drivers) {
    return "";
  }

  let html = `
    <div class="content-section">
      <h3>🎯 Risikofaktoren / Risk Factors</h3>
      <div class="enhanced-drivers-grid">
  `;

  // Render ICH drivers if available
  if (results?.ich?.drivers) {
    html += renderEnhancedDriversPanel(
      results.ich.drivers,
      "ICH",
      "ich",
      results.ich.probability
    );
  }

  // Render LVO drivers if available
  if (results?.lvo?.drivers && results.lvo.probability > 0) {
    html += renderEnhancedDriversPanel(
      results.lvo.drivers,
      "LVO",
      "lvo",
      results.lvo.probability
    );
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Normalize drivers from API to unified format
 * Handles both old format (positive/negative arrays) and new absolute_importance format
 * @param {object} drivers - Raw drivers data from API
 * @returns {object} Normalized drivers with positive/negative arrays
 */
function normalizeDriversForKiosk(drivers) {
  if (!drivers) return { positive: [], negative: [], maxImportance: 0.01 };

  // Handle new absolute_importance format
  if (drivers.kind === "absolute_importance" && Array.isArray(drivers.features)) {
    const positive = drivers.features
      .filter(f => f.direction === "increases_risk")
      .map(f => ({
        label: f.label,
        weight: f.importance,
        value: f.value,
        unit: f.unit,
        level: f.level
      }));

    const negative = drivers.features
      .filter(f => f.direction === "decreases_risk")
      .map(f => ({
        label: f.label,
        weight: f.importance,
        value: f.value,
        unit: f.unit,
        level: f.level
      }));

    const maxImportance = Math.max(...drivers.features.map(f => f.importance), 0.01);

    return { positive, negative, maxImportance };
  }

  // Handle old format (already has positive/negative arrays)
  const positive = drivers.positive || [];
  const negative = drivers.negative || [];
  const allWeights = [...positive, ...negative].map(d => Math.abs(d.weight));
  const maxImportance = Math.max(...allWeights, 0.01);

  return { positive, negative, maxImportance };
}

/**
 * Calculate bar width using square root scale for better visual differentiation
 * @param {number} importance - Feature importance value
 * @param {number} maxImportance - Maximum importance in the dataset
 * @returns {number} Bar width percentage (0-100)
 */
function calculateBarWidth(importance, maxImportance) {
  if (!maxImportance || maxImportance <= 0) return 0;
  return Math.round((Math.sqrt(importance) / Math.sqrt(maxImportance)) * 100);
}

/**
 * Render enhanced drivers panel with split-view (PWA style)
 * @param {object} drivers - Drivers data with positive/negative arrays
 * @param {string} title - Panel title
 * @param {string} type - Type ('ich' or 'lvo')
 * @param {number} probability - Risk probability (0-1)
 * @returns {string} HTML for drivers panel
 */
function renderEnhancedDriversPanel(drivers, title, type, probability) {
  if (!drivers || (!drivers.positive && !drivers.negative && !drivers.features)) {
    return "";
  }

  // Normalize drivers to unified format
  const normalized = normalizeDriversForKiosk(drivers);
  const positiveDrivers = normalized.positive.slice(0, 5);
  const negativeDrivers = normalized.negative.slice(0, 5);
  const maxImportance = normalized.maxImportance;

  return `
    <div class="enhanced-drivers-panel ${type}">
      <div class="panel-header">
        <div class="panel-icon ${type}">${type === "ich" ? "🩸" : "🧠"}</div>
        <div class="panel-title">
          <h4>${title} Faktoren / Factors</h4>
          <span class="panel-subtitle">Beitrag zum Gesamtrisiko / Contributing to overall risk</span>
        </div>
      </div>

      <div class="drivers-split-view">
        <div class="drivers-column positive-column">
          <div class="column-header">
            <span class="column-icon">⬆</span>
            <span class="column-title">Risiko erhöhend / Increasing Risk</span>
          </div>
          <div class="compact-drivers">
            ${
              positiveDrivers.length > 0
                ? positiveDrivers
                    .map((d) => renderCompactDriverWithBar(d, maxImportance, "positive"))
                    .join("")
                : '<div class="no-factors">Keine Faktoren / No factors</div>'
            }
          </div>
        </div>

        <div class="drivers-column negative-column">
          <div class="column-header">
            <span class="column-icon">⬇</span>
            <span class="column-title">Risiko mindernd / Decreasing Risk</span>
          </div>
          <div class="compact-drivers">
            ${
              negativeDrivers.length > 0
                ? negativeDrivers
                    .map((d) => renderCompactDriverWithBar(d, maxImportance, "negative"))
                    .join("")
                : '<div class="no-factors">Keine Faktoren / No factors</div>'
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render compact driver item with square root scaled bar and importance value
 * @param {object} driver - Driver object with label, weight, value, unit
 * @param {number} maxImportance - Maximum importance for scaling
 * @param {string} type - Type ('positive' or 'negative')
 * @returns {string} HTML for driver item
 */
function renderCompactDriverWithBar(driver, maxImportance, type) {
  const importance = Math.abs(driver.weight);
  const barWidth = calculateBarWidth(importance, maxImportance);
  const cleanLabel = formatDriverName(driver.label);
  const isPositive = type === "positive";

  // Format value with unit if available
  let valueDisplay = "";
  if (driver.value !== undefined && driver.value !== null) {
    const unit = driver.unit && driver.unit !== "binary" ? ` ${driver.unit}` : "";
    if (driver.unit === "binary") {
      valueDisplay = driver.value ? "Ja / Yes" : "Nein / No";
    } else {
      valueDisplay = `${driver.value}${unit}`;
    }
  }

  const barColor = isPositive ? "var(--color-danger, #ef4444)" : "var(--color-success, #22c55e)";
  const textColor = isPositive ? "var(--color-danger, #ef4444)" : "var(--color-success, #22c55e)";

  return `
    <div class="compact-driver-item" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 0.9rem; font-weight: 500; color: rgba(255,255,255,0.9);">${cleanLabel}</span>
        <span style="font-size: 0.9rem; font-weight: 700; color: ${textColor};">${importance.toFixed(2)}</span>
      </div>
      ${valueDisplay ? `<div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 6px;">${valueDisplay}</div>` : ""}
      <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
        <div style="height: 100%; width: ${barWidth}%; background: ${barColor}; border-radius: 3px; transition: width 0.5s ease;"></div>
      </div>
    </div>
  `;
}

/**
 * Render compact driver item with animated bar (legacy)
 * @param {object} driver - Driver object with label and weight
 * @param {string} type - Type ('positive' or 'negative')
 * @param {number} relativeImportance - Percentage of total contribution
 * @param {number} barWidth - Bar width percentage
 * @returns {string} HTML for driver item
 */
function renderCompactDriver(driver, type, relativeImportance, barWidth) {
  // Use medical terminology formatter for better labels
  const cleanLabel = formatDriverName(driver.label);

  return `
    <div class="compact-driver-item">
      <div class="compact-driver-label">${cleanLabel}</div>
      <div class="compact-driver-bar ${type}" style="width: ${barWidth}%">
        <span class="compact-driver-value">${type === "positive" ? "+" : "-"}${relativeImportance.toFixed(0)}%</span>
      </div>
    </div>
  `;
}

/**
 * Get urgency color
 * @param {string} urgency - Urgency level
 * @returns {string} Hex color
 */
function getUrgencyColor(urgency) {
  const colors = {
    IMMEDIATE: "#ff4444",
    TIME_CRITICAL: "#ff8800",
    URGENT: "#ffcc00",
    STANDARD: "#4a90e2"
  };
  return colors[urgency] || "#4a90e2";
}

/**
 * Render enhanced input summary matching PWA style
 * @param {object} formData - Form data from case
 * @returns {string} HTML for enhanced input summary
 */
function renderFormData(formData) {
  if (!formData || Object.keys(formData).length === 0) {
    return '<p class="no-data">Keine Bewertungsdaten verfügbar / No assessment data available</p>';
  }

  // Check if formData is structured by modules or flat
  const isModularData =
    typeof Object.values(formData)[0] === "object" &&
    !Array.isArray(Object.values(formData)[0]) &&
    Object.values(formData)[0] !== null;

  if (isModularData) {
    // Render modular data (grouped by assessment module)
    return renderModularInputSummary(formData);
  }

  // Render flat data
  return renderFlatInputSummary(formData);
}

/**
 * Render modular input summary grouped by assessment modules
 * @param {object} formData - Modular form data
 * @returns {string} HTML for modular summary
 */
function renderModularInputSummary(formData) {
  let summaryHtml = "";

  // Module icons and titles
  const moduleConfig = {
    coma: { icon: "🚨", title: "Coma Modul / Module" },
    limited: { icon: "⚡", title: "Limited Modul / Module" },
    full: { icon: "📊", title: "Full Modul / Module" }
  };

  Object.entries(formData).forEach(([module, data]) => {
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      const config = moduleConfig[module] || {
        icon: "📋",
        title:
          module.charAt(0).toUpperCase() + module.slice(1) + " Modul / Module"
      };

      let itemsHtml = "";

      Object.entries(data).forEach(([key, value]) => {
        // Skip empty, null, undefined, or default values
        if (!isValidInputValue(value)) {
          return;
        }

        const label = formatSummaryLabel(key);
        const displayValue = formatDisplayValue(value, key);

        itemsHtml += `
          <div class="summary-item">
            <span class="summary-label">${label}</span>
            <span class="summary-value">${displayValue}</span>
          </div>
        `;
      });

      if (itemsHtml) {
        summaryHtml += `
          <div class="summary-module">
            <h4 class="module-title">
              <span class="module-icon">${config.icon}</span>
              ${config.title}
            </h4>
            <div class="summary-items">
              ${itemsHtml}
            </div>
          </div>
        `;
      }
    }
  });

  return (
    summaryHtml ||
    '<p class="no-data">Keine Bewertungsdaten verfügbar / No assessment data available</p>'
  );
}

/**
 * Render flat input summary
 * @param {object} formData - Flat form data
 * @returns {string} HTML for flat summary
 */
function renderFlatInputSummary(formData) {
  let itemsHtml = "";

  Object.entries(formData).forEach(([key, value]) => {
    // Skip empty values, internal fields, and default values
    if (key.startsWith("_") || !isValidInputValue(value)) {
      return;
    }

    const label = formatSummaryLabel(key);
    const displayValue = formatDisplayValue(value, key);

    itemsHtml += `
      <div class="summary-item">
        <span class="summary-label">${label}:</span>
        <span class="summary-value">${displayValue}</span>
      </div>
    `;
  });

  if (!itemsHtml) {
    return '<p class="no-data">Keine Bewertungsdaten verfügbar / No assessment data available</p>';
  }

  return `
    <div class="summary-module">
      <div class="summary-items">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function renderDrivers(drivers) {
  if (!drivers || (!drivers.positive && !drivers.negative)) {
    return "<p>No driver data available</p>";
  }

  const positive = drivers.positive || [];
  const negative = drivers.negative || [];

  return `
    <div class="drivers-container">
      <div class="drivers-column">
        <h4>⬆ Increasing Risk</h4>
        ${
          positive.length > 0
            ? positive
                .map(
                  (d) => `
              <div class="driver-item positive">
                <span class="driver-label">${formatLabel(d.label)}</span>
                <span class="driver-value">${(Math.abs(d.weight) * 100).toFixed(1)}%</span>
              </div>
            `
                )
                .join("")
            : '<p class="no-drivers">None</p>'
        }
      </div>

      <div class="drivers-column">
        <h4>⬇ Decreasing Risk</h4>
        ${
          negative.length > 0
            ? negative
                .map(
                  (d) => `
              <div class="driver-item negative">
                <span class="driver-label">${formatLabel(d.label)}</span>
                <span class="driver-value">${(Math.abs(d.weight) * 100).toFixed(1)}%</span>
              </div>
            `
                )
                .join("")
            : '<p class="no-drivers">None</p>'
        }
      </div>
    </div>
  `;
}

/**
 * Extract GFAP value from form data
 * @param {object} formData - Form data from case
 * @returns {number} GFAP value or 0
 */
function getGFAPValue(formData) {
  if (!formData) return 0;

  // Check if modular data (coma, limited, full modules)
  for (const module of ["coma", "limited", "full"]) {
    if (formData[module]?.gfap_value) {
      return parseFloat(formData[module].gfap_value);
    }
    if (formData[module]?.gfap) {
      return parseFloat(formData[module].gfap);
    }
  }

  // Check flat data
  if (formData.gfap_value) return parseFloat(formData.gfap_value);
  if (formData.gfap) return parseFloat(formData.gfap);

  return 0;
}

/**
 * Estimate ICH volume from GFAP value (simplified from PWA logic)
 * @param {number} gfapValue - GFAP value in pg/mL
 * @returns {number} Estimated ICH volume in ml
 */
function estimateICHVolume(gfapValue) {
  if (!gfapValue || gfapValue <= 0) return 0;

  // Simplified logarithmic relationship from PWA
  // GFAP values typically range from 10-10000+ pg/mL
  // ICH volumes typically range from <1ml to 100ml+
  const logGFAP = Math.log10(gfapValue);
  const estimatedVolume = Math.pow(10, (logGFAP - 1.5) * 1.2);

  return Math.max(0, Math.min(150, estimatedVolume)); // Cap at 150ml
}

/**
 * Get volume color based on severity
 * @param {number} volume - ICH volume in ml
 * @returns {string} Hex color
 */
function getVolumeColor(volume) {
  if (volume >= 30) return "#ff4444"; // Critical (high mortality)
  if (volume >= 15) return "#ff8800"; // High risk
  if (volume >= 5) return "#ffcc00"; // Moderate
  return "#0066cc"; // Low volume
}

/**
 * Render Entscheidungshilfe speedometer for LVO/ICH decision support
 * @param {number} ichPercent - ICH probability percentage
 * @param {number} lvoPercent - LVO probability percentage
 * @returns {string} HTML for speedometer or empty string
 */
function renderEntscheidungshilfe(ichPercent, lvoPercent) {
  // Only show if both probabilities are significant
  if (!lvoPercent || lvoPercent < 20 || ichPercent < 20) return "";

  const ratio = lvoPercent / Math.max(ichPercent, 1);
  const absDiff = Math.abs(lvoPercent - ichPercent);

  // Only show if there's a meaningful signal (difference > 15%)
  if (absDiff < 15) return "";

  // Calculate needle position (-90 to +90 degrees)
  // Ratio < 0.8 = ICH dominant, > 1.2 = LVO dominant, between = uncertain
  let needleAngle = 0;
  if (ratio < 0.5)
    needleAngle = -75; // Strong ICH
  else if (ratio < 0.8)
    needleAngle = -45; // Moderate ICH
  else if (ratio < 1.2)
    needleAngle = 0; // Uncertain
  else if (ratio < 2.0)
    needleAngle = 45; // Moderate LVO
  else needleAngle = 75; // Strong LVO

  const recommendation =
    ratio < 0.8
      ? "ICH wahrscheinlicher / ICH more likely"
      : ratio > 1.2
        ? "LVO wahrscheinlicher / LVO more likely"
        : "Unsicher - beide möglich / Uncertain - both possible";

  const confidence =
    absDiff > 30
      ? "Hoch / High"
      : absDiff > 20
        ? "Mittel / Medium"
        : "Niedrig / Low";

  return `
    <div class="content-section entscheidungshilfe-section">
      <h3>🎯 Entscheidungshilfe / Decision Support</h3>
      <div class="speedometer-card">
        <div class="speedometer-gauge">
          <svg viewBox="0 0 200 120" width="300" height="180">
            <!-- Arc background -->
            <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="20" stroke-linecap="round"/>

            <!-- ICH zone (red) -->
            <path d="M 30 100 A 70 70 0 0 1 80 45" fill="none" stroke="#ff4444" stroke-width="20" stroke-linecap="round" opacity="0.6"/>

            <!-- Uncertain zone (yellow) -->
            <path d="M 80 45 A 70 70 0 0 1 120 45" fill="none" stroke="#ffcc00" stroke-width="20" stroke-linecap="round" opacity="0.6"/>

            <!-- LVO zone (blue) -->
            <path d="M 120 45 A 70 70 0 0 1 170 100" fill="none" stroke="#0066cc" stroke-width="20" stroke-linecap="round" opacity="0.6"/>

            <!-- Needle -->
            <line x1="100" y1="100" x2="100" y2="40"
                  stroke="#ffffff" stroke-width="3" stroke-linecap="round"
                  transform="rotate(${needleAngle} 100 100)"/>
            <circle cx="100" cy="100" r="6" fill="#ffffff"/>

            <!-- Labels -->
            <text x="40" y="115" font-size="12" fill="#ff4444" font-weight="bold">ICH</text>
            <text x="150" y="115" font-size="12" fill="#0066cc" font-weight="bold">LVO</text>
          </svg>
        </div>

        <div class="speedometer-info">
          <div class="recommendation">${recommendation}</div>
          <div class="speedometer-metrics">
            <div class="metric">
              <span class="metric-label">LVO/ICH Verhältnis / Ratio:</span>
              <span class="metric-value">${ratio.toFixed(2)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Differenz / Difference:</span>
              <span class="metric-value">${absDiff.toFixed(0)}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Konfidenz / Confidence:</span>
              <span class="metric-value">${confidence}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
