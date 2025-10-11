/**
 * Analyze Command - Perform comprehensive project analysis
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const AuditEngine = require('../../core/AuditEngine');
const { formatOutput } = require('../utils/formatters');

async function analyzeCommand(options) {
  const spinner = ora();

  try {
    console.log(chalk.blue.bold('🔍 Starting comprehensive project audit...\n'));

    // Initialize audit engine
    const engine = new AuditEngine({
      projectPath: process.cwd(),
      includePatterns: options.include ? options.include.split(',') : undefined,
      excludePatterns: options.exclude ? options.exclude.split(',') : undefined,
      maxDepth: options.depth ? parseInt(options.depth) : undefined,
      verbose: options.parent?.verbose || false
    });

    // Run audit
    const results = await engine.runAudit();

    // Display results
    await displayResults(results, options);

    // Save output if specified
    if (options.output) {
      await saveResults(results, options.output, options.format);
    }

    console.log(chalk.green.bold('\n✅ Audit completed successfully!'));

  } catch (error) {
    spinner.fail(chalk.red('❌ Audit failed'));
    console.error(chalk.red('Error:'), error.message);

    if (options.parent?.debug) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

async function displayResults(results, options) {
  const format = options.format || 'markdown';

  console.log(chalk.cyan.bold('\n📊 AUDIT RESULTS\n'));

  // Project metadata
  console.log(chalk.yellow('📋 Project Information:'));
  console.log(`   Repository: ${results.metadata.repositoryInfo ? 'Yes' : 'No'}`);
  console.log(`   Total Files: ${results.metadata.totalFilesAnalyzed || 0}`);
  console.log(`   Issues Found: ${results.metadata.totalIssues || 0}`);
  console.log(`   Recommendations: ${results.recommendations?.length || 0}`);

  // Tech stack summary
  if (results.metadata.packageInfo) {
    console.log(chalk.yellow('\n🛠️  Detected Technologies:'));
    Object.entries(results.metadata.packageInfo).forEach(([file, info]) => {
      if (!info.error) {
        console.log(`   ${file}: ${info.name || 'Package file detected'}`);
      }
    });
  }

  // Issues summary
  if (results.issues && results.issues.length > 0) {
    console.log(chalk.yellow('\n⚠️  Issues Summary:'));

    const severityCounts = {};
    results.issues.forEach(issue => {
      severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
    });

    Object.entries(severityCounts).forEach(([severity, count]) => {
      const color = severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'blue';
      console.log(`   ${chalk[color](count)} ${severity} priority issues`);
    });
  }

  // Recommendations
  if (results.recommendations && results.recommendations.length > 0) {
    console.log(chalk.yellow('\n💡 Top Recommendations:'));

    results.recommendations.slice(0, 3).forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵';
      console.log(`   ${priority} ${rec.title}`);
      if (rec.description) {
        console.log(`      ${chalk.gray(rec.description)}`);
      }
    });
  }

  // Detailed output if requested
  if (options.format === 'table' || options.format === 'json') {
    console.log(chalk.cyan.bold('\n📋 Detailed Analysis:'));

    if (options.format === 'table') {
      await displayTableView(results);
    } else {
      await displayJsonView(results);
    }
  }
}

async function displayTableView(results) {
  const table = require('table');

  // Files table
  if (results.files && results.files.length > 0) {
    console.log(chalk.cyan('\n📁 Files Analysis:'));
    const fileData = results.files.slice(0, 10).map(f => [
      f.path,
      f.language,
      `${Math.round(f.size / 1024)}KB`,
      f.lines
    ]);

    console.log(table.table([
      ['File', 'Language', 'Size', 'Lines'],
      ...fileData
    ]));
  }

  // Issues table
  if (results.issues && results.issues.length > 0) {
    console.log(chalk.cyan('\n🐛 Issues Found:'));
    const issueData = results.issues.slice(0, 10).map(i => [
      i.severity,
      i.type,
      i.message,
      i.file || 'N/A'
    ]);

    console.log(table.table([
      ['Severity', 'Type', 'Message', 'File'],
      ...issueData
    ]));
  }
}

async function displayJsonView(results) {
  console.log(JSON.stringify(results, null, 2));
}

async function saveResults(results, outputPath, format) {
  const spinner = ora('Saving results...').start();

  try {
    const output = formatOutput(results, format);

    if (format === 'json') {
      await fs.writeJson(outputPath, results, { spaces: 2 });
    } else {
      await fs.writeFile(outputPath, output, 'utf8');
    }

    spinner.succeed(chalk.green(`Results saved to: ${outputPath}`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to save results'));
    throw error;
  }
}

module.exports = analyzeCommand;
