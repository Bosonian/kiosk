/**
 * Case Listener Service
 * Polls Cloud Function for active cases
 */
import { KIOSK_CONFIG } from '../config.js';

export class CaseListener {
  constructor() {
    this.baseUrl = KIOSK_CONFIG.caseSharingUrl;
    this.pollInterval = KIOSK_CONFIG.pollInterval;
    this.hospitalId = KIOSK_CONFIG.hospitalId;
    this.intervalId = null;
    this.cases = new Map();
    this.onUpdate = null;
    this.onError = null;
    this.lastFetchTime = null;
    this.isConnected = false;
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
   * Fetch cases from API
   */
  async fetchCases() {
    try {
      const url = this.buildFetchUrl();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch cases');
      }

      // Update connection status
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
    } catch (error) {
      console.error('[CaseListener] Fetch error:', error);
      this.isConnected = false;

      if (this.onError) {
        this.onError(error);
      }
    }
  }

  /**
   * Build fetch URL with filters
   */
  buildFetchUrl() {
    let url = `${this.baseUrl}/get-cases`;

    const params = new URLSearchParams();

    if (this.hospitalId) {
      params.append('hospitalId', this.hospitalId);
    }

    params.append('status', 'in_transit');

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Process fetched cases
   */
  processCases(newCases) {
    const oldCaseIds = new Set(this.cases.keys());
    const newCaseIds = new Set();

    // Process each case
    newCases.forEach((caseData) => {
      const caseId = caseData.id;
      newCaseIds.add(caseId);

      const isNew = !this.cases.has(caseId);

      // Store case
      this.cases.set(caseId, {
        ...caseData,
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
   * Dismiss/archive a case
   * @param {string} caseId - Case ID to dismiss
   * @returns {Promise} - Resolution of API call
   */
  async dismissCase(caseId) {
    try {
      const url = `${this.baseUrl}/archive-case`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          reason: 'dismissed_by_kiosk',
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to dismiss case');
      }

      // Remove from local cache
      this.cases.delete(caseId);
      console.log('[CaseListener] Case dismissed:', caseId);

      // Trigger update to refresh UI
      if (this.onUpdate) {
        this.onUpdate({
          cases: Array.from(this.cases.values()),
          timestamp: new Date().toISOString(),
          count: this.cases.size,
        });
      }

      return data;
    } catch (error) {
      console.error('[CaseListener] Dismiss error:', error);
      throw error;
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
