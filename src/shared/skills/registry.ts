/**
 * MSHKUR Skills Registry
 * Central registry for all skills with lazy loading, dependency resolution, and execution pipeline
 */

import { skillRegistry, SkillDefinition, executeSkill, listSkills, listSkillsByCategory, getCategories } from './index';
import { ProcessingContext } from '@engines/MSHKURCore';

export interface SkillExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
  skillId: string;
}

export interface SkillPipeline {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  steps: PipelineStep[];
  rollbackOnError: boolean;
}

export interface PipelineStep {
  skillId: string;
  name: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  condition?: (context: PipelineContext) => boolean;
  retry?: { attempts: number; delay: number };
  timeout?: number;
}

export interface PipelineContext {
  input: Record<string, unknown>;
  outputs: Record<string, unknown>;
  stepResults: Record<string, unknown>;
  errors: Record<string, string>;
  metadata: Record<string, unknown>;
}

export class SkillsRegistryManager {
  private pipelines: Map<string, SkillPipeline> = new Map();
  private executionHistory: SkillExecutionResult[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.registerBuiltInPipelines();
  }

  private registerBuiltInPipelines(): void {
    // Photo Processing Pipeline
    this.registerPipeline({
      id: 'photo-full-processing',
      name: 'Full Photo Processing',
      nameAr: 'معالجة صور كاملة',
      description: 'Complete photo processing pipeline: background removal, plate blur, lighting, shadows, centering, enhancement',
      steps: [
        {
          skillId: 'background-removal',
          name: 'إزالة الخلفية',
          inputMapping: { imageData: 'imageData', settings: 'bgSettings' },
          outputMapping: { processedImage: 'imageData', mask: 'bgMask' },
        },
        {
          skillId: 'license-plate-blur',
          name: 'طمس اللوحة',
          inputMapping: { imageData: 'imageData', settings: 'plateSettings' },
          outputMapping: { processedImage: 'imageData', platesDetected: 'platesDetected' },
        },
        {
          skillId: 'lighting-enhancement',
          name: 'تحسين الإضاءة',
          inputMapping: { imageData: 'imageData', settings: 'lightingSettings' },
          outputMapping: { processedImage: 'imageData', adjustments: 'lightingAdjustments' },
        },
        {
          skillId: 'shadow-generation',
          name: 'إضافة الظلال',
          inputMapping: { imageData: 'imageData', settings: 'shadowSettings' },
          outputMapping: { processedImage: 'imageData', shadowMask: 'shadowMask' },
        },
        {
          skillId: 'centering-crop',
          name: 'التوسيط والقص',
          inputMapping: { imageData: 'imageData', settings: 'cropSettings' },
          outputMapping: { processedImages: 'finalImages', crops: 'crops' },
        },
        {
          skillId: 'image-enhancement',
          name: 'تحسين الصورة',
          inputMapping: { imageData: 'imageData', settings: 'enhancementSettings' },
          outputMapping: { processedImage: 'imageData', enhancements: 'enhancements' },
        },
      ],
      rollbackOnError: false,
    });

    // Batch Unify Pipeline
    this.registerPipeline({
      id: 'batch-unify-processing',
      name: 'Batch Unify Processing',
      nameAr: 'توحيد معالجة الدفعات',
      description: 'Unify backgrounds, lighting, and dimensions across multiple images',
      steps: [
        {
          skillId: 'batch-unify',
          name: 'توحيد الدفعات',
          inputMapping: { images: 'images', settings: 'unifySettings' },
          outputMapping: { processedImages: 'unifiedImages', unified: 'unified' },
        },
      ],
      rollbackOnError: true,
    });

    // Ad Creation Pipeline
    this.registerPipeline({
      id: 'ad-creation-full',
      name: 'Full Ad Creation',
      nameAr: 'إنشاء إعلان كامل',
      description: 'Complete ad creation from vehicle data to published listing',
      steps: [
        {
          skillId: 'vehicle-data-extraction',
          name: 'استخراج بيانات السيارة',
          inputMapping: { source: 'source', data: 'sourceData' },
          outputMapping: { make: 'vehicleData.make', model: 'vehicleData.model', year: 'vehicleData.year', specs: 'vehicleData.specs' },
        },
        {
          skillId: 'ad-content-generation',
          name: 'توليد محتوى الإعلان',
          inputMapping: { vehicleData: 'vehicleData', options: 'contentOptions' },
          outputMapping: { title: 'adTitle', description: 'adDescription', tags: 'adTags', variants: 'adVariants' },
        },
        {
          skillId: 'template-rendering',
          name: 'عرض القالب',
          inputMapping: { templateId: 'templateId', data: 'adData', platform: 'platform' },
          outputMapping: { html: 'adHtml', css: 'adCss', preview: 'adPreview', dimensions: 'adDimensions' },
        },
      ],
      rollbackOnError: false,
    });

    // Dealer New Vehicle Pipeline
    this.registerPipeline({
      id: 'dealer-new-vehicle',
      name: 'New Vehicle Listing',
      nameAr: 'إدراج سيارة جديدة',
      description: 'Add new vehicle to inventory with ad creation and marketing automation',
      steps: [
        {
          skillId: 'inventory-management',
          name: 'إدارة المخزون',
          inputMapping: { action: 'create', vehicle: 'vehicleData' },
          outputMapping: { success: 'inventorySuccess', vehicle: 'createdVehicle' },
        },
        {
          skillId: 'ad-content-generation',
          name: 'توليد محتوى الإعلان',
          inputMapping: { vehicleData: 'vehicleData', options: 'contentOptions' },
          outputMapping: { title: 'adTitle', description: 'adDescription', tags: 'adTags' },
        },
        {
          skillId: 'marketing-automation',
          name: 'أتمتة التسويق',
          inputMapping: { action: 'schedule-post', campaign: 'marketingCampaign', platforms: 'platforms' },
          outputMapping: { success: 'marketingSuccess', posts: 'scheduledPosts' },
        },
      ],
      rollbackOnError: false,
    });

    // Marketing Campaign Pipeline
    this.registerPipeline({
      id: 'marketing-campaign',
      name: 'Marketing Campaign',
      nameAr: 'حملة تسويقية',
      description: 'Create and execute multi-platform marketing campaign',
      steps: [
        {
          skillId: 'marketing-automation',
          name: 'إنشاء الحملة',
          inputMapping: { action: 'create-campaign', campaign: 'campaignData' },
          outputMapping: { success: 'campaignCreated', campaignId: 'campaignId' },
        },
        {
          skillId: 'marketing-automation',
          name: 'جدولة المنشورات',
          inputMapping: { action: 'schedule-post', post: 'postData', platforms: 'platforms' },
          outputMapping: { success: 'postsScheduled', posts: 'scheduledPosts' },
        },
        {
          skillId: 'marketing-automation',
          name: 'تحليل الأداء',
          inputMapping: { action: 'analytics', campaignId: 'campaignId' },
          outputMapping: { analytics: 'campaignAnalytics' },
        },
      ],
      rollbackOnError: false,
    });
  }

