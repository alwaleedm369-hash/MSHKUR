/**
 * MSHKUR/AIBG deterministic image-engine primitives.
 * Coordinates are normalized (0..1); originals are never mutated.
 */
export const DEFAULT_CANVAS = Object.freeze({ width: 1600, height: 1200 });
export const COMMANDS = Object.freeze(["REMOVE/REGION", "KEEP/REGION", "CENTER", "FIT", "WHITE", "TRANSPARENT", "REVIEW"]);

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRect(rect) {
  const x1 = clamp(Math.min(rect.x, rect.x + rect.width), 0, 1);
  const y1 = clamp(Math.min(rect.y, rect.y + rect.height), 0, 1);
  const x2 = clamp(Math.max(rect.x, rect.x + rect.width), 0, 1);
  const y2 = clamp(Math.max(rect.y, rect.y + rect.height), 0, 1);
  if (x2 - x1 <= 0 || y2 - y1 <= 0) throw new Error("Region must have a positive area.");
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

/** Fit an alpha subject inside a fixed canvas without cropping or distorting it. */
export function getCenteredSubjectPlacement(sourceWidth, sourceHeight, bounds, target = DEFAULT_CANVAS, padding = 0.08) {
  if (![sourceWidth, sourceHeight, target.width, target.height].every(v => Number.isFinite(v) && v > 0)) {
    throw new Error("Image dimensions must be positive.");
  }
  const b = {
    x: clamp(bounds.x, 0, sourceWidth),
    y: clamp(bounds.y, 0, sourceHeight),
    width: clamp(bounds.width, 0, sourceWidth),
    height: clamp(bounds.height, 0, sourceHeight),
  };
  if (!b.width || !b.height) throw new Error("No visible subject pixels were found.");
  const inset = clamp(padding, 0, 0.3);
  const maxW = target.width * (1 - inset * 2);
  const maxH = target.height * (1 - inset * 2);
  const scale = Math.min(maxW / b.width, maxH / b.height);
  const width = b.width * scale;
  const height = b.height * scale;
  return {
    canvas: { width: target.width, height: target.height },
    source: { x: b.x, y: b.y, width: b.width, height: b.height },
    destination: { x: (target.width - width) / 2, y: (target.height - height) / 2, width, height },
    scale,
  };
}

/** A deliberately small, auditable command grammar; unsupported syntax is rejected. */
export function parseImageCommand(input) {
  const value = String(input ?? "").trim().toUpperCase();
  if (["CENTER", "FIT", "WHITE", "TRANSPARENT", "REVIEW"].includes(value)) return { action: value };
  const match = /^(REMOVE|KEEP)\/REGION\s+([0-9]*\.?[0-9]+)\s*,\s*([0-9]*\.?[0-9]+)\s*,\s*([0-9]*\.?[0-9]+)\s*,\s*([0-9]*\.?[0-9]+)$/.exec(value);
  if (!match) throw new Error("Unsupported command. Use REMOVE/REGION x,y,w,h or KEEP/REGION x,y,w,h (normalized 0–1).");
  return { action: match[1], region: normalizeRect({ x: Number(match[2]), y: Number(match[3]), width: Number(match[4]), height: Number(match[5]) }) };
}

/** Apply a normalized KEEP/REMOVE rectangle to an RGBA alpha plane in-place. */
export function applyAlphaRegion(alpha, width, height, command) {
  if (!(alpha instanceof Uint8Array) || alpha.length !== width * height) throw new Error("Invalid alpha plane.");
  if (!["KEEP", "REMOVE"].includes(command.action)) throw new Error("Expected KEEP or REMOVE region command.");
  const r = command.region;
  const x0 = clamp(Math.floor(r.x * width), 0, width);
  const y0 = clamp(Math.floor(r.y * height), 0, height);
  const x1 = clamp(Math.ceil((r.x + r.width) * width), 0, width);
  const y1 = clamp(Math.ceil((r.y + r.height) * height), 0, height);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) alpha[y * width + x] = command.action === "REMOVE" ? 0 : 255;
  return alpha;
}

export function inspectAlphaPlane(alpha, width, height, threshold = 12) {
  if (!(alpha instanceof Uint8Array) || alpha.length !== width * height) throw new Error("Invalid alpha plane.");
  let minX = width, minY = height, maxX = -1, maxY = -1, visible = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (alpha[y * width + x] > threshold) {
      visible++; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  if (!visible) return { visiblePixels: 0, bounds: null, touchesEdge: false };
  return { visiblePixels: visible, bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }, touchesEdge: minX === 0 || minY === 0 || maxX === width - 1 || maxY === height - 1 };
}
