#!/usr/bin/env python3
"""Quantize an ONNX model locally using ONNX Runtime. No remote API is called."""
import argparse
from pathlib import Path
from onnxruntime.quantization import quantize_dynamic, QuantType

parser = argparse.ArgumentParser()
parser.add_argument("input", help="Path to source ONNX model")
parser.add_argument("output", help="Path for quantized ONNX model")
parser.add_argument("--type", choices=["qint8", "quint8"], default="qint8")
args = parser.parse_args()

source = Path(args.input).resolve()
target = Path(args.output).resolve()
if not source.is_file():
    raise SystemExit(f"Input model not found: {source}")
if source == target:
    raise SystemExit("Input and output must be different files.")
target.parent.mkdir(parents=True, exist_ok=True)
weight_type = QuantType.QInt8 if args.type == "qint8" else QuantType.QUInt8
quantize_dynamic(str(source), str(target), weight_type=weight_type)
print(f"Quantized model written to {target}")
