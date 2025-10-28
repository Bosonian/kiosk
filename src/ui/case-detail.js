/**
 * Case Detail Modal
 * Shows full assessment results for a case - Enhanced to match PWA results page
 */

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
  const { results, formData, moduleType, tracking, urgency } = caseData;
  const patientCode = generatePatientCode(caseData.id);
  const ichPercent = Math.round((results?.ich?.probability || 0) * 100);
  const lvoPercent = results?.lvo ? Math.round(results.lvo.probability * 100) : null;

  return `
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2>Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge">${urgency}</span>
            <span class="badge module-badge">${moduleType}</span>
            <span class="badge patient-code-badge">${patientCode}</span>
          </div>
        </div>
        <button class="close-modal">✕ Close</button>
      </div>

      <div class="detail-content">
        <!-- Risk Assessment Cards -->
        <div class="content-section">
          <h3>🎯 Risk Assessment</h3>
          <div class="risk-cards-grid ${lvoPercent !== null ? 'dual-cards' : 'single-card'}">
            ${renderRiskCard('ich', ichPercent, results?.ich)}
            ${lvoPercent !== null ? renderRiskCard('lvo', lvoPercent, results?.lvo) : ''}
          </div>
        </div>

        <!-- Volume Display for high ICH risk -->
        ${ichPercent >= 50 && formData?.gfap_value ? `
          <div class="content-section">
            <h3>🧮 ICH Volume Estimate</h3>
            ${renderVolumeEstimate(formData.gfap_value)}
          </div>
        ` : ''}

        <!-- Tracking Information -->
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

        <!-- Differential Diagnoses -->
        ${ichPercent > 25 ? renderDifferentialDiagnoses(moduleType, ichPercent) : ''}

        <!-- Risk Factor Drivers -->
        ${results?.ich?.drivers ? `
          <div class="content-section">
            <h3>⚡ Risk Factors</h3>
            ${renderDriversSplit(results.ich.drivers)}
          </div>
        ` : ''}

        <!-- Assessment Data -->
        <div class="content-section collapsible">
          <h3 class="section-toggle" onclick="this.parentElement.classList.toggle('expanded')">
            <span>📋 Assessment Data</span>
            <span class="toggle-icon">▼</span>
          </h3>
          <div class="collapsible-content">
            <div class="data-table">
              ${renderFormData(formData)}
            </div>
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <button class="dismiss-case-button" data-case-id="${caseData.id}">
          🗑️ Dismiss Case
        </button>
        <button class="close-modal secondary-button">Close</button>
      </div>
    </div>
  `;
}

/**
 * Render risk card with circular SVG visualization (like PWA)
 */
function renderRiskCard(type, percent, data) {
  const level = percent > 70 ? 'critical' : percent > 50 ? 'high' : 'normal';
  const color = getRiskColor(percent);
  const icons = { ich: '🩸', lvo: '🧠' };
  const titles = { ich: 'ICH Risk', lvo: 'LVO Risk' };
  const circumference = Math.PI * 100;
  const offset = circumference * (1 - percent / 100);

  return `
    <div class="enhanced-risk-card ${type} ${level}">
      <div class="risk-header-small">
        <div class="risk-icon-small">${icons[type]}</div>
        <div class="risk-title-small">
          <h4>${titles[type]}</h4>
        </div>
      </div>

      <div class="risk-probability">
        <div class="circles-container">
          <div class="circle-item">
            <svg viewBox="0 0 120 120" class="probability-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
              <circle cx="60" cy="60" r="50" fill="none"
                stroke="${color}"
                stroke-width="8"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                stroke-linecap="round"
                transform="rotate(-90 60 60)"/>
              <text x="60" y="60" text-anchor="middle" dominant-baseline="middle"
                class="probability-text" fill="currentColor" font-size="20" font-weight="bold">
                ${percent}%
              </text>
            </svg>
          </div>
        </div>
        <div class="risk-level ${level}">${getRiskLevel(percent)}</div>
      </div>
    </div>
  `;
}

/**
 * Render volume estimate (simplified from PWA brain visualization)
 */
