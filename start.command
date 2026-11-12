#!/bin/bash
cd "$(dirname "$0")"
echo "Starting UNBLOCKED at http://localhost:3000 (close this window to stop)"
(sleep 1; open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null) &
node server.mjs
