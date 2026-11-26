import { logger } from '@utils/logger';
import { config } from '@config';
import { Octokit } from '@octokit/rest';

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  private: boolean;
  url: string;
  language: string;
  stars: number;
  forks: number;
  defaultBranch: string;
  updatedAt: string;
}

interface GitHubCommit {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorDate: string;
  committerDate: string;
  url: string;
}

interface GitHubDeployment {
  id: number;
  ref: string;
  environment: string;
  status: string;
  url: string;
  createdAt: string;
}

class GitHubService {
  private octokit: Octokit | null = null;
  private userTokens: Map<string, string> = new Map();

  constructor() {
    if (config.githubClientId && config.githubClientSecret) {
      this.octokit = new Octokit({
        auth: config.githubToken,
      });
    }
  }

  setUserToken(userId: string, token: string): void {
    this.userTokens.set(userId, token);
  }

  getUserOctokit(userId: string): Octokit | null {
    const token = this.userTokens.get(userId);
    if (!token) return null;
    return new Octokit({ auth: token });
  }

  getAuthUrl(userId: string): string {
    const params = new URLSearchParams({
      client_id: config.githubClientId || '',
      redirect_uri: config.githubRedirectUri || 'http://localhost:3001/api/v1/auth/github/callback',
      scope: 'repo workflow read:org read:user',
      state: userId,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, userId: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: config.githubClientId || '',
      client_secret: config.githubClientSecret || '',
      code,
      redirect_uri: config.githubRedirectUri || 'http://localhost:3001/api/v1/auth/github/callback',
    });

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.access_token) {
      this.setUserToken(userId, data.access_token);
      return data.access_token;
    }
    throw new Error('Failed to exchange code for token');
  }

  async getRepositories(userId?: string): Promise<GitHubRepo[]> {
    try {
      const octokit = userId ? this.getUserOctokit(userId) : this.octokit;
      if (!octokit) throw new Error('No GitHub client available');

      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        type: 'all',
        sort: 'updated',
        per_page: 100,
      });

      return data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description || '',
        private: repo.private,
        url: repo.html_url,
        language: repo.language || '',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        defaultBranch: repo.default_branch,
        updatedAt: repo.updated_at,
      }));
    } catch (error) {
      logger.error('Failed to fetch repositories', { error });
      throw error;
    }
  }

  async getRepository(owner: string, repo: string): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.repos.get({ owner, repo });
      return data;
    } catch (error) {
      logger.error('Failed to get repository', { error, owner, repo });
      throw error;
    }
  }

  async getCommits(owner: string, repo: string, options: { sha?: string; per_page?: number; page?: number } = {}): Promise<GitHubCommit[]> {
    try {
      const { data } = await this.octokit!.rest.repos.listCommits({
        owner,
        repo,
        sha: options.sha,
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        authorName: commit.commit.author?.name || '',
        authorEmail: commit.commit.author?.email || '',
        authorDate: commit.commit.author?.date || '',
        committerDate: commit.commit.committer?.date || '',
        url: commit.html_url,
      }));
    } catch (error) {
      logger.error('Failed to fetch commits', { error });
      throw error;
    }
  }

  async getBranches(owner: string, repo: string): Promise<any[]> {
    try {
      const { data } = await this.octokit!.rest.repos.listBranches({ owner, repo });
      return data.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected,
      }));
    } catch (error) {
      logger.error('Failed to fetch branches', { error });
      throw error;
    }
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string): Promise<any> {
    try {
      const baseRef = await this.octokit!.rest.git.getRef({ owner, repo, ref: `heads/${fromBranch}` });
      const { data } = await this.octokit!.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.data.object.sha,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create branch', { error });
      throw error;
    }
  }

  async createPullRequest(owner: string, repo: string, options: {
    title: string;
    head: string;
    base: string;
    body?: string;
    draft?: boolean;
  }): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.pulls.create({
        owner,
        repo,
        title: options.title,
        head: options.head,
        base: options.base,
        body: options.body,
        draft: options.draft || false,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create pull request', { error });
      throw error;
    }
  }

  async mergePullRequest(owner: string, repo: string, pullNumber: number, mergeMethod: 'merge' | 'squash' | 'rebase' = 'merge'): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.pulls.merge({
        owner,
        repo,
        pull_number: pullNumber,
        merge_method: mergeMethod,
      });
      return data;
    } catch (error) {
      logger.error('Failed to merge pull request', { error });
      throw error;
    }
  }

  async triggerDeployment(owner: string, repo: string, ref: string, environment: string): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.repos.createDeployment({
        owner,
        repo,
        ref,
        environment,
        auto_merge: false,
        required_contexts: [],
      });
      return data;
    } catch (error) {
      logger.error('Failed to create deployment', { error });
      throw error;
    }
  }

  async getDeploymentStatus(owner: string, repo: string, deploymentId: number): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.repos.getDeploymentStatuses({
        owner,
        repo,
        deployment_id: deploymentId,
      });
      return data;
    } catch (error) {
      logger.error('Failed to get deployment status', { error });
      throw error;
    }
  }

  async getWorkflowRuns(owner: string, repo: string, options: { branch?: string; status?: string; per_page?: number } = {}): Promise<any[]> {
    try {
      const { data } = await this.octokit!.rest.actions.listWorkflowRuns({
        owner,
        repo,
        branch: options.branch,
        status: options.status,
        per_page: options.per_page || 30,
      });
      return data.workflow_runs;
    } catch (error) {
      logger.error('Failed to fetch workflow runs', { error });
      throw error;
    }
  }

  async triggerWorkflow(owner: string, repo: string, workflowId: string, ref: string, inputs?: Record<string, string>): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
        inputs,
      });
      return data;
    } catch (error) {
      logger.error('Failed to trigger workflow', { error });
      throw error;
    }
  }

  async getConnectionStatus(userId: string): Promise<{ connected: boolean; user?: any }> {
    try {
      const octokit = this.getUserOctokit(userId);
      if (!octokit) return { connected: false };

      const { data } = await octokit.rest.users.getAuthenticated();
      return { connected: true, user: data };
    } catch {
      return { connected: false };
    }
  }

  async createIssue(owner: string, repo: string, options: {
    title: string;
    body?: string;
    assignees?: string[];
    labels?: string[];
    assignee?: string;
  }): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.issues.create({
        owner,
        repo,
        title: options.title,
        body: options.body,
        assignees: options.assignees,
        labels: options.labels,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create issue', { error });
      throw error;
    }
  }

  async createRelease(owner: string, repo: string, options: {
    tagName: string;
    name?: string;
    body?: string;
    draft?: boolean;
    prerelease?: boolean;
    targetCommitish?: string;
  }): Promise<any> {
    try {
      const { data } = await this.octokit!.rest.repos.createRelease({
        owner,
        repo,
        tag_name: options.tagName,
        name: options.name,
        body: options.body,
        draft: options.draft || false,
        prerelease: options.prerelease || false,
        target_commitish: options.targetCommitish,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create release', { error });
      throw error;
    }
  }

  async getConnectionStatus(): Promise<{ connected: boolean }> {
    try {
      if (!this.octokit) return { connected: false };
      await this.octokit.rest.users.getAuthenticated();
      return { connected: true };
    } catch {
      return { connected: false };
    }
  }
}

export const githubService = new GitHubService();
export default githubService;