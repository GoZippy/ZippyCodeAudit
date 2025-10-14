/**
 * GitHub Integration Service
 * Handles GitHub OAuth, repository browsing, and cloning
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const simpleGit = require('simple-git');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class GitHubIntegration {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.apiBase = 'https://api.github.com';
    this.tempDir = path.join(os.tmpdir(), 'zippyaudit-github');
  }

  /**
   * Initialize temp directory
   */
  async initialize() {
    await fs.ensureDir(this.tempDir);
  }

  /**
   * Set access token
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated() {
    return !!this.accessToken;
  }

  /**
   * Make GitHub API request
   */
  async apiRequest(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error('GitHub access token not set');
    }

    const url = `${this.apiBase}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ZippyCodeAudit',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get authenticated user info
   */
  async getUserInfo() {
    return this.apiRequest('/user');
  }

  /**
   * List user repositories
   */
  async listRepositories(options = {}) {
    const {
      type = 'all', // all, owner, member
      sort = 'updated',
      direction = 'desc',
      per_page = 30,
      page = 1
    } = options;

    const params = new URLSearchParams({
      type,
      sort,
      direction,
      per_page: per_page.toString(),
      page: page.toString()
    });

    const repos = await this.apiRequest(`/user/repos?${params}`);

    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      html_url: repo.html_url,
      default_branch: repo.default_branch,
      language: repo.language,
      size: repo.size,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at,
      topics: repo.topics || []
    }));
  }

  /**
   * Search repositories
   */
  async searchRepositories(query, options = {}) {
    const { per_page = 30, page = 1 } = options;
    
    const params = new URLSearchParams({
      q: query,
      per_page: per_page.toString(),
      page: page.toString()
    });

    const result = await this.apiRequest(`/search/repositories?${params}`);
    
    return {
      total_count: result.total_count,
      items: result.items.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        clone_url: repo.clone_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count
      }))
    };
  }

  /**
   * Get repository details
   */
  async getRepository(owner, repo) {
    return this.apiRequest(`/repos/${owner}/${repo}`);
  }

  /**
   * Clone repository
   */
  async cloneRepository(repoUrl, options = {}) {
    await this.initialize();

    const {
      branch = null,
      depth = null,
      projectName = null
    } = options;

    // Extract repo name from URL
    const repoName = projectName || this.extractRepoName(repoUrl);
    const clonePath = path.join(this.tempDir, repoName);

    // Check if already exists
    if (await fs.pathExists(clonePath)) {
      await fs.remove(clonePath);
    }

    const git = simpleGit();
    const cloneOptions = [];

    if (branch) {
      cloneOptions.push('--branch', branch);
    }

    if (depth) {
      cloneOptions.push('--depth', depth.toString());
    }

    // Add auth token to URL if available
    let authUrl = repoUrl;
    if (this.accessToken && repoUrl.startsWith('https://')) {
      authUrl = repoUrl.replace('https://', `https://${this.accessToken}@`);
    }

    try {
      await git.clone(authUrl, clonePath, cloneOptions);

      // Remove .git directory to save space
      const gitDir = path.join(clonePath, '.git');
      if (await fs.pathExists(gitDir)) {
        await fs.remove(gitDir);
      }

      return {
        success: true,
        projectPath: clonePath,
        projectName: repoName
      };
    } catch (error) {
      // Cleanup on error
      if (await fs.pathExists(clonePath)) {
        await fs.remove(clonePath);
      }
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  /**
   * Extract repository name from URL
   */
  extractRepoName(url) {
    const match = url.match(/\/([^\/]+)\.git$/) || url.match(/\/([^\/]+)\/?$/);
    return match ? match[1] : `repo-${Date.now()}`;
  }

  /**
   * Get repository branches
   */
  async getBranches(owner, repo) {
    const branches = await this.apiRequest(`/repos/${owner}/${repo}/branches`);
    return branches.map(b => ({
      name: b.name,
      commit: {
        sha: b.commit.sha,
        url: b.commit.url
      },
      protected: b.protected
    }));
  }

  /**
   * Get repository workflows (GitHub Actions)
   */
  async getWorkflows(owner, repo) {
    try {
      const workflows = await this.apiRequest(`/repos/${owner}/${repo}/actions/workflows`);
      return workflows.workflows || [];
    } catch (error) {
      // Actions might be disabled
      return [];
    }
  }

  /**
   * Get workflow runs
   */
  async getWorkflowRuns(owner, repo, options = {}) {
    const { per_page = 10 } = options;
    
    try {
      const params = new URLSearchParams({ per_page: per_page.toString() });
      const runs = await this.apiRequest(`/repos/${owner}/${repo}/actions/runs?${params}`);
      
      return runs.workflow_runs.map(run => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        created_at: run.created_at,
        updated_at: run.updated_at,
        html_url: run.html_url
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get security alerts (requires appropriate permissions)
   */
  async getSecurityAlerts(owner, repo) {
    try {
      const alerts = await this.apiRequest(
        `/repos/${owner}/${repo}/vulnerability-alerts`,
        {
          headers: {
            'Accept': 'application/vnd.github.dorian-preview+json'
          }
        }
      );
      return alerts;
    } catch (error) {
      // Might not have permissions
      return [];
    }
  }

  /**
   * Get dependabot alerts
   */
  async getDependabotAlerts(owner, repo) {
    try {
      const alerts = await this.apiRequest(
        `/repos/${owner}/${repo}/dependabot/alerts`
      );
      return alerts;
    } catch (error) {
      return [];
    }
  }

  /**
   * Cleanup cloned repositories
   */
  async cleanup(olderThanDays = 1) {
    try {
      const entries = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = olderThanDays * 24 * 60 * 60 * 1000;

      for (const entry of entries) {
        const entryPath = path.join(this.tempDir, entry);
        const stat = await fs.stat(entryPath);
        
        if (now - stat.mtimeMs > maxAge) {
          await fs.remove(entryPath);
        }
      }
    } catch (error) {
      console.warn('Cleanup failed:', error.message);
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getOAuthURL(clientId, redirectUri, scopes = ['repo', 'read:user']) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state: this.generateState()
    });

    return `https://github.com/login/oauth/authorize?${params}`;
  }

  /**
   * Generate OAuth state token
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCodeForToken(code, clientId, clientSecret) {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return data.access_token;
  }
}

module.exports = GitHubIntegration;

