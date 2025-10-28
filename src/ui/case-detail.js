/**
 * Case Detail Modal
 * Shows full assessment results for a case
 * Enhanced with PWA-style beautiful results display
 */
import {
  getRiskColor,
  getRiskLevel,
  formatTime,
  formatLabel,
  formatDriverName,
  formatSummaryLabel,
  formatDisplayValue
} from '../utils.js';

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
            ${renderEnhancedRiskCard('ich', ichPercent, ichLevel, results, formData)}
            ${lvoPercent !== null ? renderEnhancedRiskCard('lvo', lvoPercent, lvoLevel, results, formData) : ''}
          </div>
        </div>

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
 * @param {object} formData - Form data (for GFAP volume calculation)
 * @returns {string} HTML for enhanced risk card
 */
function renderEnhancedRiskCard(type, percent, level, results, formData = null) {
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

  // For ICH cards, try to add volume ring if GFAP data available
  const volumeRingHtml = type === 'ich' && formData ? renderICHVolumeRing(formData) : '';

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
            ${volumeRingHtml}
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
  // Use medical terminology formatter for better labels
  const cleanLabel = formatDriverName(driver.label);

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
  const isModularData = typeof Object.values(formData)[0] === 'object'
    && !Array.isArray(Object.values(formData)[0])
    && Object.values(formData)[0] !== null;

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
  let summaryHtml = '';

  Object.entries(formData).forEach(([module, data]) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      const moduleTitle = module.charAt(0).toUpperCase() + module.slice(1) + ' Modul / Module';
      let itemsHtml = '';

      Object.entries(data).forEach(([key, value]) => {
        // Skip empty values
        if (value === '' || value === null || value === undefined) {
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

      if (itemsHtml) {
        summaryHtml += `
          <div class="summary-module">
            <h4 class="module-title">${moduleTitle}</h4>
            <div class="summary-items">
              ${itemsHtml}
            </div>
          </div>
        `;
      }
    }
  });

  return summaryHtml || '<p class="no-data">Keine Bewertungsdaten verfügbar / No assessment data available</p>';
}

/**
 * Render flat input summary
 * @param {object} formData - Flat form data
 * @returns {string} HTML for flat summary
 */
function renderFlatInputSummary(formData) {
  let itemsHtml = '';

  Object.entries(formData).forEach(([key, value]) => {
    // Skip empty values and internal fields
    if (value === '' || value === null || value === undefined || key.startsWith('_')) {
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

/**
 * Extract GFAP value from form data
 * @param {object} formData - Form data from case
 * @returns {number} GFAP value or 0
 */
function getGFAPValue(formData) {
  if (!formData) return 0;

  // Check if modular data (coma, limited, full modules)
  for (const module of ['coma', 'limited', 'full']) {
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
  if (volume >= 30) return '#ff4444'; // Critical (high mortality)
  if (volume >= 15) return '#ff8800'; // High risk
  if (volume >= 5) return '#ffcc00';  // Moderate
  return '#0066cc'; // Low volume
}

/**
 * Render ICH volume ring if GFAP data is available
 * @param {object} formData - Form data containing GFAP
 * @returns {string} HTML for volume ring or empty string
 */
function renderICHVolumeRing(formData) {
  const gfapValue = getGFAPValue(formData);
  if (!gfapValue || gfapValue <= 0) return '';

  const estimatedVolume = estimateICHVolume(gfapValue);
  const volumeColor = getVolumeColor(estimatedVolume);

  // Calculate progress ring (max 100ml = 100%)
  const volumePercent = Math.min((estimatedVolume / 100) * 100, 100);
  const circumference = Math.PI * 100;
  const offset = circumference * (1 - volumePercent / 100);

  const volumeDisplay = estimatedVolume < 1 ? '<1' : estimatedVolume.toFixed(1);

  return `
    <div class="circle-item">
      <div class="probability-circle">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
          <circle cx="60" cy="60" r="50" fill="none"
            stroke="${volumeColor}"
            stroke-width="10"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 60 60)"
            class="probability-progress volume-ring"/>
          <text x="60" y="60"
            text-anchor="middle"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="24"
            font-weight="bold"
            fill="#ffffff">
            ${volumeDisplay}
          </text>
          <text x="60" y="78"
            text-anchor="middle"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="14"
            fill="rgba(255,255,255,0.7)">
            ml
          </text>
        </svg>
      </div>
      <div class="circle-label">Blutungsvolumen / Bleed Volume</div>
      <div class="volume-note">Geschätzt von GFAP / Estimated from GFAP</div>
    </div>
  `;
}

/**
 * Render Entscheidungshilfe speedometer for LVO/ICH decision support
 * @param {number} ichPercent - ICH probability percentage
 * @param {number} lvoPercent - LVO probability percentage
 * @returns {string} HTML for speedometer or empty string
 */
function renderEntscheidungshilfe(ichPercent, lvoPercent) {
  // Only show if both probabilities are significant
  if (!lvoPercent || lvoPercent < 20 || ichPercent < 20) return '';

  const ratio = lvoPercent / Math.max(ichPercent, 1);
  const absDiff = Math.abs(lvoPercent - ichPercent);

  // Only show if there's a meaningful signal (difference > 15%)
  if (absDiff < 15) return '';

  // Calculate needle position (-90 to +90 degrees)
  // Ratio < 0.8 = ICH dominant, > 1.2 = LVO dominant, between = uncertain
  let needleAngle = 0;
  if (ratio < 0.5) needleAngle = -75; // Strong ICH
  else if (ratio < 0.8) needleAngle = -45; // Moderate ICH
  else if (ratio < 1.2) needleAngle = 0; // Uncertain
  else if (ratio < 2.0) needleAngle = 45; // Moderate LVO
  else needleAngle = 75; // Strong LVO

  const recommendation = ratio < 0.8
    ? 'ICH wahrscheinlicher / ICH more likely'
    : ratio > 1.2
      ? 'LVO wahrscheinlicher / LVO more likely'
      : 'Unsicher - beide möglich / Uncertain - both possible';

  const confidence = absDiff > 30 ? 'Hoch / High' : absDiff > 20 ? 'Mittel / Medium' : 'Niedrig / Low';

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
