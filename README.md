# On-Page Visual Editor (AI) - Chrome Extension

A Chrome MV3 extension that provides AI-powered visual editing capabilities for web pages.

## Features

- **Tabbed Interface**: Inspect, Styles, Presets, AI, and History tabs
- **Element Inspection**: Click and inspect page elements
- **Style Editing**: Modify CSS properties directly
- **Style Presets**: Quick style modifications
- **AI Commands**: Natural language page modifications
- **Change History**: Track and manage changes

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this directory
4. The extension should appear in your extensions list

## Testing

### Popup
- Click the extension icon in the toolbar
- Click "How to Open Side Panel" for instructions
- Click "Options" to open the options page

### Side Panel
- **To open the side panel**: Right-click the extension icon and select "Open side panel"
- **Alternative**: Use keyboard shortcut Ctrl+Shift+E (Windows) / Cmd+Shift+E (Mac)
- The side panel opens with 5 tabs: Inspect, Styles, Presets, AI, History
- Click between tabs to switch content panels
- Each tab has placeholder functionality ready for implementation

### Console Logs
- Open DevTools (F12) to see console logs from all JavaScript files
- Each file logs when it loads and when actions are performed

## Important Notes

**Side Panel Opening**: Due to Chrome extension security restrictions, side panels cannot be opened programmatically. Users must manually open them by:
1. Right-clicking the extension icon
2. Selecting "Open side panel"
3. Or using the keyboard shortcut

## File Structure

```
├── manifest.json          # Extension manifest
├── src/                   # Source files
│   ├── background.js      # Service worker
│   ├── content.js         # Content script
│   ├── selector.js        # Element selector utilities
│   ├── history.js         # History management
│   ├── storage.js         # Chrome storage utilities
│   ├── pageMap.js         # Page mapping utilities
│   ├── applyPlan.js       # Plan application utilities
│   └── schema.js          # Schema definitions
├── ui/                    # User interface files
│   ├── popup.html         # Extension popup
│   ├── popup.js           # Popup functionality
│   ├── sidepanel.html     # Side panel interface
│   ├── sidepanel.js       # Side panel functionality
│   ├── options.html       # Options page
│   ├── options.js         # Options functionality
│   └── styles.css         # Styling for all UI components
└── icons/                 # Extension icons (placeholders)
```

## Acceptance Criteria

✅ **Tabs switch**: Clicking between Inspect, Styles, Presets, AI, and History tabs shows different content panels

✅ **Side panel opens manually**: Users can open the side panel via right-click menu or keyboard shortcut

✅ **No 404s**: All referenced files exist and load without errors

✅ **Console logs**: Each JavaScript file logs when loaded and when actions are performed

✅ **Clear instructions**: Popup provides clear guidance on how to open the side panel

## Next Steps

- Implement element inspection functionality
- Add AI integration for page modifications
- Implement style editing capabilities
- Add change history tracking
- Create proper icon files
- Add content script injection logic
