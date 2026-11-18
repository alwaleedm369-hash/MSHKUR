#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 input.gguf output-q4.gguf [quantization-type]" >&2
  exit 2
fi
INPUT="$1"
OUTPUT="$2"
TYPE="${3:-Q4_K_M}"
if [ ! -f "$INPUT" ]; then echo "Input model not found: $INPUT" >&2; exit 2; fi
if ! command -v llama-quantize >/dev/null 2>&1; then
  echo "llama-quantize is not installed. Build/install llama.cpp first." >&2
  exit 2
fi
mkdir -p "$(dirname "$OUTPUT")"
llama-quantize "$INPUT" "$OUTPUT" "$TYPE"
echo "Quantized model written to $OUTPUT"
