/**
 * MSHKUR Image Processing Engine
 * Core engine for vehicle image processing with WebGPU/WASM acceleration
 * Implements: Background Removal, Plate Blur, Glass Tint, Lighting, Shadows, Centering, Enhancement, Batch Unify
 */

export interface ImageProcessingOptions {
  // Engine selection
  preferWebGPU?: boolean;
  fallbackToWASM?: boolean;
  fallbackToCPU?: boolean;

  // Quality vs Speed
  quality?: 'fast' | 'balanced' | 'high' | 'ultra';

  // Memory management
  maxMemoryMB?: number;
  tileSize?: number; // For large images

  // Output
  outputFormat?: 'png' | 'jpeg' | 'webp';
  outputQuality?: number; // 0-100

  // Callbacks
  onProgress?: (stage: string, progress: number) => void;
  onStageComplete?: (stage: string, result: unknown) => void;
}

export interface ProcessedImage {
  data: Uint8Array | Blob;
  width: number;
  height: number;
  format: string;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  originalWidth: number;
  originalHeight: number;
  processingTime: number;
  stages: ProcessingStage[];
  colorSpace: string;
  hasAlpha: boolean;
}

export interface ProcessingStage {
  name: string;
  duration: number;
  inputSize: { width: number; height: number };
  outputSize: { width: number; height: number };
  settings: Record<string, unknown>;
}

export interface VehicleDetectionResult {
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  keypoints: VehicleKeypoints;
  licensePlate?: LicensePlateDetection;
  glassRegions: GlassRegion[];
}

export interface VehicleKeypoints {
  frontBumper: { x: number; y: number };
  rearBumper: { x: number; y: number };
  frontWheel: { x: number; y: number };
  rearWheel: { x: number; y: number };
  roofCenter: { x: number; y: number };
  windshieldTop: { x: number; y: number };
  windshieldBottom: { x: number; y: number };
}

export interface LicensePlateDetection {
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  text?: string;
}

export interface GlassRegion {
  type: 'windshield' | 'side_window' | 'rear_window' | 'sunroof';
  polygon: { x: number; y: number }[];
  confidence: number;
}

// Model interfaces
export interface SegmentationModel {
  predict(input: ImageTensor): Promise<SegmentationResult>;
  warmup(): Promise<void>;
  dispose(): void;
}

export interface ImageTensor {
  data: Float32Array;
  width: number;
  height: number;
  channels: number;
}

export interface SegmentationResult {
  mask: Float32Array; // Same dimensions as input, 0-1 values
  classes: string[];
  classMasks: Map<string, Float32Array>;
}

// WebGPU Compute Shader for background removal
const BACKGROUND_REMOVAL_SHADER = `
struct Uniforms {
  resolution: vec2<f32>,
  threshold: f32,
  feather: f32,
  backgroundColor: vec4<f32>,
}

@group(0) @binding(0) var<storage, read> inputTexture: texture_2d<f32>;
@group(0) @binding(1) var<storage, write> outputTexture: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let dims = textureDimensions(inputTexture);
  if (global_id.x >= dims.x || global_id.y >= dims.y) { return; }

  let uv = vec2<f32>(global_id.xy) / uniforms.resolution;
  let color = textureLoad(inputTexture, vec2<i32>(global_id.xy), 0);

  // Simple threshold-based segmentation (replace with actual model)
  let luminance = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));
  let alpha = step(uniforms.threshold, luminance);
  alpha = smoothstep(uniforms.threshold - uniforms.feather, uniforms.threshold + uniforms.feather, luminance);

  let finalColor = vec4<f32>(
    mix(uniforms.backgroundColor.rgb, color.rgb, alpha),
    alpha
  );

  textureStore(outputTexture, vec2<i32>(global_id.xy), finalColor);
}
`;

