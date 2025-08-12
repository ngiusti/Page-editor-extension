console.log('Content script loaded');

// Content script for On-Page Visual Editor (AI)
// This script runs in the context of web pages

// Flag to prevent multiple initializations
let isInitialized = false;

// Inspect mode state
let inspectMode = false;
let hoverOverlay = null;
let selectedElement = null;
let isHighlighted = false;

// Initialize content script
function init() {
  if (isInitialized) {
    console.log('Content script already initialized, skipping...');
    return;
  }
  
  console.log('Content script initialized');
  isInitialized = true;
  
  // Create hover overlay element
  createHoverOverlay();
  
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
    } else if (request.type === 'TOGGLE_INSPECT') {
      console.log('Toggling inspect mode:', request.enabled);
      toggleInspectMode(request.enabled);
      sendResponse({ success: true, inspectMode: inspectMode });
    } else if (request.type === 'GET_SELECTED_ELEMENT') {
      console.log('Getting selected element info');
      const elementInfo = getElementInfo(selectedElement);
      sendResponse({ success: true, elementInfo: elementInfo });
    } else if (request.type === 'CLEAR_SELECTION') {
      console.log('Clearing element selection');
      clearElementSelection();
      sendResponse({ success: true });
    } else if (request.type === 'REFRESH_OVERLAY') {
      console.log('Refreshing hover overlay');
      refreshHoverOverlay();
      sendResponse({ success: true, message: 'Overlay refreshed' });
    } else {
      sendResponse({ 
        success: false, 
        error: 'Unknown message type in content script' 
      });
    }
  });
  
  // Set up event listeners for hover and click
  setupEventListeners();
  
  // Log that content script is ready to receive messages
  console.log('Content script ready to receive messages');
}

// Create hover overlay element
function createHoverOverlay() {
  hoverOverlay = document.createElement('div');
  hoverOverlay.id = 'ai-editor-hover-overlay';
  hoverOverlay.style.cssText = `
    position: fixed;
    border: 2px solid #3498db;
    background-color: rgba(52, 152, 219, 0.1);
    pointer-events: none;
    z-index: 999999;
    transition: all 0.1s ease;
    display: none;
    box-sizing: border-box;
  `;
  document.body.appendChild(hoverOverlay);
  console.log('Hover overlay created');
}

// Set up event listeners for hover and click
function setupEventListeners() {
  // Mouse move event for hover overlay
  document.addEventListener('mousemove', handleMouseMove);
  
  // Click event for element selection
  document.addEventListener('click', handleElementClick);
  
  // Escape key to clear selection
  document.addEventListener('keydown', handleKeyDown);
  
  // Window resize and scroll events to reposition overlay
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('scroll', handleWindowScroll);
  
  console.log('Event listeners set up');
}

// Handle mouse movement for hover overlay
function handleMouseMove(event) {
  if (!inspectMode) return;
  
  // If we have a selected element, don't show hover overlay
  if (isHighlighted) return;
  
  const element = document.elementFromPoint(event.clientX, event.clientY);
  if (element && element !== document.body && element !== document.documentElement) {
    showHoverOverlay(element);
  } else {
    hideHoverOverlay();
  }
}

// Show hover overlay for an element
function showHoverOverlay(element) {
  if (!hoverOverlay || !element) return;
  
  const rect = element.getBoundingClientRect();
  
  // Use viewport-relative positioning for more reliable overlay
  const left = rect.left;
  const top = rect.top;
  const width = rect.width;
  const height = rect.height;
    
  hoverOverlay.style.cssText = `
    position: fixed;
    left: ${left}px;
    top: ${top}px;
    width: ${width}px;
    height: ${height}px;
    border: 2px solid #3498db;
    background-color: rgba(52, 152, 219, 0.1);
    pointer-events: none;
    z-index: 999999;
    transition: all 0.1s ease;
    display: block;
    box-sizing: border-box;
  `;
}

// Hide hover overlay
function hideHoverOverlay() {
  if (hoverOverlay && !isHighlighted) {
    hoverOverlay.style.display = 'none';
    console.log('Hiding hover overlay');
  }
}

