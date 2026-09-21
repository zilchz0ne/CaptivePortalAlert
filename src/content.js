// src/content.js

(function initCaptiveAlert() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "CLEAR_PORTAL_ALERT") {
      const border = document.getElementById('cpa-alert-frame');
      const tapes = document.getElementById('cpa-tape-wrapper');
      const header = document.getElementById('cpa-header-bar');
      if (border) border.remove();
      if (tapes) tapes.remove();
      if (header) header.remove();
    }
  });

  if (document.getElementById('cpa-alert-frame')) return;

  // 1. Create Hazard Frame
  const structuralBorder = document.createElement('div');
  structuralBorder.id = 'cpa-alert-frame';

  // 2. Create Tape Wrapper Container
  const tapeWrapper = document.createElement('div');
  tapeWrapper.id = 'cpa-tape-wrapper';

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const repeatingText = "DANGER  •  DO NOT ENTER  •  SECURITY ALERT  •  UNTRUSTED NETWORK  •  ";

  const tapesData = [
    { id: "cpa-tape-1", path: `M -50,${vh * 0.25} Q ${vw * 0.5},${vh * 0.28} ${vw + 50},${vh * 0.35}` },
    { id: "cpa-tape-2", path: `M -50,${vh * 0.45} Q ${vw * 0.5},${vh * 0.25} ${vw + 50},${vh * 0.05}` },
    { id: "cpa-tape-3", path: `M -50,${vh * 0.58} Q ${vw * 0.5},${vh * 0.52} ${vw + 50},${vh * 0.45}` },
    { id: "cpa-tape-4", path: `M -50,${vh * 0.65} Q ${vw * 0.5},${vh * 0.72} ${vw + 50},${vh * 0.78}` },
    { id: "cpa-tape-5", path: `M -50,${vh * 0.88} Q ${vw * 0.5},${vh * 0.87} ${vw + 50},${vh * 0.86}` }
  ];

  const svgNS = "http://www.w3.org/2000/svg";
  const svgEl = document.createElementNS(svgNS, "svg");
  svgEl.setAttribute("class", "cpa-caution-tape-svg");

  const defsEl = document.createElementNS(svgNS, "defs");

  tapesData.forEach((tape) => {
    const pathEl = document.createElementNS(svgNS, "path");
    pathEl.setAttribute("id", tape.id);
    pathEl.setAttribute("d", tape.path);
    defsEl.appendChild(pathEl);

    const visiblePath = document.createElementNS(svgNS, "path");
    visiblePath.setAttribute("d", tape.path);
    visiblePath.setAttribute("class", "cpa-tape-path");
    svgEl.appendChild(visiblePath);

    const textEl = document.createElementNS(svgNS, "text");
    textEl.setAttribute("class", "cpa-tape-text");

    const textPathEl = document.createElementNS(svgNS, "textPath");
    textPathEl.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${tape.id}`);
    textPathEl.setAttribute("startOffset", "0%");
    textPathEl.textContent = repeatingText.repeat(8);

    textEl.appendChild(textPathEl);
    svgEl.appendChild(textEl);
  });

  svgEl.appendChild(defsEl);
  tapeWrapper.appendChild(svgEl);

  // 3. Create Header Bar (Board + Toggle Button aligned in the middle top)
  const headerBar = document.createElement('div');
  headerBar.id = 'cpa-header-bar';

  const policeBoard = document.createElement('div');
  policeBoard.id = 'cpa-police-board';
  policeBoard.className = 'cpa-hidden-board'; // Hidden until tapes are cut
  policeBoard.innerHTML = `
    <div class="cpa-badge">POLICE LINE</div>
    <div class="cpa-board-text-group">
      <div class="cpa-board-title">CAPTIVE PORTAL ALERT — UNTRUSTED AREA</div>
      <div class="cpa-board-sub">DO NOT ENTER SENSITIVE DATA OR PERSONAL CREDENTIALS</div>
    </div>
  `;

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'cpa-toggle-btn';
  toggleBtn.innerText = '✂️';
  toggleBtn.title = 'Cut/Hide Tapes';

  headerBar.appendChild(policeBoard);
  headerBar.appendChild(toggleBtn);

  let isCut = false;
  toggleBtn.addEventListener('click', () => {
    isCut = !isCut;
    if (isCut) {
      tapeWrapper.classList.add('cpa-hidden');
      policeBoard.classList.remove('cpa-hidden-board');
      toggleBtn.innerText = '🩹';
      toggleBtn.title = 'Restore Tapes';
    } else {
      tapeWrapper.classList.remove('cpa-hidden');
      policeBoard.classList.add('cpa-hidden-board');
      toggleBtn.innerText = '✂️';
      toggleBtn.title = 'Cut/Hide Tapes';
    }
  });

  // Inject elements
  document.documentElement.appendChild(structuralBorder);
  document.documentElement.appendChild(tapeWrapper);
  document.documentElement.appendChild(headerBar);
})();
