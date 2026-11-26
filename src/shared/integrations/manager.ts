/**
 * MSHKUR Integrations Manager
 * Central manager for all external integrations with authentication, rate limiting, and workflow orchestration
 */

import { integrationsManager, IntegrationConfig, IntegrationInstance, IntegrationCredentials, IntegrationStatus } from './index';

export interface IntegrationWorkflow {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  steps: IntegrationWorkflowStep[];
}

export interface IntegrationWorkflowStep {
  integrationId: string;
  action: string;
  params: Record<string, unknown>;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  condition?: (context: IntegrationWorkflowContext) => boolean;
  retry?: { attempts: number; delay: number };
}

export interface IntegrationWorkflowContext {
  input: Record<string, unknown>;
  outputs: Record<string, unknown>;
  stepResults: Record<string, unknown>;
  errors: Record<string, string>;
}

export class IntegrationsManagerExtended {
  private manager = integrationsManager;
  private workflows: Map<string, IntegrationWorkflow> = new Map();
  private executionHistory: Array<{
    workflowId: string;
    timestamp: number;
    success: boolean;
    duration: number;
    results: Record<string, unknown>;
    errors: Record<string, string>;
  }> = [];

  constructor() {
    this.registerBuiltInWorkflows();
  }

  private registerBuiltInWorkflows(): void {
    // GitHub Deploy Workflow
    this.registerWorkflow({
      id: 'github-deploy',
      name: 'GitHub Deploy',
      nameAr: 'نشر عبر جيت هاب',
      description: 'Build, test, and deploy via GitHub Actions',
      steps: [
        {
          integrationId: 'github',
          action: 'Get Repo',
          params: { owner: 'aimshkur', repo: 'MSHKURCAR' },
          inputMapping: {},
          outputMapping: { repo: 'repoInfo' },
        },
        {
          integrationId: 'github',
          action: 'Create PR',
          params: { title: 'Deploy {{timestamp}}', head: 'deploy', base: 'main', body: 'Automated deployment' },
          inputMapping: {},
          outputMapping: { pr: 'createdPR' },
        },
      ],
    });

    // Haraj Publish Workflow
    this.registerWorkflow({
      id: 'haraj-publish',
      name: 'Haraj Publish',
      nameAr: 'نشر على حراج',
      description: 'Publish vehicle listing to Haraj with images and notify customer',
      steps: [
        {
          integrationId: 'haraj',
          action: 'Create Listing',
          params: {
            title: '{{adTitle}}',
            description: '{{adDescription}}',
            price: '{{price}}',
            images: '{{imageUrls}}',
            category: 'vehicles',
            location: '{{location}}',
          },
          inputMapping: { adTitle: 'adTitle', adDescription: 'adDescription', price: 'price', imageUrls: 'imageUrls', location: 'location' },
          outputMapping: { listingId: 'harajListingId', url: 'harajUrl' },
        },
        {
          integrationId: 'whatsapp',
          action: 'Send Message',
          params: { to: '{{customerPhone}}', message: 'تم نشر إعلانك على حراج: {{harajUrl}}' },
          inputMapping: { customerPhone: 'customerPhone', harajUrl: 'harajUrl' },
          outputMapping: { messageId: 'whatsappMessageId' },
        },
      ],
    });

    // Google Drive Backup Workflow
    this.registerWorkflow({
      id: 'google-drive-backup',
      name: 'Google Drive Backup',
      nameAr: 'نسخ احتياطي لجوجل درايف',
      description: 'Backup processed images and data to Google Drive',
      steps: [
        {
          integrationId: 'google-workspace',
          action: 'Create Folder',
          params: { name: 'MSHKUR Backup {{date}}', mimeType: 'application/vnd.google-apps.folder' },
          inputMapping: {},
          outputMapping: { folderId: 'backupFolderId' },
        },
        {
          integrationId: 'google-workspace',
          action: 'Upload to Drive',
          params: { file: '{{backupFile}}', parents: ['{{backupFolderId}}'] },
          inputMapping: { backupFile: 'backupFile', backupFolderId: 'backupFolderId' },
          outputMapping: { fileId: 'driveFileId' },
        },
      ],
    });

    // Google Photos Sync Workflow
    this.registerWorkflow({
      id: 'google-photos-sync',
      name: 'Google Photos Sync',
      nameAr: 'مزامنة صور جوجل',
      description: 'Sync processed vehicle images to Google Photos',
      steps: [
        {
          integrationId: 'google-workspace',
          action: 'Upload to Photos',
          params: { file: '{{imageFile}}', albumId: '{{albumId}}' },
          inputMapping: { imageFile: 'imageFile', albumId: 'albumId' },
          outputMapping: { mediaId: 'photosMediaId' },
        },
      ],
    });

    // Calendar Appointment Workflow
    this.registerWorkflow({
      id: 'calendar-appointment',
      name: 'Calendar Appointment',
      nameAr: 'موعد تقويم',
      description: 'Schedule photography session in Google Calendar',
      steps: [
        {
          integrationId: 'google-workspace',
          action: 'Create Calendar Event',
          params: {
            summary: 'جلسة تصوير: {{vehicleName}}',
            description: 'تصوير سيارة للعميل {{customerName}}',
            start: { dateTime: '{{startTime}}', timeZone: 'Asia/Riyadh' },
            end: { dateTime: '{{endTime}}', timeZone: 'Asia/Riyadh' },
            attendees: [{ email: '{{photographerEmail}}' }, { email: '{{customerEmail}}' }],
          },
          inputMapping: { vehicleName: 'vehicleName', customerName: 'customerName', startTime: 'startTime', endTime: 'endTime', photographerEmail: 'photographerEmail', customerEmail: 'customerEmail' },
          outputMapping: { eventId: 'calendarEventId', link: 'calendarLink' },
        },
        {
          integrationId: 'whatsapp',
          action: 'Send Message',
          params: { to: '{{customerPhone}}', message: 'تم تحديد موعد التصوير: {{calendarLink}}' },
          inputMapping: { customerPhone: 'customerPhone', calendarLink: 'calendarLink' },
          outputMapping: {},
        },
      ],
    });

    // Sheets Report Workflow
    this.registerWorkflow({
      id: 'sheets-report',
      name: 'Sheets Report',
      nameAr: 'تقرير جداول',
      description: 'Append performance data to Google Sheets',
      steps: [
        {
          integrationId: 'google-workspace',
          action: 'Append to Sheet',
          params: {
            spreadsheetId: '{{spreadsheetId}}',
            range: 'Reports!A:Z',
            values: [['{{date}}', '{{metric}}', '{{value}}', '{{details}}']],
          },
          inputMapping: { spreadsheetId: 'spreadsheetId', date: 'date', metric: 'metric', value: 'value', details: 'details' },
          outputMapping: { updatedRange: 'updatedRange' },
        },
      ],
    });

    // Multi-platform Marketing Workflow
    this.registerWorkflow({
      id: 'multi-platform-marketing',
      name: 'Multi-Platform Marketing',
      nameAr: 'تسويق متعدد المنصات',
      description: 'Post marketing content to multiple platforms',
      steps: [
        {
          integrationId: 'facebook-marketplace',
          action: 'Create Listing',
          params: { title: '{{title}}', description: '{{description}}', price: '{{price}}', images: '{{images}}' },
          inputMapping: { title: 'title', description: 'description', price: 'price', images: 'images' },
          outputMapping: { listingId: 'fbListingId' },
        },
        {
          integrationId: 'whatsapp',
          action: 'Send Message',
          params: { to: '{{groupId}}', message: 'منشور جديد: {{title}} - {{fbUrl}}' },
          inputMapping: { groupId: 'whatsappGroupId', title: 'title', fbUrl: 'fbUrl' },
          outputMapping: {},
        },
      ],
    });
  }

