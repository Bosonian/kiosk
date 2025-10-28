/**
 * Kiosk Configuration
 */

// Check if running in development
const isDevelopment = import.meta.env.DEV;

export const KIOSK_CONFIG = {
  // API Configuration
  caseSharingUrl: isDevelopment
    ? 'http://localhost:8080' // Local Cloud Function emulator
    : 'https://case-sharing-564499947017.europe-west3.run.app',

  // Polling interval (milliseconds)
  pollInterval: 5000, // 5 seconds

  // Auto-archive time (matches server)
  autoArchiveHours: 2,

  // GPS stale warning threshold
  staleGpsMinutes: 5,

  // Hospital ID (can be changed via UI selector)
  // Leave as null to show all cases, or set to specific hospital ID
  hospitalId: localStorage.getItem('kiosk_hospital_id') || 'BY-NS-001',

  // Hospital name for display (updated dynamically)
  hospitalName: localStorage.getItem('kiosk_hospital_name') || 'LMU Klinikum München - Notaufnahme',

  // Google Maps API Key (for live tracking map)
  googleMapsApiKey: 'AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI',

  // Alert settings
  playAudioAlert: true,
  audioAlertVolume: 0.5, // 0.0 to 1.0

  // Display settings
  showArchivedCases: false, // Hide archived cases
  maxCasesDisplay: 20, // Maximum cases to show

  // Theme
  theme: 'dark', // 'dark' or 'light'
};

// Available hospitals for selector
export const AVAILABLE_HOSPITALS = [
  { id: 'BY-NS-001', name: 'LMU Klinikum München - Großhadern' },
  { id: 'BY-NS-002', name: 'Klinikum Rechts der Isar' },
  { id: 'BY-NS-003', name: 'Helios Klinikum München West' },
  { id: 'BY-NS-004', name: 'Klinikum Bogenhausen' },
  { id: 'BW-NS-001', name: 'Universitätsklinikum Tübingen' },
  { id: 'BW-NS-002', name: 'Klinikum Stuttgart' },
  { id: 'BW-NS-003', name: 'Universitätsklinikum Freiburg' },
  { id: 'ALL', name: '🌐 All Hospitals (Show All Cases)' },
];

// Function to update hospital selection
export function setHospital(hospitalId) {
  const hospital = AVAILABLE_HOSPITALS.find(h => h.id === hospitalId);
  if (hospital) {
    // Store the actual value or empty string for "ALL"
    if (hospitalId === 'ALL') {
      localStorage.setItem('kiosk_hospital_id', '');
      localStorage.setItem('kiosk_hospital_name', hospital.name);
    } else {
      localStorage.setItem('kiosk_hospital_id', hospitalId);
      localStorage.setItem('kiosk_hospital_name', hospital.name);
    }
    KIOSK_CONFIG.hospitalId = hospitalId === 'ALL' ? null : hospitalId;
    KIOSK_CONFIG.hospitalName = hospital.name;
    // Reload to apply changes
    window.location.reload();
  }
}

export const URGENCY_CONFIG = {
  IMMEDIATE: {
    color: '#ff4444',
    icon: '🚨',
    priority: 0,
  },
  TIME_CRITICAL: {
    color: '#ff8800',
    icon: '⏰',
    priority: 1,
  },
  URGENT: {
    color: '#ffcc00',
    icon: '⚠️',
    priority: 2,
  },
  STANDARD: {
    color: '#4a90e2',
    icon: '🏥',
    priority: 3,
  },
};
