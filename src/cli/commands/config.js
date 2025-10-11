/**
 * Config Command - Manage ZippyCodeAudit configuration
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const DEFAULT_CONFIG = {
  project: {
    name: null,
    type: 'auto-detect',
    path: process.cwd()
  },
  analysis: {
    includePatterns: ['**/*.{js,ts,py,go,md,json,yml,yaml}'],
    excludePatterns: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
    maxDepth: 10,
    timeout: 30000
  },
  reporting: {
    format: 'markdown',
    outputDir: 'docs/audit_reports',
    includeTimestamp: true,
    compressLargeReports: true
  },
  automation: {
    enabled: false,
    schedule: '0 14 * * 1', // Weekly on Monday 9am CT
    aiEndpoint: null,
    aiApiKey: null,
    slackWebhook: null,
    emailNotifications: false
  },
  cli: {
    colorOutput: true,
    verboseLogging: false,
    interactiveMode: true
  }
};

async function configCommand(options) {
  const spinner = ora();

  try {
    const configPath = path.join(process.cwd(), 'zippycodesaudit.config.json');

    if (options.show) {
      await showConfig(configPath);
    } else if (options.set) {
      await setConfig(configPath, options.set);
    } else if (options.reset) {
      await resetConfig(configPath);
    } else if (options.validate) {
      await validateConfig(configPath);
    } else {
      console.log(chalk.yellow('No action specified. Use --help for options.'));
      console.log(chalk.gray('Available actions: --show, --set, --reset, --validate'));
    }

  } catch (error) {
    spinner.fail(chalk.red('❌ Config command failed'));
    console.error(chalk.red('Error:'), error.message);

    if (options.parent?.debug) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

async function showConfig(configPath) {
  console.log(chalk.blue.bold('📋 Current Configuration:\n'));

  if (await fs.pathExists(configPath)) {
    const config = await fs.readJson(configPath);
    console.log(JSON.stringify(config, null, 2));
  } else {
    console.log(chalk.yellow('No configuration file found.'));
    console.log(chalk.gray('Run "zippy-audit init" to create a default configuration.'));
  }
}

async function setConfig(configPath, setOption) {
  const [key, value] = setOption.split('=');
  if (!key || value === undefined) {
    console.error(chalk.red('Invalid format. Use: --set key=value'));
    process.exit(1);
  }

  const spinner = ora(`Setting ${key}=${value}...`).start();

  let config = {};
  if (await fs.pathExists(configPath)) {
    config = await fs.readJson(configPath);
  } else {
    config = { ...DEFAULT_CONFIG };
  }

  // Set nested property
  const keys = key.split('.');
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = parseValue(value);

  await fs.writeJson(configPath, config, { spaces: 2 });
  spinner.succeed(chalk.green(`Configuration updated: ${key}=${value}`));
}

async function resetConfig(configPath) {
  const spinner = ora('Resetting configuration to defaults...').start();

  await fs.writeJson(configPath, DEFAULT_CONFIG, { spaces: 2 });
  spinner.succeed(chalk.green('Configuration reset to defaults'));
}

async function validateConfig(configPath) {
  const spinner = ora('Validating configuration...').start();

  if (!await fs.pathExists(configPath)) {
    spinner.fail(chalk.red('No configuration file found'));
    return;
  }

  const config = await fs.readJson(configPath);
  const issues = [];

  // Validate structure
  issues.push(...validateConfigStructure(config));

  // Validate values
  issues.push(...validateConfigValues(config));

  if (issues.length === 0) {
    spinner.succeed(chalk.green('Configuration is valid'));
  } else {
    spinner.warn(chalk.yellow(`Found ${issues.length} configuration issues:`));
    issues.forEach(issue => {
      console.log(chalk.yellow(`  • ${issue}`));
    });
  }
}

function validateConfigStructure(config) {
  const issues = [];
  const requiredSections = ['project', 'analysis', 'reporting', 'automation', 'cli'];

  requiredSections.forEach(section => {
    if (!config[section]) {
      issues.push(`Missing required section: ${section}`);
    }
  });

  return issues;
}

function validateConfigValues(config) {
  const issues = [];

  // Validate analysis patterns
  if (config.analysis) {
    if (!Array.isArray(config.analysis.includePatterns)) {
      issues.push('analysis.includePatterns must be an array');
    }
    if (!Array.isArray(config.analysis.excludePatterns)) {
      issues.push('analysis.excludePatterns must be an array');
    }
    if (typeof config.analysis.maxDepth !== 'number' || config.analysis.maxDepth < 1) {
      issues.push('analysis.maxDepth must be a positive number');
    }
  }

  // Validate reporting format
  if (config.reporting) {
    const validFormats = ['json', 'markdown', 'html', 'table'];
    if (!validFormats.includes(config.reporting.format)) {
      issues.push(`reporting.format must be one of: ${validFormats.join(', ')}`);
    }
  }

  // Validate automation schedule
  if (config.automation && config.automation.schedule) {
    if (!isValidCron(config.automation.schedule)) {
      issues.push('automation.schedule must be a valid cron expression');
    }
  }

  return issues;
}

function parseValue(value) {
  // Try to parse as JSON first
  try {
    return JSON.parse(value);
  } catch {
    // If not JSON, check for boolean/number
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(value)) return Number(value);
    return value;
  }
}

function isValidCron(cronExpression) {
  const cronRegex = /^(\*|(\d+|\d+-\d+|(\d+(,\d+)*))|\?)\s+(\*|(\d+|\d+-\d+|(\d+(,\d+)*))|\?)\s+(\*|(\d+|\d+-\d+|(\d+(,\d+)*))|\?)\s+(\*|(\d+|\d+-\d+|(\d+(,\d+)*))|\?)\s+(\*|(\d+|\d+-\d+|(\d+(,\d+)*))|\?)\s+(\*|(\d+|\d+-\d+|(\d+(,\d+)*))|\?)$/;
  return cronRegex.test(cronExpression);
}

module.exports = configCommand;
