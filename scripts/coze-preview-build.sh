#!/usr/bin/env bash
set -euo pipefail

# 纯静态项目，无需构建步骤
# 仅验证入口文件存在
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ ! -f "index.html" ]; then
  echo "ERROR: index.html not found in $PROJECT_DIR" >&2
  exit 1
fi

echo "Static project ready. Entry: index.html"
