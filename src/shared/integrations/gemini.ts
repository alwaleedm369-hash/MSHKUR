/**
 * MSHKUR Google Gemini AI Integration
 * Unified interface for Google Generative AI (Gemini) with multiple models and capabilities
 */

export interface GeminiConfig {
  apiKey: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTopP?: number;
  defaultTopK?: number;
  safetySettings?: SafetySetting[];
}

export interface SafetySetting {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_HIGH_AND_ABOVE';
}

export interface GenerationConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  stopSequences?: string[];
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: Record<string, unknown>;
}

export interface ContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
  fileData?: {
    mimeType: string;
    fileUri: string;
  };
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, unknown>;
  };
}

export interface Message {
  role: 'user' | 'model' | 'system';
  parts: ContentPart[];
}

export interface GenerateContentRequest {
  contents: Message[];
  generationConfig?: GenerationConfig;
  safetySettings?: SafetySetting[];
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: Message;
}

export interface Tool {
  functionDeclarations: FunctionDeclaration[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      description?: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required?: string[];
  };
}

export interface ToolConfig {
  functionCallingConfig: {
    mode: 'AUTO' | 'ANY' | 'NONE';
    allowedFunctionNames?: string[];
  };
}

export interface GenerateContentResponse {
  candidates: Candidate[];
  promptFeedback?: PromptFeedback;
  usageMetadata?: UsageMetadata;
}

export interface Candidate {
  content: Message;
  finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
  index: number;
  safetyRatings: SafetyRating[];
  citationMetadata?: CitationMetadata;
  tokenCount: number;
}

export interface SafetyRating {
  category: string;
  probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
  blocked: boolean;
}

export interface PromptFeedback {
  safetyRatings: SafetyRating[];
  blockReason?: string;
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface CitationMetadata {
  citations: Citation[];
}

export interface Citation {
  startIndex: number;
  endIndex: number;
  uri: string;
  title: string;
  license: string;
  publicationDate: string;
}

export interface StreamGenerateContentResponse {
  candidates: Candidate[];
  usageMetadata?: UsageMetadata;
}

// Model definitions
export const GEMINI_MODELS = {
  // Latest models
  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    description: 'Most capable model for complex reasoning, code, and multimodal tasks',
    maxInputTokens: 2097152, // 2M tokens
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    costPer1kInput: 0.0035,
    costPer1kOutput: 0.0105,
  },
  'gemini-1.5-flash': {
    name: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    description: 'Fast and efficient model for high-volume tasks',
    maxInputTokens: 1048576, // 1M tokens
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
  },
  'gemini-1.5-flash-8b': {
    name: 'gemini-1.5-flash-8b',
    displayName: 'Gemini 1.5 Flash 8B',
    description: 'Lightweight model for simple tasks',
    maxInputTokens: 1048576,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    costPer1kInput: 0.0000375,
    costPer1kOutput: 0.00015,
  },
  'gemini-1.0-pro': {
    name: 'gemini-1.0-pro',
    displayName: 'Gemini 1.0 Pro',
    description: 'Balanced performance for text and code',
    maxInputTokens: 32768,
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.0015,
  },
  'gemini-1.0-pro-vision': {
    name: 'gemini-1.0-pro-vision',
    displayName: 'Gemini 1.0 Pro Vision',
    description: 'Multimodal model for image understanding',
    maxInputTokens: 16384,
    maxOutputTokens: 2048,
    supportsVision: true,
    supportsFunctionCalling: false,
    supportsJsonMode: false,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.0005,
  },
  // Embedding models
  'text-embedding-004': {
    name: 'text-embedding-004',
    displayName: 'Text Embedding 004',
    description: 'High-quality text embeddings for similarity search',
    maxInputTokens: 2048,
    dimensions: 768,
    costPer1kInput: 0.00001,
  },
} as const;

export type ModelName = keyof typeof GEMINI_MODELS;

export class GeminiClient {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private models: Map<string, any> = new Map();

