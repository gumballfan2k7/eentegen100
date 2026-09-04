#!/usr/bin/env python3
"""
Simple HTTP Server for Een Tegen 100 - Local Testing
Run this script to test the controller and spectator locally
Then open:
  Controller: http://localhost:8000/public/controller.html
  Spectator:  http://localhost:8000/public/spectator.html
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS and cache headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging
        print(f'[{self.log_date_time_string()}] {format % args}')

if __name__ == '__main__':
    # Change to the script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Create server
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f'🎬 Een Tegen 100 - Local Test Server')
        print(f'📍 Serving on http://localhost:{PORT}')
        print(f'')
        print(f'🎮 Controller: http://localhost:{PORT}/public/controller.html')
        print(f'👥 Spectator:  http://localhost:{PORT}/public/spectator.html')
        print(f'')
        print(f'Press Ctrl+C to stop the server')
        print(f'')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f'\n✋ Server stopped')
