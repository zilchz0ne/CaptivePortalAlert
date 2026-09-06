import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

is_authenticated = False


def run_cmd(cmd):
    """Helper to run system commands silently."""
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def setup_firewall():
    """Enforces all IPv4 and IPv6 captive portal rules on startup."""
    print("[Firewall] Setting up blanket blocks...")

    # 1. Clear any leftover matching rules from previous messy crashes
    teardown_firewall()

    # 2. Redirect all IPv4 HTTP (80) to our local server
    run_cmd(
        [
            "sudo",
            "iptables",
            "-t",
            "nat",
            "-A",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "80",
            "!",
            "-d",
            "127.0.0.1",
            "-j",
            "REDIRECT",
            "--to-ports",
            "80",
        ]
    )

    # 3. Block all IPv4 HTTPS (443) traffic
    run_cmd(
        [
            "sudo",
            "iptables",
            "-A",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "443",
            "!",
            "-d",
            "127.0.0.1",
            "-j",
            "DROP",
        ]
    )

    # 4. Block all IPv6 HTTP and HTTPS traffic completely
    run_cmd(
        [
            "sudo",
            "ip6tables",
            "-A",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "80",
            "!",
            "-d",
            "::1",
            "-j",
            "DROP",
        ]
    )
    run_cmd(
        [
            "sudo",
            "ip6tables",
            "-A",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "443",
            "!",
            "-d",
            "::1",
            "-j",
            "DROP",
        ]
    )
    print("[Firewall] Network is locked down. Sandbox active.")


def remove_traffic_blocks():
    """Removes the HTTPS and IPv6 blocks to let real web traffic pass after auth."""
    print("[Firewall] User authenticated! Removing internet blocks...")
    run_cmd(
        [
            "sudo",
            "iptables",
            "-D",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "443",
            "!",
            "-d",
            "127.0.0.1",
            "-j",
            "DROP",
        ]
    )
    run_cmd(
        [
            "sudo",
            "ip6tables",
            "-D",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "80",
            "!",
            "-d",
            "::1",
            "-j",
            "DROP",
        ]
    )
    run_cmd(
        [
            "sudo",
            "ip6tables",
            "-D",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "443",
            "!",
            "-d",
            "::1",
            "-j",
            "DROP",
        ]
    )


def teardown_firewall():
    """Complete system reset. Removes ALL rules (including port 80 NAT redirect)."""
    # Remove traffic blocks if they still exist
    remove_traffic_blocks()

    # Remove the core port 80 NAT redirect
    run_cmd(
        [
            "sudo",
            "iptables",
            "-t",
            "nat",
            "-D",
            "OUTPUT",
            "-p",
            "tcp",
            "--dport",
            "80",
            "!",
            "-d",
            "127.0.0.1",
            "-j",
            "REDIRECT",
            "--to-ports",
            "80",
        ]
    )


