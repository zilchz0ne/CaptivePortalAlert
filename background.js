// background.js

const flaggedTabs = new Set();

// 1. PRIMARY DETECTOR: Catches the initial gstatic.com probe
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    const response = await fetch(`http://connectivitycheck.gstatic.com/generate_204?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'manual' 
    });

    if (response.status !== 204) {
      // Trapped -> Add tabId to set
      flaggedTabs.add(details.tabId);
      await injectDefensiveUI(details.tabId);
    }
  } catch (error) {
    flaggedTabs.add(details.tabId);
    await injectDefensiveUI(details.tabId);
  }
}, {
  url: [{ hostSuffix: 'gstatic.com', pathContains: 'generate_204' }]
});

// 2. CHILD TAB TRACKER: Flag new tabs opened by a captive portal tab
chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
  if (flaggedTabs.has(details.sourceTabId)) {
    flaggedTabs.add(details.tabId);
  }
});

// 3. CATCH-ALL RE-INJECTION: Re-inject into ANY flagged tab on navigation/redirect
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  if (flaggedTabs.has(details.tabId)) {
    await injectDefensiveUI(details.tabId);
  }
});

// Cleanup memory when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  flaggedTabs.delete(tabId);
});

async function injectDefensiveUI(tabId) {
  try {
    await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (err) {
    // Suppress errors for system pages (e.g. chrome://)
  }
}
