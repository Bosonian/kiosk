/**
 * Brain Visualization Component for ICH Volume Display
 * Creates an SVG-based brain hemorrhage visualization
 */

import {
  calculateHemorrhageSizePercent, getVolumeColor, calculateICHVolume, formatVolumeDisplay,
} from '../../logic/ich-volume-calculator.js';

/**
 * Render brain visualization with hemorrhage overlay
 * @param {number} volume - ICH volume in ml
 * @param {string} size - 'compact' or 'detailed'
 * @returns {string} HTML string with SVG brain visualization
 */
export function renderBrainVisualization(volume, size = 'compact') {
  const dimensions = size === 'compact' ? { width: 120, height: 120 } : { width: 200, height: 200 };
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Calculate hemorrhage appearance
  const hemorrhagePercent = calculateHemorrhageSizePercent(volume);
  const hemorrhageColor = getVolumeColor(volume);

  // Scale hemorrhage radius based on volume (basal ganglia region, slightly off-center)
  const maxRadius = dimensions.width * 0.25; // Maximum 25% of brain width
  const hemorrhageRadius = (hemorrhagePercent / 70) * maxRadius; // 70% is max brain area

  // Position hemorrhage in basal ganglia region (slightly right of center)
  const hemorrhageX = centerX + (dimensions.width * 0.1); // 10% right of center
  const hemorrhageY = centerY + (dimensions.height * 0.05); // 5% below center

  // 30ml reference circle (for detailed view)
  const referenceRadius = (40 / 70) * maxRadius; // 40% brain area = 30ml threshold

  // Animation for hemorrhage (subtle pulsing)
  const animationId = `hemorrhage-pulse-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <div class="brain-visualization ${size}">
      <svg 
        width="${dimensions.width}" 
        height="${dimensions.height}" 
        viewBox="0 0 ${dimensions.width} ${dimensions.height}"
        class="brain-svg"
        role="img"
        aria-label="Brain hemorrhage visualization showing ${volume.toFixed(1)}ml ICH volume"
      >
        <!-- Brain outline with hemorrhage overlay -->
        ${renderBrainOutlineWithHemorrhage(dimensions, volume)}
        
        <!-- 30ml reference indicator (detailed view only) -->
        ${size === 'detailed' && volume > 0 ? `
          <circle 
            cx="${hemorrhageX}" 
            cy="${hemorrhageY}" 
            r="${referenceRadius}"
            fill="none" 
            stroke="#9ca3af" 
            stroke-width="1" 
            stroke-dasharray="3,3"
            opacity="0.5"
          />
          <text 
            x="${hemorrhageX + referenceRadius + 5}" 
            y="${hemorrhageY - referenceRadius}" 
            font-size="10" 
            fill="#6b7280"
            font-family="system-ui"
          >30ml</text>
        ` : ''}
        
        <!-- Hemorrhage visualization -->
        ${volume > 0 ? `
          <circle 
            cx="${hemorrhageX}" 
            cy="${hemorrhageY}" 
            r="${hemorrhageRadius}"
            fill="${hemorrhageColor}"
            opacity="0.8"
            class="hemorrhage-circle"
          >
            <!-- Subtle pulsing animation -->
            <animate 
              attributeName="opacity" 
              values="0.6;0.9;0.6" 
              dur="2.5s" 
              repeatCount="indefinite"
            />
            ${hemorrhageRadius > 15 ? `
            <animate 
              attributeName="r" 
              values="${hemorrhageRadius * 0.95};${hemorrhageRadius};${hemorrhageRadius * 0.95}" 
              dur="2.5s" 
              repeatCount="indefinite"
            />
            ` : ''}
          </circle>
          
          <!-- Volume label (detailed view only) -->
          ${size === 'detailed' ? `
            <text 
              x="${centerX}" 
              y="${dimensions.height - 10}" 
              text-anchor="middle" 
              font-size="12" 
              font-weight="bold"
              fill="#374151"
              font-family="system-ui"
            >${volume < 1 ? '<1' : volume.toFixed(1)} ml</text>
          ` : ''}
        ` : ''}
        
        <style>
          .hemorrhage-circle {
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }
        </style>
      </svg>
    </div>
  `;
}

/**
 * Load and render the provided brain SVG with hemorrhage overlay
 * @param {object} dimensions - Width and height for the brain
 * @returns {string} Brain SVG with embedded hemorrhage visualization
 */
