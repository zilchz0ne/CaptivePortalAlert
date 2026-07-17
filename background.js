// A reliable, static HTTP-only endpoint that should return a clean 204 status if the connection is truly open.
const CAPTIVE_PROBE_URL = 'http://connectivitycheck.gstatic.com/generate_204';

self.addEventListener('activate', () => {
  console.log('CaptivePortalAlert Engine Active.');
});

// True hardware/network interrupt event
if (navigator.connection) {
  navigator.connection.addEventListener('change', checkNetworkStatus);
}

async function checkNetworkStatus() {
  // If the browser thinks it's completely offline, sleep.
  if (!navigator.onLine) return;

  try {
    // We explicitly use standard cache-busting to bypass browser caches
    const response = await fetch(`${CAPTIVE_PROBE_URL}?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'manual' // Prevent following automatic 302/200 portal hijacks
    });

    // An untampered connection returns exactly 204.
    // If a portal intercepts it, it will return a 200 OK (the login HTML) or a 302/307 Redirect.
    if (response.status !== 204) {
      triggerPortalAlert();
    }
  } catch (error) {
    // In many intercept situations, an opaque/failed network fetch over HTTP means a gateway redirect is interfering
    triggerPortalAlert();
  }
}

async function triggerPortalAlert() {
  // Query for the current active window tab to inject our defensive UI
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.id || activeTab.url.startsWith('chrome://')) return;

  // Inject both our rigid styles and our containment execution script
  await chrome.scripting.insertCSS({
    target: { tabId: activeTab.id },
    files: ['content.css']
  });

  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    files: ['content.js']
  });
}
