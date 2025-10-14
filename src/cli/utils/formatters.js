/**
 * Output Formatters - Format audit results for different output types
 * Enhanced with beautiful CLI output, progress bars, and ASCII art
 */

const chalk = require('chalk');

/**
 * Format output based on specified format
 */
function formatOutput(data, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'table':
      return formatAsTable(data);
    case 'markdown':
      return formatAsMarkdown(data);
    case 'html':
      return formatAsHTML(data);
    default:
      return formatAsMarkdown(data);
  }
}

/**
 * Format data as a table
 */
function formatAsTable(data) {
  const table = require('table');

  if (data.files && Array.isArray(data.files)) {
    const fileTable = [
      ['File', 'Language', 'Size', 'Lines'],
      ...data.files.slice(0, 20).map(f => [
        f.path,
        f.language || 'Unknown',
        `${Math.round(f.size / 1024)}KB`,
        f.lines
      ])
    ];

    return table.table(fileTable);
  }

  if (data.issues && Array.isArray(data.issues)) {
    const issueTable = [
      ['Severity', 'Type', 'Message', 'File'],
      ...data.issues.slice(0, 20).map(i => [
        i.severity || 'unknown',
        i.type || 'general',
        i.message || 'No message',
        i.file || 'N/A'
      ])
    ];

    return table.table(issueTable);
  }

  return 'No tabular data available';
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data) {
  let output = '';

  // Header
  output += '# 🔍 ZippyCodeAudit Results\n\n';

  if (data.metadata) {
    output += `**Generated:** ${new Date().toISOString()}\n`;
    output += `**Project:** ${data.metadata.projectPath || 'Unknown'}\n`;
    output += `**Files Analyzed:** ${data.metadata.totalFilesAnalyzed || 0}\n`;
    output += `**Issues Found:** ${data.metadata.totalIssues || 0}\n\n`;
  }

  // Tech Stack
  if (data.metadata && data.metadata.packageInfo) {
    output += '## 🛠️ Detected Technologies\n\n';
    Object.entries(data.metadata.packageInfo).forEach(([file, info]) => {
      if (!info.error && info.name) {
        output += `- **${file}**: ${info.name}\n`;
      }
    });
    output += '\n';
  }

  // Issues
  if (data.issues && data.issues.length > 0) {
    output += '## ⚠️ Issues Found\n\n';
    data.issues.forEach((issue, index) => {
      const severity = issue.severity ? issue.severity.toUpperCase() : 'UNKNOWN';
      output += `### Issue #${index + 1} [${severity}]\n`;
      output += `**Type:** ${issue.type || 'General'}\n`;
      output += `**Message:** ${issue.message}\n`;
      if (issue.file) {
        output += `**File:** \`${issue.file}\`\n`;
      }
      if (issue.suggestion) {
        output += `**Suggestion:** ${issue.suggestion}\n`;
      }
      output += '\n';
    });
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    output += '## 💡 Recommendations\n\n';
    data.recommendations.forEach((rec, index) => {
      output += `### ${index + 1}. ${rec.title}\n`;
      if (rec.description) {
        output += `${rec.description}\n`;
      }
      if (rec.priority) {
        output += `**Priority:** ${rec.priority}\n`;
      }
      output += '\n';
    });
  }

  // Files summary
  if (data.files && data.files.length > 0) {
    output += '## 📁 File Analysis\n\n';
    output += `Total files analyzed: ${data.files.length}\n\n`;

    // Language breakdown
    const languages = {};
    data.files.forEach(file => {
      const lang = file.language || 'Unknown';
      languages[lang] = (languages[lang] || 0) + 1;
    });

    output += '### Language Distribution\n';
    Object.entries(languages).forEach(([lang, count]) => {
      output += `- ${lang}: ${count} files\n`;
    });
    output += '\n';
  }

  return output;
}

/**
 * Format data as HTML
 */
