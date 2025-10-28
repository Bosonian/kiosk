/**
 * Dashboard UI - Case List View
 */
import { URGENCY_CONFIG, KIOSK_CONFIG } from '../config.js';
import { getRiskColor, getTimeAgo, formatETA, isCaseStale, getRelevantTimestamp } from '../utils.js';

export function renderDashboard(cases) {
  const container = document.getElementById('casesContainer');
  if (!container) {
    return;
  }

  if (!cases || cases.length === 0) {
    container.innerHTML = `
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;
    return;
  }

  // Sort by urgency and ETA
  const sortedCases = sortCases(cases);

  // Apply display limit
  const displayCases = sortedCases.slice(0, KIOSK_CONFIG.maxCasesDisplay);

  // Render case cards
  const cardsHTML = displayCases.map((caseData) => renderCaseCard(caseData)).join('');

  // Show warning if cases were truncated
  const truncatedWarning = sortedCases.length > KIOSK_CONFIG.maxCasesDisplay
    ? `<div class="truncated-warning" role="alert">
         Showing ${KIOSK_CONFIG.maxCasesDisplay} of ${sortedCases.length} cases
       </div>`
    : '';

  container.innerHTML = `
    ${truncatedWarning}
    <div class="cases-grid" role="list" aria-label="Active cases">
      ${cardsHTML}
    </div>
  `;
}

/**
 * Sort cases by urgency and ETA
 */
function sortCases(cases) {
  return [...cases].sort((a, b) => {
    const urgencyA = URGENCY_CONFIG[a.urgency]?.priority ?? 10;
    const urgencyB = URGENCY_CONFIG[b.urgency]?.priority ?? 10;

    if (urgencyA !== urgencyB) {
      return urgencyA - urgencyB;
    }

    // Same urgency - sort by ETA
    const etaA = a.tracking?.duration || 9999;
    const etaB = b.tracking?.duration || 9999;
    return etaA - etaB;
  });
}

/**
 * Generate unique patient code from case ID
 */
function generatePatientCode(caseId) {
  if (!caseId) return 'PAT-0000';

  // Create a simple hash from the case ID
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = ((hash << 5) - hash) + caseId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to positive 4-digit number
  const code = Math.abs(hash % 10000).toString().padStart(4, '0');
  return `PAT-${code}`;
}

/**
 * Render individual case card
 */
function renderCaseCard(caseData) {
  const urgencyConfig = URGENCY_CONFIG[caseData.urgency] || URGENCY_CONFIG.STANDARD;
  const ichPercent = Math.round((caseData.results?.ich?.probability || 0) * 100);
  const lvoPercent = caseData.results?.lvo ? Math.round(caseData.results.lvo.probability * 100) : null;
  const formattedETA = formatETA(caseData.tracking?.duration);
  const distance = caseData.tracking?.distance || '?';

  // Generate unique patient code
  const patientCode = generatePatientCode(caseData.id);

  // Check GPS staleness
  const isGpsStale = caseData.tracking?.gpsStale || false;

  // Get most relevant timestamp (updatedAt > receivedAt > lastUpdated > createdAt)
  const relevantTimestamp = getRelevantTimestamp(caseData);

  // Check if case is old/stale
  const caseIsStale = isCaseStale(relevantTimestamp);

  // Calculate time since received/updated
  const receivedAgo = getTimeAgo(relevantTimestamp);

  // Create accessible label
  const ariaLabel = `${caseData.urgency} case, ${patientCode}, ICH risk ${ichPercent}%, ETA ${formattedETA} minutes`;

  return `
    <div class="case-card ${caseData.urgency.toLowerCase()} ${caseData.isNew ? 'new-case' : ''} ${caseIsStale ? 'stale-case' : ''}"
         data-case-id="${caseData.id}"
         style="border-color: ${urgencyConfig.color}"
         role="listitem"
         tabindex="0"
         aria-label="${ariaLabel}">

      <div class="case-header">
        <div class="urgency-badge" style="background: ${urgencyConfig.color}">
          ${urgencyConfig.icon} ${caseData.urgency}
        </div>
        <div class="case-meta">
          <span class="patient-code">${patientCode}</span>
          <span class="module-type">${caseData.moduleType}</span>
        </div>
      </div>

      <div class="case-risks">
        <div class="risk-circle-container">
          ${renderRiskRingSVG(ichPercent, 'ICH')}
        </div>

        ${lvoPercent !== null ? `
          <div class="risk-circle-container">
            ${renderRiskRingSVG(lvoPercent, 'LVO')}
          </div>
        ` : ''}
      </div>

      <div class="case-eta">
        <div class="eta-main ${isGpsStale ? 'stale' : ''}">
          <span class="eta-value">${formattedETA}</span>
          <span class="eta-unit">${formattedETA === 'Arrived' || formattedETA === '?' ? '' : 'min'}</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof distance === 'number' ? distance.toFixed(1) : distance} km</span>
          ${isGpsStale ? '<span class="gps-stale-warning" role="alert">⚠️ GPS stale</span>' : ''}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${receivedAgo}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `;
}

/**
 * Render SVG risk ring for dashboard cards
 */
function renderRiskRingSVG(percent, label) {
  const color = getRiskColor(percent);
  const circumference = Math.PI * 100; // 2πr where r=50
  const offset = circumference * (1 - percent / 100);
  const riskClass = percent > 70 ? 'critical' : percent > 50 ? 'high' : percent > 30 ? 'medium' : 'low';

  return `
    <svg class="risk-ring-svg ${riskClass}" viewBox="0 0 120 120" width="80" height="80">
      <!-- Background circle -->
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        stroke-width="8"/>

      <!-- Progress circle -->
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

      <!-- Percentage text -->
      <text
        x="60"
        y="65"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="20"
        font-weight="bold"
        fill="#ffffff"
        style="pointer-events: none;">
        ${percent}%
      </text>
    </svg>
    <div class="risk-label">${label}</div>
  `;
}
