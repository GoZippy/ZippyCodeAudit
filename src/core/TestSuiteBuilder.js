/**
 * Test Suite Configuration Builder
 * Builds appropriate test suites based on detected project characteristics
 */

class TestSuiteBuilder {
  constructor(detectionResults) {
    this.detection = detectionResults;
    this.availableTests = this.buildAvailableTests();
  }

  /**
   * Build list of available tests based on project
   */
  buildAvailableTests() {
    const tests = {
      tier1: [], // Always available
      tier2: [], // Conditional based on project
      tier3: [], // External integrations
      custom: []  // User-defined
    };

    // Tier 1 - Always Available
    tests.tier1 = [
      {
        id: 'code-quality',
        name: 'Code Quality',
        description: 'Analyze complexity, duplication, and naming conventions',
        estimatedTime: 30,
        enabled: true,
        checks: ['complexity', 'duplication', 'naming', 'file-size']
      },
      {
        id: 'security-basic',
        name: 'Basic Security',
        description: 'Scan for hardcoded secrets, unsafe patterns, and vulnerabilities',
        estimatedTime: 20,
        enabled: true,
        checks: ['secrets', 'unsafe-patterns', 'dependencies']
      },
      {
        id: 'formatting',
        name: 'Formatting Consistency',
        description: 'Check code style, indentation, and formatting',
        estimatedTime: 15,
        enabled: true,
        checks: ['indentation', 'line-length', 'whitespace']
      },
      {
        id: 'structure',
        name: 'File Structure',
        description: 'Analyze project organization and file structure',
        estimatedTime: 10,
        enabled: true,
        checks: ['organization', 'naming-convention', 'depth']
      }
    ];

    // Tier 2 - Conditional
    this.addConditionalTests(tests.tier2);

    // Tier 3 - External Integrations
    tests.tier3 = [
      {
        id: 'github-actions',
        name: 'GitHub Actions Status',
        description: 'Fetch and display GitHub CI/CD status',
        estimatedTime: 5,
        enabled: false,
        requires: 'github-token'
      },
      {
        id: 'sonarqube',
        name: 'SonarQube Analysis',
        description: 'Import metrics from SonarQube',
        estimatedTime: 10,
        enabled: false,
        requires: 'sonarqube-credentials'
      },
      {
        id: 'snyk',
        name: 'Snyk Vulnerability Scan',
        description: 'Check dependencies for known vulnerabilities',
        estimatedTime: 15,
        enabled: false,
        requires: 'snyk-api-key'
      },
      {
        id: 'codeclimate',
        name: 'Code Climate Metrics',
        description: 'Import maintainability metrics from Code Climate',
        estimatedTime: 10,
        enabled: false,
        requires: 'codeclimate-token'
      }
    ];

    return tests;
  }

  /**
   * Add conditional tests based on project detection
   */
  addConditionalTests(tier2Array) {
    const { projectType, languages, frameworks } = this.detection;

    // JavaScript/TypeScript specific
    if (languages.JavaScript || languages.TypeScript) {
      tier2Array.push({
        id: 'eslint',
        name: 'ESLint',
        description: 'JavaScript/TypeScript linting',
        estimatedTime: 25,
        enabled: true,
        language: 'JavaScript/TypeScript',
        configDetected: this.detection.linters.some(l => l.name === 'ESLint')
      });

      tier2Array.push({
        id: 'prettier',
        name: 'Prettier',
        description: 'Code formatting check',
        estimatedTime: 10,
        enabled: false,
        language: 'JavaScript/TypeScript',
        configDetected: this.detection.linters.some(l => l.name === 'Prettier')
      });
    }

    // React specific
    const hasReact = frameworks.some(f => f.name === 'React');
    if (hasReact) {
      tier2Array.push({
        id: 'react-hooks',
        name: 'React Hooks Rules',
        description: 'Validate React Hooks usage',
        estimatedTime: 15,
        enabled: true,
        framework: 'React'
      });

      tier2Array.push({
        id: 'react-accessibility',
        name: 'React Accessibility',
        description: 'Check for accessibility issues in React components',
        estimatedTime: 20,
        enabled: true,
        framework: 'React'
      });
    }

    // Vue specific
    const hasVue = frameworks.some(f => f.name === 'Vue.js');
    if (hasVue) {
      tier2Array.push({
        id: 'vue-best-practices',
        name: 'Vue Best Practices',
        description: 'Check Vue.js coding standards',
        estimatedTime: 15,
        enabled: true,
        framework: 'Vue.js'
      });
    }

    // Python specific
    if (languages.Python) {
      tier2Array.push({
        id: 'pylint',
        name: 'Pylint',
        description: 'Python code analysis',
        estimatedTime: 30,
        enabled: true,
        language: 'Python',
        configDetected: this.detection.linters.some(l => l.name === 'Pylint')
      });

      tier2Array.push({
        id: 'black',
        name: 'Black',
        description: 'Python code formatting',
        estimatedTime: 10,
        enabled: false,
        language: 'Python',
        configDetected: this.detection.linters.some(l => l.name === 'Black')
      });
    }

    // Go specific
    if (languages.Go) {
      tier2Array.push({
        id: 'golangci-lint',
        name: 'GolangCI-Lint',
        description: 'Go linting suite',
        estimatedTime: 25,
        enabled: true,
        language: 'Go'
      });
    }

    // Performance analysis for web projects
    const isWebProject = hasReact || hasVue || languages.HTML;
    if (isWebProject) {
      tier2Array.push({
        id: 'performance',
        name: 'Performance Analysis',
        description: 'Check for performance bottlenecks',
        estimatedTime: 20,
        enabled: false,
        category: 'performance'
      });

      tier2Array.push({
        id: 'bundle-size',
        name: 'Bundle Size Analysis',
        description: 'Analyze bundle size and dependencies',
        estimatedTime: 15,
        enabled: false,
        category: 'performance'
      });
    }

    // Test coverage (if tests detected)
    if (this.detection.testFrameworks.length > 0 || this.detection.metadata.hasTestDirectory) {
      tier2Array.push({
        id: 'test-coverage',
        name: 'Test Coverage',
        description: 'Analyze test coverage',
        estimatedTime: 30,
        enabled: false,
        category: 'testing'
      });
    }
  }