function renderBrainOutlineWithHemorrhage(dimensions, volume) {
  // For performance, we'll use the SVG as a background image and overlay the hemorrhage
  // This avoids loading the 530KB SVG content directly into the DOM

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Calculate hemorrhage position (basal ganglia region - slightly right and posterior)
  const hemorrhageX = centerX + (dimensions.width * 0.08); // 8% right of center
  const hemorrhageY = centerY + (dimensions.height * 0.03); // 3% below center

  const hemorrhagePercent = calculateHemorrhageSizePercent(volume);
  const hemorrhageColor = getVolumeColor(volume);
  const maxRadius = dimensions.width * 0.25;
  const hemorrhageRadius = (hemorrhagePercent / 70) * maxRadius;

  return `
    <!-- 3D Brain image as background -->
    <image 
      x="0" 
      y="0" 
      width="${dimensions.width}" 
      height="${dimensions.height}"
      href="./src/assets/brain-3d.png"
      opacity="0.95"
      preserveAspectRatio="xMidYMid meet"
    />
    
    <!-- Hemorrhage overlay in basal ganglia region -->
    ${volume > 0 ? `
      <circle 
        cx="${hemorrhageX}" 
        cy="${hemorrhageY}" 
        r="${hemorrhageRadius}"
        fill="${hemorrhageColor}"
        opacity="0.85"
        class="hemorrhage-circle"
      >
        <!-- Subtle pulsing animation -->
        <animate 
          attributeName="opacity" 
          values="0.7;0.95;0.7" 
          dur="2.5s" 
          repeatCount="indefinite"
        />
        ${hemorrhageRadius > 8 ? `
        <animate 
          attributeName="r" 
          values="${hemorrhageRadius * 0.96};${hemorrhageRadius * 1.02};${hemorrhageRadius * 0.96}" 
          dur="2.5s" 
          repeatCount="indefinite"
        />
        ` : ''}
      </circle>
      
      <!-- Hemorrhage center highlight -->
      <circle 
        cx="${hemorrhageX}" 
        cy="${hemorrhageY}" 
        r="${hemorrhageRadius * 0.3}"
        fill="${hemorrhageColor}"
        opacity="0.95"
        class="hemorrhage-center"
      />
    ` : ''}
  `;
}

/**
 * Temporary brain outline (for fallback when SVG file not available)
 */
function renderTemporaryBrainOutline(dimensions) {
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  return `
    <!-- Simplified brain outline -->
    <ellipse 
      cx="${centerX}" 
      cy="${centerY}" 
      rx="${dimensions.width * 0.4}" 
      ry="${dimensions.height * 0.35}" 
      fill="#f1f5f9" 
      stroke="#64748b" 
      stroke-width="2"
      opacity="0.8"
    />
    
    <!-- Brain hemisphere division -->
    <line 
      x1="${centerX}" 
      y1="${centerY - dimensions.height * 0.25}" 
      x2="${centerX}" 
      y2="${centerY + dimensions.height * 0.25}" 
      stroke="#9ca3af" 
      stroke-width="1" 
      opacity="0.5"
    />
  `;
}

/**
 * Create compact brain icon for inline display
 * @param {number} volume - ICH volume in ml
 * @param {number} size - Icon size in pixels
 * @returns {string} Small brain icon with hemorrhage indicator
 */
export function renderCompactBrainIcon(volume, size = 24) {
  const hemorrhageColor = getVolumeColor(volume);
  const hemorrhageSize = volume > 0 ? Math.max(2, (volume / 50) * size * 0.3) : 0;

  return `
    <svg 
      width="${size}" 
      height="${size}" 
      viewBox="0 0 ${size} ${size}"
      class="brain-icon"
      style="display: inline-block; vertical-align: middle;"
    >
      <!-- Simple brain outline -->
      <ellipse 
        cx="${size / 2}" 
        cy="${size / 2}" 
        rx="${size * 0.4}" 
        ry="${size * 0.35}" 
        fill="#f1f5f9" 
        stroke="#64748b" 
        stroke-width="1"
      />
      
      <!-- Hemorrhage indicator -->
      ${volume > 0 ? `
        <circle 
          cx="${size / 2 + size * 0.1}" 
          cy="${size / 2}" 
          r="${hemorrhageSize}"
          fill="${hemorrhageColor}"
          opacity="0.9"
        />
      ` : ''}
    </svg>
  `;
}

/**
 * Render circular brain display matching ICH risk circle style
 * @param {number} volume - ICH volume in ml
 * @returns {string} HTML for circular brain display
 */