  constructor(config: GeminiConfig) {
    this.config = {
      defaultModel: 'gemini-1.5-flash',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
      defaultTopP: 0.95,
      defaultTopK: 40,
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
      ...config,
    };
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-goog-api-key': this.config.apiKey,
    };
  }

  private getModelUrl(model: string, action: 'generateContent' | 'streamGenerateContent' | 'countTokens'): string {
    return `${this.baseUrl}/models/${model}:${action}?key=${this.config.apiKey}`;
  }

  async generateContent(
    contents: Message[],
    options: {
      model?: ModelName;
      generationConfig?: GenerationConfig;
      safetySettings?: SafetySetting[];
      tools?: Tool[];
      toolConfig?: ToolConfig;
      systemInstruction?: Message;
    } = {}
  ): Promise<GenerateContentResponse> {
    const model = options.model || this.config.defaultModel!;
    const modelInfo = GEMINI_MODELS[model];

    if (!modelInfo) {
      throw new Error(`Model not found: ${model}`);
    }

    const request: GenerateContentRequest = {
      contents,
      generationConfig: {
        temperature: this.config.defaultTemperature,
        maxOutputTokens: this.config.defaultMaxTokens,
        topP: this.config.defaultTopP,
        topK: this.config.defaultTopK,
        ...options.generationConfig,
      },
      safetySettings: options.safetySettings || this.config.safetySettings,
      tools: options.tools,
      toolConfig: options.toolConfig,
      systemInstruction: options.systemInstruction,
    };

    const response = await fetch(this.getModelUrl(model, 'generateContent'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async streamGenerateContent(
    contents: Message[],
    options: {
      model?: ModelName;
      generationConfig?: GenerationConfig;
      safetySettings?: SafetySetting[];
      tools?: Tool[];
      toolConfig?: ToolConfig;
      systemInstruction?: Message;
      onChunk?: (chunk: StreamGenerateContentResponse) => void;
    } = {}
  ): Promise<AsyncIterable<StreamGenerateContentResponse>> {
    const model = options.model || this.config.defaultModel!;
    const modelInfo = GEMINI_MODELS[model];

    if (!modelInfo) {
      throw new Error(`Model not found: ${model}`);
    }

    const request: GenerateContentRequest = {
      contents,
      generationConfig: {
        temperature: this.config.defaultTemperature,
        maxOutputTokens: this.config.defaultMaxTokens,
        topP: this.config.defaultTopP,
        topK: this.config.defaultTopK,
        ...options.generationConfig,
      },
      safetySettings: options.safetySettings || this.config.safetySettings,
      tools: options.tools,
      toolConfig: options.toolConfig,
      systemInstruction: options.systemInstruction,
    };

    const response = await fetch(this.getModelUrl(model, 'streamGenerateContent'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    return {
      async *[Symbol.asyncIterator]() {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;
              try {
                const chunk = JSON.parse(data);
                options.onChunk?.(chunk);
                yield chunk;
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      },
    };
  }

  async countTokens(
    contents: Message[],
    model?: ModelName
  ): Promise<{ totalTokens: number }> {
    const modelName = model || this.config.defaultModel!;

    const response = await fetch(this.getModelUrl(modelName, 'countTokens'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      throw new Error(`Token count failed: ${response.statusText}`);
    }

    return response.json();
  }

  async generateEmbedding(
    text: string | string[],
    model: ModelName = 'text-embedding-004'
  ): Promise<number[][]> {
    const texts = Array.isArray(text) ? text : [text];

    const response = await fetch(`${this.baseUrl}/models/${model}:embedContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        contents: texts.map(t => ({ parts: [{ text: t }] })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding?.values || data.embeddings?.map((e: any) => e.values) || [];
  }

  // Utility methods for common use cases

  async generateText(
    prompt: string,
    options: {
      model?: ModelName;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
      schema?: Record<string, unknown>;
    } = {}
  ): Promise<string> {
    const contents: Message[] = [];

    if (options.systemPrompt) {
      contents.push({
        role: 'system',
        parts: [{ text: options.systemPrompt }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const generationConfig: GenerationConfig = {
      temperature: options.temperature ?? this.config.defaultTemperature,
      maxOutputTokens: options.maxTokens ?? this.config.defaultMaxTokens,
    };

    if (options.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
      if (options.schema) {
        generationConfig.responseSchema = options.schema;
      }
    }

    const response = await this.generateContent(contents, {
      model: options.model,
      generationConfig,
    });

    return response.candidates[0]?.content.parts[0]?.text || '';
  }

  async generateWithImages(
    prompt: string,
    images: { mimeType: string; data: string }[], // base64
    options: {
      model?: ModelName;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    if (!GEMINI_MODELS[options.model || this.config.defaultModel!].supportsVision) {
      throw new Error('Selected model does not support vision');
    }

    const contents: Message[] = [];

    if (options.systemPrompt) {
      contents.push({
        role: 'system',
        parts: [{ text: options.systemPrompt }],
      });
    }

    const parts: ContentPart[] = [{ text: prompt }];
    for (const image of images) {
      parts.push({ inlineData: image });
    }

    contents.push({
      role: 'user',
      parts,
    });

    const response = await this.generateContent(contents, {
      model: options.model,
      generationConfig: {
        temperature: options.temperature ?? this.config.defaultTemperature,
        maxOutputTokens: options.maxTokens ?? this.config.defaultMaxTokens,
      },
    });

    return response.candidates[0]?.content.parts[0]?.text || '';
  }

  async chat(
    messages: Message[],
    options: {
      model?: ModelName;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      tools?: Tool[];
      toolConfig?: ToolConfig;
    } = {}
  ): Promise<GenerateContentResponse> {
    let contents = [...messages];

    if (options.systemPrompt) {
      contents = [
        { role: 'system', parts: [{ text: options.systemPrompt }] },
        ...contents,
      ];
    }

    return this.generateContent(contents, {
      model: options.model,
      generationConfig: {
        temperature: options.temperature ?? this.config.defaultTemperature,
        maxOutputTokens: options.maxTokens ?? this.config.defaultMaxTokens,
      },
      tools: options.tools,
      toolConfig: options.toolConfig,
    });
  }

  // Pre-defined tools for MSHKUR
  static getMSHKURTools(): Tool[] {
    return [
      {
        functionDeclarations: [
          {
            name: 'remove_background',
            description: 'Remove background from vehicle image',
            parameters: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string', description: 'URL of the image' },
                backgroundType: { type: 'string', enum: ['transparent', 'white', 'studio', 'outdoor'], description: 'Background type' },
                quality: { type: 'string', enum: ['fast', 'high'], description: 'Processing quality' },
              },
              required: ['imageUrl'],
            },
          },
          {
            name: 'blur_license_plate',
            description: 'Blur license plate in vehicle image',
            parameters: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string', description: 'URL of the image' },
                autoDetect: { type: 'boolean', default: true },
              },
              required: ['imageUrl'],
            },
          },
          {
            name: 'tint_glass',
            description: 'Tint vehicle glass windows',
            parameters: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string', description: 'URL of the image' },
                tintLevel: { type: 'number', minimum: 0, maximum: 1, default: 0.6 },
                tintColor: { type: 'string', default: '#1a1a2e' },
              },
              required: ['imageUrl'],
            },
          },
          {
            name: 'enhance_lighting',
            description: 'Enhance lighting and contrast of vehicle image',
            parameters: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string', description: 'URL of the image' },
                autoBalance: { type: 'boolean', default: true },
                exposure: { type: 'number', default: 0 },
                contrast: { type: 'number', default: 0.1 },
              },
              required: ['imageUrl'],
            },
          },
          {
            name: 'generate_shadow',
            description: 'Generate realistic shadow for vehicle',
            parameters: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string', description: 'URL of the image' },
                intensity: { type: 'number', minimum: 0, maximum: 1, default: 0.5 },
                direction: { type: 'number', default: 270 },
              },
              required: ['imageUrl'],
            },
          },
          {
            name: 'create_ad_content',
            description: 'Generate professional vehicle ad content',
            parameters: {
              type: 'object',
              properties: {
                vehicleData: {
                  type: 'object',
                  properties: {
                    make: { type: 'string' },
                    model: { type: 'string' },
                    year: { type: 'number' },
                    trim: { type: 'string' },
                    mileage: { type: 'number' },
                    price: { type: 'number' },
                    color: { type: 'string' },
                    fuelType: { type: 'string' },
                    transmission: { type: 'string' },
                    features: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['make', 'model', 'year', 'price'],
                },
                tone: { type: 'string', enum: ['professional', 'enthusiastic', 'luxury'], default: 'professional' },
                language: { type: 'string', enum: ['ar', 'en'], default: 'ar' },
              },
              required: ['vehicleData'],
            },
          },
          {
            name: 'search_vehicles',
            description: 'Search for vehicles matching criteria',
            parameters: {
              type: 'object',
              properties: {
                make: { type: 'string' },
                model: { type: 'string' },
                yearMin: { type: 'number' },
                yearMax: { type: 'number' },
                priceMin: { type: 'number' },
                priceMax: { type: 'number' },
                fuelType: { type: 'string' },
                location: { type: 'string' },
              },
            },
          },
        ],
      },
    ];
  }

  // Model selection helpers
  static getModelForTask(task: 'chat' | 'code' | 'vision' | 'embedding' | 'fast' | 'complex'): ModelName {
    switch (task) {
      case 'chat': return 'gemini-1.5-flash';
      case 'code': return 'gemini-1.5-pro';
      case 'vision': return 'gemini-1.5-pro';
      case 'embedding': return 'text-embedding-004';
      case 'fast': return 'gemini-1.5-flash-8b';
      case 'complex': return 'gemini-1.5-pro';
      default: return 'gemini-1.5-flash';
    }
  }

  static estimateCost(model: ModelName, inputTokens: number, outputTokens: number): number {
    const modelInfo = GEMINI_MODELS[model];
    if (!modelInfo || 'dimensions' in modelInfo) return 0;

    const inputCost = (inputTokens / 1000) * modelInfo.costPer1kInput;
    const outputCost = (outputTokens / 1000) * modelInfo.costPer1kOutput;
    return inputCost + outputCost;
  }
}

// Factory function
export function createGeminiClient(config: GeminiConfig): GeminiClient {
  return new GeminiClient(config);
}

// Default client instance (configured via environment)
let defaultClient: GeminiClient | null = null;

export function getDefaultGeminiClient(): GeminiClient {
  if (!defaultClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY not configured');
    }
    defaultClient = new GeminiClient({ apiKey });
  }
  return defaultClient;
}

// React hook for Gemini
export function useGemini() {
  const [client, setClient] = useState<GeminiClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        setClient(new GeminiClient({ apiKey }));
      } else {
        setError('Gemini API key not configured');
      }
    } catch (e) {
      setError('Failed to initialize Gemini client');
    } finally {
      setLoading(false);
    }
  }, []);

  return { client, loading, error };
}

import { useState, useEffect } from 'react';