  registerWorkflow(workflow: IntegrationWorkflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  getWorkflow(id: string): IntegrationWorkflow | undefined {
    return this.workflows.get(id);
  }

  listWorkflows(): IntegrationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  async executeWorkflow(
    workflowId: string,
    input: Record<string, unknown>
  ): Promise<{
    success: boolean;
    results: Record<string, unknown>;
    errors: Record<string, string>;
    duration: number;
  }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const startTime = Date.now();
    const context: IntegrationWorkflowContext = {
      input,
      outputs: {},
      stepResults: {},
      errors: {},
    };

    for (const step of workflow.steps) {
      // Check condition
      if (step.condition && !step.condition(context)) {
        continue;
      }

      // Build params
      const params: Record<string, unknown> = {};
      for (const [key, template] of Object.entries(step.params)) {
        params[key] = this.interpolate(template, { ...context.input, ...context.outputs });
      }

      // Execute with retry
      let result: unknown;
      let lastError: Error | null = null;
      const attempts = step.retry?.attempts ?? 1;
      const delay = step.retry?.delay ?? 1000;

      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          result = await this.manager.execute(step.integrationId, step.action, params);
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < attempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          }
        }
      }

      if (lastError && !result) {
        context.errors[`${step.integrationId}.${step.action}`] = lastError.message;
        // Continue with other steps
        continue;
      }

      // Store result
      context.stepResults[`${step.integrationId}.${step.action}`] = result;

      // Map outputs
      for (const [outputKey, resultKey] of Object.entries(step.outputMapping)) {
        if (result && typeof result === 'object' && resultKey in result) {
          context.outputs[outputKey] = (result as Record<string, unknown>)[resultKey];
        }
      }
    }

    const duration = Date.now() - startTime;
    const success = Object.keys(context.errors).length === 0;

    this.executionHistory.push({
      workflowId,
      timestamp: startTime,
      success,
      duration,
      results: context.outputs,
      errors: context.errors,
    });

    return {
      success,
      results: context.outputs,
      errors: context.errors,
      duration,
    };
  }

  private interpolate(template: unknown, data: Record<string, unknown>): unknown {
    if (typeof template !== 'string') return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return String(data[key] ?? match);
    });
  }

  // Delegate to underlying manager
  getConfig(id: string) { return this.manager.getConfig(id); }
  getInstance(id: string) { return this.manager.getInstance(id); }
  list() { return this.manager.list(); }
  listByCategory(category: string) { return this.manager.listByCategory(category); }
  listEnabled() { return this.manager.listEnabled(); }
  async connect(id: string, credentials: IntegrationCredentials) { return this.manager.connect(id, credentials); }
  async disconnect(id: string) { return this.manager.disconnect(id); }
  async execute(id: string, action: string, params: Record<string, unknown>) { return this.manager.execute(id, action, params); }
  async sync(id: string) { return this.manager.sync(id); }
  getStatus(id: string) { return this.manager.getStatus(id); }
  on(event: string, handler: Function) { return this.manager.on(event, handler); }
  off(event: string, handler: Function) { return this.manager.off(event, handler); }

  getExecutionHistory() {
    return [...this.executionHistory];
  }

  getIntegrationStats(integrationId: string): {
    totalExecutions: number;
    successRate: number;
    avgDuration: number;
    lastExecution: Date | null;
  } {
    const executions = this.executionHistory.filter(e => {
      // Check if workflow uses this integration
      const workflow = this.workflows.get(e.workflowId);
      if (!workflow) return false;
      return workflow.steps.some(s => s.integrationId === integrationId);
    });

    if (executions.length === 0) {
      return { totalExecutions: 0, successRate: 0, avgDuration: 0, lastExecution: null };
    }

    const successful = executions.filter(e => e.success).length;
    const avgDuration = executions.reduce((sum, e) => sum + e.duration, 0) / executions.length;
    const lastExecution = executions[executions.length - 1];

    return {
      totalExecutions: executions.length,
      successRate: successful / executions.length,
      avgDuration,
      lastExecution: new Date(lastExecution.timestamp),
    };
  }
}

