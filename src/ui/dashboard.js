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
 * Render individual case card
 */
function renderCaseCard(caseData) {
  const urgencyConfig = URGENCY_CONFIG[caseData.urgency] || URGENCY_CONFIG.STANDARD;
  const ichPercent = Math.round((caseData.results?.ich?.probability || 0) * 100);
  const lvoPercent = caseData.results?.lvo ? Math.round(caseData.results.lvo.probability * 100) : null;
  const eta = caseData.tracking?.duration || '?';
  const distance = caseData.tracking?.distance || '?';

  // Check GPS staleness
  const isGpsStale = caseData.tracking?.gpsStale || false;

  // Calculate time since received
  const receivedAgo = getTimeAgo(caseData.createdAt);

  return `
    <div class="case-card ${caseData.urgency.toLowerCase()} ${caseData.isNew ? 'new-case' : ''}"
         data-case-id="${caseData.id}"
         style="border-color: ${urgencyConfig.color}">

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
