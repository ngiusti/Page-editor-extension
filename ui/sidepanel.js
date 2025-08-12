console.log('Side panel script loaded');

// Side panel script for On-Page Visual Editor (AI)

document.addEventListener('DOMContentLoaded', () => {
  console.log('Side panel DOM loaded');
  
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  // Add click event listeners to tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      console.log('Switching to tab:', targetTab);
      switchTab(targetTab);
    });
  });
  
  // Function to switch tabs
  function switchTab(tabName) {
    // Remove active class from all tabs and panels
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activePanel = document.getElementById(`${tabName}-panel`);
    
    if (activeButton && activePanel) {
      activeButton.classList.add('active');
      activePanel.classList.add('active');
      console.log('Tab switched to:', tabName);
    }
  }
  
  // Get UI elements for different tabs
  const startInspectingBtn = document.getElementById('startInspecting');
  const stopInspectingBtn = document.getElementById('stopInspecting');
  const refreshOverlayBtn = document.getElementById('refreshOverlay');
  const applyStylesBtn = document.getElementById('applyStyles');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const generatePlanBtn = document.getElementById('generatePlan');
  const applyAIChangesBtn = document.getElementById('applyAIChanges');
  const undoLastBtn = document.getElementById('undoLast');
  const redoLastBtn = document.getElementById('redoLast');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const pingButton = document.getElementById('pingButton');
  
  // Inspect mode state
  let inspectMode = false;
  let selectedElementInfo = null;
  
  // Inspect tab event listeners
  if (startInspectingBtn) {
    startInspectingBtn.addEventListener('click', () => {
      console.log('Starting element inspection');
      startInspectMode();
    });
  }
  
  if (stopInspectingBtn) {
    stopInspectingBtn.addEventListener('click', () => {
      console.log('Stopping element inspection');
      stopInspectMode();
    });
  }
  
  if (refreshOverlayBtn) {
    refreshOverlayBtn.addEventListener('click', () => {
      console.log('Refreshing hover overlay');
      refreshHoverOverlay();
    });
  }
  
  // Start inspect mode
  function startInspectMode() {
    console.log('Starting element inspection with automatic content script check');
    
    // Show loading state
    startInspectingBtn.textContent = 'Checking Content Script...';
    startInspectingBtn.disabled = true;
    
    // First, ensure content script is injected and ready
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error pinging content script:', chrome.runtime.lastError);
        updateElementDetails(`❌ Error: ${chrome.runtime.lastError.message}. Please refresh the page and try again.`);
        
        // Reset button state on error
        startInspectingBtn.disabled = false;
        startInspectingBtn.textContent = 'Start Inspecting (Auto-Check)';
        return;
      }
      
      if (response && response.success) {
        console.log('Content script is ready, enabling inspect mode');
        
        // Show success message for content script check
        updateElementDetails('✅ Content script ready. Enabling inspect mode...');
        
        // Now enable inspect mode
        inspectMode = true;
        startInspectingBtn.disabled = true;
        stopInspectingBtn.disabled = false;
        startInspectingBtn.textContent = 'Inspecting...';
        stopInspectingBtn.textContent = 'Stop Inspecting';
        
        // Send message to content script to enable inspect mode
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              type: 'TOGGLE_INSPECT', 
              enabled: true 
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error enabling inspect mode:', chrome.runtime.lastError);
                updateElementDetails(`❌ Error enabling inspect mode: ${chrome.runtime.lastError.message}`);
                
                // Reset button state on error
                startInspectingBtn.disabled = false;
                startInspectingBtn.textContent = 'Start Inspecting (Auto-Check)';
                inspectMode = false;
              } else {
                console.log('Inspect mode enabled:', response);
                updateElementDetails('✅ Inspect mode enabled. Click on any element to select it.');
              }
            });
          }
        });
      } else {
        console.error('Content script ping failed:', response);
        updateElementDetails('❌ Content script not responding. Please refresh the page and try again.');
        
        // Reset button state on error
        startInspectingBtn.disabled = false;
        startInspectingBtn.textContent = 'Start Inspecting (Auto-Check)';
      }
    });
  }
  
  // Stop inspect mode
  function stopInspectMode() {
    inspectMode = false;
    startInspectingBtn.disabled = false;
    stopInspectingBtn.disabled = true;
    startInspectingBtn.textContent = 'Start Inspecting';
    stopInspectingBtn.textContent = 'Stopped';
    
    // Send message to content script to disable inspect mode
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'TOGGLE_INSPECT', 
          enabled: false 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error disabling inspect mode:', chrome.runtime.lastError);
          } else {
            console.log('Inspect mode disabled:', response);
            updateElementDetails('Inspect mode disabled. Click "Start Inspecting" to begin.');
          }
        });
      }
    });
    
    // Clear any selected element
    selectedElementInfo = null;
    updateElementDetails('No element selected');
  }
  
  // Update element details display
  function updateElementDetails(message, elementInfo = null) {
    const elementDetails = document.getElementById('elementDetails');
    if (elementDetails) {
      if (elementInfo) {
        elementDetails.innerHTML = formatElementInfo(elementInfo);
      } else {
        elementDetails.innerHTML = `<span class="info-message">${message}</span>`;
      }
    }
  }
  
  // Format element information for display
  function formatElementInfo(elementInfo) {
    if (!elementInfo) return 'No element information available';
    
    return `
      <div class="element-info-display">
        <div class="element-header">
          <strong>${elementInfo.tagName.toUpperCase()}</strong>
          ${elementInfo.id ? `<span class="element-id">#${elementInfo.id}</span>` : ''}
          ${elementInfo.className ? `<span class="element-class">.${elementInfo.className}</span>` : ''}
        </div>
        <div class="element-content">
          <div class="element-text"><strong>Text:</strong> ${elementInfo.textContent || 'No text'}</div>
          <div class="element-selector"><strong>Selector:</strong> <code>${elementInfo.selector}</code></div>
          <div class="element-position">
            <strong>Position:</strong> ${Math.round(elementInfo.position.x)}, ${Math.round(elementInfo.position.y)} 
            (${Math.round(elementInfo.position.width)} × ${Math.round(elementInfo.position.height)})
          </div>
        </div>
        <div class="element-styles">
          <strong>Styles:</strong>
          <div class="style-grid">
            <span>Color: <span class="color-preview" style="background-color: ${elementInfo.styles.color}"></span></span>
            <span>Font: ${elementInfo.styles.fontSize} ${elementInfo.styles.fontWeight}</span>
            <span>Background: <span class="color-preview" style="background-color: ${elementInfo.styles.backgroundColor}"></span></span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Ping button event listener
  if (pingButton) {
    pingButton.addEventListener('click', () => {
      console.log('Ping button clicked, sending PING message to background');
      
      // Show loading state
      pingButton.textContent = 'Pinging...';
      pingButton.disabled = true;
      
      // Send PING message to background script
      chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
        // Reset button state
        pingButton.textContent = 'Ping Content Script';
        pingButton.disabled = false;
        
        if (chrome.runtime.lastError) {
          console.error('Error sending PING:', chrome.runtime.lastError);
          
          // Show error in UI
          const elementDetails = document.getElementById('elementDetails');
          if (elementDetails) {
            elementDetails.innerHTML = `<strong>❌ Runtime Error: ${chrome.runtime.lastError.message}</strong>`;
          }
        } else {
          console.log('Side panel received response:', response);
          
          // Show result in the UI
          const elementDetails = document.getElementById('elementDetails');
          if (elementDetails) {
            if (response && response.success) {
              elementDetails.innerHTML = `<strong>✅ ${response.message}</strong><br><small>Timestamp: ${new Date(response.timestamp).toLocaleTimeString()}</small>`;
            } else {
              elementDetails.innerHTML = `<strong>❌ Error: ${response?.error || 'Unknown error'}</strong>`;
            }
          }
        }
      });
    });
  }
  
  // Styles tab event listeners
  if (applyStylesBtn) {
    applyStylesBtn.addEventListener('click', () => {
      console.log('Applying styles to selected element');
      // Implementation will go here
    });
  }
  
  // Presets tab event listeners
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const preset = button.getAttribute('data-preset');
      console.log('Applying preset:', preset);
      // Implementation will go here
    });
  });
  
  // AI tab event listeners
  if (generatePlanBtn) {
    generatePlanBtn.addEventListener('click', () => {
      const prompt = document.getElementById('aiPrompt')?.value || '';
      console.log('Generating plan for prompt:', prompt);
      // Implementation will go here
    });
  }
  
  if (applyAIChangesBtn) {
    applyAIChangesBtn.addEventListener('click', () => {
      console.log('Applying AI-generated changes');
      // Implementation will go here
    });
  }
  
  // History tab event listeners
  if (undoLastBtn) {
    undoLastBtn.addEventListener('click', () => {
      console.log('Undoing last change');
      // Implementation will go here
    });
  }
  
  if (redoLastBtn) {
    redoLastBtn.addEventListener('click', () => {
      console.log('Redoing last undone change');
      // Implementation will go here
    });
  }
  
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      console.log('Clearing change history');
      // Implementation will go here
    });
  }
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Side panel received message:', request);
    
    if (request.type === 'ELEMENT_SELECTED') {
      console.log('Element selected:', request.elementInfo);
      selectedElementInfo = request.elementInfo;
      updateElementDetails('', request.elementInfo);
    }
  });
  
  // Initialize button states
  if (stopInspectingBtn) {
    stopInspectingBtn.disabled = true;
  }
  
  // Refresh hover overlay
  function refreshHoverOverlay() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'REFRESH_OVERLAY'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error refreshing overlay:', chrome.runtime.lastError);
          } else {
            console.log('Overlay refresh response:', response);
            updateElementDetails('Hover overlay refreshed. Move your mouse over elements to see the highlight.');
          }
        });
      }
    });
  }
  
  console.log('Side panel initialized successfully with tab functionality and inspect mode');
});
