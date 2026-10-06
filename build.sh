#!/bin/sh

set -eu

THEME="${1:-dark}"
BACKGROUND="${2:-spaceslime.jpg}"

case "$THEME" in
  light)
    DEFAULT_ACCENT="rgb(119, 27, 176)"
    ;;
  dark)
    DEFAULT_ACCENT="rgb(146, 72, 235)"
    ;;
  *)
    echo "Usage: $0 [light|dark] [background-url-or-file] [accent-color]" >&2
    exit 1
    ;;
esac

ACCENT="${3:-$DEFAULT_ACCENT}"

gitfolio build groovyrae \
  -f \
  --theme "$THEME" \
  --background "$BACKGROUND" \
  --accent "$ACCENT" \
  --order desc \
  --sort updated