#!/usr/bin/python3

import json
from urllib.parse import parse_qs
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
import time

hostName = "localhost"
hostPort = 8000

class MyServer(BaseHTTPRequestHandler):

    # set header base
    def _set_headers(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        
    # GET is for getting data.
    def do_GET(self):
        self._set_headers()
        print( "incoming http: ", self.path )
        self.wfile.write(bytes("<p>You accessed path: %s</p>" % self.path, "utf-8"))
        
    # POST is for submitting data.
    def do_POST(self):
        print( "incomming http: ", self.path )
        content_length = int(self.headers['Content-Length'])
        post_data = json.load(self.rfile.read(content_length))

        print(post_data)

        try:
            self.wfile.write(bytes("Successful write: %s", "utf-8"))
            self.send_response(200)
        except:
            self.wfile.write(bytes("<p>FAIL: Unable to write to path: %s</p>" % self.path, "utf-8"))
            self.send_response(500)


def run(handler_class=MyServer):
    http = HTTPServer((hostName, hostPort), handler_class)
    
    print(f"Starting http server on {hostName}:{hostPort}")
    http.serve_forever()


if __name__ == "__main__":
    run()
