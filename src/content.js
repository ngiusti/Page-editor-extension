console.log('Content script loaded');

// Content script for On-Page Visual Editor (AI)
// This script runs in the context of web pages

// Flag to prevent multiple initializations
let isInitialized = false;

// Initialize content script
function init() {
  if (isInitialized) {
    console.log('Content script already initialized, skipping...');
    return;
  }
  
  console.log('Content script initialized');
  isInitialized = true;
  
  // Set up message listener for communication with background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.type === 'PING') {
      console.log('Pong from content!');
      sendResponse({ 
        success: true, 
        message: 'Pong from content',
        timestamp: Date.now(),
        url: window.location.href
      });
    } else {
      sendResponse({ 
        success: false, 
        error: 'Unknown message type in content script' 
      });
    }
  });
  
  // Log that content script is ready to receive messages
  console.log('Content script ready to receive messages');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
