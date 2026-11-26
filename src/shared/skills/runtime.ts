/**
 * MSHKUR Skill Runtime (Gate 4)
 * Manifest-driven skill discovery, contract enforcement, isolation, cancellation, and execution evidence.
 */

import { removeVehicleBackground } from '@engines/backgroundRemovalService';

export type SkillLifecycleStatus = 'verified' | 'experimental' | 'quarantined' | 'disabled';

export interface SkillPortSpec {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface SkillManifest {
  id: string;
  version: string;
  name: string;
  nameAr?: string;
  description: string;
  inputs: SkillPortSpec[];
  outputs: SkillPortSpec[];
  engine: {
    provider: 'local' | 'worker' | 'remote-approved';
    entry: string;
    model?: string;
  };
  permissions: string[];
  tests: string[];
  license: string;
  status: SkillLifecycleStatus;
}

export interface SkillExecutionContext {
  sessionId: string;
  appId: 'photo-studio' | 'ad-studio' | 'dealer-workspace' | 'personal-assistant' | 'admin-browser';
  grantedPermissions: string[];
  signal?: AbortSignal;
  timeoutMs?: number;
  onProgress?: (key: string, current: number, total: number) => void;
}

export interface SkillExecutionEvidence {
  executionId: string;
  skillId: string;
  skillVersion: string;
  status: 'completed' | 'failed' | 'cancelled' | 'rejected';
  startedAt: number;
  completedAt: number;
  durationMs: number;
  inputSummary: Record<string, unknown>;
  outputSummary?: Record<string, unknown>;
  error?: string;
}

export interface RegisteredRuntimeSkill {
  manifest: SkillManifest;
  validateInput: (input: unknown) => { valid: boolean; reason?: string };
  validateOutput: (output: unknown) => { valid: boolean; reason?: string };
  execute: (input: unknown, context: SkillExecutionContext) => Promise<unknown>;
}

const DEFAULT_TIMEOUT_MS = 60_000;

export class SkillRuntime {
  private registry = new Map<string, RegisteredRuntimeSkill>();
  private evidenceLog: SkillExecutionEvidence[] = [];
  private maxEvidenceEntries = 500;

  register(skill: RegisteredRuntimeSkill): void {
    const { manifest } = skill;
    if (!manifest.id || !manifest.version || !manifest.license) {
      throw new Error(`Invalid skill manifest: id, version, and license are required.`);
    }
    this.registry.set(manifest.id, skill);
  }

  discover(filter?: { status?: SkillLifecycleStatus; permission?: string }): SkillManifest[] {
    let manifests = Array.from(this.registry.values()).map(s => ({ ...s.manifest }));
    if (filter?.status) {
      manifests = manifests.filter(m => m.status === filter.status);
    }
    if (filter?.permission) {
      manifests = manifests.filter(m => m.permissions.includes(filter.permission!));
    }
    return manifests;
  }

  getManifest(skillId: string): SkillManifest | undefined {
    const entry = this.registry.get(skillId);
    return entry ? { ...entry.manifest } : undefined;
  }

  getEvidence(skillId?: string): SkillExecutionEvidence[] {
    if (!skillId) return [...this.evidenceLog];
    return this.evidenceLog.filter(e => e.skillId === skillId);
  }

  private recordEvidence(evidence: SkillExecutionEvidence): void {
    this.evidenceLog.push(evidence);
    if (this.evidenceLog.length > this.maxEvidenceEntries) {
      this.evidenceLog.shift();
    }
  }