  registerPipeline(pipeline: SkillPipeline): void {
    this.pipelines.set(pipeline.id, pipeline);
  }

  getPipeline(id: string): SkillPipeline | undefined {
    return this.pipelines.get(id);
  }

  listPipelines(): SkillPipeline[] {
    return Array.from(this.pipelines.values());
  }

  async executePipeline(
    pipelineId: string,
    input: Record<string, unknown>,
    context: ProcessingContext
  ): Promise<Record<string, unknown>> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    const pipelineContext: PipelineContext = {
      input,
      outputs: {},
      stepResults: {},
      errors: {},
      metadata: { pipelineId, startedAt: Date.now() },
    };

    for (const step of pipeline.steps) {
      // Check condition
      if (step.condition && !step.condition(pipelineContext)) {
        continue;
      }

      // Build skill input
      const skillInput: Record<string, unknown> = {};
      for (const [skillKey, contextKey] of Object.entries(step.inputMapping)) {
        if (contextKey in pipelineContext.input) {
          skillInput[skillKey] = pipelineContext.input[contextKey];
        } else if (contextKey in pipelineContext.outputs) {
          skillInput[skillKey] = pipelineContext.outputs[contextKey];
        }
      }

      // Execute with retry logic
      let result: unknown;
      let lastError: Error | null = null;
      const attempts = step.retry?.attempts ?? 1;
      const delay = step.retry?.delay ?? 1000;

      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          const timeout = step.timeout ?? 30000;
          result = await Promise.race([
            executeSkill(step.skillId, skillInput, context),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Skill execution timeout')), timeout)
            ),
          ]);
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < attempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          }
        }
      }

      if (lastError && !result) {
        pipelineContext.errors[step.skillId] = lastError.message;
        if (pipeline.rollbackOnError) {
          throw new Error(`Pipeline failed at step ${step.name}: ${lastError.message}`);
        }
        // Continue with other steps even if one fails
        continue;
      }

      // Store result
      pipelineContext.stepResults[step.skillId] = result;

      // Map outputs
      for (const [outputKey, skillKey] of Object.entries(step.outputMapping)) {
        if (result && typeof result === 'object' && skillKey in result) {
          pipelineContext.outputs[outputKey] = (result as Record<string, unknown>)[skillKey];
        }
      }
    }

    pipelineContext.metadata.completedAt = Date.now();
    pipelineContext.metadata.duration = pipelineContext.metadata.completedAt - pipelineContext.metadata.startedAt;

    return pipelineContext.outputs;
  }

  async executeSkill(
    skillId: string,
    input: unknown,
    context: ProcessingContext
  ): Promise<SkillExecutionResult> {
    const startTime = Date.now();

    try {
      const result = await executeSkill(skillId, input, context);
      const executionTime = Date.now() - startTime;

      const executionResult: SkillExecutionResult = {
        success: true,
        result,
        executionTime,
        skillId,
      };

      this.addToHistory(executionResult);
      return executionResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      const executionResult: SkillExecutionResult = {
        success: false,
        error: errorMessage,
        executionTime,
        skillId,
      };

      this.addToHistory(executionResult);
      return executionResult;
    }
  }

  private addToHistory(result: SkillExecutionResult): void {
    this.executionHistory.push(result);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  getHistory(): SkillExecutionResult[] {
    return [...this.executionHistory];
  }

  getSkillStats(skillId: string): {
    totalExecutions: number;
    successRate: number;
    avgExecutionTime: number;
    lastExecution: SkillExecutionResult | null;
  } {
    const executions = this.executionHistory.filter(r => r.skillId === skillId);
    if (executions.length === 0) {
      return { totalExecutions: 0, successRate: 0, avgExecutionTime: 0, lastExecution: null };
    }

    const successful = executions.filter(r => r.success).length;
    const avgTime = executions.reduce((sum, r) => sum + r.executionTime, 0) / executions.length;

    return {
      totalExecutions: executions.length,
      successRate: successful / executions.length,
      avgExecutionTime: avgTime,
      lastExecution: executions[executions.length - 1],
    };
  }

  // Delegate to underlying registry
  getSkill(skillId: string) {
    return skillRegistry.get(skillId);
  }

  listSkills() {
    return listSkills();
  }

  listSkillsByCategory(category: string) {
    return listSkillsByCategory(category);
  }

  getCategories() {
    return getCategories();
  }
}

