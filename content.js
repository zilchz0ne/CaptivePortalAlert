(function injectOrClearDefensiveWrapper() {
  // Listen for the background script telling us the internet is unfrozen
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "CLEAR_PORTAL_ALERT") {
      const border = document.getElementById('cpa-alert-frame');
      const banner = document.getElementById('cpa-alert-banner');
      if (border) border.remove();
      if (banner) banner.remove();
    }
  });

  // Guard against duplicate element generation
  if (document.getElementById('cpa-alert-frame')) return;

  const structuralBorder = document.createElement('div');
  structuralBorder.id = 'cpa-alert-frame';
  structuralBorder.className = 'cpa-danger-border';
  
  const alertBanner = document.createElement('div');
  alertBanner.id = 'cpa-alert-banner';
  alertBanner.className = 'cpa-warning-banner';
  alertBanner.innerText = '⚠️ SECURITY ALERT: UNTRUSTED CAPTIVE PORTAL ENVIRONMENT DETECTED';

  document.documentElement.appendChild(structuralBorder);
  document.documentElement.appendChild(alertBanner);
})();
