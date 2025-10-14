/**
 * ZippyCodeAudit Core Engine
 * Main analysis engine for code auditing
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const simpleGit = require('simple-git');
const chalk = require('chalk');
const ora = require('ora');

class AuditEngine {
  constructor(options = {}) {
    this.options = {
      projectPath: process.cwd(),
      includePatterns: ['**/*.{js,ts,py,go,md,json,yml,yaml}'],
      excludePatterns: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      maxDepth: 10,
      verbose: false,
      ...options
    };

    this.git = simpleGit(this.options.projectPath);
    this.spinner = ora();
    this.results = {
      metadata: {},
      files: [],
      issues: [],
      metrics: {},
      recommendations: []
    };
  }

  /**
   * Initialize audit engine
   */
  async initialize() {
    this.showSpinner('Initializing audit engine...');

    try {
      // Check if it's a git repository
      const isGitRepo = await this.git.checkIsRepo();
      this.results.metadata.isGitRepository = isGitRepo;

      if (isGitRepo) {
        // Get repository information
        this.results.metadata.repositoryInfo = await this.getRepositoryInfo();
      }

      // Get project structure
      this.results.metadata.projectStructure = await this.analyzeProjectStructure();

      // Get package information
      this.results.metadata.packageInfo = await this.analyzePackageFiles();

      this.hideSpinner();
      return true;
    } catch (error) {
      this.hideSpinner();
      throw new Error(`Failed to initialize audit engine: ${error.message}`);
    }
  }

  /**
   * Run complete audit analysis
   */
  async runAudit() {
    try {
      await this.initialize();

      this.showSpinner('Analyzing codebase...');

      // Analyze files
      await this.analyzeFiles();

      // Run quality checks
      await this.runQualityChecks();

      // Generate recommendations
      await this.generateRecommendations();

      this.hideSpinner();

      // Save to history
      try {
        const HistoryTracker = require('./HistoryTracker');
        const tracker = new HistoryTracker(this.options.projectPath);
        await tracker.saveAudit(this.results);
      } catch (historyError) {
        console.warn('Failed to save audit history:', historyError.message);
      }

      return this.results;
    } catch (error) {
      this.hideSpinner();
      throw error;
    }
  }

  /**
   * Run progressive audit with phases
   * Phase 1: Quick Parse, Phase 2: Smart Prompt, Phase 3: Progressive Execution, Phase 4: Results
   */
  async runProgressiveAudit(testSuite = 'standard', onProgress = null) {
    try {
      // Phase 1: Quick Parse (5-10 seconds)
      if (onProgress) onProgress({ phase: 1, stage: 'scanning', progress: 0, message: 'Starting quick parse...' });
      
      const quickProfile = await this.quickParse(onProgress);
      
      if (onProgress) onProgress({ phase: 1, stage: 'complete', progress: 20, message: 'Quick parse complete', data: quickProfile });

      // Phase 2: Smart Prompt (handled by caller typically)
      // This is where the UI would show test options to the user
      
      // Phase 3: Progressive Execution
      if (onProgress) onProgress({ phase: 3, stage: 'security', progress: 30, message: 'Running security checks...' });
      
      await this.initialize();
      
      if (onProgress) onProgress({ phase: 3, stage: 'analyzing', progress: 40, message: 'Analyzing codebase...' });
      await this.analyzeFiles();
      
      if (onProgress) onProgress({ phase: 3, stage: 'quality', progress: 60, message: 'Checking code quality...' });
      await this.runQualityChecks();
      
      if (onProgress) onProgress({ phase: 3, stage: 'linting', progress: 80, message: 'Running linters...' });
      await this.generateRecommendations();
      
      // Phase 4: Results & Recommendations
      if (onProgress) onProgress({ phase: 4, stage: 'complete', progress: 100, message: 'Audit complete!', data: this.results });
      
      // Save to history
      try {
        const HistoryTracker = require('./HistoryTracker');
        const tracker = new HistoryTracker(this.options.projectPath);
        await tracker.saveAudit(this.results);
      } catch (historyError) {
        console.warn('Failed to save audit history:', historyError.message);
      }

      return this.results;
    } catch (error) {
      if (onProgress) onProgress({ phase: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Quick parse for initial project profile
   */
  async quickParse(onProgress = null) {
    const ProjectDetector = require('./ProjectDetector');
    const detector = new ProjectDetector(this.options.projectPath);
    
    if (onProgress) onProgress({ phase: 1, stage: 'detecting', progress: 5, message: 'Detecting project type...' });
    
    const detection = await detector.detect();
    
    if (onProgress) onProgress({ phase: 1, stage: 'counting', progress: 15, message: 'Counting files and languages...' });
    
    return {
      projectType: detection.projectType,
      languages: detection.languages,
      frameworks: detection.frameworks,
      fileCount: detection.fileCount,
      complexity: detection.complexity,
      summary: detector.getSummary()
    };
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo() {
    try {
      const remotes = await this.git.getRemotes(true);
      const branch = await this.git.branch();
      const log = await this.git.log({ maxCount: 10 });

      return {
        remotes,
        currentBranch: branch.current,
        recentCommits: log.all.slice(0, 5),
        totalCommits: log.total
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Analyze project structure
   */
  async analyzeProjectStructure() {
    const projectPath = this.options.projectPath;
    const structure = {
      directories: [],
      files: [],
      totalFiles: 0,
      totalDirectories: 0
    };

    try {
      const items = await fs.readdir(projectPath, { withFileTypes: true });

      for (const item of items) {
        if (item.isDirectory() && !this.shouldExclude(item.name)) {
          structure.directories.push(item.name);
          structure.totalDirectories++;
        } else if (item.isFile() && !this.shouldExclude(item.name)) {
          structure.files.push(item.name);
          structure.totalFiles++;
        }
      }

      return structure;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Analyze package files
   */
  async analyzePackageFiles() {
    const packageFiles = [
      'package.json',
      'requirements.txt',
      'pyproject.toml',
      'go.mod',
      'Cargo.toml',
      'composer.json',
      'Gemfile'
    ];

    const packageInfo = {};

    for (const file of packageFiles) {
      const filePath = path.join(this.options.projectPath, file);
      if (await fs.pathExists(filePath)) {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const parsed = this.parsePackageFile(file, content);
          if (parsed) {
            packageInfo[file] = parsed;
          }
        } catch (error) {
          packageInfo[file] = { error: error.message };
        }
      }
    }

    return packageInfo;
  }

  /**
   * Parse package file content
   */
  parsePackageFile(filename, content) {
    try {
      switch (filename) {
        case 'package.json':
          return JSON.parse(content);
        case 'requirements.txt':
        case 'pyproject.toml':
        case 'go.mod':
        case 'Cargo.toml':
        case 'composer.json':
        case 'Gemfile':
          return { raw: content };
        default:
          return null;
      }
    } catch (error) {
      return { error: error.message, raw: content };
    }
  }

  /**
   * Analyze project files
   */
  async analyzeFiles() {
    const patterns = this.options.includePatterns.map(pattern =>
      path.join(this.options.projectPath, pattern)
    );

    const files = [];

    for (const pattern of patterns) {
      const matches = await new Promise((resolve, reject) => {
        glob(pattern, {
          ignore: this.options.excludePatterns,
          cwd: this.options.projectPath,
          maxDepth: this.options.maxDepth
        }, (error, matches) => {
          if (error) reject(error);
          else resolve(matches);
        });
      });

      for (const file of matches) {
        const filePath = path.join(this.options.projectPath, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');

        files.push({
          path: file,
          absolutePath: filePath,
          size: stats.size,
          extension: path.extname(file),
          lines: content.split('\n').length,
          language: this.getLanguageFromExtension(path.extname(file)),
          lastModified: stats.mtime
        });
      }
    }

    this.results.files = files;
    this.results.metadata.totalFilesAnalyzed = files.length;
  }

  /**
   * Run quality checks
   */
  async runQualityChecks() {
    const issues = [];

    // File size check
    issues.push(...this.checkFileSizes());

    // Naming convention checks
    issues.push(...this.checkNamingConventions());

    // Documentation checks
    issues.push(...this.checkDocumentation());

    // Security checks
    issues.push(...this.checkSecurity());

    this.results.issues = issues;
    this.results.metadata.totalIssues = issues.length;
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations() {
    const recommendations = [];

    // Based on issues found
    if (this.results.issues.length > 0) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        title: 'Address Critical Issues',
        description: `Found ${this.results.issues.length} issues that need immediate attention.`,
        issues: this.results.issues.filter(i => i.severity === 'high')
      });
    }

    // Based on file analysis
    if (this.results.files.length > 1000) {
      recommendations.push({
        type: 'architecture',
        priority: 'medium',
        title: 'Consider Code Organization',
        description: 'Large codebase detected. Consider modularization or microservices.',
        metrics: { totalFiles: this.results.files.length }
      });
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Check file sizes for potential issues
   */
  checkFileSizes() {
    const issues = [];
    const largeFiles = this.results.files.filter(f => f.size > 1024 * 1024); // > 1MB

    largeFiles.forEach(file => {
      issues.push({
        type: 'performance',
        severity: 'medium',
        file: file.path,
        line: null,
        message: `Large file detected (${Math.round(file.size / 1024)}KB). Consider splitting or optimizing.`,
        suggestion: 'Break into smaller modules or optimize content'
      });
    });

    return issues;
  }

  /**
   * Check naming conventions
   */
  checkNamingConventions() {
    const issues = [];
    const badNames = this.results.files.filter(f =>
      f.path.includes(' ') ||
      f.path.match(/[A-Z][a-z]*[A-Z]/) || // camelCase issues
      f.path.includes('_') && f.extension === '.js' // snake_case in JS
    );

    badNames.forEach(file => {
      issues.push({
        type: 'style',
        severity: 'low',
        file: file.path,
        line: null,
        message: 'Potential naming convention issue detected',
        suggestion: 'Follow project-specific naming conventions'
      });
    });

    return issues;
  }

  /**
   * Check documentation completeness
   */
  checkDocumentation() {
    const issues = [];
    const hasReadme = this.results.files.some(f =>
      f.path.toLowerCase().includes('readme')
    );

    if (!hasReadme) {
      issues.push({
        type: 'documentation',
        severity: 'medium',
        file: null,
        line: null,
        message: 'No README file found',
        suggestion: 'Create a comprehensive README.md with setup and usage instructions'
      });
    }

    return issues;
  }

  /**
   * Basic security checks
   */
  checkSecurity() {
    const issues = [];

    // Check for potential secrets in files
    this.results.files.forEach(file => {
      if (file.content && (
        file.content.includes('password') ||
        file.content.includes('secret') ||
        file.content.includes('api_key') ||
        file.content.match(/sk-[a-zA-Z0-9]{32,}/) // OpenAI-like keys
      )) {
        issues.push({
          type: 'security',
          severity: 'high',
          file: file.path,
          line: null,
          message: 'Potential sensitive information detected',
          suggestion: 'Use environment variables or secure secret management'
        });
      }
    });

    return issues;
  }

  /**
   * Get language from file extension
   */
  getLanguageFromExtension(extension) {
    const languageMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.go': 'Go',
      '.rs': 'Rust',
      '.java': 'Java',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.yml': 'YAML',
      '.yaml': 'YAML',
      '.xml': 'XML',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.less': 'Less'
    };

    return languageMap[extension] || 'Unknown';
  }

  /**
   * Check if path should be excluded
   */
  shouldExclude(pathName) {
    return this.options.excludePatterns.some(pattern =>
      pathName.includes(pattern.replace('**', ''))
    );
  }

  /**
   * Show spinner with message
   */
  showSpinner(message) {
    if (!this.options.verbose) {
      this.spinner.start(message);
    } else {
      console.log(chalk.blue(`⏳ ${message}`));
    }
  }

  /**
   * Hide spinner
   */
  hideSpinner() {
    if (!this.options.verbose) {
      this.spinner.stop();
    }
  }
}

module.exports = AuditEngine;