// Export singleton
export const integrationsManagerExtended = new IntegrationsManagerExtended();

// Utility functions
export async function runIntegrationWorkflow(
  workflowId: string,
  input: Record<string, unknown>
): Promise<{
  success: boolean;
  results: Record<string, unknown>;
  errors: Record<string, string>;
  duration: number;
}> {
  return integrationsManagerExtended.executeWorkflow(workflowId, input);
}

export function getIntegrationWorkflow(id: string) {
  return integrationsManagerExtended.getWorkflow(id);
}

export function listIntegrationWorkflows() {
  return integrationsManagerExtended.listWorkflows();
}

// Pre-defined integration configs for easy setup
export const integrationSetupGuide = {
  github: {
    name: 'GitHub',
    description: 'Repositories, Issues, PRs, Actions',
    requiredCredentials: ['personalAccessToken'],
    scopes: ['repo', 'workflow', 'read:org'],
    setupUrl: 'https://github.com/settings/tokens',
  },
  'google-workspace': {
    name: 'Google Workspace',
    description: 'Drive, Photos, Calendar, Sheets, Gmail',
    requiredCredentials: ['oauth2'],
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/photoslibrary',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
  },
  whatsapp: {
    name: 'WhatsApp Web',
    description: 'WhatsApp messaging via local bridge',
    requiredCredentials: ['sessionId'],
    setupNote: 'Run local WhatsApp Web bridge server (port 3001)',
  },
  haraj: {
    name: 'Haraj',
    description: 'Saudi Arabia vehicle marketplace',
    requiredCredentials: ['username', 'password'],
    setupNote: 'Requires manual login to get session cookies',
  },
  'facebook-marketplace': {
    name: 'Facebook Marketplace',
    description: 'Meta Marketplace listings',
    requiredCredentials: ['pageAccessToken'],
    scopes: ['pages_manage_posts', 'catalog_management'],
    setupUrl: 'https://developers.facebook.com/',
  },
};