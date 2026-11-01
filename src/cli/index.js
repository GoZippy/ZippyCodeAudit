#!/usr/bin/env node

/**
 * ZippyCodeAudit CLI - Main Entry Point
 * Comprehensive code auditing toolkit for vibe coders
 */

const { Command } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const packageJson = require('../../package.json');

// Import CLI modules
const analyzeCommand = require('./commands/analyze');
const checkCommand = require('./commands/check');
const reportCommand = require('./commands/report');
const initCommand = require('./commands/init');
const configCommand = require('./commands/config');
const readinessCommand = require('./commands/readiness');

const program = new Command();

// CLI Header
const header = boxen(
  chalk.blue.bold('🧩 ZippyCodeAudit') + '\n' +
  chalk.gray('Comprehensive code auditing toolkit for vibe coders'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'blue',
    backgroundColor: '#000000'
  }
);

// Program configuration
program
  .name('zippy-audit')
  .description('Comprehensive code auditing toolkit')
  .version(packageJson.version, '-v, --version', 'Show version information')
  .alias('zca')
  .helpOption('-h, --help', 'Show help information')
  .addHelpCommand('help [command]', 'Show help for a specific command');

// Global options
program
  .option('--verbose', 'Enable verbose logging')
  .option('--debug', 'Enable debug mode')
  .option('--config <file>', 'Specify configuration file path', 'zippycodesaudit.config.json')
  .option('--no-color', 'Disable colored output');

// Analyze command
program
  .command('analyze')
  .alias('audit')
  .description('Perform comprehensive project analysis')
  .option('-f, --format <format>', 'Output format (json, markdown, html, table)', 'markdown')
  .option('-o, --output <file>', 'Output file path')
  .option('--include <patterns>', 'File patterns to include (comma-separated)', '**/*.{js,ts,py,go,md}')
  .option('--exclude <patterns>', 'File patterns to exclude (comma-separated)', 'node_modules/**,dist/**,build/**')
  .option('--depth <number>', 'Maximum directory depth to analyze', '10')
  .option('--ai-endpoint <url>', 'AI analysis endpoint URL')
  .option('--ai-key <key>', 'AI analysis API key')
  .action(analyzeCommand);

// Check command
program
  .command('check')
  .description('Run specific quality checks')
  .option('--security', 'Run security checks')
  .option('--performance', 'Run performance checks')
  .option('--maintainability', 'Run maintainability checks')
  .option('--test-coverage', 'Check test coverage')
  .option('--dependencies', 'Check dependency health')
  .option('--code-style', 'Check code style and formatting')
  .option('--all', 'Run all available checks')
  .option('-f, --format <format>', 'Output format (json, table, summary)', 'table')
  .option('-o, --output <file>', 'Output file path')
  .action(checkCommand);


// Readiness command
program
  .command('readiness')
  .description('Run evidence-oriented security/readiness rules against an authorized inventory')
  .requiredOption('--inventory <file>', 'Authorized inventory JSON file')
  .requiredOption('--rules <file>', 'Readiness rules JSON file')
  .option('-f, --format <format>', 'Output format (json, markdown)', 'json')
  .option('-o, --output <file>', 'Output file path')
  .action(readinessCommand);

// Report command
program
  .command('report')
  .description('Generate audit reports')
  .option('--type <type>', 'Report type (summary, detailed, compliance)', 'summary')
  .option('-f, --format <format>', 'Output format (html, pdf, json)', 'html')
  .option('-o, --output <file>', 'Output file path')
  .option('--template <template>', 'Report template to use')
  .option('--include-history', 'Include historical audit data')
  .action(reportCommand);

// Init command
program
  .command('init')
  .description('Initialize ZippyCodeAudit in current project')
  .option('--audit-system', 'Set up complete audit system')
  .option('--ci-workflow', 'Set up GitHub Actions workflow')
  .option('--vscode-extension', 'Configure VS Code integration')
  .option('--force', 'Overwrite existing files')
  .action(initCommand);

// Config command
program
  .command('config')
  .description('Manage ZippyCodeAudit configuration')
  .option('--show', 'Display current configuration')
  .option('--set <key> <value>', 'Set configuration value')
  .option('--reset', 'Reset to default configuration')
  .option('--validate', 'Validate configuration file')
  .action(configCommand);

// Error handling
program.exitOverride();

try {
  // Show header for main command
  if (process.argv.length === 2) {
    console.log(header);
    console.log(chalk.gray('\n💡 Run "zippy-audit --help" to see available commands\n'));
  }

  program.parse();
} catch (error) {
  if (error.code === 'commander.version') {
    console.log(chalk.blue.bold(`ZippyCodeAudit v${packageJson.version}`));
    process.exit(0);
  }

  if (error.code === 'commander.help') {
    console.log(header);
    program.outputHelp();
    process.exit(0);
  }

  if (error.code === 'commander.helpDisplayed') {
    process.exit(0);
  }

  console.error(chalk.red('🚨 Error:'), error.message);
  process.exit(1);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Uncaught Exception:'), error.message);
  if (program.opts().debug) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('💥 Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

module.exports = program;
