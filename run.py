#!/usr/bin/env python

import http.server
import socketserver

Port = 8000

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map['.woff'] = 'font/woff'
Handler.extensions_map['.woff2'] = 'font/woff2'

socketserver.TCPServer.allow_reuse_address=True
httpd = socketserver.TCPServer(("", Port), Handler)

print('Server started')
print("Open your browser at http://localhost:8000/")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass

print('\rServer closed')
httpd.shutdown()
