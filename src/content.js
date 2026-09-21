// src/content.js

(function initCaptiveAlert() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "CLEAR_PORTAL_ALERT") {
      const border = document.getElementById('cpa-alert-frame');
      const board = document.getElementById('cpa-police-board');
      if (border) border.remove();
      if (board) board.remove();
    }
  });

  if (document.getElementById('cpa-alert-frame')) return;

  // 1. Create Hazard Border Frame
  const structuralBorder = document.createElement('div');
  structuralBorder.id = 'cpa-alert-frame';

  // 2. Create Top Police Warning Banner
  const policeBoard = document.createElement('div');
  policeBoard.id = 'cpa-police-board';
  policeBoard.innerHTML = `
    <div class="cpa-badge">POLICE LINE</div>
    <div class="cpa-board-text-group">
      <div class="cpa-board-title">CAPTIVE PORTAL ALERT — UNTRUSTED AREA</div>
      <div class="cpa-board-sub">DO NOT ENTER SENSITIVE DATA OR PERSONAL CREDENTIALS</div>
    </div>
  `;

  // Inject elements into DOM
  document.documentElement.appendChild(structuralBorder);
  document.documentElement.appendChild(policeBoard);
})();
