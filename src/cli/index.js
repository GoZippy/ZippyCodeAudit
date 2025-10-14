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
const projectCommand = require('./commands/project');
const dashboardCommand = require('./commands/dashboard');

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

// Report command
program
  .command('report')
  .description('Generate audit reports')
  .option('--type <type>', 'Report type (summary, detailed, compliance)', 'summary')
  .option('-f, --format <format>', 'Output format (html, pdf, json, markdown)', 'markdown')
  .option('-o, --output <file>', 'Output file path')
  .option('--template <template>', 'Report template to use')
  .option('--include-history', 'Include historical audit data')
  .option('--ai', 'Include AI improvement prompts')
  .option('--project <id>', 'Project ID to generate report for')
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

// Project command
program
  .command('project <action>')
  .description('Manage projects for auditing')
  .option('--path <path>', 'Project path')
  .option('--name <name>', 'Project name')
  .option('--description <desc>', 'Project description')
  .option('--type <type>', 'Project type')
  .option('--tags <tags>', 'Project tags (comma-separated)')
  .option('--id <id>', 'Project ID')
  .option('--set-current', 'Set as current project after adding')
  .option('--register', 'Register discovered projects automatically')
  .action(projectCommand);

// Dashboard command
program
  .command('dashboard <action>')
  .description('Manage the web dashboard')
  .action(dashboardCommand);

// Config command
program
  .command('config')
  .description('Manage ZippyCodeAudit configuration')
  .option('--show', 'Display current configuration')
  .option('--set <key> <value>', 'Set configuration value')
  .option('--reset', 'Reset to default configuration')
  .option('--validate', 'Validate configuration file')
  .action(configCommand);

// Quick command - fast scan with top issues
program
  .command('quick')
  .description('Quick scan showing top 5 issues')
  .option('-f, --fix', 'Apply quick fixes automatically')
  .action(async (options) => {
    const chalk = require('chalk');
    const ora = require('ora');
    const AuditEngine = require('../core/AuditEngine');
    const { formatSummaryCard, formatIssuesList } = require('./utils/formatters');
    
    const spinner = ora('Running quick scan...').start();
    
    try {
      const engine = new AuditEngine({ maxDepth: 5 });
      const results = await engine.runAudit();
      
      spinner.succeed('Quick scan complete!');
      
      console.log(formatSummaryCard(results));
      console.log(formatIssuesList(results.issues?.slice(0, 5) || [], false));
      
      if (options.fix) {
        console.log(chalk.cyan('\n✨ Auto-fix mode coming soon!'));
      }
    } catch (error) {
      spinner.fail('Quick scan failed');
      console.error(chalk.red(error.message));
    }
  });

// Compare command - compare with previous audit
program
  .command('compare')
  .description('Compare current state with previous audit')
  .option('--with <audit-id>', 'Compare with specific audit ID')
  .action(async (options) => {
    const chalk = require('chalk');
    const HistoryTracker = require('../core/HistoryTracker');
    
    try {
      const tracker = new HistoryTracker();
      const history = await tracker.getHistory({ limit: 2 });
      
      if (history.length < 2) {
        console.log(chalk.yellow('⚠️  Need at least 2 audits to compare'));
        return;
      }
      
      const current = history[0];
      const previous = history[1];
      
      console.log(chalk.cyan.bold('\n📊 Audit Comparison\n'));
      
      const healthDiff = current.summary.healthScore - previous.summary.healthScore;
      const issuesDiff = current.summary.totalIssues - previous.summary.totalIssues;
      
      console.log(`Health Score: ${previous.summary.healthScore}% → ${current.summary.healthScore}% ${healthDiff >= 0 ? chalk.green(`(+${healthDiff}%)`) : chalk.red(`(${healthDiff}%)`)}`);
      console.log(`Total Issues: ${previous.summary.totalIssues} → ${current.summary.totalIssues} ${issuesDiff <= 0 ? chalk.green(`(${issuesDiff})`) : chalk.red(`(+${issuesDiff})`)}`);
      
      // Check for regressions
      const regressions = await tracker.detectRegressions();
      if (regressions.hasRegression) {
        console.log(chalk.red.bold('\n⚠️  Regressions Detected:\n'));
        regressions.details.forEach(reg => {
          console.log(`  ${chalk.red('•')} ${reg.message}`);
        });
      } else {
        console.log(chalk.green('\n✅ No regressions detected!'));
      }
    } catch (error) {
      console.error(chalk.red('Comparison failed:'), error.message);
    }
  });

// Interactive command - launch TUI mode
program
  .command('interactive')
  .alias('tui')
  .description('Launch interactive TUI mode with arrow key navigation')
  .action(async () => {
    const InteractiveCLI = require('./interactive');
    const AuditEngine = require('../core/AuditEngine');
    const chalk = require('chalk');
    const ora = require('ora');
    
    console.log(chalk.cyan.bold('\n🚀 Starting interactive mode...\n'));
    
    // Run audit first
    const spinner = ora('Running audit...').start();
    try {
      const engine = new AuditEngine();
      const results = await engine.runAudit();
      spinner.succeed('Audit complete!');
      
      // Launch interactive mode
      const interactive = new InteractiveCLI();
      await interactive.start(results);
    } catch (error) {
      spinner.fail('Audit failed');
      console.error(chalk.red(error.message));
    }
  });

// Explain command - explain audit terminology
program
  .command('explain <term>')
  .description('Explain audit terminology and concepts')
  .action((term) => {
    const chalk = require('chalk');
    
    const explanations = {
      'health-score': {
        title: 'Health Score',
        description: 'A score from 0-100 indicating overall code quality. Higher scores mean fewer issues and better maintainability.',
        calculation: 'Based on issues per file ratio: 100 - (issues/files * 50)',
        thresholds: '90-100: Excellent, 75-89: Good, 60-74: Fair, <60: Needs Improvement'
      },
      'security': {
        title: 'Security Issues',
        description: 'Potential vulnerabilities like exposed secrets, insecure dependencies, or unsafe code patterns.',
        examples: 'Hardcoded passwords, SQL injection risks, XSS vulnerabilities'
      },
      'performance': {
        title: 'Performance Issues',
        description: 'Code patterns that may slow down your application.',
        examples: 'Large files, inefficient algorithms, resource-heavy operations'
      },
      'maintainability': {
        title: 'Maintainability Issues',
        description: 'Code complexity, deep nesting, lack of documentation.',
        impact: 'Makes code harder to understand and modify'
      },
      'quick-wins': {
        title: 'Quick Wins',
        description: 'Easy fixes that take less than 5 minutes but improve code quality.',
        examples: 'Removing console.log, fixing formatting, adding missing documentation'
      }
    };
    
    const explanation = explanations[term.toLowerCase()];
    
    if (explanation) {
      console.log(chalk.cyan.bold(`\n📚 ${explanation.title}\n`));
      console.log(chalk.white(explanation.description));
      
      if (explanation.calculation) {
        console.log(chalk.gray(`\nCalculation: ${explanation.calculation}`));
      }
      if (explanation.thresholds) {
        console.log(chalk.gray(`\nThresholds: ${explanation.thresholds}`));
      }
      if (explanation.examples) {
        console.log(chalk.gray(`\nExamples: ${explanation.examples}`));
      }
      if (explanation.impact) {
        console.log(chalk.gray(`\nImpact: ${explanation.impact}`));
      }
      console.log();
    } else {
      console.log(chalk.yellow(`\n⚠️  No explanation found for: ${term}`));
      console.log(chalk.gray('\nAvailable terms: health-score, security, performance, maintainability, quick-wins\n'));
    }
  });

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
