(function injectDefensiveWrapper() {
  // Guard against duplicate injections if the event triggers multiple times
  if (document.getElementById('cpa-alert-frame')) return;

  // Create the viewport bounding red box
  const structuralBorder = document.createElement('div');
  structuralBorder.id = 'cpa-alert-frame';
  structuralBorder.className = 'cpa-danger-border';
  
  // Create the warning payload element
  const alertBanner = document.createElement('div');
  alertBanner.className = 'cpa-warning-banner';
  alertBanner.innerText = '⚠️ SECURITY ALERT: UNTRUSTED CAPTIVE PORTAL ENVIROMENT DETECTED';

  // Append elements safely directly onto the document root element
  document.documentElement.appendChild(structuralBorder);
  document.documentElement.appendChild(alertBanner);
})();