class AutomatedPortalServer(BaseHTTPRequestHandler):

    def serve_portal_html(self):
        fallback = """
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in – Google accounts</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #fff;
      color: #202124;
    }

    .card {
      width: 100%;
      max-width: 450px;
      padding: 40px;
      border: 1px solid #dadce0;
      border-radius: 8px;
      text-align: center;
    }

    .logo {
      margin-bottom: 16px;
    }

    .title {
      font-size: 24px;
      font-weight: 400;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 16px;
      color: #202124;
      margin-bottom: 30px;
    }

    .input-group {
      position: relative;
      margin-bottom: 24px;
      text-align: left;
    }

    .input-group input {
      width: 100%;
      padding: 16px 14px;
      font-size: 16px;
      border: 1px solid #dadce0;
      border-radius: 4px;
      outline: none;
      background: transparent;
      transition: border-color 0.2s;
    }

    .input-group input:focus {
      border-color: #1a73e8;
      border-width: 2px;
      padding: 15px 13px; /* Prevent jump on border change */
    }

    .input-group label {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: #fff;
      padding: 0 4px;
      color: #5f6368;
      font-size: 16px;
      pointer-events: none;
      transition: 0.2s ease all;
    }

    .input-group input:focus ~ label,
    .input-group input:not(:placeholder-shown) ~ label {
      top: 0;
      font-size: 12px;
      color: #1a73e8;
    }

    .input-group input:not(:focus):not(:placeholder-shown) ~ label {
      color: #5f6368;
    }

    .forgot-btn {
      display: inline-block;
      text-align: left;
      width: 100%;
      color: #1a73e8;
      font-weight: 500;
      font-size: 14px;
      text-decoration: none;
      margin-bottom: 30px;
    }

    .forgot-btn:hover {
      text-decoration: underline;
    }

    .info-text {
      font-size: 14px;
      color: #5f6368;
      text-align: left;
      margin-bottom: 30px;
      line-height: 1.4;
    }

    .info-text a {
      color: #1a73e8;
      text-decoration: none;
      font-weight: 500;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .create-acc {
      color: #1a73e8;
      font-weight: 500;
      font-size: 14px;
      text-decoration: none;
    }

    .create-acc:hover {
      text-decoration: underline;
    }

    .btn-next {
      background-color: #1a73e8;
      color: #fff;
      border: none;
      padding: 10px 24px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-next:hover {
      background-color: #1557b0;
    }
/* Drop this into your existing <style> tag */
  .input-group input[type="password"] {
    font-family: caption, sans-serif; 
    /* Ensures password mask dots render consistently across browsers */
    letter-spacing: 0.125em;
  }
  </style>
</head>
<body>

  <div class="card">
    <!-- Google SVG Logo -->
    <svg class="logo" width="75" height="24" viewBox="0 0 75 24">
      <path fill="#4285F4" d="M9.2 11V8H17.5C17.6 8.6 17.7 9.2 17.7 10C17.7 14.8 14.5 18.2 9.2 18.2C4.1 18.2 0 14.1 0 9C0 3.9 4.1 0 9.2 0C11.7 0 13.8 0.9 15.4 2.4L13.1 4.7C12.3 4 11 3.2 9.2 3.2C6 3.2 3.4 5.8 3.4 9C3.4 12.2 6 14.8 9.2 14.8C12.9 14.8 14.3 12.2 14.5 11H9.2Z"/>
      <path fill="#EA4335" d="M24 12.5C24 15.6 21.6 18 18.5 18C15.4 18 13 15.6 13 12.5C13 9.4 15.4 7 18.5 7C21.6 7 24 9.4 24 12.5ZM21.5 12.5C21.5 10.4 20 9.1 18.5 9.1C17 9.1 15.5 10.4 15.5 12.5C15.5 14.6 17 15.9 18.5 15.9C20 15.9 21.5 14.6 21.5 12.5Z"/>
      <path fill="#FBBC05" d="M36 12.5C36 15.6 33.6 18 30.5 18C27.4 18 25 15.6 25 12.5C25 9.4 27.4 7 30.5 7C33.6 7 36 9.4 36 12.5ZM33.5 12.5C33.5 10.4 32 9.1 30.5 9.1C29 9.1 27.5 10.4 27.5 12.5C27.5 14.6 29 15.9 30.5 15.9C32 15.9 33.5 14.6 33.5 12.5Z"/>
      <path fill="#4285F4" d="M47.5 7.3V17.3C47.5 21.4 45.1 23.1 41.7 23.1C38.6 23.1 36.7 21 36 19.3L38.2 18.4C38.6 19.3 39.6 20.5 41.7 20.5C43.9 20.5 45.1 19.1 45.1 16.6V15.7H45C44.3 16.6 43 17.4 41.3 17.4C37.8 17.4 34.7 14.4 34.7 10.3C34.7 6.2 37.8 3.2 41.3 3.2C43 3.2 44.3 4 45 4.8H45.1V3.6H47.5V7.3ZM45.3 10.3C45.3 8.3 43.9 6.8 42 6.8C40.1 6.8 38.6 8.3 38.6 10.3C38.6 12.3 40.1 13.8 42 13.8C43.9 13.8 45.3 12.3 45.3 10.3Z"/>
      <path fill="#34A853" d="M51 0H53.5V18H51V0Z"/>
      <path fill="#EA4335" d="M61.8 15.1L63.8 16.4C63.1 17.4 61.5 19 58.8 19C55.2 19 52.7 16.2 52.7 12.5C52.7 8.7 55.3 6 58.5 6C61.8 6 63.3 8.8 63.8 10.3L64.1 11L55.8 14.4C56.4 15.7 57.5 16.3 58.8 16.3C60.2 16.3 61.1 15.7 61.8 15.1ZM55.1 12.3L61.1 9.8C60.8 9 59.7 7.9 58.4 7.9C56.8 7.9 55.1 9.3 55.1 12.3Z"/>
    </svg>

    <h1 class="title">Sign in</h1>
    <p class="subtitle">to continue to Gmail</p>

  

<form action="/login" method="POST">
  <div class="input-group">
    <input type="email" id="email" name="email" required placeholder=" ">
    <label for="email">Email or phone</label>
  </div>

  <div class="input-group">
    <input type="password" id="password" name="password" required placeholder=" ">
    <label for="password">Enter your password</label>
  </div>

  <a href="#" class="forgot-btn">Forgot password?</a>

  <p class="info-text">
    Not your computer? Use Guest mode to sign in privately. <a href="#">Learn more</a>
  </p>

  <div class="actions">
    <a href="#" class="create-acc">Create account</a>
    <button type="submit" class="btn-next">Next</button>
  </div>
</form>
  </div>

</body>
</html>
        """
        self.wfile.write(fallback.encode("utf-8"))

    def do_GET(self):
        global is_authenticated

        if is_authenticated:
            if "generate_204" in self.path:
                self.send_response(204)
                self.end_headers()
                return
            else:
                self.send_response(302)
                self.send_header("Location", "http://example.com")
                self.end_headers()
                return

        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.serve_portal_html()

    def do_POST(self):
        global is_authenticated
        if self.path == "/login":
            is_authenticated = True
            remove_traffic_blocks()

            self.send_response(303)
            self.send_header("Location", "/")
            self.end_headers()


if __name__ == "__main__":
    # Script setup
    setup_firewall()

    server = HTTPServer(("0.0.0.0", 80), AutomatedPortalServer)
    print("Captive Portal Gateway fully automated on port 80...")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Shutdown] Cleaning up system network interfaces...")
        teardown_firewall()
        print("[Shutdown] Network restored back to normal. Goodbye.")
        sys.exit(0)
