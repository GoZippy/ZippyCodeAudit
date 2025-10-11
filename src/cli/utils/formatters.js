/**
 * Output Formatters - Format audit results for different output types
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

module.exports = {
  formatOutput,
  formatAsTable,
  formatAsMarkdown,
  formatAsHTML
};