  /**
   * Get preset configurations
   */
  getPresets() {
    return {
      quick: {
        name: 'Quick Health Check',
        description: 'Essential checks only (30 seconds)',
        estimatedTime: 30,
        tests: ['code-quality', 'security-basic'],
        icon: '⚡'
      },
      standard: {
        name: 'Standard Audit',
        description: 'Recommended checks for your project (2 minutes)',
        estimatedTime: 120,
        tests: this.getStandardTests(),
        icon: '⚖️'
      },
      thorough: {
        name: 'Thorough Analysis',
        description: 'Deep dive with all available checks (5+ minutes)',
        estimatedTime: 300,
        tests: this.getAllEnabledTests(),
        icon: '🔬'
      },
      security: {
        name: 'Security Focus',
        description: 'All security-related checks',
        estimatedTime: 60,
        tests: this.getSecurityTests(),
        icon: '🔒'
      },
      quality: {
        name: 'Code Quality Focus',
        description: 'Code quality and maintainability checks',
        estimatedTime: 90,
        tests: this.getQualityTests(),
        icon: '✨'
      }
    };
  }

  /**
   * Get standard tests (recommended subset)
   */
  getStandardTests() {
    const tests = ['code-quality', 'security-basic', 'formatting', 'structure'];
    
    // Add language-specific linters
    const tier2 = this.availableTests.tier2;
    tier2.forEach(test => {
      if (test.enabled && (test.id.includes('lint') || test.id.includes('hooks'))) {
        tests.push(test.id);
      }
    });

    return tests;
  }

  /**
   * Get all enabled tests
   */
  getAllEnabledTests() {
    const tests = [];
    
    ['tier1', 'tier2'].forEach(tier => {
      this.availableTests[tier].forEach(test => {
        if (test.enabled) {
          tests.push(test.id);
        }
      });
    });

    return tests;
  }

  /**
   * Get security-focused tests
   */
  getSecurityTests() {
    const tests = ['security-basic'];
    
    // Add security-related tier 3 tests if available
    if (this.availableTests.tier3.find(t => t.id === 'snyk' && t.enabled)) {
      tests.push('snyk');
    }

    return tests;
  }

  /**
   * Get quality-focused tests
   */
  getQualityTests() {
    const tests = ['code-quality', 'formatting', 'structure'];
    
    // Add linters
    const tier2 = this.availableTests.tier2;
    tier2.forEach(test => {
      if (test.enabled && test.id.includes('lint')) {
        tests.push(test.id);
      }
    });

    return tests;
  }

  /**
   * Get test configuration for a specific preset
   */
  getPresetConfig(presetName) {
    const presets = this.getPresets();
    const preset = presets[presetName];
    
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    return {
      preset: presetName,
      ...preset,
      testDetails: this.getTestDetails(preset.tests)
    };
  }

  /**
   * Get detailed test information
   */
  getTestDetails(testIds) {
    const allTests = [
      ...this.availableTests.tier1,
      ...this.availableTests.tier2,
      ...this.availableTests.tier3
    ];

    return testIds.map(id => {
      const test = allTests.find(t => t.id === id);
      return test || { id, name: id, description: 'Custom test', estimatedTime: 10 };
    });
  }

  /**
   * Build custom test suite
   */
  buildCustomSuite(selectedTests) {
    const testDetails = this.getTestDetails(selectedTests);
    const totalTime = testDetails.reduce((sum, test) => sum + test.estimatedTime, 0);

    return {
      custom: true,
      tests: selectedTests,
      testDetails,
      estimatedTime: totalTime,
      description: `Custom suite with ${selectedTests.length} tests`
    };
  }

  /**
   * Get recommendations based on project
   */
  getRecommendations() {
    const recommendations = [];
    const { frameworks, languages, linters, testFrameworks, metadata } = this.detection;

    // No linter configured
    if (languages.JavaScript && !linters.some(l => l.name === 'ESLint')) {
      recommendations.push({
        type: 'warning',
        title: 'No ESLint configuration found',
        message: 'Consider adding ESLint for JavaScript/TypeScript projects',
        action: 'Setup ESLint',
        priority: 'high'
      });
    }

    // No tests detected
    if (!testFrameworks.length && !metadata.hasTestDirectory) {
      recommendations.push({
        type: 'info',
        title: 'No test framework detected',
        message: 'Consider adding tests to improve code quality',
        action: 'Learn about testing',
        priority: 'medium'
      });
    }

    // React without accessibility checks
    if (frameworks.some(f => f.name === 'React')) {
      recommendations.push({
        type: 'tip',
        title: 'Enable React accessibility checks',
        message: 'Ensure your React components are accessible',
        action: 'Enable accessibility audit',
        priority: 'medium'
      });
    }

    // No formatter
    if (!linters.some(l => l.type === 'formatter')) {
      recommendations.push({
        type: 'info',
        title: 'No code formatter detected',
        message: 'Use Prettier or similar to maintain consistent code style',
        action: 'Setup Prettier',
        priority: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Export configuration
   */
  exportConfig(testSuite) {
    return {
      version: '1.0.0',
      projectType: this.detection.projectType,
      suite: testSuite,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TestSuiteBuilder;

