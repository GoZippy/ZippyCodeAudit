/**
 * Smart Project Detection Service
 * Auto-detects project type, tech stack, frameworks, and configurations
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class ProjectDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.detectionResults = {
      projectType: null,
      languages: {},
      frameworks: [],
      buildTools: [],
      linters: [],
      testFrameworks: [],
      packageManagers: [],
      complexity: 'unknown',
      fileCount: 0,
      totalLines: 0,
      confidence: {},
      metadata: {}
    };
  }

  /**
   * Run full detection analysis
   */
  async detect() {
    try {
      // Phase 1: File system scan
      await this.scanFileStructure();
      
      // Phase 2: Detect package managers and manifests
      await this.detectPackageManagers();
      
      // Phase 3: Detect languages
      await this.detectLanguages();
      
      // Phase 4: Detect frameworks
      await this.detectFrameworks();
      
      // Phase 5: Detect build tools
      await this.detectBuildTools();
      
      // Phase 6: Detect linters and formatters
      await this.detectLintersAndFormatters();
      
      // Phase 7: Detect test frameworks
      await this.detectTestFrameworks();
      
      // Phase 8: Estimate complexity
      await this.estimateComplexity();
      
      // Phase 9: Calculate confidence scores
      this.calculateConfidence();
      
      return this.detectionResults;
    } catch (error) {
      console.error('Detection failed:', error);
      throw error;
    }
  }

  /**
   * Scan file structure
   */
  async scanFileStructure() {
    const files = await this.getProjectFiles();
    this.detectionResults.fileCount = files.length;
    
    // Count lines of code
    let totalLines = 0;
    for (const file of files.slice(0, 100)) { // Sample first 100 files
      try {
        const content = await fs.readFile(path.join(this.projectPath, file), 'utf8');
        totalLines += content.split('\n').length;
      } catch (error) {
        // Skip binary or unreadable files
      }
    }
    this.detectionResults.totalLines = totalLines;
  }

  /**
   * Get all project files
   */
  async getProjectFiles() {
    return new Promise((resolve, reject) => {
      glob('**/*', {
        cwd: this.projectPath,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'vendor/**'],
        nodir: true
      }, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }

  /**
   * Detect package managers
   */
  async detectPackageManagers() {
    const indicators = [
      { file: 'package.json', manager: 'npm', type: 'Node.js' },
      { file: 'package-lock.json', manager: 'npm', type: 'Node.js' },
      { file: 'yarn.lock', manager: 'yarn', type: 'Node.js' },
      { file: 'pnpm-lock.yaml', manager: 'pnpm', type: 'Node.js' },
      { file: 'requirements.txt', manager: 'pip', type: 'Python' },
      { file: 'Pipfile', manager: 'pipenv', type: 'Python' },
      { file: 'pyproject.toml', manager: 'poetry', type: 'Python' },
      { file: 'go.mod', manager: 'go modules', type: 'Go' },
      { file: 'Cargo.toml', manager: 'cargo', type: 'Rust' },
      { file: 'pom.xml', manager: 'maven', type: 'Java' },
      { file: 'build.gradle', manager: 'gradle', type: 'Java' },
      { file: 'Gemfile', manager: 'bundler', type: 'Ruby' },
      { file: 'composer.json', manager: 'composer', type: 'PHP' }
    ];

    for (const indicator of indicators) {
      const filePath = path.join(this.projectPath, indicator.file);
      if (await fs.pathExists(filePath)) {
        this.detectionResults.packageManagers.push(indicator.manager);
        if (!this.detectionResults.projectType) {
          this.detectionResults.projectType = indicator.type;
        }
        
        // Parse package files for additional info
        await this.parsePackageFile(indicator.file, indicator.type);
      }
    }
  }

  /**
   * Parse package file for dependencies
   */
  async parsePackageFile(filename, projectType) {
    const filePath = path.join(this.projectPath, filename);
    
    try {
      if (filename === 'package.json') {
        const pkg = await fs.readJson(filePath);
        this.detectionResults.metadata.packageName = pkg.name;
        this.detectionResults.metadata.version = pkg.version;
        this.detectionResults.metadata.dependencies = Object.keys(pkg.dependencies || {});
        this.detectionResults.metadata.devDependencies = Object.keys(pkg.devDependencies || {});
        
        // Detect Node version
        if (pkg.engines && pkg.engines.node) {
          this.detectionResults.metadata.nodeVersion = pkg.engines.node;
        }
      } else if (filename === 'pyproject.toml') {
        const content = await fs.readFile(filePath, 'utf8');
        // Basic TOML parsing for Python version
        const pythonMatch = content.match(/python\s*=\s*"([^"]+)"/);
        if (pythonMatch) {
          this.detectionResults.metadata.pythonVersion = pythonMatch[1];
        }
      } else if (filename === 'go.mod') {
        const content = await fs.readFile(filePath, 'utf8');
        const goMatch = content.match(/go\s+([\d.]+)/);
        if (goMatch) {
          this.detectionResults.metadata.goVersion = goMatch[1];
        }
      }
    } catch (error) {
      console.warn(`Failed to parse ${filename}:`, error.message);
    }
  }

  /**
   * Detect languages by file extensions
   */
  async detectLanguages() {
    const files = await this.getProjectFiles();
    const languageMap = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.py': 'Python',
      '.go': 'Go',
      '.rs': 'Rust',
      '.java': 'Java',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.c': 'C',
      '.cpp': 'C++',
      '.cs': 'C#',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.vue': 'Vue',
      '.svelte': 'Svelte'
    };

    const languageCounts = {};
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      const language = languageMap[ext];
      if (language) {
        languageCounts[language] = (languageCounts[language] || 0) + 1;
      }
    });

    this.detectionResults.languages = languageCounts;
    
    // Set primary language
    const primaryLanguage = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)[0];
    if (primaryLanguage) {
      this.detectionResults.metadata.primaryLanguage = primaryLanguage[0];
    }
  }

  /**
   * Detect frameworks
   */
  async detectFrameworks() {
    const pkg = this.detectionResults.metadata;
    const deps = [...(pkg.dependencies || []), ...(pkg.devDependencies || [])];

    const frameworkIndicators = [
      { deps: ['react', 'react-dom'], framework: 'React', category: 'frontend' },
      { deps: ['@angular/core'], framework: 'Angular', category: 'frontend' },
      { deps: ['vue'], framework: 'Vue.js', category: 'frontend' },
      { deps: ['svelte'], framework: 'Svelte', category: 'frontend' },
      { deps: ['next'], framework: 'Next.js', category: 'fullstack' },
      { deps: ['nuxt'], framework: 'Nuxt.js', category: 'fullstack' },
      { deps: ['express'], framework: 'Express.js', category: 'backend' },
      { deps: ['fastify'], framework: 'Fastify', category: 'backend' },
      { deps: ['nestjs'], framework: 'NestJS', category: 'backend' },
      { deps: ['django'], framework: 'Django', category: 'backend' },
      { deps: ['flask'], framework: 'Flask', category: 'backend' },
      { deps: ['fastapi'], framework: 'FastAPI', category: 'backend' },
      { deps: ['gin'], framework: 'Gin', category: 'backend' },
      { deps: ['rails'], framework: 'Ruby on Rails', category: 'fullstack' }
    ];

    frameworkIndicators.forEach(indicator => {
      if (indicator.deps.some(dep => deps.includes(dep))) {
        this.detectionResults.frameworks.push({
          name: indicator.framework,
          category: indicator.category
        });
      }
    });
  }

  /**
   * Detect build tools
   */
  async detectBuildTools() {
    const buildTools = [
      { file: 'webpack.config.js', tool: 'Webpack' },
      { file: 'vite.config.js', tool: 'Vite' },
      { file: 'rollup.config.js', tool: 'Rollup' },
      { file: 'tsconfig.json', tool: 'TypeScript' },
      { file: 'babel.config.js', tool: 'Babel' },
      { file: '.babelrc', tool: 'Babel' },
      { file: 'Makefile', tool: 'Make' },
      { file: 'CMakeLists.txt', tool: 'CMake' },
      { file: 'Dockerfile', tool: 'Docker' },
      { file: 'docker-compose.yml', tool: 'Docker Compose' }
    ];

    for (const buildTool of buildTools) {
      const filePath = path.join(this.projectPath, buildTool.file);
      if (await fs.pathExists(filePath)) {
        if (!this.detectionResults.buildTools.includes(buildTool.tool)) {
          this.detectionResults.buildTools.push(buildTool.tool);
        }
      }
    }
  }

  /**
   * Detect linters and formatters
   */
  async detectLintersAndFormatters() {
    const linterConfigs = [
      { file: '.eslintrc', tool: 'ESLint', type: 'linter' },
      { file: '.eslintrc.js', tool: 'ESLint', type: 'linter' },
      { file: '.eslintrc.json', tool: 'ESLint', type: 'linter' },
      { file: '.prettierrc', tool: 'Prettier', type: 'formatter' },
      { file: '.prettierrc.js', tool: 'Prettier', type: 'formatter' },
      { file: '.pylintrc', tool: 'Pylint', type: 'linter' },
      { file: 'pyproject.toml', tool: 'Black', type: 'formatter' },
      { file: '.rubocop.yml', tool: 'RuboCop', type: 'linter' },
      { file: '.golangci.yml', tool: 'GolangCI', type: 'linter' },
      { file: 'rustfmt.toml', tool: 'rustfmt', type: 'formatter' }
    ];

    for (const config of linterConfigs) {
      const filePath = path.join(this.projectPath, config.file);
      if (await fs.pathExists(filePath)) {
        this.detectionResults.linters.push({
          name: config.tool,
          type: config.type,
          configFile: config.file
        });
      }
    }
  }

  /**
   * Detect test frameworks
   */
  async detectTestFrameworks() {
    const pkg = this.detectionResults.metadata;
    const deps = [...(pkg.dependencies || []), ...(pkg.devDependencies || [])];

    const testFrameworks = [
      { deps: ['jest'], framework: 'Jest', language: 'JavaScript' },
      { deps: ['mocha'], framework: 'Mocha', language: 'JavaScript' },
      { deps: ['vitest'], framework: 'Vitest', language: 'JavaScript' },
      { deps: ['cypress'], framework: 'Cypress', language: 'JavaScript' },
      { deps: ['playwright'], framework: 'Playwright', language: 'JavaScript' },
      { deps: ['pytest'], framework: 'Pytest', language: 'Python' },
      { deps: ['unittest'], framework: 'unittest', language: 'Python' }
    ];

    testFrameworks.forEach(test => {
      if (test.deps.some(dep => deps.includes(dep))) {
        this.detectionResults.testFrameworks.push({
          name: test.framework,
          language: test.language
        });
      }
    });

    // Check for test directories
    const testDirs = ['test', 'tests', '__tests__', 'spec'];
    for (const dir of testDirs) {
      const testPath = path.join(this.projectPath, dir);
      if (await fs.pathExists(testPath)) {
        this.detectionResults.metadata.hasTestDirectory = true;
        break;
      }
    }
  }

  /**
   * Estimate project complexity
   */
  async estimateComplexity() {
    const { fileCount, totalLines, languages } = this.detectionResults;
    const languageCount = Object.keys(languages).length;

    let complexityScore = 0;

    // File count scoring
    if (fileCount < 50) complexityScore += 1;
    else if (fileCount < 200) complexityScore += 2;
    else if (fileCount < 500) complexityScore += 3;
    else complexityScore += 4;

    // Lines of code scoring
    if (totalLines < 5000) complexityScore += 1;
    else if (totalLines < 20000) complexityScore += 2;
    else if (totalLines < 50000) complexityScore += 3;
    else complexityScore += 4;

    // Language diversity scoring
    if (languageCount <= 2) complexityScore += 1;
    else if (languageCount <= 4) complexityScore += 2;
    else complexityScore += 3;

    // Determine complexity level
    if (complexityScore <= 4) {
      this.detectionResults.complexity = 'simple';
    } else if (complexityScore <= 7) {
      this.detectionResults.complexity = 'moderate';
    } else if (complexityScore <= 10) {
      this.detectionResults.complexity = 'complex';
    } else {
      this.detectionResults.complexity = 'very complex';
    }

    this.detectionResults.metadata.complexityScore = complexityScore;
  }

  /**
   * Calculate confidence scores
   */
  calculateConfidence() {
    const confidence = {};

    // Project type confidence
    if (this.detectionResults.packageManagers.length > 0) {
      confidence.projectType = 0.95;
    } else if (Object.keys(this.detectionResults.languages).length > 0) {
      confidence.projectType = 0.7;
    } else {
      confidence.projectType = 0.3;
    }

    // Framework confidence
    if (this.detectionResults.frameworks.length > 0) {
      confidence.frameworks = 0.9;
    } else {
      confidence.frameworks = 0.5;
    }

    // Build tools confidence
    if (this.detectionResults.buildTools.length > 0) {
      confidence.buildTools = 0.85;
    } else {
      confidence.buildTools = 0.4;
    }

    this.detectionResults.confidence = confidence;
  }

  /**
   * Get human-readable summary
   */
  getSummary() {
    const { projectType, frameworks, languages, complexity, fileCount } = this.detectionResults;
    
    const primaryFramework = frameworks.length > 0 ? frameworks[0].name : null;
    const primaryLanguage = this.detectionResults.metadata.primaryLanguage;

    let summary = `${projectType || 'Unknown'} project`;
    
    if (primaryFramework) {
      summary += ` using ${primaryFramework}`;
    }
    
    if (primaryLanguage && primaryLanguage !== projectType) {
      summary += ` with ${primaryLanguage}`;
    }

    summary += `. ${fileCount} files, ${complexity} complexity.`;

    return summary;
  }
}

module.exports = ProjectDetector;