// Handle element click for selection
function handleElementClick(event) {
  if (!inspectMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = document.elementFromPoint(event.clientX, event.clientY);
  if (element && element !== document.body && element !== document.documentElement) {
    selectElement(element);
  }
  
  return false;
}

// Select an element
function selectElement(element) {
  if (selectedElement === element) return;
  
  // Clear previous selection
  clearElementSelection();
  
  // Set new selection
  selectedElement = element;
  isHighlighted = true;
  
  // Show permanent highlight
  showElementHighlight(element);
  
  // Get element info and send to side panel
  const elementInfo = getElementInfo(element);
  console.log('Element selected:', elementInfo);
  
  // Send message to side panel with element info
  chrome.runtime.sendMessage({
    type: 'ELEMENT_SELECTED',
    elementInfo: elementInfo
  });
}

// Show permanent highlight for selected element
function showElementHighlight(element) {
  if (!hoverOverlay || !element) return;
  
  const rect = element.getBoundingClientRect();
  
  // Use viewport-relative positioning for more reliable overlay
  const left = rect.left;
  const top = rect.top;
  const width = rect.width;
  const height = rect.height;
  
  hoverOverlay.style.cssText = `
    position: fixed;
    left: ${left}px;
    top: ${top}px;
    width: ${width}px;
    height: ${height}px;
    border: 3px solid #e74c3c;
    background-color: rgba(231, 76, 60, 0.15);
    pointer-events: none;
    z-index: 999999;
    transition: all 0.1s ease;
    display: block;
    box-sizing: border-box;
  `;
}

// Clear element selection
function clearElementSelection() {
  if (selectedElement) {
    selectedElement = null;
    isHighlighted = false;
    hideHoverOverlay();
    console.log('Element selection cleared');
  }
}

// Reset hover overlay state
function resetHoverOverlay() {
  if (hoverOverlay) {
    hoverOverlay.style.display = 'none';
    console.log('Hover overlay reset');
  }
}

// Refresh hover overlay state
function refreshHoverOverlay() {
  if (inspectMode && !isHighlighted) {
    // Get current mouse position and show overlay if over an element
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });
    handleMouseMove(mouseEvent);
  }
}

// Get element information
function getElementInfo(element) {
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || '',
    className: element.className || '',
    textContent: element.textContent?.substring(0, 100) || '',
    attributes: getElementAttributes(element),
    styles: {
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontFamily: computedStyle.fontFamily,
      width: computedStyle.width,
      height: computedStyle.height,
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      border: computedStyle.border,
      borderRadius: computedStyle.borderRadius,
      boxShadow: computedStyle.boxShadow
    },
    position: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    },
    selector: generateElementSelector(element)
  };
}

// Get element attributes
function getElementAttributes(element) {
  const attributes = {};
  for (let attr of element.attributes) {
    attributes[attr.name] = attr.value;
  }
  return attributes;
}

// Generate unique selector for element
function generateElementSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim());
    if (classes.length > 0) {
      return `.${classes.join('.')}`;
    }
  }
  
  let selector = element.tagName.toLowerCase();
  let parent = element.parentElement;
  let index = 0;
  
  // Find index among siblings
  if (parent) {
    const siblings = Array.from(parent.children).filter(child => 
      child.tagName === element.tagName
    );
    index = siblings.indexOf(element);
    if (index > 0) {
      selector += `:nth-of-type(${index + 1})`;
    }
  }
  
  return selector;
}

// Toggle inspect mode
function toggleInspectMode(enabled) {
  inspectMode = enabled;
  console.log('Inspect mode:', inspectMode ? 'ON' : 'OFF');
  
  if (!enabled) {
    clearElementSelection();
    resetHoverOverlay();
  } else {
    // Reset any existing state when enabling inspect mode
    resetHoverOverlay();
  }
  
  // Update cursor style
  document.body.style.cursor = enabled ? 'crosshair' : '';
}

// Handle keyboard events
function handleKeyDown(event) {
  if (event.key === 'Escape' && inspectMode) {
    clearElementSelection();
  }
}

// Handle window resize
function handleWindowResize() {
  if (inspectMode) {
    if (isHighlighted && selectedElement) {
      showElementHighlight(selectedElement);
    } else {
      resetHoverOverlay();
    }
  }
}

// Handle window scroll
function handleWindowScroll() {
  if (inspectMode) {
    if (isHighlighted && selectedElement) {
      showElementHighlight(selectedElement);
    } else {
      resetHoverOverlay();
    }
  }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
