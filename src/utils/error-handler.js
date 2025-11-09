/**
 * Comprehensive Error Handling Utilities
 * iGFAP Stroke Triage Assistant - Enterprise Error Management
 *
 * Provides robust error handling for production medical applications
 *
 * @author iGFAP Project Team
 * @contact Deepak Bos <bosdeepak@gmail.com>
 */

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
};

/**
 * Error categories for medical applications
 */
export const ERROR_CATEGORIES = {
  NETWORK: "network",
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  CALCULATION: "calculation",
  STORAGE: "storage",
  RENDERING: "rendering",
  MEDICAL: "medical",
  SECURITY: "security"
};

/**
 * Medical error codes
 */
export const MEDICAL_ERROR_CODES = {
  INVALID_VITAL_SIGNS: "MED001",
  CALCULATION_FAILED: "MED002",
  DATA_INCOMPLETE: "MED003",
  PREDICTION_UNAVAILABLE: "MED004",
  SAFETY_THRESHOLD_EXCEEDED: "MED005"
};

/**
 * Enhanced error class for medical applications
 */
export class MedicalError extends Error {
  constructor(
    message,
    code,
    category = ERROR_CATEGORIES.MEDICAL,
    severity = ERROR_SEVERITY.MEDIUM
  ) {
    super(message);
    this.name = "MedicalError";
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    this.context = {};
  }

