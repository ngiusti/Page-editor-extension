console.log('Storage utility loaded');

// Storage utilities for On-Page Visual Editor (AI)

class StorageManager {
  constructor() {
    console.log('StorageManager initialized');
  }

  // Save data to Chrome storage
  async saveData(key, data) {
    console.log('Saving data:', key, data);
    try {
      await chrome.storage.local.set({ [key]: data });
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Load data from Chrome storage
  async loadData(key) {
    console.log('Loading data:', key);
    try {
      const result = await chrome.storage.local.get([key]);
      console.log('Data loaded:', result[key]);
      return result[key];
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
