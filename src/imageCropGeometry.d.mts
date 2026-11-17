export const MAX_CROP_PIXELS: number;
export type CropRectangle = { x: number; y: number; width: number; height: number };
export function getCenteredCrop(width: number, height: number, targetRatio?: number | null): CropRectangle;