  /**
   * Add context to error
   * @param {Object} context - Error context
   * @returns {MedicalError} - This error instance
   */
  withContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Get user-friendly error message
   * @returns {string} - User-friendly message
   */
  getUserMessage() {
    switch (this.category) {
      case ERROR_CATEGORIES.NETWORK:
        return "Network connection issue. Please check your internet connection and try again.";
      case ERROR_CATEGORIES.VALIDATION:
        return "Please check your input data and try again.";
      case ERROR_CATEGORIES.AUTHENTICATION:
        return "Authentication failed. Please log in again.";
      case ERROR_CATEGORIES.CALCULATION:
        return "Unable to complete calculation. Please verify your input data.";
      case ERROR_CATEGORIES.MEDICAL:
        return "Medical calculation could not be completed. Please verify all clinical data.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
}

/**
 * Global error handler for unhandled errors
 */
class GlobalErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(
        event.reason,
        ERROR_CATEGORIES.NETWORK,
        ERROR_SEVERITY.HIGH
      );
      event.preventDefault();
    });

    // Handle uncaught errors
    window.addEventListener("error", (event) => {
      this.handleError(
        event.error,
        ERROR_CATEGORIES.RENDERING,
        ERROR_SEVERITY.MEDIUM
      );
    });
  }

  handleError(
    error,
    category = ERROR_CATEGORIES.NETWORK,
    severity = ERROR_SEVERITY.MEDIUM
  ) {
    const errorEntry = {
      error: error instanceof Error ? error : new Error(String(error)),
      category,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
      url: window.location.href
    };

    // Add to queue
    this.errorQueue.push(errorEntry);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Handle critical errors immediately
    if (severity === ERROR_SEVERITY.CRITICAL) {
      this.handleCriticalError(errorEntry);
    }
  }

  handleCriticalError(errorEntry) {
    // For critical medical errors, show immediate user notification
    if (errorEntry.category === ERROR_CATEGORIES.MEDICAL) {
      this.showMedicalAlert(errorEntry.error.message);
    }
  }

  showMedicalAlert(message) {
    // Create a critical medical alert
    const alert = document.createElement("div");
    alert.className = "critical-medical-alert";
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4444;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 90%;
      text-align: center;
    `;
    alert.textContent = `⚠️ Medical Error: ${message}`;

    document.body.appendChild(alert);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(alert)) {
        document.body.removeChild(alert);
      }
    }, 10000);
  }

  getErrorSummary() {
    return {
      totalErrors: this.errorQueue.length,
      criticalErrors: this.errorQueue.filter(
        (e) => e.severity === ERROR_SEVERITY.CRITICAL
      ).length,
      recentErrors: this.errorQueue.slice(-10)
    };
  }
}

// Initialize global error handler
const globalErrorHandler = new GlobalErrorHandler();

/**
 * Wrapper for async operations with comprehensive error handling
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Error handling options
 * @returns {Promise} - Promise with error handling
 */
export async function safeAsync(asyncFn, options = {}) {
  const {
    category = ERROR_CATEGORIES.NETWORK,
    severity = ERROR_SEVERITY.MEDIUM,
    fallback = null,
    timeout = 30000,
    retries = 0,
    context = {}
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Operation timeout")), timeout);
      });

      const result = await Promise.race([asyncFn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;

      // Log error
      globalErrorHandler.handleError(error, category, severity);

      // If we have retries left, wait and retry
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
        continue;
      }

      // Final attempt failed
      if (fallback !== null) {
        return typeof fallback === "function" ? fallback(error) : fallback;
      }

      // Throw enhanced error
      const enhancedError = new MedicalError(
        error.message || "Operation failed",
        error.code || "UNKNOWN",
        category,
        severity
      ).withContext(context);

      throw enhancedError;
    }
  }
}

/**
 * Safe wrapper for medical calculations
 * @param {Function} calculationFn - Medical calculation function
 * @param {Object} inputs - Input data
 * @param {Object} options - Calculation options
 * @returns {Promise} - Calculation result with error handling
 */
export async function safeMedicalCalculation(
  calculationFn,
  inputs,
  options = {}
) {
  return safeAsync(() => calculationFn(inputs), {
    category: ERROR_CATEGORIES.MEDICAL,
    severity: ERROR_SEVERITY.HIGH,
    fallback: () => ({
      error: true,
      message: "Medical calculation unavailable",
      fallbackUsed: true
    }),
    context: {
      operation: "medical_calculation",
      inputKeys: Object.keys(inputs || {}),
      ...options.context
    },
    ...options
  });
}

/**
 * Safe wrapper for network requests
 * @param {Function} requestFn - Network request function
 * @param {Object} options - Request options
 * @returns {Promise} - Request result with error handling
 */
export async function safeNetworkRequest(requestFn, options = {}) {
  return safeAsync(requestFn, {
    category: ERROR_CATEGORIES.NETWORK,
    severity: ERROR_SEVERITY.MEDIUM,
    retries: 2,
    timeout: 10000,
    fallback: () => ({
      error: true,
      message: "Network request failed",
      offline: true
    }),
    ...options
  });
}

/**
 * Safe wrapper for authentication operations
 * @param {Function} authFn - Authentication function
 * @param {Object} options - Auth options
 * @returns {Promise} - Auth result with error handling
 */
export async function safeAuthOperation(authFn, options = {}) {
  return safeAsync(authFn, {
    category: ERROR_CATEGORIES.AUTHENTICATION,
    severity: ERROR_SEVERITY.HIGH,
    timeout: 15000,
    fallback: () => ({
      success: false,
      error: true,
      message: "Authentication service unavailable"
    }),
    ...options
  });
}

/**
 * Create error boundary for React-like error handling
 * @param {HTMLElement} element - DOM element to wrap
 * @param {Function} renderFn - Function to render content
 * @param {Function} errorFn - Function to render error state
 */
export function createErrorBoundary(element, renderFn, errorFn) {
  try {
    renderFn();
  } catch (error) {
    globalErrorHandler.handleError(
      error,
      ERROR_CATEGORIES.RENDERING,
      ERROR_SEVERITY.MEDIUM
    );

    if (errorFn) {
      errorFn(error);
    } else {
      element.textContent = "Content could not be displayed due to an error.";
    }
  }
}

/**
 * Validate medical input data
 * @param {Object} data - Input data
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result
 */
export function validateMedicalInputs(data, schema) {
  const errors = [];
  const warnings = [];

  Object.keys(schema).forEach((key) => {
    const rule = schema[key];
    const value = data[key];

    // Required field check
    if (
      rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({
        field: key,
        code: MEDICAL_ERROR_CODES.DATA_INCOMPLETE,
        message: `${key} is required`
      });
      return;
    }

    // Type check
    if (value !== undefined && rule.type) {
      const expectedType = rule.type;
      const actualType = typeof value;

      if (
        expectedType === "number" &&
        (isNaN(value) || actualType !== "number")
      ) {
        errors.push({
          field: key,
          code: MEDICAL_ERROR_CODES.INVALID_VITAL_SIGNS,
          message: `${key} must be a valid number`
        });
        return;
      }
    }

    // Range check for medical values
    if (value !== undefined && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field: key,
          code: MEDICAL_ERROR_CODES.INVALID_VITAL_SIGNS,
          message: `${key} must be at least ${rule.min}`
        });
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field: key,
          code: MEDICAL_ERROR_CODES.INVALID_VITAL_SIGNS,
          message: `${key} must not exceed ${rule.max}`
        });
      }

      // Medical warning thresholds
      if (rule.warningMin !== undefined && value < rule.warningMin) {
        warnings.push({
          field: key,
          message: `${key} is below typical range (${rule.warningMin})`
        });
      }

      if (rule.warningMax !== undefined && value > rule.warningMax) {
        warnings.push({
          field: key,
          message: `${key} is above typical range (${rule.warningMax})`
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  };
}

/**
 * Get error handler instance for debugging
 */
export function getErrorHandler() {
  return globalErrorHandler;
}

/**
 * Export error classes
 */
export { GlobalErrorHandler };
