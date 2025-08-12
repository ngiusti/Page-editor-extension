console.log('Background service worker loaded');

// Background service worker for On-Page Visual Editor (AI)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  
  // Handle ping/pong messaging between side panel and content script
  if (request.type === 'PING') {
    console.log('Background received PING, forwarding to content script');
    
    // Get the active tab and ensure content script is injected
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        console.log('Found active tab:', tabs[0].id, tabs[0].url);
        
        // Check if this is a page where we can inject content scripts
        if (tabs[0].url.startsWith('chrome://') || tabs[0].url.startsWith('chrome-extension://') || tabs[0].url.startsWith('edge://')) {
          console.log('Cannot inject content script into Chrome/Edge system page');
          sendResponse({ success: false, error: 'Cannot inject content script into system pages' });
          return;
        }
        
        try {
          // First, try to send a message to see if content script is already running
          try {
            await new Promise((resolve, reject) => {
              chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            });
            console.log('Content script already running, message sent successfully');
            sendResponse({ success: true, message: 'Pong from content (already running)', timestamp: Date.now() });
            return;
          } catch (error) {
            console.log('Content script not running, injecting...');
          }
          
          // Inject the content script since it's not running
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['src/content.js']
          });
          console.log('Content script injected successfully');
          
          // Wait a moment for the content script to initialize
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Now send the message
          chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Error sending message after injection:', chrome.runtime.lastError.message);
              sendResponse({ success: false, error: 'Failed to send message after injection' });
            } else {
              console.log('Background received response from content:', response);
              sendResponse(response);
            }
          });
        } catch (error) {
          console.log('Error injecting content script:', error);
          sendResponse({ success: false, error: `Failed to inject content script: ${error.message}` });
        }
      } else {
        console.log('No active tab found');
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    
    // Return true to indicate we'll send response asynchronously
    return true;
  }
  
  // Handle inspect mode toggle messages from side panel
  if (request.type === 'TOGGLE_INSPECT') {
    console.log('Background received TOGGLE_INSPECT, forwarding to content script');
    
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        try {
          // Ensure content script is injected
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['src/content.js']
          });
          
          // Wait for initialization
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Forward the message to content script
          chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Error sending TOGGLE_INSPECT:', chrome.runtime.lastError.message);
              sendResponse({ success: false, error: 'Failed to send message to content script' });
            } else {
              console.log('Background forwarded TOGGLE_INSPECT response:', response);
              sendResponse(response);
            }
          });
        } catch (error) {
          console.log('Error handling TOGGLE_INSPECT:', error);
          sendResponse({ success: false, error: `Failed to handle inspect mode toggle: ${error.message}` });
        }
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    
    return true;
  }
  
  // Handle element selection messages from content script
  if (request.type === 'ELEMENT_SELECTED') {
    console.log('Background received ELEMENT_SELECTED, forwarding to side panel');
    
    // Forward the message to the side panel
    chrome.runtime.sendMessage(request);
    sendResponse({ success: true });
    return true;
  }
  
  // Handle other message types here
  console.log('Unknown message type:', request.type);
  sendResponse({ success: false, error: 'Unknown message type' });
});