function formatAsHTML(data) {
  let html = `<!DOCTYPE html>
<html>
<head>
    <title>ZippyCodeAudit Results</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .metric {
            display: inline-block;
            margin: 10px 20px 10px 0;
            padding: 10px 15px;
            background: #e3f2fd;
            border-radius: 5px;
            border-left: 4px solid #007acc;
        }
        .issue {
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .issue.high { background: #ffebee; border-color: #f44336; }
        .issue.medium { background: #fff3e0; border-color: #ff9800; }
        .issue.low { background: #e8f5e8; border-color: #4caf50; }
        .recommendation {
            margin: 10px 0;
            padding: 15px;
            background: #f3e5f5;
            border-radius: 5px;
            border-left: 4px solid #9c27b0;
        }
        .section {
            margin: 30px 0;
        }
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .tech-item {
            padding: 8px 12px;
            background: #f0f0f0;
            border-radius: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 ZippyCodeAudit Results</h1>
            <p>Generated on ${new Date().toISOString()}</p>
        </div>`;

  // Metadata
  if (data.metadata) {
    html += '<div class="section">';
    html += '<h2>📊 Project Overview</h2>';
    html += '<div class="metrics">';
    html += `<div class="metric">Files Analyzed: ${data.metadata.totalFilesAnalyzed || 0}</div>`;
    html += `<div class="metric">Issues Found: ${data.metadata.totalIssues || 0}</div>`;
    html += '</div>';
    html += '</div>';
  }

  // Tech Stack
  if (data.metadata && data.metadata.packageInfo) {
    html += '<div class="section">';
    html += '<h2>🛠️ Detected Technologies</h2>';
    html += '<div class="tech-stack">';
    Object.entries(data.metadata.packageInfo).forEach(([file, info]) => {
      if (!info.error && info.name) {
        html += `<div class="tech-item">${info.name}</div>`;
      }
    });
    html += '</div>';
    html += '</div>';
  }

  // Issues
  if (data.issues && data.issues.length > 0) {
    html += '<div class="section">';
    html += '<h2>⚠️ Issues Found</h2>';
    data.issues.forEach(issue => {
      const severity = issue.severity || 'low';
      html += `<div class="issue ${severity}">`;
      html += `<strong>${issue.type || 'General'}</strong>: ${issue.message}`;
      if (issue.file) {
        html += `<br><small>File: ${issue.file}</small>`;
      }
      if (issue.suggestion) {
        html += `<br><small>Suggestion: ${issue.suggestion}</small>`;
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    html += '<div class="section">';
    html += '<h2>💡 Recommendations</h2>';
    data.recommendations.forEach((rec, index) => {
      html += `<div class="recommendation">`;
      html += `<strong>${index + 1}. ${rec.title}</strong>`;
      if (rec.description) {
        html += `<br>${rec.description}`;
      }
      html += '</div>';
    });
    html += '</div>';
  }

  html += '</div></body></html>';
  return html;
}

/**
 * Create success banner with ASCII art
 */
function formatSuccessBanner(title, subtitle) {
  const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ${chalk.green.bold('✓')} ${chalk.white.bold(title.padEnd(50))}  ║
║   ${chalk.gray(subtitle.padEnd(54))}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `;
  return banner;
}

/**
 * Create error banner with ASCII art
 */
function formatErrorBanner(title, message) {
  const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ${chalk.red.bold('✗')} ${chalk.white.bold(title.padEnd(50))}  ║
║   ${chalk.gray(message.padEnd(54))}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `;
  return banner;
}

/**
 * Create progress bar
 */
function formatProgressBar(current, total, width = 40) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  return `[${bar}] ${percentage}% (${current}/${total})`;
}

/**
 * Create metrics card for CLI
 */
function formatMetricsCard(metrics) {
  const card = `
┌─────────────────────────────────────────────────────┐
│  ${chalk.cyan.bold('📊 Project Metrics')}                            │
├─────────────────────────────────────────────────────┤
│  ${chalk.white('Files Analyzed:')} ${chalk.yellow.bold(String(metrics.totalFiles || 0).padStart(8))}            │
│  ${chalk.white('Issues Found:')}   ${chalk.red.bold(String(metrics.totalIssues || 0).padStart(8))}            │
│  ${chalk.white('Health Score:')}   ${chalk.green.bold(String(metrics.healthScore || 100).padStart(8) + '%')}       │
│  ${chalk.white('Analysis Time:')}  ${chalk.gray(formatDuration(metrics.analysisTime || 0).padStart(8))}     │
└─────────────────────────────────────────────────────┘
  `;
  return card;
}

/**
 * Format duration in human-readable form
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Format issue with color coding
 */
function formatIssue(issue, index) {
  const severityColors = {
    high: chalk.red,
    medium: chalk.yellow,
    low: chalk.blue
  };
  
  const severityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🔵'
  };
  
  const color = severityColors[issue.severity] || chalk.gray;
  const icon = severityIcons[issue.severity] || '⚪';
  
  let output = `\n${icon} ${color.bold(`Issue #${index + 1}`)}\n`;
  output += `   ${chalk.white('Type:')} ${issue.type || 'General'}\n`;
  output += `   ${chalk.white('Severity:')} ${color(issue.severity || 'Unknown')}\n`;
  output += `   ${chalk.white('Message:')} ${issue.message}\n`;
  
  if (issue.file) {
    output += `   ${chalk.white('File:')} ${chalk.cyan(issue.file)}\n`;
  }
  
  if (issue.suggestion) {
    output += `   ${chalk.white('Suggestion:')} ${chalk.green(issue.suggestion)}\n`;
  }
  
  return output;
}

/**
 * Create summary card
 */
function formatSummaryCard(data) {
  const healthScore = calculateHealthScore(data);
  const healthEmoji = getHealthEmoji(healthScore);
  const healthText = getHealthText(healthScore);
  
  const card = `
╔═══════════════════════════════════════════════════════════╗
║  ${chalk.white.bold('AUDIT SUMMARY')}                                       ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ${healthEmoji}  Health Score: ${getHealthColor(healthScore)(healthScore + '%')} ${chalk.gray(`(${healthText})`)}       ║
║                                                           ║
║  ${chalk.cyan('📁')}  Files:   ${chalk.white(String(data.metadata?.totalFilesAnalyzed || 0).padStart(6))}                          ║
║  ${chalk.red('⚠️ ')}  Issues:  ${chalk.white(String(data.issues?.length || 0).padStart(6))}                          ║
║  ${chalk.green('✅')}  Fixed:   ${chalk.white(String(data.completed || 0).padStart(6))}                          ║
║  ${chalk.yellow('💡')}  Suggestions: ${chalk.white(String(data.recommendations?.length || 0).padStart(2))}                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `;
  return card;
}

/**
 * Calculate health score
 */
function calculateHealthScore(data) {
  const issues = data.issues?.length || 0;
  const files = data.metadata?.totalFilesAnalyzed || 1;
  return Math.max(0, 100 - Math.min(100, (issues / files) * 50));
}

/**
 * Get health emoji
 */
function getHealthEmoji(score) {
  if (score >= 90) return '🎉';
  if (score >= 75) return '😊';
  if (score >= 60) return '😐';
  return '😰';
}

/**
 * Get health text
 */
function getHealthText(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Get health color function
 */
function getHealthColor(score) {
  if (score >= 90) return chalk.green.bold;
  if (score >= 75) return chalk.blue.bold;
  if (score >= 60) return chalk.yellow.bold;
  return chalk.red.bold;
}

/**
 * Format issue list with collapsible sections
 */
function formatIssuesList(issues, showAll = false) {
  if (!issues || issues.length === 0) {
    return chalk.green('\n✓ No issues found! Your code looks great!\n');
  }
  
  let output = chalk.yellow.bold('\n⚠️  Issues Found:\n');
  
  // Group by severity
  const grouped = {
    high: issues.filter(i => i.severity === 'high'),
    medium: issues.filter(i => i.severity === 'medium'),
    low: issues.filter(i => i.severity === 'low')
  };
  
  // Show high priority issues
  if (grouped.high.length > 0) {
    output += chalk.red.bold(`\n🔴 High Priority (${grouped.high.length})\n`);
    const displayCount = showAll ? grouped.high.length : Math.min(3, grouped.high.length);
    for (let i = 0; i < displayCount; i++) {
      output += formatIssue(grouped.high[i], i);
    }
    if (!showAll && grouped.high.length > 3) {
      output += chalk.gray(`\n   ... and ${grouped.high.length - 3} more\n`);
    }
  }
  
  // Show medium priority issues
  if (grouped.medium.length > 0) {
    output += chalk.yellow.bold(`\n🟡 Medium Priority (${grouped.medium.length})\n`);
    const displayCount = showAll ? grouped.medium.length : Math.min(2, grouped.medium.length);
    for (let i = 0; i < displayCount; i++) {
      output += formatIssue(grouped.medium[i], i);
    }
    if (!showAll && grouped.medium.length > 2) {
      output += chalk.gray(`\n   ... and ${grouped.medium.length - 2} more\n`);
    }
  }
  
  // Show low priority issues summary
  if (grouped.low.length > 0) {
    output += chalk.blue.bold(`\n🔵 Low Priority (${grouped.low.length})\n`);
    if (showAll) {
      for (let i = 0; i < grouped.low.length; i++) {
        output += formatIssue(grouped.low[i], i);
      }
    } else {
      output += chalk.gray(`   ${grouped.low.length} minor issues (use --all to show)\n`);
    }
  }
  
  return output;
}

/**
 * Format recommendations as actionable list
 */
function formatRecommendations(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return '';
  }
  
  let output = chalk.cyan.bold('\n💡 Recommendations:\n');
  
  recommendations.forEach((rec, index) => {
    const priorityIcon = rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⭐' : '💭';
    output += `\n${priorityIcon} ${chalk.white.bold(rec.title)}\n`;
    if (rec.description) {
      output += `   ${chalk.gray(rec.description)}\n`;
    }
  });
  
  return output;
}

module.exports = {
  formatOutput,
  formatAsTable,
  formatAsMarkdown,
  formatAsHTML,
  formatSuccessBanner,
  formatErrorBanner,
  formatProgressBar,
  formatMetricsCard,
  formatSummaryCard,
  formatIssue,
  formatIssuesList,
  formatRecommendations,
  formatDuration
};
