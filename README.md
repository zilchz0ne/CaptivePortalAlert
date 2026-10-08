# Public Wi-Fi Phishing Alert

**Public Wi-Fi Phishing Alert** is a lightweight, privacy-focused Chrome Extension (Manifest V3) designed to detect captive portals and untrusted network gateways (e.g., public Wi-Fi login pages or Evil Twin access points).

When an HTTP request interception or captive portal is detected, the extension overlays a high-visibility hazard warning around the page to alert you before sensitive credentials or personal data are entered.

---

## 🛡️ Key Features

- **Automated Detection:** Intercepts network connectivity check probes to identify captive portals before pages load completely.
- **Visual Warning Overlay:** Injects a prominent, top-layer hazard frame and warning banner on intercepted network tabs.
- **Inherited Tab Tracking:** Automatically applies protection to new child tabs spawned from a flagged portal session.
- **Zero Data Collection:** Runs entirely locally within the browser with no external logging, telemetry, or third-party analytics.

---

## 📁 Repository Structure

```text
├── assets/         # listings, icons, tiles, screenshots for chrome web store
├── LICENSE
├── README.md
├── PRIVACY.md
├── TERMS.md
├── src/            # Extension source code (manifest, service worker, content scripts)
└── test/           # Local testing environment and mock portal server
```

---

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zilchz0ne/Public_Wi-Fi_Phishing_Alert.git
   cd Public_Wi-Fi_Phishing_Alert
   ```

2. **Load into Google Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** using the toggle in the top-right corner.
   - Click **Load unpacked** and select the `src/` directory.

---

## 🧪 Local Testing

**Note:** Compatibility for this local testing setup is not guaranteed across all Linux distributions, macOS, or Windows systems.
A local mock server is provided in the `test/` directory to simulate a captive portal response:

```bash
sudo python3 test/server.py
```

Open Chrome. Try browsing to `http://neverssl.com` or `https://github.com` to verify the detection workflow and visual overlay.

---

## 📄 Legal & Documentation

- [Privacy Policy](PRIVACY.md)
- [Terms of Service](TERMS.md)

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 💳 Credits
Huge thanks to [Atanu](https://github.com/atanuroy911) Sir for guiding me throughout the project. I could not have completed it without his constant support, supervision, advice, and guidance.
