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
 * Get time ago string with negative time protection
 * @param {string} timestamp - ISO date string
 * @returns {string} Time ago description
 */
export function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);

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
 * @param {string} createdAt - ISO date string when case was created
 * @param {number} thresholdMinutes - Staleness threshold in minutes
 * @returns {boolean} True if case is stale
 */
export function isCaseStale(createdAt, thresholdMinutes = CONSTANTS.CASE_STALE_THRESHOLD_MINUTES) {
  if (!createdAt) {
    return false;
  }

  try {
    const created = new Date(createdAt);
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
