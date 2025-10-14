/**
 * Project Registry - Manages multiple projects for auditing
 * Provides project isolation, registration, and discovery
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ProjectRegistry {
  constructor() {
    this.registryPath = path.join(os.homedir(), '.zippycodesaudit', 'projects.json');
    this.projects = new Map();
    this.currentProject = null;
  }

  /**
   * Initialize the project registry
   */
  async initialize() {
    await this.ensureRegistryExists();
    await this.loadProjects();
  }

  /**
   * Ensure registry file exists
   */
  async ensureRegistryExists() {
    await fs.ensureFile(this.registryPath);
    const dir = path.dirname(this.registryPath);
    await fs.ensureDir(dir);
  }

  /**
   * Load projects from registry file
   */
  async loadProjects() {
    try {
      if (await fs.pathExists(this.registryPath)) {
        const data = await fs.readJson(this.registryPath);
        this.projects = new Map(Object.entries(data.projects || {}));
        this.currentProject = data.currentProject || null;
      }
    } catch (error) {
      console.warn('Failed to load project registry:', error.message);
      this.projects = new Map();
    }
  }

  /**
   * Save projects to registry file
   */
  async saveProjects() {
    try {
      const data = {
        projects: Object.fromEntries(this.projects),
        currentProject: this.currentProject,
        lastUpdated: new Date().toISOString()
      };
      await fs.writeJson(this.registryPath, data, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save project registry:', error);
      throw error;
    }
  }

  /**
   * Register a new project
   */
  async registerProject(projectPath, metadata = {}) {
    const normalizedPath = path.resolve(projectPath);
    const projectId = this.generateProjectId(normalizedPath);

    const project = {
      id: projectId,
      path: normalizedPath,
      name: metadata.name || path.basename(normalizedPath),
      description: metadata.description || '',
      type: metadata.type || this.detectProjectType(normalizedPath),
      registeredAt: new Date().toISOString(),
      lastAudited: null,
      auditCount: 0,
      tags: metadata.tags || [],
      // Enhanced metadata
      source: metadata.source || 'local', // local, github, zip
      sourceUrl: metadata.sourceUrl || null,
      detection: metadata.detection || null, // Project detection results
      complexity: metadata.complexity || 'unknown',
      frameworks: metadata.frameworks || [],
      languages: metadata.languages || {},
      fileCount: metadata.fileCount || 0,
      healthScore: metadata.healthScore || null,
      lastHealthScore: null,
      testSuite: metadata.testSuite || 'standard',
      schedule: metadata.schedule || 'manual',
      settings: {
        autoAudit: metadata.autoAudit || false,
        includePatterns: metadata.includePatterns || ['**/*.{js,ts,py,go,md,json,yml,yaml}'],
        excludePatterns: metadata.excludePatterns || ['node_modules/**', 'dist/**', 'build/**'],
        preset: metadata.preset || 'standard',
        ...metadata.settings
      }
    };

    this.projects.set(projectId, project);
    await this.saveProjects();

    return project;
  }

  /**
   * Unregister a project
   */
  async unregisterProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    this.projects.delete(projectId);

    // Switch to another project if this was current
    if (this.currentProject === projectId) {
      const remainingProjects = Array.from(this.projects.keys());
      this.currentProject = remainingProjects.length > 0 ? remainingProjects[0] : null;
    }

    await this.saveProjects();
    return project;
  }

  /**
   * Update project metadata
   */
  async updateProject(projectId, updates) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    Object.assign(project, updates, { updatedAt: new Date().toISOString() });
    await this.saveProjects();
    return project;
  }

  /**
   * Set current project
   */
  async setCurrentProject(projectId) {
    if (projectId && !this.projects.has(projectId)) {
      throw new Error(`Project not found: ${projectId}`);
    }

    this.currentProject = projectId;
    await this.saveProjects();
    return this.currentProject;
  }

  /**
   * Get current project
   */
  getCurrentProject() {
    return this.currentProject ? this.projects.get(this.currentProject) : null;
  }

  /**
   * Get project by ID
   */
  getProject(projectId) {
    return this.projects.get(projectId);
  }

  /**
   * Get project by path
   */
  getProjectByPath(projectPath) {
    const normalizedPath = path.resolve(projectPath);
    for (const project of this.projects.values()) {
      if (project.path === normalizedPath) {
        return project;
      }
    }
    return null;
  }

  /**
   * List all projects
   */
  listProjects() {
    return Array.from(this.projects.values());
  }

  /**
   * Find projects by criteria
   */
  findProjects(criteria = {}) {
    const projects = this.listProjects();

    return projects.filter(project => {
      if (criteria.type && project.type !== criteria.type) return false;
      if (criteria.tags && !criteria.tags.some(tag => project.tags.includes(tag))) return false;
      if (criteria.name && !project.name.toLowerCase().includes(criteria.name.toLowerCase())) return false;
      return true;
    });
  }

  /**
   * Generate unique project ID
   */
  generateProjectId(projectPath) {
    const hash = require('crypto').createHash('md5').update(projectPath).digest('hex');
    return `proj_${hash.substring(0, 8)}`;
  }

  /**
   * Detect project type from path
   */
  detectProjectType(projectPath) {
    const indicators = {
      'package.json': 'nodejs',
      'requirements.txt': 'python',
      'Cargo.toml': 'rust',
      'go.mod': 'go',
      'composer.json': 'php',
      'pom.xml': 'java',
      'Gemfile': 'ruby'
    };

    for (const [file, type] of Object.entries(indicators)) {
      if (fs.existsSync(path.join(projectPath, file))) {
        return type;
      }
    }

    return 'generic';
  }

  /**
   * Auto-discover projects in common locations
   */
  async discoverProjects() {
    const commonPaths = [
      process.cwd(),
      path.join(os.homedir(), 'Projects'),
      path.join(os.homedir(), 'Documents'),
      path.join(os.homedir(), 'Desktop')
    ];

    const discovered = [];

    for (const basePath of commonPaths) {
      if (!await fs.pathExists(basePath)) continue;

      try {
        const items = await fs.readdir(basePath, { withFileTypes: true });

        for (const item of items) {
          if (!item.isDirectory()) continue;

          const projectPath = path.join(basePath, item.name);
          const projectType = this.detectProjectType(projectPath);

          // Only consider directories with project indicators
          if (projectType !== 'generic') {
            const existingProject = this.getProjectByPath(projectPath);
            if (!existingProject) {
              discovered.push({
                path: projectPath,
                name: item.name,
                type: projectType,
                discoveredAt: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        // Skip inaccessible directories
        continue;
      }
    }

    return discovered;
  }

  /**
   * Get project statistics
   */
  getProjectStats(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    return {
      id: project.id,
      name: project.name,
      type: project.type,
      auditCount: project.auditCount,
      lastAudited: project.lastAudited,
      registeredAt: project.registeredAt,
      fileCount: this.getProjectFileCount(project.path),
      size: this.getProjectSize(project.path)
    };
  }

  /**
   * Get project file count
   */
  getProjectFileCount(projectPath) {
    try {
      const files = fs.readdirSync(projectPath, { recursive: true });
      return files.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get project size in bytes
   */
  getProjectSize(projectPath) {
    try {
      let totalSize = 0;
      const walkDir = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walkDir(filePath);
          } else {
            totalSize += stat.size;
          }
        }
      };
      walkDir(projectPath);
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate project exists and is accessible
   */
  async validateProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    if (!await fs.pathExists(project.path)) {
      throw new Error(`Project path not accessible: ${project.path}`);
    }

    return project;
  }

  /**
   * Clean up orphaned projects
   */
  async cleanupOrphanedProjects() {
    const orphaned = [];

    for (const [projectId, project] of this.projects) {
      if (!await fs.pathExists(project.path)) {
        orphaned.push(projectId);
      }
    }

    for (const projectId of orphaned) {
      this.projects.delete(projectId);
    }

    if (orphaned.length > 0) {
      await this.saveProjects();
    }

    return orphaned;
  }
}

module.exports = ProjectRegistry;
