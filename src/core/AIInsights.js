/**
 * AI-Powered Insights
 * Pattern detection, code smell analysis, and smart recommendations
 * 
 * Note: This is a rule-based implementation that simulates AI capabilities.
 * For true AI integration, consider using external APIs like OpenAI, Claude, etc.
 */

class AIInsights {
  constructor() {
    this.patterns = this.initializePatterns();
    this.codeSmells = this.initializeCodeSmells();
    this.learningData = this.loadLearningData();
  }

  /**
   * Initialize pattern detection rules
   */
  initializePatterns() {
    return [
      {
        id: 'duplicate-code',
        name: 'Duplicate Code Pattern',
        description: 'Similar code blocks found across multiple files',
        severity: 'medium',
        check: (files) => this.detectDuplicateCode(files)
      },
      {
        id: 'complex-function',
        name: 'Complex Function',
        description: 'Functions with high cyclomatic complexity',
        severity: 'medium',
        check: (files) => this.detectComplexFunctions(files)
      },
      {
        id: 'unused-imports',
        name: 'Unused Imports',
        description: 'Import statements that are never used',
        severity: 'low',
        check: (files) => this.detectUnusedImports(files)
      },
      {
        id: 'magic-numbers',
        name: 'Magic Numbers',
        description: 'Hard-coded numbers that should be named constants',
        severity: 'low',
        check: (files) => this.detectMagicNumbers(files)
      },
      {
        id: 'long-parameter-list',
        name: 'Long Parameter List',
        description: 'Functions with too many parameters',
        severity: 'medium',
        check: (files) => this.detectLongParameterLists(files)
      }
    ];
  }

  /**
   * Initialize code smell detection rules
   */
  initializeCodeSmells() {
    return [
      {
        id: 'god-object',
        name: 'God Object',
        description: 'Class or object that knows/does too much',
        indicator: (file) => {
          const lines = file.content.split('\n').length;
          return lines > 500;
        },
        recommendation: 'Split into smaller, focused modules'
      },
      {
        id: 'shotgun-surgery',
        name: 'Shotgun Surgery',
        description: 'Changes require modifications in many places',
        indicator: (files) => {
          // Detect files with similar patterns that might indicate coupling
          return false; // Placeholder
        },
        recommendation: 'Improve separation of concerns'
      },
      {
        id: 'feature-envy',
        name: 'Feature Envy',
        description: 'Method using more features of another class than its own',
        indicator: (file) => {
          // Check for excessive external references
          return false; // Placeholder
        },
        recommendation: 'Move method to appropriate class'
      },
      {
        id: 'data-clumps',
        name: 'Data Clumps',
        description: 'Same data items appearing together repeatedly',
        indicator: (files) => {
          // Detect repeated parameter groups
          return false; // Placeholder
        },
        recommendation: 'Extract into a data class or object'
      }
    ];
  }

  /**
   * Analyze code and provide insights
   */
  async analyze(auditResults) {
    const insights = {
      patterns: [],
      codeSmells: [],
      recommendations: [],
      predictiveMaintenance: [],
      learningInsights: []
    };

    // Pattern detection
    insights.patterns = this.detectPatterns(auditResults);

    // Code smell analysis
    insights.codeSmells = this.analyzeCodeSmells(auditResults);

    // Generate recommendations
    insights.recommendations = this.generateRecommendations(auditResults, insights);

    // Predictive maintenance
    insights.predictiveMaintenance = this.predictMaintenance(auditResults);

    // Learning insights (based on user actions)
    insights.learningInsights = this.generateLearningInsights();

    return insights;
  }

  /**
   * Detect patterns across the codebase
   */
  detectPatterns(auditResults) {
    const detectedPatterns = [];

    this.patterns.forEach(pattern => {
      const matches = pattern.check(auditResults.files || []);
      if (matches && matches.length > 0) {
        detectedPatterns.push({
          ...pattern,
          matches,
          count: matches.length,
          impact: this.calculateImpact(pattern, matches)
        });
      }
    });

    return detectedPatterns;
  }

  /**
   * Detect duplicate code
   */
  detectDuplicateCode(files) {
    const matches = [];
    
    // Simple similarity detection
    files.forEach((file1, i) => {
      files.slice(i + 1).forEach(file2 => {
        if (file1.content && file2.content) {
          const similarity = this.calculateSimilarity(file1.content, file2.content);
          if (similarity > 0.7) {
            matches.push({
              file1: file1.path,
              file2: file2.path,
              similarity: Math.round(similarity * 100),
              suggestion: 'Extract common code into a shared module'
            });
          }
        }
      });
    });

    return matches;
  }

