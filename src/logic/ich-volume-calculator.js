/**
 * Simplified ICH Volume Calculator for Kiosk
 * Contains only the display utilities needed for volume visualization
 */

/**
 * Estimate ICH volume from GFAP value (synchronous, simple version)
 * @param {number} gfap - GFAP value in pg/ml
 * @returns {number} Estimated volume in ml
 */
export function estimateICHVolume(gfap) {
  if (!gfap || gfap <= 0) {
    return 0;
  }

  // Cap GFAP at 10000 for calculation stability
  const cappedGfap = Math.min(gfap, 10000);

  // Log-log regression formula: log₁₀(Volume) = 0.0192 + 0.4533 × log₁₀(GFAP)
  const logGfap = Math.log10(cappedGfap);
  const logVolume = 0.0192 + 0.4533 * logGfap;
  const volume = 10 ** logVolume;

  return volume;
}

/**
 * Estimate mortality rate from volume (display only)
 * @param {number} volume - ICH volume in ml
 * @returns {string} Mortality rate percentage
 */
export function estimateMortalityFromVolume(volume) {
  if (!volume || volume <= 0) {
    return '5-10%';
  }
  if (volume >= 60) {
    return '91-100%';
  }
  if (volume >= 50) {
    return '44-91%';
  }
  if (volume >= 30) {
    return '19-44%';
  }
  if (volume >= 10) {
    return '10-19%';
  }
  return '5-10%';
}

/**
 * Format volume for display with appropriate precision
 * @param {number} volume - Volume in ml
 * @returns {string} Formatted volume string
 */
export function formatVolumeDisplay(volume) {
  if (!volume || volume <= 0) {
    return '0<span> ml</span>';
  }
  if (volume < 1) {
    return '<1<span> ml</span>';
  }
  if (volume < 10) {
    return `${volume.toFixed(1)}<span> ml</span>`;
  }
  return `${Math.round(volume)}<span> ml</span>`;
}

/**
 * Calculate hemorrhage size percentage for visualization (stub implementation)
 * @param {number} volume - Volume in ml
 * @returns {number} Percentage of brain area (0-70)
 */
export function calculateHemorrhageSizePercent(volume) {
  if (!volume || volume <= 0) {
    return 0;
  }
  if (volume >= 100) {
    return 70;
  }
  // Simple scaling: 30ml = 40%, 100ml = 70%
  const sqrtValue = Math.sqrt(volume / 30);
  const basePercent = sqrtValue * 40;
  return Math.min(basePercent, 70);
}

/**
 * Get color for volume visualization (stub implementation)
 * @param {number} volume - Volume in ml
 * @returns {string} CSS color value
 */
export function getVolumeColor(volume) {
  return '#dc2626'; // Red color for blood
}

/**
 * Calculate ICH volume (stub for compatibility)
 * @param {number} gfapValue - GFAP value in pg/ml
 * @returns {Promise<Object>} Volume calculation result
 */
export async function calculateICHVolume(gfapValue) {
  const volume = estimateICHVolume(gfapValue);
  return {
    volume,
    volumeRange: { min: volume * 0.7, max: volume * 1.3 },
    riskLevel: volume >= 30 ? 'critical' : volume >= 20 ? 'high' : 'moderate',
    mortalityRate: estimateMortalityFromVolume(volume),
    isValid: true,
  };
}
