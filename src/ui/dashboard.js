/**
 * Dashboard UI - Case List View
 */
import { URGENCY_CONFIG } from '../config.js';

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

  // Render case cards
  const cardsHTML = sortedCases.map((caseData) => renderCaseCard(caseData)).join('');

  container.innerHTML = `
    <div class="cases-grid">
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
  const eta = caseData.tracking?.duration || '?';
  const distance = caseData.tracking?.distance || '?';

  // Generate unique patient code
  const patientCode = generatePatientCode(caseData.id);

  // Check GPS staleness
  const isGpsStale = caseData.tracking?.gpsStale || false;

  // Calculate time since received (use receivedAt if available, fallback to createdAt)
  const receivedAgo = getTimeAgo(caseData.receivedAt || caseData.createdAt);

  return `
    <div class="case-card ${caseData.urgency.toLowerCase()} ${caseData.isNew ? 'new-case' : ''}"
         data-case-id="${caseData.id}"
         style="border-color: ${urgencyConfig.color}">

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
          <span class="eta-value">${eta}</span>
          <span class="eta-unit">min</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof distance === 'number' ? distance.toFixed(1) : distance} km</span>
          ${isGpsStale ? '<span class="gps-stale-warning">⚠️ GPS stale</span>' : ''}
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

/**
 * Get risk color based on percentage
 */
function getRiskColor(percent) {
  if (percent > 70) {
    return '#ff4444';
  }
  if (percent > 50) {
    return '#ff8800';
  }
  if (percent > 30) {
    return '#ffcc00';
  }
  return '#4a90e2';
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}
