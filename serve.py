"""Local static server for SpeedBench on port 4173 with SPA fallback."""

import argparse
import os
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
DIST_DIR = ROOT_DIR / "dist"
DEFAULT_PORT = 4173


class SpaHandler(SimpleHTTPRequestHandler):
    """HTTP handler with SPA (Single Page Application) routing fallback."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def do_GET(self):
        # Resolve target file path relative to DIST_DIR
        raw_path = self.path.split("?", 1)[0].split("#", 1)[0].lstrip("/")
        target_path = (DIST_DIR / raw_path).resolve()

        # If file doesn't exist and isn't a directory with an index.html, fallback to /index.html
        try:
            target_path.relative_to(DIST_DIR)
            exists = target_path.exists() and (target_path.is_file() or (target_path / "index.html").is_file())
        except ValueError:
            exists = False

        if not exists:
            self.path = "/index.html"

        return super().do_GET()

    def end_headers(self):
        # Disable aggressive caching in local dev so code updates reflect immediately
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format, *args):
        # Clean logging format
        sys.stderr.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}\n")


def main():
    parser = argparse.ArgumentParser(description="Host SpeedBench locally.")
    parser.add_argument(
        "--port",
        type=int,
        default=DEFAULT_PORT,
        help=f"Port to listen on (default: {DEFAULT_PORT})",
    )
    parser.add_argument(
        "--open",
        action="store_true",
        help="Open default browser automatically",
    )
    args = parser.parse_args()

    if not DIST_DIR.exists() or not (DIST_DIR / "index.html").exists():
        print(f"[!] Folder 'dist' belum ditemukan di: {DIST_DIR}")
        print("[!] Silakan jalankan 'npm run build' terlebih dahulu.")
        sys.exit(1)

    host = "127.0.0.1"
    port = args.port
    server_url = f"http://localhost:{port}/?tool=benchmark"

    with ThreadingHTTPServer((host, port), SpaHandler) as httpd:
        print("=" * 50)
        print(" SpeedBench Local Server")
        print("=" * 50)
        print(f" Directory : {DIST_DIR}")
        print(f" URL       : {server_url}")
        print(" Tekan Ctrl+C untuk menghentikan server.")
        print("=" * 50)

        if args.open:
            webbrowser.open(server_url)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")


if __name__ == "__main__":
    main()