// WebGPU Engine Class
export class WebGPUEngine {
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipelines: Map<string, GPUComputePipeline> = new Map();
  private buffers: Map<string, GPUBuffer> = new Map();
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (!navigator.gpu) {
      console.warn('WebGPU not supported');
      return false;
    }

    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
      });

      if (!adapter) {
        console.warn('No WebGPU adapter found');
        return false;
      }

      this.device = await adapter.requestDevice({
        requiredFeatures: ['texture-compression-bc', 'shader-f16'],
        requiredLimits: {
          maxStorageBufferBindingSize: 256 * 1024 * 1024, // 256MB
          maxBufferSize: 256 * 1024 * 1024,
        },
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('WebGPU initialization failed:', error);
      return false;
    }
  }

  async createPipeline(shaderCode: string, entryPoint: string): Promise<GPUComputePipeline | null> {
    if (!this.device || !this.isInitialized) return null;

    try {
      const shaderModule = this.device.createShaderModule({ code: shaderCode });
      const pipeline = this.device.createComputePipeline({
        layout: 'auto',
        compute: { module: shaderModule, entryPoint },
      });
      return pipeline;
    } catch (error) {
      console.error('Pipeline creation failed:', error);
      return null;
    }
  }

  async processImage(
    imageData: Uint8Array,
    width: number,
    height: number,
    pipelineName: string,
    uniforms: Record<string, number>
  ): Promise<Uint8Array> {
    if (!this.device || !this.isInitialized) {
      throw new Error('WebGPU engine not initialized');
    }

    const pipeline = this.pipelines.get(pipelineName);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineName}`);
    }

    // Create input texture
    const inputTexture = this.device.createTexture({
      size: [width, height, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST,
    });

    this.device.queue.writeTexture(
      { texture: inputTexture },
      imageData,
      { bytesPerRow: width * 4 },
      { width, height, depthOrArrayLayers: 1 }
    );

    // Create output texture
    const outputTexture = this.device.createTexture({
      size: [width, height, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC,
    });

    // Create uniform buffer
    const uniformBuffer = this.device.createBuffer({
      size: 64, // Enough for our uniforms
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Float32Array(uniformBuffer.getMappedRange()).set([
      width, height,
      uniforms.threshold ?? 0.5,
      uniforms.feather ?? 0.1,
      uniforms.backgroundColor?.r ?? 0,
      uniforms.backgroundColor?.g ?? 0,
      uniforms.backgroundColor?.b ?? 0,
      uniforms.backgroundColor?.a ?? 0,
    ]);
    uniformBuffer.unmap();

    // Create bind group
    const bindGroup = this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: inputTexture.createView() },
        { binding: 1, resource: outputTexture.createView() },
        { binding: 2, resource: { buffer: uniformBuffer } },
      ],
    });

    // Submit compute pass
    const commandEncoder = this.device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, bindGroup);
    const workgroupCountX = Math.ceil(width / 16);
    const workgroupCountY = Math.ceil(height / 16);
    computePass.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    computePass.end();

    // Read back result
    const readbackBuffer = this.device.createBuffer({
      size: width * height * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    commandEncoder.copyTextureToBuffer(
      { texture: outputTexture },
      { buffer: readbackBuffer, bytesPerRow: width * 4 },
      { width, height, depthOrArrayLayers: 1 }
    );

    this.device.queue.submit([commandEncoder.finish()]);
    await readbackBuffer.mapAsync(GPUMapMode.READ);

    const result = new Uint8Array(readbackBuffer.getMappedRange().slice(0));
    readbackBuffer.unmap();

    // Cleanup
    inputTexture.destroy();
    outputTexture.destroy();
    uniformBuffer.destroy();
    readbackBuffer.destroy();

    return result;
  }

  dispose(): void {
    for (const pipeline of this.pipelines.values()) {
      // Pipelines don't have explicit dispose in WebGPU
    }
    this.pipelines.clear();

    for (const buffer of this.buffers.values()) {
      buffer.destroy();
    }
    this.buffers.clear();

    if (this.device) {
      this.device.destroy();
      this.device = null;
    }
    this.isInitialized = false;
  }
}

// WASM Engine (using TensorFlow.js or ONNX Runtime Web)
export class WASMEngine {
  private models: Map<string, any> = new Map();
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      // Load TensorFlow.js or ONNX Runtime Web
      // For now, return true as placeholder
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('WASM engine initialization failed:', error);
      return false;
    }
  }

  async loadModel(modelName: string, modelUrl: string): Promise<void> {
    // Load model from URL or IndexedDB cache
    // Placeholder for actual implementation
  }

  async predict(modelName: string, input: ImageTensor): Promise<any> {
    // Run inference
    // Placeholder for actual implementation
    return { mask: new Float32Array(input.width * input.height) };
  }

  dispose(): void {
    for (const model of this.models.values()) {
      if (model?.dispose) model.dispose();
    }
    this.models.clear();
    this.isInitialized = false;
  }
}

// CPU Fallback Engine (JavaScript implementations)
export class CPUEngine {
  private isInitialized = true;

  async initialize(): Promise<boolean> {
    return true;
  }

  // Simple threshold-based background removal (fallback)
  async removeBackground(
    imageData: Uint8Array,
    width: number,
    height: number,
    options: { threshold: number; feather: number; backgroundColor: number[] }
  ): Promise<Uint8Array> {
    const output = new Uint8Array(imageData.length);
    const { threshold, feather, backgroundColor } = options;

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      // Simple luminance-based segmentation
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      let alpha = luminance > threshold ? 1 : 0;

      // Feather edges
      if (feather > 0) {
        const dist = Math.abs(luminance - threshold);
        if (dist < feather) {
          alpha = 0.5 + 0.5 * Math.sin((dist / feather - 0.5) * Math.PI);
        }
      }

      // Apply background color with alpha blending
      output[i] = Math.round(backgroundColor[0] * (1 - alpha) + r * alpha);
      output[i + 1] = Math.round(backgroundColor[1] * (1 - alpha) + g * alpha);
      output[i + 2] = Math.round(backgroundColor[2] * (1 - alpha) + b * alpha);
      output[i + 3] = Math.round(255 * alpha);
    }

    return output;
  }

  // License plate blur (simple rectangle blur)
  async blurLicensePlate(
    imageData: Uint8Array,
    width: number,
    height: number,
    box: { x: number; y: number; width: number; height: number },
    intensity: number = 0.9
  ): Promise<Uint8Array> {
    const output = new Uint8Array(imageData);
    const { x, y, width: w, height: h } = box;

    // Simple box blur
    const kernelSize = Math.max(3, Math.floor(Math.max(w, h) * 0.1) | 1);

    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        let r = 0, g = 0, b = 0, count = 0;

        for (let ky = -kernelSize; ky <= kernelSize; ky++) {
          for (let kx = -kernelSize; kx <= kernelSize; kx++) {
            const sx = Math.max(x, Math.min(x + w - 1, px + kx));
            const sy = Math.max(y, Math.min(y + h - 1, py + ky));
            const idx = (sy * width + sx) * 4;
            r += imageData[idx];
            g += imageData[idx + 1];
            b += imageData[idx + 2];
            count++;
          }
        }

        const idx = (py * width + px) * 4;
        const blurR = r / count;
        const blurG = g / count;
        const blurB = b / count;

        output[idx] = Math.round(imageData[idx] * (1 - intensity) + blurR * intensity);
        output[idx + 1] = Math.round(imageData[idx + 1] * (1 - intensity) + blurG * intensity);
        output[idx + 2] = Math.round(imageData[idx + 2] * (1 - intensity) + blurB * intensity);
      }
    }

    return output;
  }

  // Glass tinting
  async tintGlass(
    imageData: Uint8Array,
    width: number,
    height: number,
    regions: { polygon: { x: number; y: number }[] }[],
    tintColor: number[],
    intensity: number
  ): Promise<Uint8Array> {
    const output = new Uint8Array(imageData);

    // Point in polygon test
    function pointInPolygon(px: number, py: number, polygon: { x: number; y: number }[]): boolean {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      return inside;
    }

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const idx = (py * width + px) * 4;

        for (const region of regions) {
          if (pointInPolygon(px, py, region.polygon)) {
            const r = imageData[idx];
            const g = imageData[idx + 1];
            const b = imageData[idx + 2];

            output[idx] = Math.round(r * (1 - intensity) + tintColor[0] * intensity);
            output[idx + 1] = Math.round(g * (1 - intensity) + tintColor[1] * intensity);
            output[idx + 2] = Math.round(b * (1 - intensity) + tintColor[2] * intensity);
            break;
          }
        }
      }
    }

    return output;
  }

  // Lighting enhancement (basic curves)
  async enhanceLighting(
    imageData: Uint8Array,
    width: number,
    height: number,
    options: {
      exposure: number;
      contrast: number;
      highlights: number;
      shadows: number;
      saturation: number;
    }
  ): Promise<Uint8Array> {
    const output = new Uint8Array(imageData);
    const { exposure, contrast, highlights, shadows, saturation } = options;

    for (let i = 0; i < imageData.length; i += 4) {
      let r = imageData[i] / 255;
      let g = imageData[i + 1] / 255;
      let b = imageData[i + 2] / 255;

      // Exposure
      r *= Math.pow(2, exposure);
      g *= Math.pow(2, exposure);
      b *= Math.pow(2, exposure);

      // Contrast
      const contrastFactor = (contrast + 1) / (1 - contrast);
      r = (r - 0.5) * contrastFactor + 0.5;
      g = (g - 0.5) * contrastFactor + 0.5;
      b = (b - 0.5) * contrastFactor + 0.5;

      // Highlights/Shadows
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luminance > 0.5) {
        // Highlights
        const factor = 1 + highlights * (1 - luminance) * 2;
        r = Math.min(1, r * factor);
        g = Math.min(1, g * factor);
        b = Math.min(1, b * factor);
      } else {
        // Shadows
        const factor = 1 + shadows * luminance * 2;
        r = Math.min(1, r * factor);
        g = Math.min(1, g * factor);
        b = Math.min(1, b * factor);
      }

      // Saturation
      if (saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * (1 + saturation);
        g = gray + (g - gray) * (1 + saturation);
        b = gray + (b - gray) * (1 + saturation);
      }

      // Clamp and convert back
      output[i] = Math.round(Math.max(0, Math.min(1, r)) * 255);
      output[i + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
      output[i + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
      output[i + 3] = imageData[i + 3];
    }

    return output;
  }

  // Shadow generation (simple drop shadow)
  async generateShadow(
    imageData: Uint8Array,
    width: number,
    height: number,
    vehicleMask: Uint8Array,
    options: {
      intensity: number;
      direction: number; // degrees
      softness: number;
      distance: number;
    }
  ): Promise<Uint8Array> {
    const output = new Uint8Array(imageData);
    const { intensity, direction, softness, distance } = options;

    // Convert direction to offset
    const rad = (direction * Math.PI) / 180;
    const offsetX = Math.round(Math.cos(rad) * distance * Math.max(width, height));
    const offsetY = Math.round(Math.sin(rad) * distance * Math.max(width, height));

    // Create shadow from mask
    const shadow = new Float32Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (vehicleMask[idx] > 0.5) {
          const sx = x + offsetX;
          const sy = y + offsetY;
          if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
            shadow[sy * width + sx] = Math.max(shadow[sy * width + sx], vehicleMask[idx] * intensity);
          }
        }
      }
    }

    // Blur shadow (box blur approximation)
    const kernelSize = Math.max(1, Math.floor(softness * 20));
    const blurred = new Float32Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0, count = 0;
        for (let ky = -kernelSize; ky <= kernelSize; ky++) {
          for (let kx = -kernelSize; kx <= kernelSize; kx++) {
            const sx = x + kx;
            const sy = y + ky;
            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
              sum += shadow[sy * width + sx];
              count++;
            }
          }
        }
        blurred[y * width + x] = sum / count;
      }
    }

    // Composite shadow onto image
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const shadowAlpha = blurred[y * width + x];
        if (shadowAlpha > 0) {
          output[idx] = Math.round(output[idx] * (1 - shadowAlpha));
          output[idx + 1] = Math.round(output[idx + 1] * (1 - shadowAlpha));
          output[idx + 2] = Math.round(output[idx + 2] * (1 - shadowAlpha));
        }
      }
    }

    return output;
  }

  // Centering and cropping
  async centerAndCrop(
    imageData: Uint8Array,
    width: number,
    height: number,
    vehicleBox: { x: number; y: number; width: number; height: number },
    options: {
      aspectRatio: string; // "4:3", "16:9", "1:1", etc.
      padding: number; // 0-0.5
      outputWidth?: number;
      outputHeight?: number;
    }
  ): Promise<{ data: Uint8Array; width: number; height: number }> {
    const [arW, arH] = options.aspectRatio.split(':').map(Number);
    const targetAR = arW / arH;

    const vehicleCenterX = vehicleBox.x + vehicleBox.width / 2;
    const vehicleCenterY = vehicleBox.y + vehicleBox.height / 2;

    // Calculate crop box
    let cropW, cropH;
    if (width / height > targetAR) {
      cropH = height;
      cropW = height * targetAR;
    } else {
      cropW = width;
      cropH = width / targetAR;
    }

    // Add padding
    cropW *= (1 + options.padding);
    cropH *= (1 + options.padding);

    // Center on vehicle
    let cropX = Math.round(vehicleCenterX - cropW / 2);
    let cropY = Math.round(vehicleCenterY - cropH / 2);

    // Clamp to image bounds
    cropX = Math.max(0, Math.min(width - cropW, cropX));
    cropY = Math.max(0, Math.min(height - cropH, cropY));
    cropW = Math.min(cropW, width - cropX);
    cropH = Math.min(cropH, height - cropY);

    // Extract crop
    const croppedData = new Uint8Array(cropW * cropH * 4);
    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const srcIdx = ((cropY + y) * width + (cropX + x)) * 4;
        const dstIdx = (y * cropW + x) * 4;
        croppedData[dstIdx] = imageData[srcIdx];
        croppedData[dstIdx + 1] = imageData[srcIdx + 1];
        croppedData[dstIdx + 2] = imageData[srcIdx + 2];
        croppedData[dstIdx + 3] = imageData[srcIdx + 3];
      }
    }

    // Resize if output dimensions specified
    if (options.outputWidth && options.outputHeight) {
      return this.resize(croppedData, cropW, cropH, options.outputWidth, options.outputHeight);
    }

    return { data: croppedData, width: cropW, height: cropH };
  }

  // Simple bilinear resize
  private resize(
    data: Uint8Array,
    srcW: number,
    srcH: number,
    dstW: number,
    dstH: number
  ): { data: Uint8Array; width: number; height: number } {
    const output = new Uint8Array(dstW * dstH * 4);
    const xRatio = srcW / dstW;
    const yRatio = srcH / dstH;

    for (let y = 0; y < dstH; y++) {
      for (let x = 0; x < dstW; x++) {
        const srcX = x * xRatio;
        const srcY = y * yRatio;
        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = Math.min(x0 + 1, srcW - 1);
        const y1 = Math.min(y0 + 1, srcH - 1);
        const dx = srcX - x0;
        const dy = srcY - y0;

        const idx = (y * dstW + x) * 4;

        for (let c = 0; c < 3; c++) {
          const v00 = data[(y0 * srcW + x0) * 4 + c];
          const v01 = data[(y0 * srcW + x1) * 4 + c];
          const v10 = data[(y1 * srcW + x0) * 4 + c];
          const v11 = data[(y1 * srcW + x1) * 4 + c];

          const v0 = v00 * (1 - dx) + v01 * dx;
          const v1 = v10 * (1 - dx) + v11 * dx;
          const val = v0 * (1 - dy) + v1 * dy;

          output[idx + c] = Math.round(Math.max(0, Math.min(255, val)));
        }
        output[idx + 3] = 255;
      }
    }

    return { data: output, width: dstW, height: dstH };
  }

  // Image enhancement (sharpen, denoise, clarity)
  async enhanceImage(
    imageData: Uint8Array,
    width: number,
    height: number,
    options: {
      sharpen: number;
      denoise: number;
      clarity: number;
      vibrance: number;
    }
  ): Promise<Uint8Array> {
    let current = new Uint8Array(imageData);

    // Denoise (simple median filter approximation)
    if (options.denoise > 0) {
      current = this.denoise(current, width, height, options.denoise);
    }

    // Sharpen (unsharp mask)
    if (options.sharpen > 0) {
      current = this.sharpen(current, width, height, options.sharpen);
    }

    // Clarity (local contrast)
    if (options.clarity > 0) {
      current = this.clarity(current, width, height, options.clarity);
    }

    // Vibrance
    if (options.vibrance !== 0) {
      current = this.vibrance(current, width, height, options.vibrance);
    }

    return current;
  }

  private denoise(data: Uint8Array, width: number, height: number, strength: number): Uint8Array {
    const output = new Uint8Array(data);
    const radius = Math.max(1, Math.floor(strength * 3));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        let r = 0, g = 0, b = 0, count = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const sx = Math.max(0, Math.min(width - 1, x + kx));
            const sy = Math.max(0, Math.min(height - 1, y + ky));
            const sIdx = (sy * width + sx) * 4;
            r += data[sIdx];
            g += data[sIdx + 1];
            b += data[sIdx + 2];
            count++;
          }
        }

        output[idx] = Math.round(data[idx] * (1 - strength) + (r / count) * strength);
        output[idx + 1] = Math.round(data[idx + 1] * (1 - strength) + (g / count) * strength);
        output[idx + 2] = Math.round(data[idx + 2] * (1 - strength) + (b / count) * strength);
      }
    }

    return output;
  }

  private sharpen(data: Uint8Array, width: number, height: number, strength: number): Uint8Array {
    // Unsharp mask: blurred - original
    const blurred = this.gaussianBlur(data, width, height, 1.5);
    const output = new Uint8Array(data);

    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const diff = data[i + c] - blurred[i + c];
        output[i + c] = Math.max(0, Math.min(255, data[i + c] + diff * strength * 2));
      }
    }

    return output;
  }

  private gaussianBlur(data: Uint8Array, width: number, height: number, sigma: number): Uint8Array {
    const radius = Math.ceil(sigma * 3);
    const kernel = this.createGaussianKernel(radius, sigma);

    // Horizontal pass
    const horizontal = new Uint8Array(data.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        for (let k = -radius; k <= radius; k++) {
          const sx = Math.max(0, Math.min(width - 1, x + k));
          const weight = kernel[k + radius];
          const idx = (y * width + sx) * 4;
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
        const outIdx = (y * width + x) * 4;
        horizontal[outIdx] = r;
        horizontal[outIdx + 1] = g;
        horizontal[outIdx + 2] = b;
        horizontal[outIdx + 3] = 255;
      }
    }

    // Vertical pass
    const output = new Uint8Array(data.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        for (let k = -radius; k <= radius; k++) {
          const sy = Math.max(0, Math.min(height - 1, y + k));
          const weight = kernel[k + radius];
          const idx = (sy * width + x) * 4;
          r += horizontal[idx] * weight;
          g += horizontal[idx + 1] * weight;
          b += horizontal[idx + 2] * weight;
        }
        const outIdx = (y * width + x) * 4;
        output[outIdx] = r;
        output[outIdx + 1] = g;
        output[outIdx + 2] = b;
        output[outIdx + 3] = 255;
      }
    }

    return output;
  }

  private createGaussianKernel(radius: number, sigma: number): Float32Array {
    const kernel = new Float32Array(radius * 2 + 1);
    let sum = 0;
    for (let i = 0; i < kernel.length; i++) {
      const x = i - radius;
      kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
      sum += kernel[i];
    }
    // Normalize
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= sum;
    }
    return kernel;
  }

  private clarity(data: Uint8Array, width: number, height: number, strength: number): Uint8Array {
    // Local contrast enhancement using large-radius unsharp mask
    const blurred = this.gaussianBlur(data, width, height, Math.max(5, strength * 20));
    const output = new Uint8Array(data);

    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const diff = data[i + c] - blurred[i + c];
        output[i + c] = Math.max(0, Math.min(255, data[i + c] + diff * strength));
      }
    }

    return output;
  }

  private vibrance(data: Uint8Array, width: number, height: number, amount: number): Uint8Array {
    const output = new Uint8Array(data);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;

      // Vibrance affects less saturated pixels more
      const vibranceFactor = amount * (1 - saturation);

      if (vibranceFactor !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        output[i] = Math.round(Math.max(0, Math.min(255, (gray + (r - gray) * (1 + vibranceFactor)) * 255)));
        output[i + 1] = Math.round(Math.max(0, Math.min(255, (gray + (g - gray) * (1 + vibranceFactor)) * 255)));
        output[i + 2] = Math.round(Math.max(0, Math.min(255, (gray + (b - gray) * (1 + vibranceFactor)) * 255)));
      }
    }

    return output;
  }

  dispose(): void {
    // No resources to dispose for CPU engine
  }
}

// Main Image Processing Engine Coordinator
export class ImageProcessingEngine {
  private webgpuEngine: WebGPUEngine;
  private wasmEngine: WASMEngine;
  private cpuEngine: CPUEngine;
  private currentEngine: 'webgpu' | 'wasm' | 'cpu' = 'cpu';
  private options: ImageProcessingOptions;

  constructor(options: ImageProcessingOptions = {}) {
    this.options = {
      preferWebGPU: true,
      fallbackToWASM: true,
      fallbackToCPU: true,
      quality: 'balanced',
      maxMemoryMB: 512,
      tileSize: 1024,
      outputFormat: 'png',
      outputQuality: 95,
      ...options,
    };

    this.webgpuEngine = new WebGPUEngine();
    this.wasmEngine = new WASMEngine();
    this.cpuEngine = new CPUEngine();
  }

  async initialize(): Promise<void> {
    // Try WebGPU first
    if (this.options.preferWebGPU) {
      const webgpuReady = await this.webgpuEngine.initialize();
      if (webgpuReady) {
        this.currentEngine = 'webgpu';
        console.log('Using WebGPU engine');
        return;
      }
    }

    // Try WASM
    if (this.options.fallbackToWASM) {
      const wasmReady = await this.wasmEngine.initialize();
      if (wasmReady) {
        this.currentEngine = 'wasm';
        console.log('Using WASM engine');
        return;
      }
    }

    // Fallback to CPU
    if (this.options.fallbackToCPU) {
      await this.cpuEngine.initialize();
      this.currentEngine = 'cpu';
      console.log('Using CPU engine');
      return;
    }

    throw new Error('No image processing engine available');
  }

  getCurrentEngine(): string {
    return this.currentEngine;
  }

  // High-level processing methods
  async removeBackground(
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: {
      model?: 'fast' | 'high-quality' | 'car-optimized';
      edgeRefinement?: number;
      backgroundType?: 'transparent' | 'white' | 'studio' | 'outdoor' | 'custom';
      backgroundValue?: string;
      preserveDetails?: boolean;
    } = {}
  ): Promise<ProcessedImage> {
    const startTime = Date.now();

    // Detect vehicle first
    const vehicleDetection = await this.detectVehicle(imageData, width, height);

    // Determine background color
    let backgroundColor = [255, 255, 255, 0]; // Transparent default
    if (settings.backgroundType === 'white') backgroundColor = [255, 255, 255, 255];
    else if (settings.backgroundType === 'custom' && settings.backgroundValue) {
      const hex = settings.backgroundValue.replace('#', '');
      backgroundColor = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        255,
      ];
    }

    let result: Uint8Array;

    if (this.currentEngine === 'webgpu') {
      // Use WebGPU engine
      result = await this.webgpuEngine.processImage(
        imageData, width, height, 'background-removal',
        {
          threshold: 0.5,
          feather: settings.edgeRefinement ?? 0.1,
          backgroundColor: { r: backgroundColor[0]/255, g: backgroundColor[1]/255, b: backgroundColor[2]/255, a: backgroundColor[3]/255 },
        }
      );
    } else if (this.currentEngine === 'wasm') {
      // Use WASM engine
      result = await this.wasmEngine.predict('background-removal', { data: new Float32Array(imageData), width, height, channels: 4 });
      result = new Uint8Array(result.mask.buffer);
    } else {
      // Use CPU engine
      result = await this.cpuEngine.removeBackground(imageData, width, height, {
        threshold: 0.5,
        feather: settings.edgeRefinement ?? 0.1,
        backgroundColor: backgroundColor.slice(0, 3) as [number, number, number],
      });
    }

    return {
      data: result,
      width,
      height,
      format: this.options.outputFormat ?? 'png',
      metadata: {
        originalWidth: width,
        originalHeight: height,
        processingTime: Date.now() - startTime,
        stages: [{
          name: 'background-removal',
          duration: Date.now() - startTime,
          inputSize: { width, height },
          outputSize: { width, height },
          settings,
        }],
        colorSpace: 'sRGB',
        hasAlpha: settings.backgroundType === 'transparent',
      },
    };
  }

  async blurLicensePlate(
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: {
      autoDetect?: boolean;
      blurIntensity?: number;
      blurType?: 'pixelate' | 'gaussian' | 'solid';
      customRegion?: { x: number; y: number; width: number; height: number } | null;
    } = {}
  ): Promise<ProcessedImage> {
    const startTime = Date.now();

    let regions: { x: number; y: number; width: number; height: number }[] = [];

    if (settings.autoDetect) {
      const detection = await this.detectVehicle(imageData, width, height);
      if (detection.licensePlate) {
        regions.push(detection.licensePlate.boundingBox);
      }
    }

    if (settings.customRegion) {
      regions.push(settings.customRegion);
    }

    let result = new Uint8Array(imageData);

    for (const region of regions) {
      if (this.currentEngine === 'cpu' || this.currentEngine === 'wasm') {
        result = await this.cpuEngine.blurLicensePlate(result, width, height, region, settings.blurIntensity ?? 0.9);
      } else {
        // WebGPU implementation would go here
        result = await this.cpuEngine.blurLicensePlate(result, width, height, region, settings.blurIntensity ?? 0.9);
      }
    }

    return {
      data: result,
      width,
      height,
      format: this.options.outputFormat ?? 'png',
      metadata: {
        originalWidth: width,
        originalHeight: height,
        processingTime: Date.now() - startTime,
        stages: [{
          name: 'license-plate-blur',
          duration: Date.now() - startTime,
          inputSize: { width, height },
          outputSize: { width, height },
          settings,
        }],
        colorSpace: 'sRGB',
        hasAlpha: true,
      },
    };
  }

  async tintGlass(
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: {
      tintLevel?: number;
      tintColor?: string;
      preserveReflections?: boolean;
      autoDetectGlass?: boolean;
    } = {}
  ): Promise<ProcessedImage> {
    const startTime = Date.now();

    const detection = await this.detectVehicle(imageData, width, height);
    const glassRegions = detection.glassRegions;

    const tintColor = settings.tintColor
      ? settings.tintColor.replace('#', '').match(/.{2}/g)!.map(h => parseInt(h, 16))
      : [26, 26, 46]; // Default dark blue

    let result: Uint8Array;

    if (this.currentEngine === 'cpu' || this.currentEngine === 'wasm') {
      result = await this.cpuEngine.tintGlass(
        imageData, width, height,
        glassRegions.map(r => ({ polygon: r.polygon })),
        tintColor,
        settings.tintLevel ?? 0.6
      );
    } else {
      result = await this.cpuEngine.tintGlass(
        imageData, width, height,
        glassRegions.map(r => ({ polygon: r.polygon })),
        tintColor,
        settings.tintLevel ?? 0.6
      );
    }

    return {
      data: result,
      width,
      height,
      format: this.options.outputFormat ?? 'png',
      metadata: {
        originalWidth: width,
        originalHeight: height,
        processingTime: Date.now() - startTime,
        stages: [{
          name: 'glass-tinting',
          duration: Date.now() - startTime,
          inputSize: { width, height },
          outputSize: { width, height },
          settings,
        }],
        colorSpace: 'sRGB',
        hasAlpha: true,
      },
    };
  }

  async enhanceLighting(
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: {
      exposure?: number;
      contrast?: number;
      highlights?: number;
      shadows?: number;
      whites?: number;
      blacks?: number;
      autoBalance?: boolean;
      removeHarshShadows?: boolean;
    } = {}
  ): Promise<ProcessedImage> {
    const startTime = Date.now();

    let result: Uint8Array;

    if (this.currentEngine === 'cpu' || this.currentEngine === 'wasm') {
      result = await this.cpuEngine.enhanceLighting(imageData, width, height, {
        exposure: settings.exposure ?? 0,
        contrast: settings.contrast ?? 0,
        highlights: settings.highlights ?? 0,
        shadows: settings.shadows ?? 0,
        saturation: 0,
      });
    } else {
      result = await this.cpuEngine.enhanceLighting(imageData, width, height, {
        exposure: settings.exposure ?? 0,
        contrast: settings.contrast ?? 0,
        highlights: settings.highlights ?? 0,
        shadows: settings.shadows ?? 0,
        saturation: 0,
      });
    }

    return {
      data: result,
      width,
      height,
      format: this.options.outputFormat ?? 'png',
      metadata: {
        originalWidth: width,
        originalHeight: height,
        processingTime: Date.now() - startTime,
        stages: [{
          name: 'lighting-enhancement',
          duration: Date.now() - startTime,
          inputSize: { width, height },
          outputSize: { width, height },
          settings,
        }],
        colorSpace: 'sRGB',
        hasAlpha: true,
      },
    };
  }

  async generateShadow(
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: {
      intensity?: number;
      direction?: number;
      softness?: number;
      distance?: number;
      perspective?: boolean;
      contactPoint?: 'auto' | 'front' | 'rear' | 'center';
    } = {}
  ): Promise<ProcessedImage> {
    const startTime = Date.now();

    const detection = await this.detectVehicle(imageData, width, height);

    // Create vehicle mask from bounding box
    const vehicleMask = new Uint8Array(width * height);
    const box = detection.boundingBox;
    for (let y = box.y; y < box.y + box.height; y++) {
      for (let x = box.x; x < box.x + box.width; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          vehicleMask[y * width + x] = 1;
        }
      }
    }

    let result: Uint8Array;

    if (this.currentEngine === 'cpu' || this.currentEngine === 'wasm') {
      result = await this.cpuEngine.generateShadow(imageData, width, height, vehicleMask, {
        intensity: settings.intensity ?? 0.5,
        direction: settings.direction ?? 270,
        softness: settings.softness ?? 0.7,
        distance: settings.distance ?? 0.3,
      });
    } else {
      result = await this.cpuEngine.generateShadow(imageData, width, height, vehicleMask, {
        intensity: settings.intensity ?? 0.5,
        direction: settings.direction ?? 270,
        softness: settings.softness ?? 0.7,
        distance: settings.distance ?? 0.3,
      });
    }

    return {
      data: result,
      width,
      height,
      format: this.options.outputFormat ?? 'png',
      metadata: {
        originalWidth: width,
        originalHeight: height,
        processingTime: Date.now() - startTime,
        stages: [{
          name: 'shadow-generation',
          duration: Date.now() - startTime,
          inputSize: { width, height },
          outputSize: { width, height },
          settings,
        }],
        colorSpace: 'sRGB',
        hasAlpha: true,
      },
    };
  }

  async centerAndCrop(
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: {
      mode?: 'auto' | 'manual' | 'batch';
      aspectRatio?: string;
      padding?: number;
      centerOn?: 'vehicle' | 'center';
      outputSizes?: string[];
      maintainResolution?: boolean;
    } = {}
  ): Promise<ProcessedImage[]> {
    const startTime = Date.now();

    const detection = await this.detectVehicle(imageData, width, height);

    const results: ProcessedImage[] = [];
    const outputSizes = settings.outputSizes ?? ['1200x900', '1920x1080', '1080x1080', '1080x1350'];

    for (const sizeStr of outputSizes) {
      const [outW, outH] = sizeStr.split('x').map(Number);

      const cropResult = await this.cpuEngine.centerAndCrop(imageData, width, height, detection.boundingBox, {
        aspectRatio: settings.aspectRatio ?? '4:3',
        padding: settings.padding ?? 0.1,
        outputWidth: outW,
        outputHeight: outH,
      });

      results.push({
        data: cropResult.data,
        width: cropResult.width,
        height: cropResult.height,
        format: this.options.outputFormat ?? 'png',
        metadata: {
          originalWidth: width,
          originalHeight: height,
          processingTime: Date.now() - startTime,
          stages: [{
            name: 'centering-crop',
            duration: Date.now() - startTime,
            inputSize: { width, height },
            outputSize: { width: cropResult.width, height: cropResult.height },
            settings: { ...settings, outputSize: sizeStr },
          }],
          colorSpace: 'sRGB',
          hasAlpha: true,
        },
      });
    }

    return results;
  }

  async enhanceImage(
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: {
      sharpen?: number;
      denoise?: number;
      clarity?: number;
      vibrance?: number;
      saturation?: number;
      hdr?: boolean;
      preserveNaturalLook?: boolean;
    } = {}
  ): Promise<ProcessedImage> {
    const startTime = Date.now();

    let result: Uint8Array;

    if (this.currentEngine === 'cpu' || this.currentEngine === 'wasm') {
      result = await this.cpuEngine.enhanceImage(imageData, width, height, {
        sharpen: settings.sharpen ?? 0.3,
        denoise: settings.denoise ?? 0.2,
        clarity: settings.clarity ?? 0.15,
        vibrance: settings.vibrance ?? 0.1,
      });
    } else {
      result = await this.cpuEngine.enhanceImage(imageData, width, height, {
        sharpen: settings.sharpen ?? 0.3,
        denoise: settings.denoise ?? 0.2,
        clarity: settings.clarity ?? 0.15,
        vibrance: settings.vibrance ?? 0.1,
      });
    }

    return {
      data: result,
      width,
      height,
      format: this.options.outputFormat ?? 'png',
      metadata: {
        originalWidth: width,
        originalHeight: height,
        processingTime: Date.now() - startTime,
        stages: [{
          name: 'image-enhancement',
          duration: Date.now() - startTime,
          inputSize: { width, height },
          outputSize: { width, height },
          settings,
        }],
        colorSpace: 'sRGB',
        hasAlpha: true,
      },
    };
  }

  async batchUnify(
    images: Uint8Array[],
    widths: number[],
    heights: number[],
    settings: {
      unifyBackground?: boolean;
      unifyLighting?: boolean;
      unifyDimensions?: boolean;
      referenceIndex?: number;
    } = {}
  ): Promise<ProcessedImage[]> {
    const startTime = Date.now();

    // Use reference image for settings
    const refIndex = settings.referenceIndex ?? 0;
    const refWidth = widths[refIndex];
    const refHeight = heights[refIndex];
    const refImage = images[refIndex];

    // Process reference image first to establish baseline
    if (settings.unifyLighting) {
      // Analyze reference lighting
    }

    const results: ProcessedImage[] = [];

    for (let i = 0; i < images.length; i++) {
      let currentImage = images[i];
      let currentWidth = widths[i];
      let currentHeight = heights[i];

      // Apply unification steps
      if (settings.unifyBackground) {
        // Remove background and apply same background
        const processed = await this.removeBackground(currentImage, currentWidth, currentHeight, {
          backgroundType: 'white',
        });
        currentImage = processed.data as Uint8Array;
        currentWidth = processed.width;
        currentHeight = processed.height;
      }

      if (settings.unifyLighting) {
        // Match lighting to reference
        const processed = await this.enhanceLighting(currentImage, currentWidth, currentHeight, {
          autoBalance: true,
        });
        currentImage = processed.data as Uint8Array;
        currentWidth = processed.width;
        currentHeight = processed.height;
      }

      if (settings.unifyDimensions) {
        // Resize to match reference aspect ratio
        const targetAR = refWidth / refHeight;
        const currentAR = currentWidth / currentHeight;
        if (Math.abs(currentAR - targetAR) > 0.01) {
          const processed = await this.centerAndCrop(currentImage, currentWidth, currentHeight, {
            aspectRatio: `${refWidth}:${refHeight}`,
            padding: 0.1,
          });
          currentImage = processed[0].data as Uint8Array;
          currentWidth = processed[0].width;
          currentHeight = processed[0].height;
        }
      }

      results.push({
        data: currentImage,
        width: currentWidth,
        height: currentHeight,
        format: this.options.outputFormat ?? 'png',
        metadata: {
          originalWidth: widths[i],
          originalHeight: heights[i],
          processingTime: Date.now() - startTime,
          stages: [{
            name: 'batch-unify',
            duration: Date.now() - startTime,
            inputSize: { width: widths[i], height: heights[i] },
            outputSize: { width: currentWidth, height: currentHeight },
            settings: { ...settings, imageIndex: i },
          }],
          colorSpace: 'sRGB',
          hasAlpha: true,
        },
      });
    }

    return results;
  }

  // Vehicle detection (simplified - in production use a real model)
  private async detectVehicle(
    imageData: Uint8Array,
    width: number,
    height: number
  ): Promise<VehicleDetectionResult> {
    // Placeholder: return center region as vehicle
    // In production, use a proper object detection model (YOLO, SSD, etc.)
    const vehicleW = Math.floor(width * 0.8);
    const vehicleH = Math.floor(height * 0.6);
    const vehicleX = Math.floor((width - vehicleW) / 2);
    const vehicleY = Math.floor((height - vehicleH) / 2);

    return {
      boundingBox: { x: vehicleX, y: vehicleY, width: vehicleW, height: vehicleH },
      confidence: 0.95,
      keypoints: {
        frontBumper: { x: vehicleX + vehicleW / 2, y: vehicleY + vehicleH },
        rearBumper: { x: vehicleX + vehicleW / 2, y: vehicleY },
        frontWheel: { x: vehicleX + vehicleW * 0.2, y: vehicleY + vehicleH * 0.8 },
        rearWheel: { x: vehicleX + vehicleW * 0.8, y: vehicleY + vehicleH * 0.8 },
        roofCenter: { x: vehicleX + vehicleW / 2, y: vehicleY + vehicleH * 0.2 },
        windshieldTop: { x: vehicleX + vehicleW / 2, y: vehicleY + vehicleH * 0.3 },
        windshieldBottom: { x: vehicleX + vehicleW / 2, y: vehicleY + vehicleH * 0.5 },
      },
      licensePlate: {
        boundingBox: {
          x: vehicleX + Math.floor(vehicleW * 0.35),
          y: vehicleY + Math.floor(vehicleH * 0.85),
          width: Math.floor(vehicleW * 0.3),
          height: Math.floor(vehicleH * 0.08),
        },
        confidence: 0.9,
      },
      glassRegions: [
        {
          type: 'windshield',
          polygon: [
            { x: vehicleX + vehicleW * 0.15, y: vehicleY + vehicleH * 0.25 },
            { x: vehicleX + vehicleW * 0.85, y: vehicleY + vehicleH * 0.25 },
            { x: vehicleX + vehicleW * 0.75, y: vehicleY + vehicleH * 0.5 },
            { x: vehicleX + vehicleW * 0.25, y: vehicleY + vehicleH * 0.5 },
          ],
          confidence: 0.9,
        },
        {
          type: 'side_window',
          polygon: [
            { x: vehicleX + vehicleW * 0.7, y: vehicleY + vehicleH * 0.3 },
            { x: vehicleX + vehicleW * 0.95, y: vehicleY + vehicleH * 0.3 },
            { x: vehicleX + vehicleW * 0.9, y: vehicleY + vehicleH * 0.6 },
            { x: vehicleX + vehicleW * 0.65, y: vehicleY + vehicleH * 0.6 },
          ],
          confidence: 0.85,
        },
      ],
    };
  }

  // Utility: Load image from file/URL
  static async loadImage(source: File | string | Blob): Promise<{ data: Uint8Array; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve({
          data: new Uint8Array(imageData.data),
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;

      if (source instanceof File || source instanceof Blob) {
        img.src = URL.createObjectURL(source);
      } else {
        img.src = source;
      }
    });
  }

  // Utility: Save processed image
  static async saveImage(processed: ProcessedImage, filename: string): Promise<void> {
    const blob = new Blob([processed.data], { type: `image/${processed.format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  dispose(): void {
    this.webgpuEngine.dispose();
    this.wasmEngine.dispose();
    this.cpuEngine.dispose();
  }
}

// Export singleton factory
export function createImageProcessingEngine(options?: ImageProcessingOptions): ImageProcessingEngine {
  return new ImageProcessingEngine(options);
}