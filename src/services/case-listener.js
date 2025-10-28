/**
 * Case Listener Service
 * Polls Cloud Function for active cases
 */
import { KIOSK_CONFIG } from '../config.js';
import {
  createTimeoutSignal,
  sleep,
  validateCaseData,
  isGPSStale,
  CONSTANTS,
} from '../utils.js';

export class CaseListener {
  constructor() {
    this.baseUrl = KIOSK_CONFIG.caseSharingUrl;
    this.pollInterval = KIOSK_CONFIG.pollInterval;
    // Don't cache hospitalId - always read from KIOSK_CONFIG for real-time updates
    this.intervalId = null;
    this.cases = new Map();
    this.onUpdate = null;
    this.onError = null;
    this.lastFetchTime = null;
    this.isConnected = false;
    this.retryCount = 0;
  }

  /**
   * Start listening for cases
   * @param {Function} onUpdateCallback - Called when cases update
   * @param {Function} onErrorCallback - Called on errors
   */
  start(onUpdateCallback, onErrorCallback) {
    this.onUpdate = onUpdateCallback;
    this.onError = onErrorCallback;

    // Initial fetch
    this.fetchCases();

    // Start polling
    this.intervalId = setInterval(() => {
      this.fetchCases();
    }, this.pollInterval);

    console.log('[CaseListener] Started polling every', this.pollInterval, 'ms');
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[CaseListener] Stopped polling');
    }
  }

  /**
   * Fetch cases from API with retry logic
   */
  async fetchCases() {
    let lastError = null;

    for (let attempt = 0; attempt <= CONSTANTS.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const url = this.buildFetchUrl();

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: createTimeoutSignal(CONSTANTS.FETCH_TIMEOUT_MS),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch cases');
        }

        // Success! Reset retry count and update connection status
        this.retryCount = 0;
        this.isConnected = true;
        this.lastFetchTime = new Date();

        // Process cases
        this.processCases(data.cases || []);

        // Notify listeners
        if (this.onUpdate) {
          this.onUpdate({
            cases: Array.from(this.cases.values()),
            timestamp: data.timestamp,
            count: data.count,
          });
        }

        return; // Success, exit function
      } catch (error) {
        lastError = error;
        console.error(`[CaseListener] Fetch error (attempt ${attempt + 1}/${CONSTANTS.MAX_RETRY_ATTEMPTS + 1}):`, error);

        // If not the last attempt, wait before retrying
        if (attempt < CONSTANTS.MAX_RETRY_ATTEMPTS) {
          const delayMs = CONSTANTS.RETRY_DELAYS_MS[attempt] || 8000;
          console.log(`[CaseListener] Retrying in ${delayMs}ms...`);
          await sleep(delayMs);
        }
      }
    }

    // All retries failed
    console.error('[CaseListener] All retry attempts failed:', lastError);
    this.isConnected = false;
    this.retryCount++;

    if (this.onError) {
      this.onError(lastError);
    }
  }

  /**
   * Build fetch URL with filters
   */
  buildFetchUrl() {
    let url = `${this.baseUrl}/get-cases`;

    const params = new URLSearchParams();

    // Always read from config for latest hospital selection
    if (KIOSK_CONFIG.hospitalId) {
      params.append('hospitalId', KIOSK_CONFIG.hospitalId);
    }

    params.append('status', 'in_transit');

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Process fetched cases with validation and enrichment
   */
  processCases(newCases) {
    const oldCaseIds = new Set(this.cases.keys());
    const newCaseIds = new Set();

    // Process each case
    newCases.forEach((caseData) => {
      // Validate case data
      if (!validateCaseData(caseData)) {
        console.warn('[CaseListener] Invalid case data, skipping:', caseData);
        return;
      }

      const caseId = caseData.id;
      newCaseIds.add(caseId);

      const isNew = !this.cases.has(caseId);

      // Calculate GPS staleness
      const gpsStale = isGPSStale(
        caseData.tracking?.lastUpdated,
        KIOSK_CONFIG.staleGpsMinutes
      );

      // Enrich tracking data
      const enrichedTracking = {
        ...(caseData.tracking || {}),
        gpsStale,
      };

      // Store case with enriched data
      this.cases.set(caseId, {
        ...caseData,
        tracking: enrichedTracking,
        isNew, // Flag for new case alert
        receivedAt: isNew ? new Date() : this.cases.get(caseId).receivedAt,
      });

      // Log new cases
      if (isNew) {
        console.log('[CaseListener] New case:', caseId, this.getCaseSummary(caseData));
      }
    });

    // Remove cases that are no longer active
    oldCaseIds.forEach((caseId) => {
      if (!newCaseIds.has(caseId)) {
        console.log('[CaseListener] Case removed:', caseId);
        this.cases.delete(caseId);
      }
    });
  }

  /**
   * Get case summary for logging
   */
  getCaseSummary(caseData) {
    const ichPercent = Math.round((caseData.results?.ich?.probability || 0) * 100);
    const eta = caseData.tracking?.duration || '?';

    return {
      module: caseData.moduleType,
      ich: `${ichPercent}%`,
      eta: `${eta} min`,
      urgency: caseData.urgency,
    };
  }

  /**
   * Get all cases
   */
  getCases() {
    return Array.from(this.cases.values());
  }

  /**
   * Get case by ID
   */
  getCase(caseId) {
    return this.cases.get(caseId);
  }

  /**
   * Mark case as viewed (clear isNew flag)
   */
  markViewed(caseId) {
    const caseData = this.cases.get(caseId);
    if (caseData) {
      caseData.isNew = false;
      this.cases.set(caseId, caseData);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      lastFetchTime: this.lastFetchTime,
      caseCount: this.cases.size,
      isPolling: this.intervalId !== null,
    };
  }
}

// Export singleton
export const caseListener = new CaseListener();
