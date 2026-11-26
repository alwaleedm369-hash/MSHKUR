import { logger } from '@utils/logger';
import { config } from '@config';
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, SafetySetting } from '@google/generative-ai';

export interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  systemInstruction?: string;
}

export interface GenerationResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  safetyRatings?: any[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private models: Map<string, GenerativeModel> = new Map();
  private defaultConfig: GenerationConfig = {
    temperature: 0.7,
    maxOutputTokens: 4096,
    topP: 0.95,
    topK: 40,
  };

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      this.initializeModels();
    } else {
      logger.warn('Gemini API key not configured');
    }
  }

  private initializeModels() {
    if (!this.genAI) return;

    const models = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision',
    ];

    models.forEach(modelName => {
      try {
        const model = this.genAI!.getGenerativeModel({
          model: modelName,
          generationConfig: this.defaultConfig,
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        });
        this.models.set(modelName, model);
      } catch (error) {
        console.warn(`Failed to initialize model ${modelName}:`, error);
      }
    }
  }

  getModel(modelName: string = 'gemini-1.5-flash'): GenerativeModel | null {
    return this.models.get(modelName) || this.models.get('gemini-1.5-flash') || null;
  }

  async generateText(
    prompt: string,
    options: GeminiConfig = {}
  ): Promise<GenerationResult> {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const model = this.getModel(options.model);
    if (!model) {
      throw new Error('No model available');
    }

    try {
      const generationConfig: GenerationConfig = {
        ...this.defaultConfig,
        temperature: options.temperature ?? this.defaultConfig.temperature,
        maxOutputTokens: options.maxOutputTokens ?? this.defaultConfig.maxOutputTokens,
        topP: options.topP ?? this.defaultConfig.topP,
        topK: options.topK ?? this.defaultConfig.topK,
      };

      const chat = model.startChat({
        history: options.systemInstruction ? [
          { role: 'system', parts: [{ text: options.systemInstruction }] }
        ] : [],
        generationConfig,
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response;

      return {
        text: response.text(),
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        } : undefined,
        finishReason: response.candidates?.[0]?.finishReason || 'STOP',
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error) {
      logger.error('Gemini text generation failed', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  async generateWithImages(
    prompt: string,
    images: { mimeType: string; data: Buffer }[],
    options: GeminiConfig = {}
  ): Promise<GenerationResult> {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const model = this.getModel(options.model || 'gemini-1.5-pro');
    if (!model) {
      throw new Error('Vision model not available');
    }

    try {
      const generationConfig: GenerationConfig = {
        ...this.defaultConfig,
        temperature: options.temperature ?? this.defaultConfig.temperature,
        maxOutputTokens: options.maxOutputTokens ?? this.defaultConfig.maxOutputTokens,
      };

      const parts = [{ text: prompt }];
      for (const image of images) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data.toString('base64'),
          },
        });
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig,
      });

      const response = result.response;
      return {
        text: response.text(),
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        } : undefined,
        finishReason: response.candidates?.[0]?.finishReason || 'STOP',
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error) {
      logger.error('Gemini image generation failed', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  async generateStructuredOutput<T>(
    prompt: string,
    schema: any,
    options: GeminiConfig = {}
  ): Promise<T> {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const model = this.getModel(options.model || 'gemini-1.5-pro');
    if (!model) {
      throw new Error('Model not available');
    }

    try {
      const generationConfig: GenerationConfig = {
        ...this.defaultConfig,
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxOutputTokens ?? this.defaultConfig.maxOutputTokens,
        responseMimeType: 'application/json',
        responseSchema: schema,
      };

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();
      return JSON.parse(text) as T;
    } catch (error) {
      logger.error('Gemini structured output failed', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  async countTokens(text: string, modelName: string = 'gemini-1.5-flash'): Promise<number> {
    if (!this.genAI) return 0;

    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      logger.warn('Token counting failed', { error });
      return Math.ceil(text.length / 4); // Rough estimate
    }
  }

  async streamGenerateText(
    prompt: string,
    options: GeminiConfig = {},
    onChunk: (text: string) => void
  ): Promise<GenerationResult> {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const model = this.getModel(options.model);
    if (!model) {
      throw new Error('No model available');
    }

    try {
      const generationConfig: GenerationConfig = {
        ...this.defaultConfig,
        temperature: options.temperature ?? this.defaultConfig.temperature,
        maxOutputTokens: options.maxOutputTokens ?? this.defaultConfig.maxOutputTokens,
      };

      const chat = model.startChat({
        history: options.systemInstruction ? [
          { role: 'system', parts: [{ text: options.systemInstruction }] }
        ] : [],
        generationConfig,
      });

      const result = await chat.sendMessageStream(prompt);

      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullText += text;
        onChunk(text);
      }

      return {
        text: fullText,
        finishReason: 'STOP',
      };
    } catch (error) {
      logger.error('Gemini streaming failed', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  // Predefined prompts for MSHKUR use cases
  static readonly PROMPTS = {
    AD_GENERATION: `You are a professional car listing copywriter for the Saudi Arabian market. Generate compelling car advertisements in Arabic.

    Given vehicle data, create:
    1. A compelling title (max 80 chars)
    2. A detailed description highlighting key features
    3. Relevant tags for search

    Tone: Professional, trustworthy, appealing to buyers
    Language: Arabic
    Format: JSON with title, description, tags`,

    VEHICLE_ANALYSIS: `You are an automotive expert analyzing car images. Identify:
    1. Make, model, year
    2. Color, body type
    3. Visible features (sunroof, wheels, etc.)
    4. Condition assessment
    5. Any visible damage

    Return structured JSON with confidence scores`,

    MARKETING_CONTENT: `You are a social media marketing expert for car dealerships in Saudi Arabia.
    Create engaging content for:
    - Instagram posts/stories
    - Facebook marketplace listings
    - WhatsApp broadcast messages
    - TikTok video scripts

    Tone: Engaging, professional, culturally appropriate
    Language: Arabic with English terms where appropriate`,

    CUSTOMER_RESPONSE: `You are a professional car sales assistant responding to customer inquiries.
    Guidelines:
    - Be polite, helpful, and professional
    - Provide accurate information
    - Encourage test drives
    - Handle objections gracefully
    - Language: Arabic (with English if customer uses English)`,

    IMAGE_PROCESSING_GUIDE: `You are an AI assistant helping users with car image processing.
    Available tools:
    1. Background removal (transparent, white, studio, outdoor)
    2. License plate blur (auto-detect, pixelate, gaussian)
    3. Glass tinting (level 0-1, color selection)
    4. Lighting enhancement (exposure, contrast, highlights, shadows)
    5. Shadow generation (intensity, direction, softness)
    6. Centering & crop (aspect ratios, multi-size output)
    7. Image enhancement (sharpen, denoise, clarity, vibrance)
    8. Batch unify (background, lighting, dimensions)

    Help users choose the right tools and settings for their needs.`,
  };

  // Estimate cost
  estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs: Record<string, { input: number; output: number }> = {
      'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
      'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
      'gemini-1.5-flash-8b': { input: 0.0000375, output: 0.00015 },
      'gemini-1.0-pro': { input: 0.0005, output: 0.0015 },
      'gemini-1.0-pro-vision': { input: 0.00025, output: 0.0005 },
    };

    const modelCost = costs[model] || costs['gemini-1.5-flash'];
    return (inputTokens / 1000) * modelCost.input + (outputTokens / 1000) * modelCost.output;
  }
}

export const geminiService = new GeminiService();
export default geminiService;