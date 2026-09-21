// background.js

async function isFlagged(tabId) {
  const { flaggedTabs = [] } = await chrome.storage.session.get('flaggedTabs');
  return flaggedTabs.includes(tabId);
}

async function addFlagged(tabId) {
  const { flaggedTabs = [] } = await chrome.storage.session.get('flaggedTabs');
  if (!flaggedTabs.includes(tabId)) {
    flaggedTabs.push(tabId);
    await chrome.storage.session.set({ flaggedTabs });
  }
}

async function removeFlagged(tabId) {
  const { flaggedTabs = [] } = await chrome.storage.session.get('flaggedTabs');
  const updated = flaggedTabs.filter(id => id !== tabId);
  await chrome.storage.session.set({ flaggedTabs: updated });
}
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
      await addFlagged(details.tabId);
      await injectDefensiveUI(details.tabId);
    }
  } catch (error) {
    await addFlagged(details.tabId);
    await injectDefensiveUI(details.tabId);
  }
}, {
  url: [
    { hostSuffix: 'gstatic.com', pathContains: 'generate_204' },
    { schemes: ['http'] }
  ]
});

// 2. CHILD TAB TRACKER: Flag new tabs opened by a captive portal tab
chrome.webNavigation.onCreatedNavigationTarget.addListener(async (details) => {
  if (await isFlagged(details.sourceTabId)) {
    await addFlagged(details.tabId);
  }
});

// 3. CATCH-ALL RE-INJECTION: Re-inject into ANY flagged tab on navigation/redirect
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  if (await isFlagged(details.tabId)) {
    await injectDefensiveUI(details.tabId);
  }
});

// Cleanup memory when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
	removeFlagged(tabId);
});

async function injectDefensiveUI(tabId) {
  try {
    await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (err) {
    // Suppress errors for system pages (e.g. chrome://)
  }
}