function renderVolumeEstimate(gfapValue) {
  const volume = estimateVolumeFromGFAP(parseFloat(gfapValue));
  const mortality = estimateMortalityFromVolume(volume);

  return `
    <div class="volume-estimate-card">
      <div class="volume-display">
        <div class="volume-value">${volume.toFixed(1)} mL</div>
        <div class="volume-label">Estimated ICH Volume</div>
      </div>
      <div class="mortality-estimate">
        <div class="mortality-label">Predicted 30-day Mortality</div>
        <div class="mortality-value">${mortality}</div>
      </div>
      <div class="volume-note">
        <small>Based on GFAP value: ${gfapValue} pg/mL</small>
      </div>
    </div>
  `;
}

/**
 * Estimate volume from GFAP (simplified calculation)
 */
function estimateVolumeFromGFAP(gfap) {
  if (gfap <= 0) return 0;
  // Simplified exponential relationship
  const logGfap = Math.log10(gfap);
  const volume = Math.max(0, (logGfap - 1.5) * 15);
  return Math.min(volume, 150); // Cap at 150mL
}

/**
 * Estimate mortality from volume
 */
function estimateMortalityFromVolume(volume) {
  if (volume < 30) return '<30%';
  if (volume < 60) return '30-50%';
  return '>50%';
}

/**
 * Render differential diagnoses section
 */
function renderDifferentialDiagnoses(moduleType, ichPercent) {
  const isComa = moduleType?.toLowerCase().includes('coma');

  if (isComa) {
    return `
      <div class="content-section differential-diagnoses">
        <h3>⚡ Differential Diagnoses</h3>
        <div class="diagnosis-content">
          <ul class="diagnosis-list">
            ${ichPercent > 25 ? `
              <li>Alternative diagnoses include SAH, SDH, EDH (Subarachnoid Hemorrhage, Subdural Hematoma, Epidural Hematoma)</li>
              <li>In cases of unclear time window since symptom onset or extended time window, demarcated infarction or hypoxic brain injury should also be considered</li>
            ` : `
              <li>Alternative diagnosis for reduced consciousness likely</li>
              <li>Basilar artery occlusion cannot be excluded</li>
            `}
          </ul>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="content-section differential-diagnoses">
        <h3>⚡ Differential Diagnoses</h3>
        <div class="diagnosis-content">
          <h4 class="clinical-action">Reconfirm Time Window Since Symptom Onset</h4>
          <ul class="diagnosis-list">
            <li>Unclear time window since symptom onset</li>
            <li>Rare diagnoses (PRES, encephalitis, metabolic disorders)</li>
          </ul>
        </div>
      </div>
    `;
  }
}

/**
 * Render drivers with split columns (like PWA)
 */
function renderDriversSplit(drivers) {
  if (!drivers || (!drivers.positive && !drivers.negative)) {
    return '<p class="no-drivers">No driver data available</p>';
  }

  const positive = drivers.positive || [];
  const negative = drivers.negative || [];

  return `
    <div class="drivers-split-view">
      <div class="drivers-column positive-column">
        <div class="column-header">
          <span class="column-icon">⬆</span>
          <span class="column-title">Increasing Risk</span>
        </div>
        <div class="compact-drivers">
          ${positive.length > 0
            ? positive.slice(0, 5).map((d) => renderCompactDriver(d, 'positive')).join('')
            : '<p class="no-factors">No factors</p>'
          }
        </div>
      </div>

      <div class="drivers-column negative-column">
        <div class="column-header">
          <span class="column-icon">⬇</span>
          <span class="column-title">Decreasing Risk</span>
        </div>
        <div class="compact-drivers">
          ${negative.length > 0
            ? negative.slice(0, 5).map((d) => renderCompactDriver(d, 'negative')).join('')
            : '<p class="no-factors">No factors</p>'
          }
        </div>
      </div>
    </div>
  `;
}

function renderCompactDriver(driver, type) {
  const percentage = Math.abs(driver.weight * 100);
  const width = Math.min(percentage * 2, 100);

  return `
    <div class="compact-driver-item">
      <div class="compact-driver-label">${formatDriverName(driver.label)}</div>
      <div class="compact-driver-bar ${type}" style="width: ${width}%;">
        <span class="compact-driver-value">${percentage.toFixed(1)}%</span>
      </div>
    </div>
  `;
}

function formatDriverName(label) {
  // Format driver names nicely
  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

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

function getRiskLevel(percent) {
  if (percent > 70) {
    return 'Very High Risk';
  }
  if (percent > 50) {
    return 'High Risk';
  }
  if (percent > 30) {
    return 'Moderate Risk';
  }
  return 'Low Risk';
}

function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid time';
  }
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

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
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
