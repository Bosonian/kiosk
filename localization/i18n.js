// Internationalization utilities for the Stroke Triage Assistant

import { messages } from "./messages.js";

class I18n {
  constructor() {
    this.supportedLanguages = ["en", "de"];
    this.currentLanguage = this.detectLanguage();
  }

  // Detect browser language and default to appropriate language
  detectLanguage() {
    // Check if language is already set in localStorage
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.substring(0, 2).toLowerCase();

    // Default to German if browser language is German, otherwise English
    return langCode === "de" ? "de" : "en";
  }

  // Get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Set language and save to localStorage
  setLanguage(language) {
    if (this.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
      localStorage.setItem("language", language);

      // Dispatch custom event for language change
      window.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { language }
        })
      );

      return true;
    }
    return false;
  }

  // Get supported languages
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  // Translate a message key
  t(key) {
    const currentMessages = messages[this.currentLanguage] || messages.en;
    return currentMessages[key] || key;
  }

  // Toggle between English and German
  toggleLanguage() {
    const newLanguage = this.currentLanguage === "en" ? "de" : "en";
    return this.setLanguage(newLanguage);
  }

  // Get language display name
  getLanguageDisplayName(lang = null) {
    const language = lang || this.currentLanguage;
    const displayNames = {
      en: "English",
      de: "Deutsch"
    };
    return displayNames[language] || language;
  }

  // Format date/time according to current locale
  formatDateTime(date) {
    const locale = this.currentLanguage === "de" ? "de-DE" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  }

  // Format time only according to current locale
  formatTime(date) {
    const locale = this.currentLanguage === "de" ? "de-DE" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  }
}

// Create singleton instance
const i18n = new I18n();

// Export both the instance and the class
export { i18n, I18n };

// Export convenience function for translation
export const t = (key) => i18n.t(key);
