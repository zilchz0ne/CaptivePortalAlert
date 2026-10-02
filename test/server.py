import os
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

    teardown_firewall()

    # Redirect all IPv4 HTTP (80) to local server
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

    # Block all IPv4 HTTPS (443) traffic
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

    # Block all IPv6 HTTP and HTTPS traffic
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
    """Removes HTTPS and IPv6 blocks after auth."""
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
    """Complete system reset. Removes ALL rules."""
    remove_traffic_blocks()

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
        script_dir = os.path.dirname(os.path.abspath(__file__))
        html_path = os.path.join(script_dir, "index.html")

        if os.path.exists(html_path):
            with open(html_path, "rb") as f:
                self.wfile.write(f.read())
        else:
            self.wfile.write(b"<h1>404: test/index.html not found</h1>")

    def do_GET(self):
        global is_authenticated

        if is_authenticated:
            if "generate_204" in self.path:
                self.send_response(204)
                self.end_headers()
                return
            else:
                self.send_response(302)
                url = "https://example.com"
                self.send_header("Location", url)
                self.end_headers()
                return

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
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
    setup_firewall()

    server = HTTPServer(("0.0.0.0", 80), AutomatedPortalServer)
    print("Captive Portal Gateway serving index.html on port 80...")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Shutdown] Cleaning up system network interfaces...")
        teardown_firewall()
        print("[Shutdown] Network restored back to normal. Goodbye.")
        sys.exit(0)