export function renderCircularBrainDisplay(volume) {
  if (!volume || volume <= 0) {
    return `
      <div class="volume-circle" data-volume="0">
        <div class="volume-number">0<span> ml</span></div>
        <canvas class="volume-canvas" width="120" height="120"></canvas>
      </div>
    `;
  }

  const formattedVolume = formatVolumeDisplay(volume);
  const canvasId = `volume-canvas-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <div class="volume-circle" data-volume="${volume}">
      <div class="volume-number">${formattedVolume}</div>
      <canvas id="${canvasId}" class="volume-canvas" 
              data-volume="${volume}" data-canvas-id="${canvasId}"></canvas>
    </div>
  `;
}

/**
 * Initialize fluid fill animation for volume canvas
 * Call this after DOM is updated with new volume circles
 */
export function initializeVolumeAnimations() {
  const canvases = document.querySelectorAll('.volume-canvas');

  canvases.forEach((canvas) => {
    // Set canvas internal size to match CSS size
    const cssWidth = canvas.offsetWidth || 120;
    const cssHeight = canvas.offsetHeight || 120;
    canvas.width = cssWidth;
    canvas.height = cssHeight;

    const volume = parseFloat(canvas.dataset.volume) || 0;
    if (volume > 0) {
      drawVolumeFluid(canvas, volume);
    }
  });
}

/**
 * Draw fluid fill animation on canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {number} volume - ICH volume in ml
 */
function drawVolumeFluid(canvas, volume) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width * 0.45; // 45% of canvas width for the circle
  let animationFrame = 0;
  let isAnimating = true;
  let rafId = null; // Store requestAnimationFrame ID for cleanup

  // Check dark mode once
  const isDarkMode = document.body.classList.contains('dark-mode')
                    || window.matchMedia('(prefers-color-scheme: dark)').matches;

  function draw() {
    if (!isAnimating) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      return;
    }

    // Clear canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Don't draw background - let CSS handle it
    // Just draw the fluid and border
    drawFluidLayer();
  }

  function drawFluidLayer() {
    // Calculate fill level based on volume
    const maxVolume = 80; // ml (practical maximum for visualization)
    const fillPercentage = Math.min(volume / maxVolume, 0.9);
    const fillHeight = fillPercentage * (radius * 1.8);
    const baseLevel = centerY + radius - 4 - fillHeight;

    // Draw fluid fill with waves
    if (volume > 0) {
      ctx.save();

      // Clip to circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 4, 0, Math.PI * 2);
      ctx.clip();

      // Draw base fluid rectangle
      ctx.fillStyle = '#dc2626';
      ctx.globalAlpha = 0.7;
      ctx.fillRect(0, baseLevel + 5, canvas.width, canvas.height);

      // Draw animated wave surface
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();

      // Create wave path
      const startX = centerX - radius + 4;
      ctx.moveTo(startX, baseLevel);

      for (let x = startX; x <= centerX + radius - 4; x += 2) {
        const waveOffset1 = Math.sin((x * 0.05) + animationFrame * 0.08) * 3;
        const waveOffset2 = Math.sin((x * 0.08) + animationFrame * 0.12 + 1) * 2;
        const y = baseLevel + waveOffset1 + waveOffset2;
        ctx.lineTo(x, y);
      }

      // Complete wave fill
      ctx.lineTo(centerX + radius - 4, canvas.height);
      ctx.lineTo(startX, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Draw background border circle (like ICH risk ring)
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                       || (isDarkMode ? '#8899a6' : '#6c757d');
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw volume progress ring (like ICH risk circle)
    const volumePercent = Math.min(volume / 100, 1); // Max 100ml = 100%
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - volumePercent);

    // Progress ring (dark mode aware)
    const progressColor = getComputedStyle(document.documentElement).getPropertyValue('--danger-color').trim()
                         || '#dc2626';
    ctx.strokeStyle = progressColor;
    ctx.lineWidth = 8;
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (volumePercent * 2 * Math.PI));
    ctx.stroke();

    // Continue animation
    animationFrame += 1;
    if (volume > 0) {
      rafId = requestAnimationFrame(draw);
    }
  }

  // Start animation
  draw();

  // Stop animation when canvas is removed from DOM
  const observer = new MutationObserver(() => {
    if (!document.contains(canvas)) {
      isAnimating = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Get brain visualization CSS classes
 * @param {string} size - 'compact' or 'detailed'
 * @returns {string} CSS classes
 */
export function getBrainVisualizationClasses(size) {
  const baseClasses = 'brain-visualization';
  const sizeClasses = size === 'compact' ? 'compact-brain' : 'detailed-brain';
  return `${baseClasses} ${sizeClasses}`;
}
