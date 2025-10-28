/**
 * Case Detail Modal
 * Shows full assessment results for a case
 */
import { getRiskColor, getRiskLevel, formatTime, formatLabel } from '../utils.js';

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
  const { results, formData, moduleType, ambulanceId, tracking, urgency } = caseData;
  const ichPercent = Math.round((results?.ich?.probability || 0) * 100);
  const lvoPercent = results?.lvo ? Math.round(results.lvo.probability * 100) : null;

  return `
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2 id="modalTitle">Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge">${urgency}</span>
            <span class="badge module-badge">${moduleType}</span>
            <span class="badge ambulance-badge">${ambulanceId}</span>
          </div>
        </div>
        <button class="close-modal">✕ Close</button>
      </div>

      <div class="detail-content">
        <div class="content-section">
          <h3>🎯 Risk Assessment</h3>
          <div class="risk-display-large">
            <div class="risk-item-large">
              <div class="risk-label-large">ICH Risk</div>
              <div class="risk-value-large" style="color: ${getRiskColor(ichPercent)}">${ichPercent}%</div>
              <div class="risk-level-large">${getRiskLevel(ichPercent)}</div>
            </div>

            ${lvoPercent !== null ? `
              <div class="risk-item-large">
                <div class="risk-label-large">LVO Risk</div>
                <div class="risk-value-large" style="color: ${getRiskColor(lvoPercent)}">${lvoPercent}%</div>
                <div class="risk-level-large">${getRiskLevel(lvoPercent)}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="content-section">
          <h3>📍 Tracking Information</h3>
          <div class="tracking-grid">
            <div class="tracking-item">
              <div class="tracking-label">ETA</div>
              <div class="tracking-value">${tracking?.duration || '?'} min</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Distance</div>
              <div class="tracking-value">${tracking?.distance ? tracking.distance.toFixed(1) : '?'} km</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Last Update</div>
              <div class="tracking-value">${tracking?.lastUpdated ? formatTime(tracking.lastUpdated) : 'Unknown'}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Estimated Arrival</div>
              <div class="tracking-value">${tracking?.estimatedArrival ? formatTime(tracking.estimatedArrival) : 'Unknown'}</div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3>📋 Assessment Data</h3>
          <div class="data-table">
            ${renderFormData(formData)}
          </div>
        </div>

        ${results?.ich?.drivers ? `
          <div class="content-section">
            <h3>⚡ Risk Factors</h3>
            ${renderDrivers(results.ich.drivers)}
          </div>
        ` : ''}
      </div>

      <div class="detail-footer">
        <button class="close-modal secondary-button">Close</button>
      </div>
    </div>
  `;
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