  async execute<TInput = unknown, TOutput = unknown>(
    skillId: string,
    input: TInput,
    context: SkillExecutionContext
  ): Promise<{ output: TOutput; evidence: SkillExecutionEvidence }> {
    const startedAt = Date.now();
    const executionId = `exec-${startedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const entry = this.registry.get(skillId);

    if (!entry) {
      const evidence: SkillExecutionEvidence = {
        executionId,
        skillId,
        skillVersion: 'unknown',
        status: 'rejected',
        startedAt,
        completedAt: Date.now(),
        durationMs: 0,
        inputSummary: { hasInput: input !== undefined && input !== null },
        error: `Skill not registered: ${skillId}`,
      };
      this.recordEvidence(evidence);
      throw new Error(evidence.error);
    }

    const { manifest } = entry;

    // Gate 4 rule: only verified skills may execute; quarantined/experimental/disabled are blocked
    if (manifest.status !== 'verified') {
      const evidence: SkillExecutionEvidence = {
        executionId,
        skillId: manifest.id,
        skillVersion: manifest.version,
        status: 'rejected',
        startedAt,
        completedAt: Date.now(),
        durationMs: 0,
        inputSummary: { status: manifest.status },
        error: `Skill "${manifest.id}" is "${manifest.status}" and cannot execute until verified and approved.`,
      };
      this.recordEvidence(evidence);
      throw new Error(evidence.error);
    }

    // Permission preflight
    const missingPermissions = manifest.permissions.filter(
      perm => !context.grantedPermissions.includes(perm)
    );
    if (missingPermissions.length > 0) {
      const evidence: SkillExecutionEvidence = {
        executionId,
        skillId: manifest.id,
        skillVersion: manifest.version,
        status: 'rejected',
        startedAt,
        completedAt: Date.now(),
        durationMs: 0,
        inputSummary: { missingPermissions },
        error: `Missing required permissions for "${manifest.id}": ${missingPermissions.join(', ')}`,
      };
      this.recordEvidence(evidence);
      throw new Error(evidence.error);
    }

    // Input contract validation
    const inputCheck = entry.validateInput(input);
    if (!inputCheck.valid) {
      const evidence: SkillExecutionEvidence = {
        executionId,
        skillId: manifest.id,
        skillVersion: manifest.version,
        status: 'rejected',
        startedAt,
        completedAt: Date.now(),
        durationMs: 0,
        inputSummary: { validationError: inputCheck.reason },
        error: `Input validation failed for "${manifest.id}": ${inputCheck.reason || 'invalid input'}`,
      };
      this.recordEvidence(evidence);
      throw new Error(evidence.error);
    }

    if (context.signal?.aborted) {
      const evidence: SkillExecutionEvidence = {
        executionId,
        skillId: manifest.id,
        skillVersion: manifest.version,
        status: 'cancelled',
        startedAt,
        completedAt: Date.now(),
        durationMs: 0,
        inputSummary: {},
        error: 'Execution cancelled before start',
      };
      this.recordEvidence(evidence);
      throw new Error(evidence.error);
    }

    const timeoutMs = context.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    try {
      const output = await new Promise<TOutput>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Skill "${manifest.id}" timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        const onAbort = () => {
          clearTimeout(timer);
          reject(new Error(`Skill "${manifest.id}" cancelled by caller`));
        };

        if (context.signal) {
          context.signal.addEventListener('abort', onAbort, { once: true });
        }

        entry
          .execute(input, context)
          .then(res => {
            clearTimeout(timer);
            if (context.signal) context.signal.removeEventListener('abort', onAbort);
            resolve(res as TOutput);
          })
          .catch(err => {
            clearTimeout(timer);
            if (context.signal) context.signal.removeEventListener('abort', onAbort);
            reject(err);
          });
      });

      // Output contract validation
      const outputCheck = entry.validateOutput(output);
      if (!outputCheck.valid) {
        throw new Error(`Output validation failed for "${manifest.id}": ${outputCheck.reason || 'invalid output'}`);
      }

      const completedAt = Date.now();
      const evidence: SkillExecutionEvidence = {
        executionId,
        skillId: manifest.id,
        skillVersion: manifest.version,
        status: 'completed',
        startedAt,
        completedAt,
        durationMs: completedAt - startedAt,
        inputSummary: { appId: context.appId },
        outputSummary: { validated: true },
      };
      this.recordEvidence(evidence);
      return { output, evidence };
    } catch (err) {
      const completedAt = Date.now();
      const message = err instanceof Error ? err.message : String(err);
      const isCancelled = message.toLowerCase().includes('cancelled');
      const evidence: SkillExecutionEvidence = {
        executionId,
        skillId: manifest.id,
        skillVersion: manifest.version,
        status: isCancelled ? 'cancelled' : 'failed',
        startedAt,
        completedAt,
        durationMs: completedAt - startedAt,
        inputSummary: { appId: context.appId },
        error: message,
      };
      this.recordEvidence(evidence);
      throw err;
    }
  }
}

export const skillRuntime = new SkillRuntime();

// Gate 4: Register the ONLY proven & license-verified skill (`removebackground`)
export interface RemoveBackgroundSkillInput {
  image: Blob | File;
  model?: 'fast' | 'high-quality' | 'car-optimized';
  backgroundType?: 'transparent' | 'white' | 'studio' | 'outdoor' | 'custom';
  backgroundValue?: string;
}

export interface RemoveBackgroundSkillOutput {
  transparent_png: Blob;
  previewUrl: string;
  width: number;
  height: number;
  durationMs: number;
}

export const removeBackgroundSkill: RegisteredRuntimeSkill = {
  manifest: {
    id: 'removebackground',
    version: '0.1.0',
    name: 'Remove Background',
    nameAr: 'إزالة الخلفية',
    description: 'Separates the vehicle from the source background while keeping the original input immutable.',
    inputs: [
      { name: 'image', type: 'Blob|File', required: true, description: 'Immutable source vehicle image' },
      { name: 'model', type: 'string', required: false, description: 'Segmentation precision profile' },
      { name: 'backgroundType', type: 'string', required: false, description: 'Transparent or studio backdrop' },
      { name: 'backgroundValue', type: 'string', required: false, description: 'Hex color for custom backdrop' },
    ],
    outputs: [
      { name: 'transparent_png', type: 'image/png', description: 'Derived PNG blob with removed/replaced background' },
      { name: 'previewUrl', type: 'string', description: 'Data URL preview of derived image' },
      { name: 'width', type: 'number', description: 'Output pixel width' },
      { name: 'height', type: 'number', description: 'Output pixel height' },
    ],
    engine: {
      provider: 'local',
      entry: '@engines/backgroundRemovalService#removeVehicleBackground',
      model: '@imgly/background-removal (isnet_fp16 / isnet_quint8)',
    },
    permissions: ['read:input', 'write:derived-output'],
    tests: ['tests/skills/removebackground.contract.test.ts'],
    license: 'AGPL-3.0 / Apache-2.0 (@imgly/background-removal & IS-Net weights — review redistribution terms)',
    status: 'verified',
  },
  validateInput(input: unknown) {
    if (!input || typeof input !== 'object') {
      return { valid: false, reason: 'Input must be an object' };
    }
    const candidate = input as Partial<RemoveBackgroundSkillInput>;
    if (!(candidate.image instanceof Blob)) {
      return { valid: false, reason: 'Input.image must be a Blob or File instance' };
    }
    if (candidate.image.size === 0) {
      return { valid: false, reason: 'Input.image cannot be empty (0 bytes)' };
    }
    return { valid: true };
  },
  validateOutput(output: unknown) {
    if (!output || typeof output !== 'object') {
      return { valid: false, reason: 'Output must be an object' };
    }
    const candidate = output as Partial<RemoveBackgroundSkillOutput>;
    if (!(candidate.transparent_png instanceof Blob) || candidate.transparent_png.size === 0) {
      return { valid: false, reason: 'Output.transparent_png must be a non-empty Blob' };
    }
    if (typeof candidate.width !== 'number' || candidate.width <= 0) {
      return { valid: false, reason: 'Output.width must be a positive number' };
    }
    if (typeof candidate.height !== 'number' || candidate.height <= 0) {
      return { valid: false, reason: 'Output.height must be a positive number' };
    }
    return { valid: true };
  },
  async execute(input: unknown, context: SkillExecutionContext): Promise<RemoveBackgroundSkillOutput> {
    const typed = input as RemoveBackgroundSkillInput;
    const res = await removeVehicleBackground(typed.image, {
      model: typed.model || 'car-optimized',
      backgroundType: typed.backgroundType || 'transparent',
      backgroundValue: typed.backgroundValue,
      onProgress: context.onProgress,
    });
    return {
      transparent_png: res.blob,
      previewUrl: res.previewUrl,
      width: res.width,
      height: res.height,
      durationMs: res.durationMs,
    };
  },
};

skillRuntime.register(removeBackgroundSkill);
