#!/usr/bin/python3

import json
from urllib.parse import parse_qs
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from os import curdir, sep

hostName = ""
hostPort = 8000

class MyServer(BaseHTTPRequestHandler):

    # set header base
    def _set_headers(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()

    # GET is for getting data.
    def do_GET(self):
        print( "incoming http: ", self.path )
        if self.path=="/":
            self.path="/index.html"

        if self.path.endswith(".html"):
            mimetype='text/html'

        if self.path.endswith(".js"):
            mimetype='application/javascript'

        if self.path.endswith(".css"):
            mimetype='text/css'

        f = open(curdir + self.path)
        self.send_response(200)
        self.send_header('Content-type', mimetype)
        self.end_headers()
        self.wfile.write(f.read().encode())
        f.close()

    # POST is for submitting data.
    def do_POST(self):
        print("incomming http: ", self.path)
        content_length = int(self.headers['Content-length'])
        post_data = json.loads(self.rfile.read(content_length))

        print(post_data)

        self._set_headers()
        try:
            response_dict = {"Success?": "Success!"}
            # self.wfile.write("Successful write".encode())
            self.wfile.write(json.dumps(response_dict).encode())
            print("writing response")
            self.send_response(200)
        except:
            self.wfile.write("FAIL: Unable to write to path".encode())
            self.send_response(500)


def run(handler_class=MyServer):
    http = HTTPServer((hostName, hostPort), handler_class)

    print(f"Starting http server on {hostName}:{hostPort}")
    http.serve_forever()


if __name__ == "__main__":
    run()
