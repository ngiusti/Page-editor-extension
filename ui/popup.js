console.log('Popup script loaded');

// Popup script for On-Page Visual Editor (AI)

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded');
  
  // Get button elements
  const openSidePanelBtn = document.getElementById('openSidePanel');
  const openOptionsBtn = document.getElementById('openOptions');
  
  // Add event listeners
  openSidePanelBtn.addEventListener('click', () => {
    console.log('Side panel button clicked');
    // Note: Chrome side panels are typically opened manually by the user
    // We can't programmatically open them, but we can provide instructions
    alert('To open the side panel:\n1. Right-click the extension icon\n2. Select "Open side panel"\n\nOr use the keyboard shortcut: Ctrl+Shift+E (Windows) / Cmd+Shift+E (Mac)');
  });
  
  openOptionsBtn.addEventListener('click', () => {
    console.log('Opening options page');
    chrome.runtime.openOptionsPage();
  });
  
  console.log('Popup initialized successfully');
});
