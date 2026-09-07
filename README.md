# CaptivePortalAlert

**CaptivePortalAlert** is a lightweight, defensive Google Chrome extension (Manifest V3) designed to mitigate risks associated with untrusted public Wi-Fi networks—specifically **Evil Twin APs** and **phishing portals**. 

When connected to a network that intercepts HTTP requests, the extension highlights the portal login interface with a prominent visual warning frame to maintain situational awareness.

---

## 🛡️ Key Features

* **Proactive Interception:** Captures connectivity check probes (`connectivitycheck.gstatic.com/generate_204`) via `chrome.webNavigation` before content fully loads.
* **Visual Isolation:** Dynamically injects a high-visibility, top-layer red defensive border (`#ff0033`) and alert banner around intercepted login screens.
* **Tab Tracking:** Propagates danger flags to child tabs spawned directly from an active portal page.
* **Privacy-First Design:** Zero external data transmission, analytics, or user logging.

---

## 🏗️ Technical Architecture & Permissions

### Manifest Permissions
* `webNavigation`: Listens for top-level frame navigation and monitors HTTP redirects triggered by captive portals.
* `scripting`: Dynamically injects style isolation (`content.css`) and DOM elements (`content.js`) into flagged tabs.
* `<all_urls>`: Required host permission to inject warning overlays on arbitrary captive portal domains.

### Detection Workflow
1. Intercepts HTTP requests matching `generate_204` connectivity checks.
2. Evaluates probe response. If trapped or redirected (non-204 status), the origin tab ID is stored in memory (`flaggedTabs`).
3. Injects defensive UI assets (`content.css`, `content.js`) into the target tab.
4. Cleans up tab references on closure to optimize background memory usage.

---

## 🚀 Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/zilchz0ne/CaptivePortalAlert.git](https://github.com/zilchz0ne/CaptivePortalAlert.git)
   ```
2. **Load into Chrome**
- Open Chrome and navigate to <chrome://extensions/>.
- Enable **Developer mode** using the toggle switch in the top-right corner.
- Click **Load unpacked** and select the `src/` directory of this repository.

## 🧪 Testing
A local testing environment is located under the `test/` directory.
Run the local mock portal server:

```bash
sudo python3 test/server.py
```

## 📄 Documentation & Legal
- [Privacy Policy](./docs/privacy.html)
- [Terms of Service](./docs/terms.html)

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
