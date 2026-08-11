#!/bin/sh
cat > /usr/share/nginx/html/env-config.js << EOF
window._env_ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}"
};
EOF
