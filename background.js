// background.js

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    const response = await fetch(`http://connectivitycheck.gstatic.com/generate_204?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'manual' 
    });

    if (response.status !== 204) {
      // Still trapped -> Deploy or maintain the alert
      executeDefensiveOverlay(details.tabId);
    } else {
      // Connection is clear! -> Tell the content script to tear down the warning
      clearDefensiveOverlay(details.tabId);
    }
  } catch (error) {
    // Network errors during a portal check usually mean we are still trapped/intercepted
    executeDefensiveOverlay(details.tabId);
  }
}, {
  url: [{ hostSuffix: 'gstatic.com', pathContains: 'generate_204' }]
});

async function executeDefensiveOverlay(tabId) {
  try {
    await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (err) {
    console.debug("Overlay injection deferred:", err);
  }
}

async function clearDefensiveOverlay(tabId) {
  try {
    // Send a message to the content script running in that tab to remove the elements
    await chrome.tabs.sendMessage(tabId, { action: "CLEAR_PORTAL_ALERT" });
  } catch (err) {
    // If the content script hasn't loaded yet or tab changed, ignore the error safely
    console.debug("Clear signal deferred:", err);
  }
}
