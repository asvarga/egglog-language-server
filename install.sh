#!/bin/bash
# Quick install script for the updated egglog-language-modal extension

set -e

echo "=== Egglog Language Server Installation ==="
echo ""

# Navigate to extension directory
cd "$(dirname "$0")"

# Build language server
echo "Building language server..."
cd egglog-language-server
cargo build --release
cd ..

# Package extension
echo ""
echo "Packaging VS Code extension..."
npx @vscode/vsce package

# Install extension
echo ""
echo "Installing extension..."
code --install-extension egglog-language-modal-*.vsix

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Please reload VS Code:"
echo "  Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)"
echo "  Type 'Developer: Reload Window'"
echo ""
echo "The formatter will now preserve backtick and comma syntax correctly!"
