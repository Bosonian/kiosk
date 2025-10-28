/**
 * Shared Utility Functions
 */

// Constants for magic numbers
export const CONSTANTS = {
  NEW_CASE_VIEWED_DELAY_MS: 2000,
  ALERT_BEEP_DURATION_SEC: 0.5,
  ALERT_BEEP_FREQUENCY_HZ: 880, // A5 note
  ALERT_BEEP_VOLUME: 0.5,
  FETCH_TIMEOUT_MS: 8000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAYS_MS: [2000, 4000, 8000], // Exponential backoff
  CASE_STALE_THRESHOLD_MINUTES: 30,
};

/**
 * Get risk color based on percentage
 * @param {number} percent - Risk percentage (0-100)
 * @returns {string} Hex color code
 */
export function getRiskColor(percent) {
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
 * Get risk level label based on percentage
 * @param {number} percent - Risk percentage (0-100)
 * @returns {string} Risk level description
 */
export function getRiskLevel(percent) {
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

/**
 * Format timestamp as time string
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted time (HH:MM)
 */
export function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.warn('[Utils] Invalid time:', isoString, error);
    return 'Invalid time';
  }
}

/**
 * Get the most relevant timestamp for display
 * Priority: updatedAt > receivedAt > tracking.lastUpdated > createdAt
 * @param {object} caseData - Case data object
 * @returns {string|Date} Timestamp (ISO string or Date object)
 */
export function getRelevantTimestamp(caseData) {
  // Priority 1: updatedAt (when case was last modified/submitted)
  if (caseData.updatedAt) {
    return caseData.updatedAt;
  }

  // Priority 2: receivedAt (when kiosk first saw this case - most reliable)
  // This is our local timestamp and most accurate for "when did we see this"
  if (caseData.receivedAt) {
    return caseData.receivedAt;
  }

  // Priority 3: tracking.lastUpdated (recent GPS update)
  if (caseData.tracking?.lastUpdated) {
    return caseData.tracking.lastUpdated;
  }

  // Priority 4: createdAt (fallback - may be hours old if form was started earlier)
  return caseData.createdAt || new Date();
}

/**
 * Get time ago string with negative time protection
 * @param {string|Date} timestamp - ISO date string or Date object
 * @returns {string} Time ago description
 */
export function getTimeAgo(timestamp) {
  const now = new Date();

  // Handle both Date objects and ISO strings
  const then = timestamp instanceof Date ? timestamp : new Date(timestamp);

  // Protect against invalid dates or future dates
  if (isNaN(then.getTime())) {
    return 'Unknown';
  }

  const seconds = Math.max(0, Math.floor((now - then) / 1000));

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

/**
 * Format label from snake_case to Title Case
 * @param {string} key - Key to format
 * @returns {string} Formatted label
 */
export function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Format ETA with special cases
 * @param {number|string} duration - Duration in minutes
 * @returns {string} Formatted ETA
 */
export function formatETA(duration) {
  if (duration === null || duration === undefined || duration === '?') {
    return '?';
  }

  const eta = typeof duration === 'string' ? parseFloat(duration) : duration;

  if (isNaN(eta)) {
    return '?';
  }

  if (eta <= 0) {
    return 'Arrived';
  }

  if (eta < 1) {
    return '< 1';
  }

  return Math.round(eta).toString();
}

/**
 * Check if GPS data is stale
 * @param {string} lastUpdated - ISO date string of last GPS update
 * @param {number} thresholdMinutes - Staleness threshold in minutes
 * @returns {boolean} True if GPS is stale
 */
export function isGPSStale(lastUpdated, thresholdMinutes = 5) {
  if (!lastUpdated) {
    return true;
  }

  try {
    const lastUpdate = new Date(lastUpdated);
    if (isNaN(lastUpdate.getTime())) {
      return true;
    }

    const now = new Date();
    const minutesAgo = (now - lastUpdate) / (1000 * 60);
    return minutesAgo > thresholdMinutes;
  } catch {
    return true;
  }
}

/**
 * Check if case is stale (old)
 * @param {string|Date} timestamp - ISO date string or Date object
 * @param {number} thresholdMinutes - Staleness threshold in minutes
 * @returns {boolean} True if case is stale
 */
export function isCaseStale(timestamp, thresholdMinutes = CONSTANTS.CASE_STALE_THRESHOLD_MINUTES) {
  if (!timestamp) {
    return false;
  }

  try {
    // Handle both Date objects and ISO strings
    const created = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(created.getTime())) {
      return false;
    }

    const now = new Date();
    const minutesAgo = (now - created) / (1000 * 60);
    return minutesAgo > thresholdMinutes;
  } catch {
    return false;
  }
}

