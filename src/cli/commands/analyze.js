/**
 * Analyze Command - Perform comprehensive project analysis
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const AuditEngine = require('../../core/AuditEngine');
const { 
  formatOutput, 
  formatSuccessBanner,
  formatSummaryCard,
  formatIssuesList,
  formatRecommendations
} = require('../utils/formatters');

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

    // Show success banner
    console.log(formatSuccessBanner('Audit Completed Successfully', 'Your code has been analyzed'));

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

  // Show summary card
  console.log(formatSummaryCard(results));

  // Tech stack summary
  if (results.metadata.packageInfo) {
    console.log(chalk.yellow('\n🛠️  Detected Technologies:'));
    Object.entries(results.metadata.packageInfo).forEach(([file, info]) => {
      if (!info.error) {
        console.log(`   ${file}: ${info.name || 'Package file detected'}`);
      }
    });
  }

  // Issues list with enhanced formatting
  if (results.issues && results.issues.length > 0) {
    console.log(formatIssuesList(results.issues, options.all));
  } else {
    console.log(chalk.green('\n✓ No issues found! Your code looks great!\n'));
  }

  // Recommendations
  if (results.recommendations && results.recommendations.length > 0) {
    console.log(formatRecommendations(results.recommendations));
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
