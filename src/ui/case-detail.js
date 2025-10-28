/**
 * Case Detail Modal
 * Shows full assessment results for a case
 * Enhanced with PWA-style beautiful results display
 */
import { getRiskColor, getRiskLevel, formatTime, formatLabel } from '../utils.js';

/**
 * Get risk level classification for styling
 * @param {number} percent - Risk percentage (0-100)
 * @returns {string} Risk level ('critical', 'high', 'normal')
 */
function getRiskLevelClass(percent) {
  if (percent > 70) return 'critical';
  if (percent > 50) return 'high';
  return 'normal';
}

export function showCaseDetail(caseData) {
  const modal = document.getElementById('caseDetailModal');
  if (!modal) {
    return;
  }

  const modalContent = modal.querySelector('.modal-content');
  if (!modalContent) {
    return;
  }

  // Render detail view
  modalContent.innerHTML = renderDetailView(caseData);

  // Show modal
  modal.style.display = 'flex';
}

function renderDetailView(caseData) {
  const { results, formData, moduleType, ambulanceId, tracking, urgency, createdAt, updatedAt } = caseData;

  // Calculate risk percentages
  const ichPercent = Math.round((results?.ich?.probability || 0) * 100);
  const lvoPercent = results?.lvo ? Math.round(results.lvo.probability * 100) : null;

  // Determine risk levels for styling
  const ichLevel = getRiskLevelClass(ichPercent);
  const lvoLevel = lvoPercent ? getRiskLevelClass(lvoPercent) : 'normal';

  // Determine card layout (single, dual, or triple)
  let cardCount = 1; // Always have ICH
  if (lvoPercent !== null && lvoPercent > 0) {
    cardCount++;
  }

  const layoutClass = cardCount === 1 ? 'risk-results-single' : 'risk-results-dual';

  return `
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2 id="modalTitle">🩺 Detaillierte Fallanalyse / Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge" style="background: ${getUrgencyColor(urgency)}">${urgency}</span>
            <span class="badge module-badge">${moduleType}</span>
            <span class="badge ambulance-badge">🚑 ${ambulanceId}</span>
          </div>
        </div>
        <button class="close-modal" aria-label="Close modal">✕</button>
      </div>

      <div class="detail-content">
        <!-- Enhanced Risk Assessment Cards -->
        <div class="content-section">
          <h3>🎯 Risikobewertung / Risk Assessment</h3>
          <div class="${layoutClass}">
            ${renderEnhancedRiskCard('ich', ichPercent, ichLevel, results)}
            ${lvoPercent !== null ? renderEnhancedRiskCard('lvo', lvoPercent, lvoLevel, results) : ''}
          </div>
        </div>

        <!-- Enhanced Drivers Section -->
        ${renderEnhancedDriversSection(results)}

        <!-- Tracking Information -->
        <div class="content-section">
          <h3>📍 Standort & Ankunftszeit / Tracking Information</h3>
          <div class="tracking-grid">
            <div class="tracking-item">
              <div class="tracking-label">ETA</div>
              <div class="tracking-value">${tracking?.duration || '?'} min</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Entfernung / Distance</div>
              <div class="tracking-value">${tracking?.distance ? tracking.distance.toFixed(1) : '?'} km</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Letzte Aktualisierung / Last Update</div>
              <div class="tracking-value">${tracking?.lastUpdated ? formatTime(tracking.lastUpdated) : 'Unknown'}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Voraussichtliche Ankunft / Estimated Arrival</div>
              <div class="tracking-value">${tracking?.estimatedArrival ? formatTime(tracking.estimatedArrival) : 'Unknown'}</div>
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
        <button class="close-modal secondary-button">Schließen / Close</button>
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
  const icons = { ich: '🩸', lvo: '🧠' };
  const titles = {
    ich: 'ICH Risiko / ICH Risk',
    lvo: 'LVO Risiko / LVO Risk'
  };

  const color = level === 'critical' ? '#ff4444' : level === 'high' ? '#ff8800' : '#0066cc';
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
          <span class="risk-module">${type === 'ich' ? 'Blutungsrisiko' : 'Verschlussrisiko'}</span>
        </div>
      </div>

      <div class="risk-probability">
        <div class="circles-container">
          <div class="rings-row">
            <div class="circle-item">
              <div class="probability-circle">
                <svg viewBox="0 0 120 120" width="120" height="120">
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
          </div>
          <div class="risk-level ${level}">${riskLevelText}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render enhanced drivers section with split-view layout (PWA style)
 * @param {object} results - Results object containing drivers
 * @returns {string} HTML for drivers section
 */
function renderEnhancedDriversSection(results) {
  if (!results?.ich?.drivers && !results?.lvo?.drivers) {
    return '';
  }

  let html = `
    <div class="content-section">
      <h3>🎯 Risikofaktoren / Risk Factors</h3>
      <div class="enhanced-drivers-grid">
  `;

  // Render ICH drivers if available
  if (results?.ich?.drivers) {
    html += renderEnhancedDriversPanel(results.ich.drivers, 'ICH', 'ich', results.ich.probability);
  }

  // Render LVO drivers if available
  if (results?.lvo?.drivers && results.lvo.probability > 0) {
    html += renderEnhancedDriversPanel(results.lvo.drivers, 'LVO', 'lvo', results.lvo.probability);
  }

  html += `
      </div>
    </div>
  `;

  return html;
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
  if (!drivers || (!drivers.positive && !drivers.negative)) {
    return '';
  }

  const positiveDrivers = (drivers.positive || []).slice(0, 5);
  const negativeDrivers = (drivers.negative || []).slice(0, 5);

  // Calculate max weight for bar sizing
  const allWeights = [...positiveDrivers, ...negativeDrivers].map(d => Math.abs(d.weight));
  const maxWeight = Math.max(...allWeights, 0.01);

  // Calculate relative importance percentages
  const totalPositiveWeight = positiveDrivers.reduce((sum, d) => sum + Math.abs(d.weight), 0);
  const totalNegativeWeight = negativeDrivers.reduce((sum, d) => sum + Math.abs(d.weight), 0);

  return `
    <div class="enhanced-drivers-panel ${type}">
      <div class="panel-header">
        <div class="panel-icon ${type}">${type === 'ich' ? '🩸' : '🧠'}</div>
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
            ${positiveDrivers.length > 0
              ? positiveDrivers.map(d => {
                  const relativeImportance = totalPositiveWeight > 0
                    ? (Math.abs(d.weight) / totalPositiveWeight) * 100 : 0;
                  const barWidth = (Math.abs(d.weight) / maxWeight) * 100;
                  return renderCompactDriver(d, 'positive', relativeImportance, barWidth);
                }).join('')
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
            ${negativeDrivers.length > 0
              ? negativeDrivers.map(d => {
                  const relativeImportance = totalNegativeWeight > 0
                    ? (Math.abs(d.weight) / totalNegativeWeight) * 100 : 0;
                  const barWidth = (Math.abs(d.weight) / maxWeight) * 100;
                  return renderCompactDriver(d, 'negative', relativeImportance, barWidth);
                }).join('')
              : '<div class="no-factors">Keine Faktoren / No factors</div>'
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render compact driver item with animated bar
 * @param {object} driver - Driver object with label and weight
 * @param {string} type - Type ('positive' or 'negative')
 * @param {number} relativeImportance - Percentage of total contribution
 * @param {number} barWidth - Bar width percentage
 * @returns {string} HTML for driver item
 */
function renderCompactDriver(driver, type, relativeImportance, barWidth) {
  const cleanLabel = formatLabel(driver.label);

  return `
    <div class="compact-driver-item">
      <div class="compact-driver-label">${cleanLabel}</div>
      <div class="compact-driver-bar ${type}" style="width: ${barWidth}%">
        <span class="compact-driver-value">${type === 'positive' ? '+' : '-'}${relativeImportance.toFixed(0)}%</span>
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
    IMMEDIATE: '#ff4444',
    TIME_CRITICAL: '#ff8800',
    URGENT: '#ffcc00',
    STANDARD: '#4a90e2',
  };
  return colors[urgency] || '#4a90e2';
}


function renderFormData(formData) {
  if (!formData || Object.keys(formData).length === 0) {
    return '<p>No assessment data available</p>';
  }

  return Object.entries(formData)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(
      ([key, value]) => `
      <div class="data-row">
        <div class="data-label">${formatLabel(key)}</div>
        <div class="data-value">${value}</div>
      </div>
    `,
    )
    .join('');
}

function renderDrivers(drivers) {
  if (!drivers || (!drivers.positive && !drivers.negative)) {
    return '<p>No driver data available</p>';
  }

  const positive = drivers.positive || [];
  const negative = drivers.negative || [];

  return `
    <div class="drivers-container">
      <div class="drivers-column">
        <h4>⬆ Increasing Risk</h4>
        ${positive.length > 0
      ? positive
        .map(
          (d) => `
              <div class="driver-item positive">
                <span class="driver-label">${formatLabel(d.label)}</span>
                <span class="driver-value">${(Math.abs(d.weight) * 100).toFixed(1)}%</span>
              </div>
            `,
        )
        .join('')
      : '<p class="no-drivers">None</p>'
    }
      </div>

      <div class="drivers-column">
        <h4>⬇ Decreasing Risk</h4>
        ${negative.length > 0
      ? negative
        .map(
          (d) => `
              <div class="driver-item negative">
                <span class="driver-label">${formatLabel(d.label)}</span>
                <span class="driver-value">${(Math.abs(d.weight) * 100).toFixed(1)}%</span>
              </div>
            `,
        )
        .join('')
      : '<p class="no-drivers">None</p>'
    }
      </div>
    </div>
  `;
}