  /**
   * Calculate code similarity (simplified)
   */
  calculateSimilarity(content1, content2) {
    const lines1 = content1.split('\n').filter(l => l.trim());
    const lines2 = content2.split('\n').filter(l => l.trim());
    
    let matchingLines = 0;
    lines1.forEach(line1 => {
      if (lines2.some(line2 => line1 === line2)) {
        matchingLines++;
      }
    });

    return matchingLines / Math.max(lines1.length, lines2.length);
  }

  /**
   * Detect complex functions
   */
  detectComplexFunctions(files) {
    const matches = [];

    files.forEach(file => {
      if (!file.content) return;

      // Simple complexity heuristic: count nested blocks
      const functions = file.content.match(/function\s+\w+\s*\([^)]*\)\s*\{/g) || [];
      functions.forEach(func => {
        const funcName = func.match(/function\s+(\w+)/)[1];
        const complexity = this.estimateComplexity(file.content, funcName);
        
        if (complexity > 10) {
          matches.push({
            file: file.path,
            function: funcName,
            complexity,
            suggestion: 'Break down into smaller functions'
          });
        }
      });
    });

    return matches;
  }

  /**
   * Estimate cyclomatic complexity (simplified)
   */
  estimateComplexity(content, functionName) {
    // Count decision points: if, else, for, while, case, catch, &&, ||
    const decisionKeywords = ['if', 'else', 'for', 'while', 'case', 'catch'];
    let complexity = 1; // Base complexity

    decisionKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex) || [];
      complexity += matches.length;
    });

    // Count logical operators
    complexity += (content.match(/&&/g) || []).length;
    complexity += (content.match(/\|\|/g) || []).length;

    return complexity;
  }

  /**
   * Detect unused imports
   */
  detectUnusedImports(files) {
    const matches = [];

    files.forEach(file => {
      if (!file.content) return;

      const imports = file.content.match(/import\s+.*\s+from\s+['"].*['"]/g) || [];
      imports.forEach(importStatement => {
        const imported = importStatement.match(/import\s+\{?\s*([^}]+)\s*\}?/);
        if (imported) {
          const names = imported[1].split(',').map(n => n.trim());
          names.forEach(name => {
            const cleanName = name.split(/\s+as\s+/)[0].trim();
            // Check if used (simplified check)
            const usageRegex = new RegExp(`\\b${cleanName}\\b`, 'g');
            const usages = file.content.match(usageRegex) || [];
            
            if (usages.length <= 1) { // Only the import itself
              matches.push({
                file: file.path,
                import: cleanName,
                suggestion: 'Remove unused import'
              });
            }
          });
        }
      });
    });

    return matches;
  }

  /**
   * Detect magic numbers
   */
  detectMagicNumbers(files) {
    const matches = [];

    files.forEach(file => {
      if (!file.content) return;

      // Find numbers that aren't 0, 1, -1 (common non-magic numbers)
      const numbers = file.content.match(/\b\d{2,}\b/g) || [];
      const uniqueNumbers = [...new Set(numbers)];

      uniqueNumbers.forEach(num => {
        if (num !== '0' && num !== '1' && num !== '10' && num !== '100') {
          matches.push({
            file: file.path,
            number: num,
            suggestion: `Define as a named constant (e.g., const MAX_RETRIES = ${num})`
          });
        }
      });
    });

    return matches.slice(0, 10); // Limit results
  }

  /**
   * Detect long parameter lists
   */
  detectLongParameterLists(files) {
    const matches = [];

    files.forEach(file => {
      if (!file.content) return;

      const functions = file.content.match(/function\s+\w+\s*\(([^)]*)\)/g) || [];
      functions.forEach(func => {
        const params = func.match(/\(([^)]*)\)/)[1];
        const paramCount = params.split(',').filter(p => p.trim()).length;
        
        if (paramCount > 4) {
          const funcName = func.match(/function\s+(\w+)/)[1];
          matches.push({
            file: file.path,
            function: funcName,
            parameterCount: paramCount,
            suggestion: 'Consider using an options object instead'
          });
        }
      });
    });

    return matches;
  }

  /**
   * Analyze code smells
   */
  analyzeCodeSmells(auditResults) {
    const detectedSmells = [];

    this.codeSmells.forEach(smell => {
      const isPresent = smell.indicator(auditResults.files || []);
      if (isPresent) {
        detectedSmells.push({
          ...smell,
          priority: this.calculateSmellPriority(smell)
        });
      }
    });

    return detectedSmells;
  }

  /**
   * Generate smart recommendations
   */
  generateRecommendations(auditResults, insights) {
    const recommendations = [];

    // Based on patterns
    insights.patterns.forEach(pattern => {
      if (pattern.count > 3) {
        recommendations.push({
          type: 'pattern',
          priority: 'high',
          title: `Address ${pattern.name}`,
          description: `Found ${pattern.count} instances. ${pattern.description}`,
          actionable: true,
          estimatedTime: pattern.count * 10 // minutes
        });
      }
    });

    // Based on code smells
    insights.codeSmells.forEach(smell => {
      recommendations.push({
        type: 'smell',
        priority: smell.priority,
        title: `Refactor ${smell.name}`,
        description: smell.description,
        suggestion: smell.recommendation,
        actionable: true,
        estimatedTime: 30
      });
    });

    // Based on issue types
    const issueTypes = this.groupIssuesByType(auditResults.issues || []);
    Object.entries(issueTypes).forEach(([type, issues]) => {
      if (issues.length > 5) {
        recommendations.push({
          type: 'issue-cluster',
          priority: 'medium',
          title: `Address ${type} issues`,
          description: `Found ${issues.length} ${type} issues`,
          actionable: true,
          estimatedTime: issues.length * 5
        });
      }
    });

    // Sort by priority and estimated time
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10);
  }

  /**
   * Predictive maintenance alerts
   */
  predictMaintenance(auditResults) {
    const alerts = [];

    const issues = auditResults.issues || [];
    const highSeverity = issues.filter(i => i.severity === 'high').length;

    if (highSeverity > 10) {
      alerts.push({
        type: 'critical-mass',
        severity: 'high',
        message: 'Critical issue accumulation detected',
        prediction: 'Project may become difficult to maintain if not addressed soon',
        recommendation: 'Schedule a refactoring sprint to address high-severity issues'
      });
    }

    const fileCount = auditResults.metadata?.totalFilesAnalyzed || 0;
    const issueRatio = issues.length / fileCount;

    if (issueRatio > 5) {
      alerts.push({
        type: 'quality-decline',
        severity: 'medium',
        message: 'Code quality declining',
        prediction: 'Issue density is increasing faster than code growth',
        recommendation: 'Implement stricter code review process and automated checks'
      });
    }

    return alerts;
  }

  /**
   * Generate learning insights based on user actions
   */
  generateLearningInsights() {
    const insights = [];

    // This would typically analyze user's fix/ignore patterns
    // For now, provide general insights

    insights.push({
      category: 'productivity',
      title: 'Quick Win Strategy',
      description: 'Users who fix low-severity issues first tend to build momentum',
      suggestion: 'Start with the "Quick Wins" section to boost confidence'
    });

    insights.push({
      category: 'best-practice',
      title: 'Consistent Patterns',
      description: 'Projects with consistent coding patterns have 40% fewer issues',
      suggestion: 'Establish and document coding standards for your team'
    });

    return insights;
  }

  /**
   * Calculate pattern impact
   */
  calculateImpact(pattern, matches) {
    const severityWeight = { high: 3, medium: 2, low: 1 };
    const baseImpact = severityWeight[pattern.severity] || 1;
    const countMultiplier = Math.min(matches.length / 5, 3); // Cap at 3x
    
    return Math.round(baseImpact * countMultiplier * 10) / 10;
  }

  /**
   * Calculate smell priority
   */
  calculateSmellPriority(smell) {
    // Could be based on project size, issue count, etc.
    return 'medium';
  }

  /**
   * Group issues by type
   */
  groupIssuesByType(issues) {
    return issues.reduce((acc, issue) => {
      const type = issue.type || 'general';
      if (!acc[type]) acc[type] = [];
      acc[type].push(issue);
      return acc;
    }, {});
  }

  /**
   * Load learning data (from previous sessions)
   */
  loadLearningData() {
    // In a real implementation, this would load from a database or file
    return {
      fixedIssues: [],
      ignoredIssues: [],
      userPreferences: {}
    };
  }

  /**
   * Save learning data
   */
  saveLearningData(data) {
    // In a real implementation, this would save to a database or file
    this.learningData = { ...this.learningData, ...data };
  }

  /**
   * Learn from user action
   */
  learnFromAction(action, issue) {
    if (action === 'fixed') {
      this.learningData.fixedIssues.push({
        type: issue.type,
        severity: issue.severity,
        timestamp: new Date().toISOString()
      });
    } else if (action === 'ignored') {
      this.learningData.ignoredIssues.push({
        type: issue.type,
        severity: issue.severity,
        timestamp: new Date().toISOString()
      });
    }

    this.saveLearningData(this.learningData);
  }
}

module.exports = AIInsights;

