# Privacy Policy for CaptivePortalAlert

**Last updated:** October 2026

## 1. Overview

CaptivePortalAlert is an open-source browser extension designed to
detect network-level captive portal redirects and display visual
warnings on untrusted public Wi-Fi networks.

## 2. Data Collection and Storage

**We do not collect, store, track, or transmit any personal data.**

- **No Analytics or Telemetry:** The extension contains zero tracking
  scripts, third-party analytics, or logging frameworks.
- **No Personal Information:** We do not capture or inspect credentials,
  browsing history, form inputs, or IP addresses.
- **Local Session State:** Transient identifiers (tab IDs) are stored in
  local browser memory (`chrome.storage.session`) strictly to track
  active warning overlays across navigations. This data never leaves
  your device and is destroyed when the tab or browser is closed.

## 3. Extension Permissions

The extension requests specific permissions solely to perform local
network checks and render warning interface elements:

- `webNavigation`: Monitored to detect initial network probe requests
  (e.g., `generate_204`) and track child tab navigations from flagged
  portals.
- `scripting` & `<all_urls>`: Required to inject the visual hazard frame
  and top warning banner into intercepted portal pages regardless of
  their domain.
- `storage`: Used to temporarily store active tab state locally in
  browser session memory.

## 4. Network Requests

To evaluate network connectivity, the extension performs a stateless
HTTP GET request to a standard endpoint
(`http://connectivitycheck.gstatic.com/generate_204`). This request
carries no personal identifiers, user credentials, or tracking cookies.

## 5. Changes to This Policy

If updates are made to the extension that impact user privacy, this
document will be updated accordingly in the repository.

## 6. Contact

For questions or security concerns regarding this extension, please
submit an issue on the project GitHub repository or contact:

**Email:** bytetrace.elixir448@slmail.me
