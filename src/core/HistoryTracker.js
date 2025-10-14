/**
 * History Tracker
 * Tracks audit history and provides trend analysis
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class HistoryTracker {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd();
    this.historyDir = path.join(this.projectPath, '.zippycodesaudit', 'history');
    this.historyFile = path.join(this.historyDir, 'audits.json');
  }

  /**
   * Initialize history tracking
   */
  async initialize() {
    await fs.ensureDir(this.historyDir);
    
    if (!await fs.pathExists(this.historyFile)) {
      await fs.writeJson(this.historyFile, {
        projectPath: this.projectPath,
        audits: [],
        createdAt: new Date().toISOString()
      }, { spaces: 2 });
    }
  }

  /**
   * Save audit result to history
   */
  async saveAudit(auditResult) {
    await this.initialize();

    const history = await fs.readJson(this.historyFile);
    
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: auditResult.metadata?.totalFilesAnalyzed || 0,
        totalIssues: auditResult.issues?.length || 0,
        healthScore: this.calculateHealthScore(auditResult),
        completedTasks: auditResult.completed || 0
      },
      issues: {
        high: auditResult.issues?.filter(i => i.severity === 'high').length || 0,
        medium: auditResult.issues?.filter(i => i.severity === 'medium').length || 0,
        low: auditResult.issues?.filter(i => i.severity === 'low').length || 0,
        byType: this.groupIssuesByType(auditResult.issues || [])
      },
      recommendations: auditResult.recommendations?.length || 0,
      duration: auditResult.metadata?.analysisTime || 0
    };

    history.audits.unshift(auditEntry);
    
    // Keep last 100 audits
    if (history.audits.length > 100) {
      history.audits = history.audits.slice(0, 100);
    }

    await fs.writeJson(this.historyFile, history, { spaces: 2 });
    
    return auditEntry;
  }

  /**
   * Get audit history
   */
  async getHistory(options = {}) {
    await this.initialize();

    const history = await fs.readJson(this.historyFile);
    let audits = history.audits;

    // Apply filters
    if (options.limit) {
      audits = audits.slice(0, options.limit);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      audits = audits.filter(audit => 
        new Date(audit.timestamp) >= sinceDate
      );
    }

    if (options.until) {
      const untilDate = new Date(options.until);
      audits = audits.filter(audit => 
        new Date(audit.timestamp) <= untilDate
      );
    }

    return audits;
  }

  /**
   * Get trend data for charts
   */
  async getTrends(period = '7d') {
    const history = await this.getHistory({ limit: 100 });
    
    const periodMap = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };

    const cutoffDate = new Date(Date.now() - (periodMap[period] || periodMap['7d']));
    
    const relevantAudits = history.filter(audit => 
      new Date(audit.timestamp) >= cutoffDate
    );

    return {
      healthScores: relevantAudits.map(audit => ({
        date: audit.timestamp,
        value: audit.summary.healthScore
      })).reverse(),
      issueCount: relevantAudits.map(audit => ({
        date: audit.timestamp,
        value: audit.summary.totalIssues
      })).reverse(),
      fileCount: relevantAudits.map(audit => ({
        date: audit.timestamp,
        value: audit.summary.totalFiles
      })).reverse()
    };
  }

  /**
   * Detect regressions (new issues introduced)
   */
  async detectRegressions() {
    const history = await this.getHistory({ limit: 10 });
    
    if (history.length < 2) {
      return { hasRegression: false, details: [] };
    }

    const latest = history[0];
    const previous = history[1];

    const regressions = [];

    // Health score regression
    if (latest.summary.healthScore < previous.summary.healthScore - 5) {
      regressions.push({
        type: 'health_score',
        severity: 'medium',
        message: `Health score decreased from ${previous.summary.healthScore}% to ${latest.summary.healthScore}%`,
        change: latest.summary.healthScore - previous.summary.healthScore
      });
    }

    // Issue count regression
    if (latest.summary.totalIssues > previous.summary.totalIssues + 3) {
      regressions.push({
        type: 'issue_count',
        severity: 'high',
        message: `${latest.summary.totalIssues - previous.summary.totalIssues} new issues introduced`,
        change: latest.summary.totalIssues - previous.summary.totalIssues
      });
    }

    // High severity issues regression
    if (latest.issues.high > previous.issues.high) {
      regressions.push({
        type: 'high_severity',
        severity: 'high',
        message: `${latest.issues.high - previous.issues.high} new high-severity issues`,
        change: latest.issues.high - previous.issues.high
      });
    }

    return {
      hasRegression: regressions.length > 0,
      details: regressions,
      comparison: {
        current: latest,
        previous: previous
      }
    };
  }

  /**
   * Get statistics summary
   */
  async getStatistics() {
    const history = await this.getHistory();
    
    if (history.length === 0) {
      return null;
    }

    const issues = history.map(a => a.summary.totalIssues);
    const healthScores = history.map(a => a.summary.healthScore);
    
    return {
      totalAudits: history.length,
      averageIssues: this.average(issues),
      averageHealthScore: this.average(healthScores),
      bestHealthScore: Math.max(...healthScores),
      worstHealthScore: Math.min(...healthScores),
      trend: this.calculateTrend(healthScores),
      lastAudit: history[0],
      firstAudit: history[history.length - 1]
    };
  }

  /**
   * Compare two audits
   */
  async compareAudits(auditId1, auditId2) {
    const history = await this.getHistory();
    
    const audit1 = history.find(a => a.id === auditId1);
    const audit2 = history.find(a => a.id === auditId2);

    if (!audit1 || !audit2) {
      throw new Error('One or both audits not found');
    }

    return {
      audit1,
      audit2,
      differences: {
        healthScore: audit2.summary.healthScore - audit1.summary.healthScore,
        totalIssues: audit2.summary.totalIssues - audit1.summary.totalIssues,
        highIssues: audit2.issues.high - audit1.issues.high,
        mediumIssues: audit2.issues.medium - audit1.issues.medium,
        lowIssues: audit2.issues.low - audit1.issues.low,
        totalFiles: audit2.summary.totalFiles - audit1.summary.totalFiles
      },
      improvement: audit2.summary.healthScore > audit1.summary.healthScore
    };
  }

  /**
   * Generate unique audit ID
   */
  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate health score
   */
  calculateHealthScore(auditResult) {
    const issues = auditResult.issues?.length || 0;
    const files = auditResult.metadata?.totalFilesAnalyzed || 1;
    return Math.max(0, Math.round(100 - Math.min(100, (issues / files) * 50)));
  }

  /**
   * Group issues by type
   */
  groupIssuesByType(issues) {
    return issues.reduce((acc, issue) => {
      const type = issue.type || 'general';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Calculate average
   */
  average(numbers) {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
  }

  /**
   * Calculate trend (improving/declining)
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(0, Math.min(5, values.length));
    const older = values.slice(Math.min(5, values.length));
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = this.average(recent);
    const olderAvg = this.average(older);
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  /**
   * Export history to various formats
   */
  async exportHistory(format = 'json', outputPath = null) {
    const history = await this.getHistory();
    
    let content;
    let ext;

    switch (format) {
      case 'csv':
        content = this.toCSV(history);
        ext = 'csv';
        break;
      case 'markdown':
        content = this.toMarkdown(history);
        ext = 'md';
        break;
      default:
        content = JSON.stringify(history, null, 2);
        ext = 'json';
    }

    if (outputPath) {
      await fs.writeFile(outputPath, content, 'utf8');
      return outputPath;
    }

    return content;
  }

  /**
   * Convert history to CSV
   */
  toCSV(audits) {
    const headers = 'Timestamp,Health Score,Total Issues,High,Medium,Low,Files';
    const rows = audits.map(audit => {
      return [
        audit.timestamp,
        audit.summary.healthScore,
        audit.summary.totalIssues,
        audit.issues.high,
        audit.issues.medium,
        audit.issues.low,
        audit.summary.totalFiles
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Convert history to Markdown
   */
  toMarkdown(audits) {
    let md = '# Audit History\n\n';
    md += `Total Audits: ${audits.length}\n\n`;
    md += '## Recent Audits\n\n';
    md += '| Date | Health Score | Issues | Files |\n';
    md += '|------|-------------|--------|-------|\n';

    audits.slice(0, 20).forEach(audit => {
      const date = new Date(audit.timestamp).toLocaleDateString();
      md += `| ${date} | ${audit.summary.healthScore}% | ${audit.summary.totalIssues} | ${audit.summary.totalFiles} |\n`;
    });

    return md;
  }

  /**
   * Clear history
   */
  async clearHistory() {
    await this.initialize();
    
    await fs.writeJson(this.historyFile, {
      projectPath: this.projectPath,
      audits: [],
      clearedAt: new Date().toISOString()
    }, { spaces: 2 });
  }
}

module.exports = HistoryTracker;