// Export singleton
export const skillsRegistryManager = new SkillsRegistryManager();

// Utility functions
export async function runPipeline(
  pipelineId: string,
  input: Record<string, unknown>,
  context: ProcessingContext
): Promise<Record<string, unknown>> {
  return skillsRegistryManager.executePipeline(pipelineId, input, context);
}

export function getPipeline(pipelineId: string) {
  return skillsRegistryManager.getPipeline(pipelineId);
}

export function listPipelines() {
  return skillsRegistryManager.listPipelines();
}

export function executeSkillDirect(
  skillId: string,
  input: unknown,
  context: ProcessingContext
) {
  return skillsRegistryManager.executeSkill(skillId, input, context);
}

import { skillRuntime, SkillManifest, SkillExecutionEvidence, SkillExecutionContext } from './runtime';

export function discoverVerifiedSkills(): SkillManifest[] {
  return skillRuntime.discover({ status: 'verified' });
}

export function discoverAllRuntimeSkills(): SkillManifest[] {
  return skillRuntime.discover();
}

export function getSkillExecutionEvidence(skillId?: string): SkillExecutionEvidence[] {
  return skillRuntime.getEvidence(skillId);
}

export async function executeVerifiedSkill<TInput = unknown, TOutput = unknown>(
  skillId: string,
  input: TInput,
  context: SkillExecutionContext
): Promise<{ output: TOutput; evidence: SkillExecutionEvidence }> {
  return skillRuntime.execute<TInput, TOutput>(skillId, input, context);
}
