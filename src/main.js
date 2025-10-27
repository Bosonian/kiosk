/**
 * Kiosk Main Application
 * Entry point for Notaufnahme kiosk display
 */
import { KIOSK_CONFIG } from './config.js';
import { caseListener } from './services/case-listener.js';
import { renderDashboard } from './ui/dashboard.js';
import { showCaseDetail } from './ui/case-detail.js';

// Application state
let currentCases = [];
let audioContext = null;

/**
 * Initialize kiosk application
 */
async function initializeKiosk() {
  console.log('[Kiosk] Initializing...', KIOSK_CONFIG);

  // Update hospital name
  document.getElementById('hospitalName').textContent = KIOSK_CONFIG.hospitalName;

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Initialize audio if enabled
  if (KIOSK_CONFIG.playAudioAlert) {
    initializeAudio();
  }

  // Start case listener
  caseListener.start(
    (data) => handleCaseUpdate(data),
    (error) => handleError(error),
  );

  // Add event listeners
  attachEventListeners();

  console.log('[Kiosk] Initialized successfully');
}

/**
 * Handle case updates
 */
function handleCaseUpdate(data) {
  const previousCount = currentCases.length;
  currentCases = data.cases || [];

  console.log('[Kiosk] Cases updated:', {
    count: currentCases.length,
    previous: previousCount,
  });

  // Update UI
  renderDashboard(currentCases);
  updateHeader(data);

  // Check for new cases
  const newCases = currentCases.filter((c) => c.isNew);
  if (newCases.length > 0 && previousCount > 0) {
    // Show alert for new cases
    playNewCaseAlert();
    flashScreen();

    // Mark as viewed after showing alert
    setTimeout(() => {
      newCases.forEach((c) => caseListener.markViewed(c.id));
    }, 2000);
  }

  // Update connection status
  updateConnectionStatus(true);
}

/**
 * Handle errors
 */
function handleError(error) {
  console.error('[Kiosk] Error:', error);
  updateConnectionStatus(false);

  // Show error in UI if no cases
  if (currentCases.length === 0) {
    const container = document.getElementById('casesContainer');
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${error.message || 'Unable to connect to case monitoring system'}</p>
          <p class="error-hint">Checking again in ${KIOSK_CONFIG.pollInterval / 1000} seconds...</p>
        </div>
      `;
    }
  }
}

/**
 * Update header information
 */
function updateHeader(data) {
  // Update case count
  const countBadge = document.getElementById('caseCount');
  if (countBadge) {
    const count = data.count || 0;
    countBadge.textContent = `${count} ${count === 1 ? 'Case' : 'Cases'}`;
    countBadge.className = `case-count-badge ${count > 0 ? 'has-cases' : ''}`;
  }
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
  const status = document.getElementById('connectionStatus');
  if (status) {
    status.className = `status-indicator ${connected ? 'connected' : 'disconnected'}`;
    status.title = connected ? 'Connected' : 'Disconnected';
  }
}

/**
 * Update clock
 */
function updateClock() {
  const clockElement = document.getElementById('currentTime');
  if (clockElement) {
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}

/**
 * Initialize audio context
 */
function initializeAudio() {
  // Create audio context on first user interaction
  document.addEventListener(
    'click',
    () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('[Kiosk] Audio initialized');
      }
    },
    { once: true },
  );
}

/**
 * Play new case alert
 */
function playNewCaseAlert() {
  if (!KIOSK_CONFIG.playAudioAlert || !audioContext) {
    return;
  }

  try {
    // Generate alert beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(KIOSK_CONFIG.audioAlertVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    console.log('[Kiosk] Alert sound played');
  } catch (error) {
    console.warn('[Kiosk] Audio playback failed:', error);
  }
}

/**
 * Flash screen for new case
 */
function flashScreen() {
  document.body.classList.add('flash-alert');

  setTimeout(() => {
    document.body.classList.remove('flash-alert');
  }, 1000);
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Click on case card to show details
  document.addEventListener('click', (e) => {
    const caseCard = e.target.closest('.case-card');
    if (caseCard) {
      const caseId = caseCard.dataset.caseId;
      if (caseId) {
        const caseData = caseListener.getCase(caseId);
        if (caseData) {
          showCaseDetail(caseData);
          caseListener.markViewed(caseId);
        }
      }
    }

    // Close modal
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-modal')) {
      closeModal();
    }
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Visibility change - resume polling if tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[Kiosk] Tab visible - fetching latest cases');
      caseListener.fetchCases();
    }
  });
}

/**
 * Close case detail modal
 */
function closeModal() {
  const modal = document.getElementById('caseDetailModal');
  if (modal) {
    modal.style.display = 'none';
    modal.querySelector('.modal-content').innerHTML = '';
  }
}

/**
 * Handle application errors
 */
window.addEventListener('error', (event) => {
  console.error('[Kiosk] Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Kiosk] Unhandled rejection:', event.reason);
});

/**
 * Start application when DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeKiosk);
} else {
  initializeKiosk();
}

/**
 * Export for debugging
 */
window.kioskApp = {
  getCases: () => currentCases,
  getStatus: () => caseListener.getStatus(),
  refresh: () => caseListener.fetchCases(),
  playAlert: () => playNewCaseAlert(),
};
