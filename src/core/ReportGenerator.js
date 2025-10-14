/**
 * Report Generator - Creates AI-ready markdown reports and prompts
 * Generates comprehensive audit reports with actionable insights
 */

const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');

class ReportGenerator {
  constructor() {
    this.templates = {
      summary: this.getSummaryTemplate(),
      detailed: this.getDetailedTemplate(),
      aiPrompts: this.getAIPromptTemplate()
    };
  }

  /**
   * Generate comprehensive audit report
   */
  async generateReport(auditResults, options = {}) {
    const {
      format = 'markdown',
      outputPath,
      includeAI = true,
      projectInfo = {}
    } = options;

    const reportData = {
      ...auditResults,
      project: projectInfo,
      generatedAt: new Date().toISOString(),
      version: require('../../package.json').version
    };

    // Generate different sections
    const summary = this.generateSummarySection(reportData);
    const issues = this.generateIssuesSection(reportData);
    const recommendations = this.generateRecommendationsSection(reportData);
    const metrics = this.generateMetricsSection(reportData);

    let content;

    switch (format) {
      case 'markdown':
        content = this.generateMarkdownReport(summary, issues, recommendations, metrics, reportData);
        break;
      case 'html':
        content = this.generateHTMLReport(summary, issues, recommendations, metrics, reportData);
        break;
      case 'json':
        content = JSON.stringify(reportData, null, 2);
        break;
      default:
        content = this.generateMarkdownReport(summary, issues, recommendations, metrics, reportData);
    }

    // Add AI prompts if requested
    if (includeAI && format === 'markdown') {
      const aiPrompts = this.generateAIPrompts(reportData);
      content += '\n\n' + aiPrompts;
    }

    // Save to file if output path provided
    if (outputPath) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, content, 'utf8');
    }

    return content;
  }

  /**
   * Generate summary section
   */
  generateSummarySection(data) {
    const totalFiles = data.metadata?.totalFilesAnalyzed || 0;
    const totalIssues = data.metadata?.totalIssues || 0;
    const healthScore = Math.max(0, 100 - (totalIssues * 2));

    return {
      title: '📊 Audit Summary',
      content: `
**Project:** ${data.project?.name || 'Unknown Project'}
**Audit Date:** ${new Date(data.generatedAt).toLocaleDateString()}
**Total Files Analyzed:** ${totalFiles}
**Issues Found:** ${totalIssues}
**Health Score:** ${healthScore}/100

**Overall Assessment:** ${this.getHealthAssessment(healthScore)}
      `.trim()
    };
  }

  /**
   * Generate issues section
   */
  generateIssuesSection(data) {
    const issues = data.issues || [];
    const groupedIssues = this.groupIssuesByType(issues);

    let content = `**Total Issues:** ${issues.length}\n\n`;

    Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
      content += `### ${this.getIssueTypeIcon(type)} ${type.charAt(0).toUpperCase() + type.slice(1)} Issues (${typeIssues.length})\n\n`;

      typeIssues.forEach((issue, index) => {
        content += `**${index + 1}.** ${issue.message}\n`;
        if (issue.file) {
          content += `   - **File:** \`${issue.file}\`\n`;
        }
        if (issue.severity) {
          content += `   - **Severity:** ${issue.severity}\n`;
        }
        content += '\n';
      });
    });

    return {
      title: '🚨 Issues Found',
      content
    };
  }

  /**
   * Generate recommendations section
   */
  generateRecommendationsSection(data) {
    const recommendations = data.recommendations || [];
    const issues = data.issues || [];

    let content = '';

    if (recommendations.length > 0) {
      content += '### 🤖 AI-Generated Recommendations\n\n';
      recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵';
        content += `${priority} **${rec.title}**\n`;
        if (rec.description) {
          content += `${rec.description}\n`;
        }
        content += '\n';
      });
    }

    // Generate action items from issues
    const actionItems = this.generateActionItems(issues);
    if (actionItems.length > 0) {
      content += '### 📋 Action Items\n\n';
      actionItems.forEach((item, index) => {
        content += `${index + 1}. **${item.title}**\n`;
        content += `   ${item.description}\n`;
        if (item.priority) {
          content += `   - **Priority:** ${item.priority}\n`;
        }
        content += '\n';
      });
    }

    return {
      title: '💡 Recommendations & Actions',
      content
    };
  }

  /**
   * Generate metrics section
   */
  generateMetricsSection(data) {
    const metadata = data.metadata || {};

    const content = `
**Files Analyzed:** ${metadata.totalFilesAnalyzed || 0}
**Lines of Code:** ${metadata.totalLines || 'N/A'}
**Languages Detected:** ${this.formatLanguages(metadata.languages)}
**Analysis Time:** ${metadata.analysisTime ? new Date(metadata.analysisTime).toLocaleString() : 'N/A'}
    `.trim();

    return {
      title: '📈 Technical Metrics',
      content
    };
  }

  /**
   * Generate AI-ready prompts
   */
  generateAIPrompts(data) {
    const issues = data.issues || [];
    const projectInfo = data.project || {};

    let prompts = '';

    // Main improvement prompt
    prompts += `## 🤖 AI Improvement Prompts\n\n`;

    if (issues.length > 0) {
      prompts += `### Primary Improvement Task\n`;
      prompts += `\`\`\`markdown\n`;
      prompts += `You are an expert software developer tasked with improving the codebase for: **${projectInfo.name || 'Unknown Project'}**\n\n`;
      prompts += `**Project Context:**\n`;
      prompts += `- Type: ${projectInfo.type || 'Unknown'}\n`;
      prompts += `- Issues Found: ${issues.length}\n`;
      prompts += `- Health Score: ${Math.max(0, 100 - (issues.length * 2))}/100\n\n`;

      prompts += `**Key Issues to Address:**\n`;
      issues.slice(0, 5).forEach((issue, index) => {
        prompts += `${index + 1}. **${issue.severity?.toUpperCase()}**: ${issue.message}\n`;
        if (issue.file) {
          prompts += `   - Location: \`${issue.file}\`\n`;
        }
        prompts += '\n';
      });

      prompts += `**Improvement Strategy:**\n`;
      prompts += `1. Analyze each issue systematically\n`;
      prompts += `2. Prioritize based on severity and impact\n`;
      prompts += `3. Implement fixes with proper testing\n`;
      prompts += `4. Ensure no regressions are introduced\n`;
      prompts += `5. Update documentation as needed\n\n`;

      prompts += `**Expected Outcomes:**\n`;
      prompts += `- Reduce technical debt\n`;
      prompts += `- Improve code quality and maintainability\n`;
      prompts += `- Enhance security posture\n`;
      prompts += `- Optimize performance where applicable\n`;
      prompts += `\`\`\`\n\n`;
    }

    // Individual issue prompts
    if (issues.length > 0) {
      prompts += `### Individual Issue Fixes\n\n`;

      issues.slice(0, 10).forEach((issue, index) => {
        prompts += `#### Issue ${index + 1}: ${issue.message}\n`;
        prompts += `\`\`\`markdown\n`;
        prompts += `Fix the following ${issue.severity || 'medium'} priority issue in the codebase:\n\n`;
        prompts += `**Issue:** ${issue.message}\n`;
        if (issue.file) {
          prompts += `**File:** \`${issue.file}\`\n`;
        }
        prompts += `**Type:** ${issue.type || 'general'}\n\n`;

        prompts += `**Requirements:**\n`;
        prompts += `- Understand the current implementation\n`;
        prompts += `- Identify the root cause of the issue\n`;
        prompts += `- Implement a proper fix\n`;
        prompts += `- Ensure the fix doesn't break existing functionality\n`;
        prompts += `- Add appropriate tests if needed\n`;
        prompts += `- Update documentation if applicable\n`;
        prompts += `\`\`\`\n\n`;
      });
    }

    return prompts;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(summary, issues, recommendations, metrics, data) {
    let content = '';

    content += `# 🧩 ZippyCodeAudit Report\n\n`;
    content += `**Generated:** ${new Date(data.generatedAt).toLocaleString()}\n`;
    content += `**Version:** ${data.version}\n\n`;

    content += `## ${summary.title}\n\n${summary.content}\n\n`;
    content += `## ${issues.title}\n\n${issues.content}\n\n`;
    content += `## ${recommendations.title}\n\n${recommendations.content}\n\n`;
    content += `## ${metrics.title}\n\n${metrics.content}\n\n`;

    return content;
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(summary, issues, recommendations, metrics, data) {
    const markdown = this.generateMarkdownReport(summary, issues, recommendations, metrics, data);
    return marked.parse(markdown);
  }

  /**
   * Generate action items from issues
   */
  generateActionItems(issues) {
    const actionItems = [];

    issues.forEach(issue => {
      actionItems.push({
        title: `Fix: ${issue.message}`,
        description: `Address the ${issue.type} issue${issue.file ? ` in ${issue.file}` : ''}`,
        priority: issue.severity === 'high' ? 'high' : issue.severity === 'medium' ? 'medium' : 'low'
      });
    });

    return actionItems;
  }

  /**
   * Group issues by type
   */
  groupIssuesByType(issues) {
    return issues.reduce((groups, issue) => {
      const type = issue.type || 'general';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(issue);
      return groups;
    }, {});
  }

  /**
   * Get health assessment based on score
   */
  getHealthAssessment(score) {
    if (score >= 90) return '🟢 Excellent';
    if (score >= 75) return '🟡 Good';
    if (score >= 60) return '🟠 Fair';
    return '🔴 Needs Improvement';
  }

  /**
   * Get issue type icon
   */
  getIssueTypeIcon(type) {
    const icons = {
      security: '🔒',
      performance: '⚡',
      maintainability: '🔧',
      documentation: '📚',
      style: '🎨',
      testing: '🧪'
    };
    return icons[type] || '🐛';
  }

  /**
   * Format languages for display
   */
  formatLanguages(languages) {
    if (!languages) return 'N/A';

    return Object.entries(languages)
      .map(([lang, count]) => `${lang} (${count} files)`)
      .join(', ');
  }

  /**
   * Get summary template
   */
  getSummaryTemplate() {
    return `
# Audit Summary Report

## Overview
- **Project:** {project.name}
- **Type:** {project.type}
- **Audit Date:** {generatedAt}
- **Total Issues:** {metadata.totalIssues}
- **Health Score:** {healthScore}/100

## Key Findings
{summary}
    `.trim();
  }

  /**
   * Get detailed template
   */
  getDetailedTemplate() {
    return `
# Detailed Audit Report

## Executive Summary
{summary}

## Technical Details
{metrics}

## Issues Analysis
{issues}

## Recommendations
{recommendations}

## Action Plan
{actionItems}
    `.trim();
  }

  /**
   * Get AI prompt template
   */
  getAIPromptTemplate() {
    return `
# AI Improvement Prompts

## Primary Task
{primaryPrompt}

## Individual Issues
{issuePrompts}

## Context Information
- Project: {project.name}
- Type: {project.type}
- Issues: {metadata.totalIssues}
- Files: {metadata.totalFilesAnalyzed}
    `.trim();
  }
}

module.exports = ReportGenerator;
