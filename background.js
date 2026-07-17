// background.js

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    // Run an out-of-band cache-busted probe to verify the state
    const response = await fetch(`http://connectivitycheck.gstatic.com/generate_204?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'manual' 
    });

    if (response.status !== 204) {
      // Still trapped -> Inject or maintain the permanent alert
      await chrome.scripting.insertCSS({ target: { tabId: details.tabId }, files: ['content.css'] });
      await chrome.scripting.executeScript({ target: { tabId: details.tabId }, files: ['content.js'] });
    } else {
      // Clean 204 received! The user logged out/authenticated. Clean up the tab.
      await chrome.tabs.sendMessage(details.tabId, { action: "CLEAR_PORTAL_ALERT" }).catch(() => {});
    }
  } catch (error) {
    // Network failures during an explicit HTTP check imply captive intercept behavior
    await chrome.scripting.insertCSS({ target: { tabId: details.tabId }, files: ['content.css'] });
    await chrome.scripting.executeScript({ target: { tabId: details.tabId }, files: ['content.js'] });
  }
}, {
  url: [{ hostSuffix: 'gstatic.com', pathContains: 'generate_204' }]
});
