/**
 * Environment Configuration Manager
 * Detects environment conflicts and suggests resolution strategies
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs-extra');
const path = require('path');

const execAsync = promisify(exec);

class EnvironmentManager {
  constructor(projectPath, detectionResults) {
    this.projectPath = projectPath;
    this.detection = detectionResults;
    this.localEnvironment = {};
    this.conflicts = [];
  }

  /**
   * Analyze environment compatibility
   */
  async analyze() {
    // Detect local environment
    await this.detectLocalEnvironment();

    // Check for conflicts
    await this.detectConflicts();

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      localEnvironment: this.localEnvironment,
      projectRequirements: this.getProjectRequirements(),
      conflicts: this.conflicts,
      recommendations,
      needsIsolation: this.conflicts.length > 0
    };
  }

  /**
   * Detect local environment
   */
  async detectLocalEnvironment() {
    // Check Node.js
    if (this.detection.projectType === 'Node.js') {
      this.localEnvironment.node = await this.getNodeVersion();
      this.localEnvironment.npm = await this.getNpmVersion();
    }

    // Check Python
    if (this.detection.projectType === 'Python') {
      this.localEnvironment.python = await this.getPythonVersion();
      this.localEnvironment.pip = await this.getPipVersion();
    }

    // Check Go
    if (this.detection.projectType === 'Go') {
      this.localEnvironment.go = await this.getGoVersion();
    }

    // Check Docker
    this.localEnvironment.docker = await this.getDockerVersion();

    // Check Git
    this.localEnvironment.git = await this.getGitVersion();
  }

  /**
   * Get Node.js version
   */
  async getNodeVersion() {
    try {
      const { stdout } = await execAsync('node --version');
      return stdout.trim().replace('v', '');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get npm version
   */
  async getNpmVersion() {
    try {
      const { stdout } = await execAsync('npm --version');
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Python version
   */
  async getPythonVersion() {
    try {
      const { stdout } = await execAsync('python --version');
      return stdout.trim().replace('Python ', '');
    } catch (error) {
      try {
        const { stdout } = await execAsync('python3 --version');
        return stdout.trim().replace('Python ', '');
      } catch (error2) {
        return null;
      }
    }
  }

  /**
   * Get pip version
   */
  async getPipVersion() {
    try {
      const { stdout } = await execAsync('pip --version');
      const match = stdout.match(/pip ([\d.]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Go version
   */
  async getGoVersion() {
    try {
      const { stdout } = await execAsync('go version');
      const match = stdout.match(/go([\d.]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Docker version
   */
  async getDockerVersion() {
    try {
      const { stdout } = await execAsync('docker --version');
      const match = stdout.match(/Docker version ([\d.]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Git version
   */
  async getGitVersion() {
    try {
      const { stdout } = await execAsync('git --version');
      const match = stdout.match(/git version ([\d.]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get project requirements
   */
  getProjectRequirements() {
    const requirements = {};

    if (this.detection.metadata.nodeVersion) {
      requirements.node = this.detection.metadata.nodeVersion;
    }

    if (this.detection.metadata.pythonVersion) {
      requirements.python = this.detection.metadata.pythonVersion;
    }

    if (this.detection.metadata.goVersion) {
      requirements.go = this.detection.metadata.goVersion;
    }

    return requirements;
  }

  /**
   * Detect conflicts
   */
  async detectConflicts() {
    const requirements = this.getProjectRequirements();

    // Check Node.js version
    if (requirements.node && this.localEnvironment.node) {
      const conflict = this.checkVersionConflict(
        'Node.js',
        requirements.node,
        this.localEnvironment.node
      );
      if (conflict) this.conflicts.push(conflict);
    } else if (requirements.node && !this.localEnvironment.node) {
      this.conflicts.push({
        tool: 'Node.js',
        type: 'missing',
        required: requirements.node,
        current: null,
        severity: 'high',
        message: 'Node.js is not installed but required by project'
      });
    }

    // Check Python version
    if (requirements.python && this.localEnvironment.python) {
      const conflict = this.checkVersionConflict(
        'Python',
        requirements.python,
        this.localEnvironment.python
      );
      if (conflict) this.conflicts.push(conflict);
    } else if (requirements.python && !this.localEnvironment.python) {
      this.conflicts.push({
        tool: 'Python',
        type: 'missing',
        required: requirements.python,
        current: null,
        severity: 'high',
        message: 'Python is not installed but required by project'
      });
    }

    // Check Go version
    if (requirements.go && this.localEnvironment.go) {
      const conflict = this.checkVersionConflict(
        'Go',
        requirements.go,
        this.localEnvironment.go
      );
      if (conflict) this.conflicts.push(conflict);
    } else if (requirements.go && !this.localEnvironment.go) {
      this.conflicts.push({
        tool: 'Go',
        type: 'missing',
        required: requirements.go,
        current: null,
        severity: 'high',
        message: 'Go is not installed but required by project'
      });
    }
  }

  /**
   * Check version conflict
   */
  checkVersionConflict(toolName, required, current) {
    const requiredVersion = this.parseVersion(required);
    const currentVersion = this.parseVersion(current);

    if (!requiredVersion || !currentVersion) {
      return null;
    }

    // Check major version mismatch
    if (requiredVersion.major !== currentVersion.major) {
      return {
        tool: toolName,
        type: 'version_mismatch',
        required,
        current,
        severity: 'high',
        message: `Major version mismatch: project requires ${required}, but ${current} is installed`
      };
    }

    // Check minor version mismatch
    if (requiredVersion.minor > currentVersion.minor) {
      return {
        tool: toolName,
        type: 'version_mismatch',
        required,
        current,
        severity: 'medium',
        message: `Minor version too old: project requires ${required}, but ${current} is installed`
      };
    }

    return null;
  }

  /**
   * Parse semantic version
   */
  parseVersion(versionString) {
    // Handle version ranges (^, ~, >=, etc.)
    const cleaned = versionString.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.').map(p => parseInt(p) || 0);

    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.conflicts.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Environment Compatible',
        message: 'Your local environment matches project requirements',
        actions: []
      });
      return recommendations;
    }

    // Recommend Docker if available
    if (this.localEnvironment.docker) {
      recommendations.push({
        type: 'primary',
        title: 'Use Docker Container',
        message: 'Run the audit in an isolated Docker container with the correct environment',
        actions: [
          {
            label: 'Generate Dockerfile',
            command: 'generate-dockerfile',
            icon: '🐳'
          },
          {
            label: 'Build & Run',
            command: 'docker-run',
            icon: '▶️'
          }
        ],
        pros: ['Complete isolation', 'Exact environment match', 'No local changes needed'],
        cons: ['Requires Docker', 'Slower initial build']
      });
    }

    // Recommend version managers
    if (this.conflicts.some(c => c.tool === 'Node.js')) {
      recommendations.push({
        type: 'alternative',
        title: 'Use Node Version Manager (nvm)',
        message: 'Switch to the required Node.js version using nvm',
        actions: [
          {
            label: 'Install nvm',
            command: 'install-nvm',
            icon: '📥'
          },
          {
            label: 'Switch Version',
            command: 'nvm-use',
            icon: '🔄'
          }
        ],
        pros: ['Easy version switching', 'No Docker required'],
        cons: ['Affects local environment', 'Requires manual setup']
      });
    }

    if (this.conflicts.some(c => c.tool === 'Python')) {
      recommendations.push({
        type: 'alternative',
        title: 'Use Python Virtual Environment',
        message: 'Create a virtual environment with the required Python version',
        actions: [
          {
            label: 'Create venv',
            command: 'create-venv',
            icon: '🐍'
          },
          {
            label: 'Activate',
            command: 'activate-venv',
            icon: '✅'
          }
        ],
        pros: ['Isolated Python environment', 'Easy to create/delete'],
        cons: ['Must be activated for each session']
      });
    }

    // Recommend proceeding anyway (with warning)
    recommendations.push({
      type: 'warning',
      title: 'Proceed Anyway',
      message: 'Run the audit with your current environment (may produce inaccurate results)',
      actions: [
        {
          label: 'Continue',
          command: 'proceed-anyway',
          icon: '⚠️'
        }
      ],
      pros: ['No setup required', 'Immediate results'],
      cons: ['May miss language-specific issues', 'Could fail on version-specific features']
    });

    return recommendations;
  }

  /**
   * Generate Dockerfile
   */
  async generateDockerfile() {
    const requirements = this.getProjectRequirements();
    let dockerfile = '';

    if (this.detection.projectType === 'Node.js') {
      const nodeVersion = requirements.node || '18';
      dockerfile = `
FROM node:${nodeVersion}-alpine

WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Install ZippyCodeAudit
RUN npm install -g zippycodesaudit

# Run audit
CMD ["zippycodesaudit", "analyze", "."]
`.trim();
    } else if (this.detection.projectType === 'Python') {
      const pythonVersion = requirements.python || '3.9';
      dockerfile = `
FROM python:${pythonVersion}-slim

WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt || true

# Install ZippyCodeAudit
RUN pip install zippycodesaudit

# Run audit
CMD ["zippycodesaudit", "analyze", "."]
`.trim();
    }

    return dockerfile;
  }

  /**
   * Generate docker-compose.yml
   */
  async generateDockerCompose() {
    return `
version: '3.8'

services:
  audit:
    build: .
    volumes:
      - .:/app
      - audit-results:/app/audit-results
    environment:
      - PROJECT_PATH=/app

volumes:
  audit-results:
`.trim();
  }

  /**
   * Get setup instructions
   */
  getSetupInstructions(recommendation) {
    const instructions = {
      'install-nvm': {
        windows: 'Download nvm-windows from https://github.com/coreybutler/nvm-windows/releases',
        mac: 'brew install nvm',
        linux: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'
      },
      'nvm-use': {
        all: `nvm install ${this.getProjectRequirements().node}\nnvm use ${this.getProjectRequirements().node}`
      },
      'create-venv': {
        all: `python -m venv venv\nsource venv/bin/activate  # On Windows: venv\\Scripts\\activate`
      },
      'generate-dockerfile': {
        all: 'Dockerfile will be generated in project root'
      }
    };

    return instructions[recommendation.command] || { all: 'No instructions available' };
  }
}

module.exports = EnvironmentManager;

