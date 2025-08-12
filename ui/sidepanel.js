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
  const applyStylesBtn = document.getElementById('applyStyles');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const generatePlanBtn = document.getElementById('generatePlan');
  const applyAIChangesBtn = document.getElementById('applyAIChanges');
  const undoLastBtn = document.getElementById('undoLast');
  const redoLastBtn = document.getElementById('redoLast');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const pingButton = document.getElementById('pingButton');
  
  // Inspect tab event listeners
  if (startInspectingBtn) {
    startInspectingBtn.addEventListener('click', () => {
      console.log('Starting element inspection');
      // Implementation will go here
    });
  }
  
  if (stopInspectingBtn) {
    stopInspectingBtn.addEventListener('click', () => {
      console.log('Stopping element inspection');
      // Implementation will go here
    });
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
  
  console.log('Side panel initialized successfully with tab functionality');
});
