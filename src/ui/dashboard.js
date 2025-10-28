/**
 * Dashboard UI - Case List View
 */
import { URGENCY_CONFIG, KIOSK_CONFIG } from '../config.js';
import { getRiskColor, getTimeAgo, formatETA, isCaseStale } from '../utils.js';

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
 * Render individual case card
 */
function renderCaseCard(caseData) {
  const urgencyConfig = URGENCY_CONFIG[caseData.urgency] || URGENCY_CONFIG.STANDARD;
  const ichPercent = Math.round((caseData.results?.ich?.probability || 0) * 100);
  const lvoPercent = caseData.results?.lvo ? Math.round(caseData.results.lvo.probability * 100) : null;
  const formattedETA = formatETA(caseData.tracking?.duration);
  const distance = caseData.tracking?.distance || '?';

  // Check GPS staleness
  const isGpsStale = caseData.tracking?.gpsStale || false;

  // Check if case is old/stale
  const caseIsStale = isCaseStale(caseData.createdAt);

  // Calculate time since received
  const receivedAgo = getTimeAgo(caseData.createdAt);

  // Create accessible label
  const ariaLabel = `${caseData.urgency} case, ${caseData.ambulanceId}, ICH risk ${ichPercent}%, ETA ${formattedETA} minutes`;

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
          <span class="ambulance-id">${caseData.ambulanceId}</span>
          <span class="module-type">${caseData.moduleType}</span>
        </div>
      </div>

      <div class="case-risks">
        <div class="risk-circle-container">
          <div class="risk-circle ${ichPercent > 70 ? 'critical' : ichPercent > 50 ? 'high' : 'medium'}"
               style="background: conic-gradient(${getRiskColor(ichPercent)} ${ichPercent}%, rgba(255,255,255,0.1) 0%)">
            <div class="risk-value">${ichPercent}%</div>
          </div>
          <div class="risk-label">ICH</div>
        </div>

        ${lvoPercent !== null ? `
          <div class="risk-circle-container">
            <div class="risk-circle ${lvoPercent > 50 ? 'high' : 'medium'}"
                 style="background: conic-gradient(${getRiskColor(lvoPercent)} ${lvoPercent}%, rgba(255,255,255,0.1) 0%)">
              <div class="risk-value">${lvoPercent}%</div>
            </div>
            <div class="risk-label">LVO</div>
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

