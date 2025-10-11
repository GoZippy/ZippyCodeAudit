/**
 * Report Command - Generate audit reports
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const AuditEngine = require('../../core/AuditEngine');

async function reportCommand(options) {
  const spinner = ora();

  try {
    console.log(chalk.blue.bold('📊 Generating audit report...\n'));

    // Initialize audit engine
    const engine = new AuditEngine({
      projectPath: process.cwd(),
      verbose: options.parent?.verbose || false
    });

    // Run audit
    const results = await engine.runAudit();

    // Generate report
    const report = await generateReport(results, options);

    // Display report
    if (options.output) {
      await saveReport(report, options.output, options.format);
    } else {
      await displayReport(report, options.format);
    }

    console.log(chalk.green.bold('\n✅ Report generated successfully!'));

  } catch (error) {
    spinner.fail(chalk.red('❌ Report generation failed'));
    console.error(chalk.red('Error:'), error.message);

    if (options.parent?.debug) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

async function generateReport(results, options) {
  const timestamp = new Date().toISOString();
  const type = options.type || 'summary';

  const report = {
    metadata: {
      generatedAt: timestamp,
      type: type,
      projectPath: results.metadata.projectPath,
      totalFiles: results.metadata.totalFilesAnalyzed,
      totalIssues: results.metadata.totalIssues,
      repository: results.metadata.repositoryInfo ? true : false
    },
    summary: generateSummary(results),
    details: generateDetails(results, type),
    recommendations: results.recommendations || []
  };

  return report;
}

function generateSummary(results) {
  return {
    projectHealth: calculateProjectHealth(results),
    techStack: extractTechStack(results),
    issueBreakdown: categorizeIssues(results.issues || []),
    metrics: calculateMetrics(results)
  };
}

function generateDetails(results, type) {
  switch (type) {
    case 'detailed':
      return {
        files: results.files || [],
        issues: results.issues || [],
        structure: results.metadata.projectStructure,
        packages: results.metadata.packageInfo
      };
    case 'compliance':
      return {
        security: results.issues?.filter(i => i.type === 'security') || [],
        standards: checkComplianceStandards(results),
        documentation: checkDocumentationCompliance(results)
      };
    default:
      return {
        keyIssues: (results.issues || []).slice(0, 10),
        topRecommendations: (results.recommendations || []).slice(0, 5)
      };
  }
}

function calculateProjectHealth(results) {
  const issues = results.issues || [];
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;

  if (highIssues > 5) return 'Critical';
  if (highIssues > 2 || mediumIssues > 10) return 'Needs Attention';
  if (mediumIssues > 5) return 'Good';
  return 'Excellent';
}

function extractTechStack(results) {
  const techStack = [];
  const packageInfo = results.metadata.packageInfo || {};

  Object.entries(packageInfo).forEach(([file, info]) => {
    if (file === 'package.json' && info.dependencies) {
      techStack.push('JavaScript/Node.js');
    }
    if (file === 'requirements.txt') {
      techStack.push('Python');
    }
    if (file === 'go.mod') {
      techStack.push('Go');
    }
  });

  return techStack.length > 0 ? techStack : ['Unknown'];
}

function categorizeIssues(issues) {
  const categories = {};

  issues.forEach(issue => {
    const category = issue.type || 'general';
    categories[category] = (categories[category] || 0) + 1;
  });

  return categories;
}

function calculateMetrics(results) {
  const files = results.files || [];
  const totalLines = files.reduce((sum, file) => sum + file.lines, 0);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return {
    totalFiles: files.length,
    totalLines: totalLines,
    totalSizeKB: Math.round(totalSize / 1024),
    avgFileSizeKB: files.length > 0 ? Math.round(totalSize / files.length / 1024) : 0,
    languages: countLanguages(files)
  };
}

function countLanguages(files) {
  const languages = {};

  files.forEach(file => {
    const lang = file.language || 'Unknown';
    languages[lang] = (languages[lang] || 0) + 1;
  });

  return languages;
}

function checkComplianceStandards(results) {
  const standards = {
    security: 'Not Checked',
    performance: 'Not Checked',
    accessibility: 'Not Checked',
    seo: 'Not Checked'
  };

  // Basic compliance checks
  const hasSecurityIssues = (results.issues || []).some(i => i.type === 'security');
  standards.security = hasSecurityIssues ? 'Issues Found' : 'Compliant';

  return standards;
}

function checkDocumentationCompliance(results) {
  const docs = {
    readme: false,
    license: false,
    contributing: false,
    changelog: false
  };

  const files = results.files || [];
  const fileNames = files.map(f => f.path.toLowerCase());

  docs.readme = fileNames.some(name => name.includes('readme'));
  docs.license = fileNames.some(name => name.includes('license'));
  docs.contributing = fileNames.some(name => name.includes('contributing'));
  docs.changelog = fileNames.some(name => name.includes('changelog'));

  return docs;
}

async function displayReport(report, format) {
  if (format === 'json') {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(chalk.cyan.bold('📋 AUDIT REPORT\n'));

  // Header
  console.log(chalk.yellow('Generated:'), new Date(report.metadata.generatedAt).toLocaleString());
  console.log(chalk.yellow('Type:'), report.metadata.type);
  console.log(chalk.yellow('Project Health:'), report.summary.projectHealth);
  console.log('');

  // Tech Stack
  console.log(chalk.cyan('🛠️  Tech Stack:'));
  report.summary.techStack.forEach(tech => {
    console.log(`   • ${tech}`);
  });
  console.log('');

  // Metrics
  console.log(chalk.cyan('📊 Metrics:'));
  console.log(`   Files: ${report.metadata.totalFiles}`);
  console.log(`   Lines: ${report.summary.metrics.totalLines.toLocaleString()}`);
  console.log(`   Size: ${report.summary.metrics.totalSizeKB}KB`);
  console.log('');

  // Issues
  if (report.details.keyIssues && report.details.keyIssues.length > 0) {
    console.log(chalk.cyan('⚠️  Key Issues:'));
    report.details.keyIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
    });
    console.log('');
  }

  // Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    console.log(chalk.cyan('💡 Recommendations:'));
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.title}`);
      if (rec.description) {
        console.log(`      ${chalk.gray(rec.description)}`);
      }
    });
  }
}

async function saveReport(report, outputPath, format) {
  const spinner = ora('Saving report...').start();

  try {
    if (format === 'json') {
      await fs.writeJson(outputPath, report, { spaces: 2 });
    } else if (format === 'html') {
      const html = generateHTMLReport(report);
      await fs.writeFile(outputPath, html, 'utf8');
    } else {
      const markdown = generateMarkdownReport(report);
      await fs.writeFile(outputPath, markdown, 'utf8');
    }

    spinner.succeed(chalk.green(`Report saved to: ${outputPath}`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to save report'));
    throw error;
  }
}

function generateMarkdownReport(report) {
  return `# Audit Report - ${report.metadata.type}

**Generated:** ${new Date(report.metadata.generatedAt).toLocaleString()}
**Project Health:** ${report.summary.projectHealth}

## Tech Stack
${report.summary.techStack.map(tech => `- ${tech}`).join('\n')}

## Metrics
- **Files:** ${report.metadata.totalFiles}
- **Lines:** ${report.summary.metrics.totalLines.toLocaleString()}
- **Size:** ${report.summary.metrics.totalSizeKB}KB

## Issues
${(report.details.keyIssues || []).map((issue, i) => `${i + 1}. [${issue.severity}] ${issue.message}`).join('\n')}

## Recommendations
${(report.recommendations || []).map((rec, i) => `${i + 1}. ${rec.title}\n   ${rec.description || ''}`).join('\n\n')}
`;
}

function generateHTMLReport(report) {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e8f4f8; border-radius: 3px; }
        .issue { margin: 5px 0; padding: 5px; background: #ffe8e8; border-left: 3px solid #ff6b6b; }
        .recommendation { margin: 5px 0; padding: 5px; background: #e8f8e8; border-left: 3px solid #51cf66; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Audit Report - ${report.metadata.type}</h1>
        <p><strong>Generated:</strong> ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
        <p><strong>Project Health:</strong> ${report.summary.projectHealth}</p>
    </div>

    <div class="section">
        <h2>Tech Stack</h2>
        ${report.summary.techStack.map(tech => `<div class="metric">${tech}</div>`).join('')}
    </div>

    <div class="section">
        <h2>Metrics</h2>
        <div class="metric">Files: ${report.metadata.totalFiles}</div>
        <div class="metric">Lines: ${report.summary.metrics.totalLines.toLocaleString()}</div>
        <div class="metric">Size: ${report.summary.metrics.totalSizeKB}KB</div>
    </div>

    <div class="section">
        <h2>Issues</h2>
        ${(report.details.keyIssues || []).map(issue => `<div class="issue">[${issue.severity}] ${issue.message}</div>`).join('')}
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        ${(report.recommendations || []).map(rec => `<div class="recommendation">${rec.title}<br><small>${rec.description || ''}</small></div>`).join('')}
    </div>
</body>
</html>`;
}

module.exports = reportCommand;