/**
 * Validate case data structure
 * @param {object} caseData - Case object to validate
 * @returns {boolean} True if valid
 */
export function validateCaseData(caseData) {
  if (!caseData || typeof caseData !== 'object') {
    return false;
  }

  // Required fields
  if (!caseData.id || typeof caseData.id !== 'string') {
    return false;
  }

  return true;
}

/**
 * Safe get nested property
 * @param {object} obj - Object to query
 * @param {string} path - Dot-separated path (e.g., 'results.ich.probability')
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Value or default
 */
export function safeGet(obj, path, defaultValue = null) {
  try {
    return path.split('.').reduce((current, prop) => current?.[prop], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Create AbortSignal with timeout (polyfill for older browsers)
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortSignal} Abort signal that fires after timeout
 */
export function createTimeoutSignal(timeoutMs) {
  // Use native AbortSignal.timeout if available (modern browsers)
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    return AbortSignal.timeout(timeoutMs);
  }

  // Polyfill for older browsers
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Timeout after ${timeoutMs}ms`));
  }, timeoutMs);

  // Clean up timeout if signal is aborted for other reasons
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  }, { once: true });

  return controller.signal;
}

/**
 * Sleep utility for retry logic
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Medical field label mapping for consistent terminology
 * Maps technical field names to user-friendly medical labels
 */
const FIELD_LABEL_MAP = {
  // Age and demographics
  age_years: 'Alter / Age',
  age: 'Alter / Age',

  // Blood pressure
  systolic_bp: 'Systolischer Blutdruck / Systolic BP',
  diastolic_bp: 'Diastolischer Blutdruck / Diastolic BP',
  systolic_blood_pressure: 'Systolischer Blutdruck / Systolic BP',
  diastolic_blood_pressure: 'Diastolischer Blutdruck / Diastolic BP',
  blood_pressure_systolic: 'Systolischer Blutdruck / Systolic BP',
  blood_pressure_diastolic: 'Diastolischer Blutdruck / Diastolic BP',

  // Biomarkers
  gfap_value: 'GFAP-Wert / GFAP Level',
  gfap: 'GFAP-Wert / GFAP Level',
  gfap_level: 'GFAP-Wert / GFAP Level',

  // Clinical scores
  fast_ed_score: 'FAST-ED Score',
  fast_ed: 'FAST-ED Score',
  fast_ed_total: 'FAST-ED Score',
  nihss: 'NIHSS Score',
  nihss_score: 'NIHSS Score',

  // Neurological symptoms
  vigilanzminderung: 'Vigilanzminderung / Reduced Consciousness',
  vigilance_reduction: 'Vigilanzminderung / Reduced Consciousness',
  reduced_consciousness: 'Vigilanzminderung / Reduced Consciousness',
  armparese: 'Armparese / Arm Weakness',
  arm_paresis: 'Armparese / Arm Weakness',
  arm_weakness: 'Armparese / Arm Weakness',
  beinparese: 'Beinparese / Leg Weakness',
  leg_paresis: 'Beinparese / Leg Weakness',
  leg_weakness: 'Beinparese / Leg Weakness',
  eye_deviation: 'Blickdeviation / Eye Deviation',
  blickdeviation: 'Blickdeviation / Eye Deviation',
  headache: 'Kopfschmerzen / Headache',
  kopfschmerzen: 'Kopfschmerzen / Headache',
  nausea: 'Übelkeit / Nausea',
  vomiting: 'Erbrechen / Vomiting',
  aphasia: 'Aphasie / Aphasia',
  dysarthria: 'Dysarthrie / Dysarthria',
  ataxia: 'Ataxie / Ataxia',
  facial_paresis: 'Gesichtsparese / Facial Weakness',

  // Medical history
  atrial_fibrillation: 'Vorhofflimmern / Atrial Fibrillation',
  vorhofflimmern: 'Vorhofflimmern / Atrial Fibrillation',
  anticoagulated_noak: 'Antikoagulation (NOAK) / Anticoagulation (NOAC)',
  anticoagulation: 'Antikoagulation / Anticoagulation',
  antiplatelets: 'Thrombozytenaggregationshemmer / Antiplatelets',
  thrombozytenaggregationshemmer: 'Thrombozytenaggregationshemmer / Antiplatelets',
  diabetes: 'Diabetes Mellitus',
  hypertension: 'Arterielle Hypertonie / Hypertension',
  prior_stroke: 'Schlaganfall (Anamnese) / Prior Stroke',
  prior_tia: 'TIA (Anamnese) / Prior TIA',

  // Timing
  symptom_onset: 'Symptombeginn / Symptom Onset',
  onset_time: 'Symptombeginn / Symptom Onset',
  time_since_onset: 'Zeit seit Symptombeginn / Time Since Onset',
};

/**
 * Pattern-based replacements for common medical terms
 */
const PATTERN_REPLACEMENTS = [
  { pattern: /_score$/i, replacement: ' Score' },
  { pattern: /_value$/i, replacement: ' Wert' },
  { pattern: /_bp$/i, replacement: ' Blutdruck' },
  { pattern: /_years?$/i, replacement: '' },
  { pattern: /^ich_/i, replacement: 'ICH ' },
  { pattern: /^lvo_/i, replacement: 'LVO ' },
  { pattern: /parese$/i, replacement: 'parese / Weakness' },
  { pattern: /deviation$/i, replacement: 'deviation / Deviation' },
];

/**
 * Format driver/field names with consistent medical terminology
 * @param {string} fieldName - Technical field name
 * @returns {string} User-friendly medical label
 */
export function formatDriverName(fieldName) {
  if (!fieldName) return '';

  // First try exact match
  const mapped = FIELD_LABEL_MAP[fieldName.toLowerCase()];
  if (mapped) return mapped;

  // Apply pattern-based replacements
  let formatted = fieldName;
  PATTERN_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });

  // Clean up and format
  formatted = formatted
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()) // Title case
    .trim();

  return formatted;
}

/**
 * Format field labels for summary display
 * @param {string} fieldName - Technical field name
 * @returns {string} User-friendly summary label
 */
export function formatSummaryLabel(fieldName) {
  const friendlyLabel = formatDriverName(fieldName);
  // Remove units from labels as they're shown in values
  return friendlyLabel.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

/**
 * Format field values for display with appropriate units
 * @param {any} value - Field value
 * @param {string} fieldName - Field name for context
 * @returns {string} Formatted display value
 */
export function formatDisplayValue(value, fieldName = '') {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? '✓ Ja / Yes' : '✗ Nein / No';
  }

  if (typeof value === 'number') {
    const lower = fieldName.toLowerCase();
    // Add units based on field type
    if (lower.includes('bp') || lower.includes('blood_pressure')) {
      return `${value} mmHg`;
    }
    if (lower.includes('gfap')) {
      return `${value} pg/mL`;
    }
    if (lower.includes('age')) {
      return `${value} Jahre / years`;
    }
    if (lower.includes('score')) {
      return value.toString();
    }
    if (lower.includes('time') || lower.includes('duration')) {
      return `${value} min`;
    }

    // Default number formatting
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }

  return value.toString();
}
