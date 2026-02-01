/**
 * iGFAP Encryption Service
 * AES-256-GCM encryption for patient data protection
 *
 * Provides end-to-end encryption between PWA, Cloud Functions, and Kiosk.
 * Google Cloud infrastructure cannot decrypt the data (no key access).
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;
const PBKDF2_ITERATIONS = 100000;
const SALT = "igfap-medical-encryption-v1";

class CryptoService {
  constructor() {
    this.key = null;
    this.initialized = false;
  }

  /**
   * Initialize the crypto service with the shared secret
   * @param {string} secretKey - Base64 encoded shared secret
   */
  async init(secretKey) {
    if (!secretKey) {
      console.warn("[CryptoService] No encryption key provided - encryption disabled");
      return;
    }

    try {
      // Import the secret as key material
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secretKey),
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      // Derive AES key using PBKDF2
      this.key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new TextEncoder().encode(SALT),
          iterations: PBKDF2_ITERATIONS,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ["encrypt", "decrypt"]
      );

      this.initialized = true;
      console.log("[CryptoService] Initialized successfully");
    } catch (error) {
      console.error("[CryptoService] Initialization failed:", error);
      this.initialized = false;
    }
  }

  /**
   * Check if encryption is available
   * @returns {boolean}
   */
  isEnabled() {
    return this.initialized && this.key !== null;
  }

  /**
   * Encrypt data
   * @param {any} plaintext - Data to encrypt (string or object)
   * @returns {Promise<Object>} Encrypted payload with iv, ct, tag
   */
  async encrypt(plaintext) {
    if (!this.initialized) {
      throw new Error("CryptoService not initialized");
    }

    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedData = new TextEncoder().encode(
      typeof plaintext === "string" ? plaintext : JSON.stringify(plaintext)
    );

    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
      this.key,
      encodedData
    );

    // GCM appends tag to ciphertext, extract it
    const ctWithTag = new Uint8Array(ciphertext);
    const tagStart = ctWithTag.length - (TAG_LENGTH / 8);
    const ct = ctWithTag.slice(0, tagStart);
    const tag = ctWithTag.slice(tagStart);

    return {
      v: 2,
      alg: "AES-256-GCM",
      iv: this._toBase64(iv),
      ct: this._toBase64(ct),
      tag: this._toBase64(tag)
    };
  }

  /**
   * Decrypt data
   * @param {Object} encryptedObj - Encrypted payload with v, iv, ct, tag
   * @returns {Promise<any>} Decrypted data
   */
  async decrypt(encryptedObj) {
    if (!this.initialized) {
      throw new Error("CryptoService not initialized");
    }

    // Handle legacy unencrypted data
    if (!encryptedObj || !encryptedObj.v || encryptedObj.v < 2) {
      return encryptedObj;
    }

    try {
      const iv = this._fromBase64(encryptedObj.iv);
      const ct = this._fromBase64(encryptedObj.ct);
      const tag = this._fromBase64(encryptedObj.tag);

      // Reconstruct ciphertext with tag for GCM
      const ctWithTag = new Uint8Array(ct.length + tag.length);
      ctWithTag.set(ct);
      ctWithTag.set(tag, ct.length);

      const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
        this.key,
        ctWithTag
      );

      const plaintext = new TextDecoder().decode(decrypted);

      try {
        return JSON.parse(plaintext);
      } catch {
        return plaintext;
      }
    } catch (error) {
      console.error("[CryptoService] Decryption failed:", error);
      throw new Error("Decryption failed - invalid key or corrupted data");
    }
  }

  /**
   * Encrypt specific fields in an object, leaving others in cleartext
   * @param {Object} obj - Object to partially encrypt
   * @param {string[]} fieldsToEncrypt - Field names to encrypt
   * @returns {Promise<Object>} Object with encrypted fields
   */
  async encryptFields(obj, fieldsToEncrypt) {
    if (!this.initialized) {
      console.warn("[CryptoService] Not initialized - returning unencrypted");
      return obj;
    }

    const result = { ...obj };
    const encryptedFieldNames = [];

    for (const field of fieldsToEncrypt) {
      if (result[field] !== undefined) {
        result[`_enc_${field}`] = await this.encrypt(result[field]);
        delete result[field];
        encryptedFieldNames.push(field);
      }
    }

    if (encryptedFieldNames.length > 0) {
      result._encrypted = true;
      result._encFields = encryptedFieldNames;
      result._encVersion = 2;
    }

    return result;
  }

  /**
   * Decrypt specific fields in an object
   * @param {Object} obj - Object with encrypted fields
   * @returns {Promise<Object>} Object with decrypted fields
   */
  async decryptFields(obj) {
    if (!obj || !obj._encrypted) {
      return obj; // Not encrypted, return as-is
    }

    if (!this.initialized) {
      console.error("[CryptoService] Cannot decrypt - not initialized");
      throw new Error("CryptoService not initialized");
    }

    const result = { ...obj };
    const fields = obj._encFields || [];

    for (const field of fields) {
      const encryptedField = `_enc_${field}`;
      if (result[encryptedField]) {
        try {
          result[field] = await this.decrypt(result[encryptedField]);
          delete result[encryptedField];
        } catch (error) {
          console.error(`[CryptoService] Failed to decrypt field ${field}:`, error);
          // Keep encrypted version if decryption fails
        }
      }
    }

    delete result._encrypted;
    delete result._encFields;
    delete result._encVersion;

    return result;
  }

  /**
   * Encrypt an API request payload
   * @param {Object} payload - Request payload
   * @param {string} moduleType - Module type for routing (kept in cleartext)
   * @returns {Promise<Object>} Encrypted request
   */
  async encryptRequest(payload, moduleType) {
    if (!this.initialized) {
      return payload; // Return unencrypted if not initialized
    }

    return {
      encrypted: await this.encrypt(payload),
      moduleType: moduleType, // Keep in cleartext for routing
      _v: 2
    };
  }

  /**
   * Decrypt an API response
   * @param {Object} response - Response from API
   * @returns {Promise<Object>} Decrypted response
   */
  async decryptResponse(response) {
    if (!response || !response.encrypted) {
      return response; // Not encrypted
    }

    if (!this.initialized) {
      throw new Error("Cannot decrypt response - CryptoService not initialized");
    }

    return await this.decrypt(response.encrypted);
  }

  // Helper: Convert Uint8Array to Base64
  _toBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  // Helper: Convert Base64 to Uint8Array
  _fromBase64(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  }
}

// Singleton instance
export const cryptoService = new CryptoService();
export default cryptoService;
