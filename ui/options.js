console.log('Options script loaded');

// Options script for On-Page Visual Editor (AI)

document.addEventListener('DOMContentLoaded', () => {
  console.log('Options DOM loaded');
  
  // Get UI elements
  const enableNotificationsCheckbox = document.getElementById('enableNotifications');
  const autoSaveCheckbox = document.getElementById('autoSave');
  const apiKeyInput = document.getElementById('apiKey');
  const aiModelSelect = document.getElementById('aiModel');
  const saveOptionsBtn = document.getElementById('saveOptions');
  const resetOptionsBtn = document.getElementById('resetOptions');
  
  // Load saved options
  loadOptions();
  
  // Add event listeners
  saveOptionsBtn.addEventListener('click', () => {
    console.log('Saving options');
    saveOptions();
  });
  
  resetOptionsBtn.addEventListener('click', () => {
    console.log('Resetting options to defaults');
    resetOptions();
  });
  
  // Load options from storage
  async function loadOptions() {
    console.log('Loading options from storage');
    try {
      const result = await chrome.storage.sync.get([
        'enableNotifications',
        'autoSave',
        'apiKey',
        'aiModel'
      ]);
      
      enableNotificationsCheckbox.checked = result.enableNotifications || false;
      autoSaveCheckbox.checked = result.autoSave || false;
      apiKeyInput.value = result.apiKey || '';
      aiModelSelect.value = result.aiModel || 'gpt-4';
      
      console.log('Options loaded successfully');
    } catch (error) {
      console.error('Error loading options:', error);
    }
  }
  
  // Save options to storage
  async function saveOptions() {
    console.log('Saving options to storage');
    try {
      await chrome.storage.sync.set({
        enableNotifications: enableNotificationsCheckbox.checked,
        autoSave: autoSaveCheckbox.checked,
        apiKey: apiKeyInput.value,
        aiModel: aiModelSelect.value
      });
      console.log('Options saved successfully');
    } catch (error) {
      console.error('Error saving options:', error);
    }
  }
  
  // Reset options to defaults
  function resetOptions() {
    enableNotificationsCheckbox.checked = false;
    autoSaveCheckbox.checked = false;
    apiKeyInput.value = '';
    aiModelSelect.value = 'gpt-4';
    saveOptions();
  }
  
  console.log('Options page initialized successfully');
});
