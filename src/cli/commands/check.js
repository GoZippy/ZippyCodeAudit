/**
 * Check Command - Run specific quality checks
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { formatOutput } = require('../utils/formatters');
const { glob } = require('glob');

const CHECKS = {
  security: {
    name: 'Security Check',
    description: 'Scan for potential security vulnerabilities',
    run: runSecurityCheck
  },
  performance: {
    name: 'Performance Check',
    description: 'Analyze performance bottlenecks and optimization opportunities',
    run: runPerformanceCheck
  },
  maintainability: {
    name: 'Maintainability Check',
    description: 'Assess code maintainability and technical debt',
    run: runMaintainabilityCheck
  },
  'test-coverage': {
    name: 'Test Coverage Check',
    description: 'Analyze test coverage and testing practices',
    run: runTestCoverageCheck
  },
  dependencies: {
    name: 'Dependencies Check',
    description: 'Check dependency health and security',
    run: runDependenciesCheck
  },
  'code-style': {
    name: 'Code Style Check',
    description: 'Check code style and formatting consistency',
    run: runCodeStyleCheck
  }
};

async function checkCommand(options) {
  const spinner = ora();

  try {
    // Determine which checks to run
    const checksToRun = getChecksToRun(options);

    if (checksToRun.length === 0) {
      console.log(chalk.yellow('No checks specified. Use --all to run all checks.'));
      console.log(chalk.gray('Available checks:'));
      Object.entries(CHECKS).forEach(([key, check]) => {
        console.log(`  --${key}    ${check.description}`);
      });
      return;
    }

    console.log(chalk.blue.bold(`🔍 Running ${checksToRun.length} quality check(s)...\n`));

    const results = {
      timestamp: new Date().toISOString(),
      projectPath: process.cwd(),
      checks: [],
      summary: {
        totalChecks: checksToRun.length,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Run each check
    for (const checkKey of checksToRun) {
      const check = CHECKS[checkKey];

      spinner.start(`${check.name}...`);
      try {
        const checkResult = await check.run(options);
        results.checks.push({
          name: check.name,
          key: checkKey,
          status: checkResult.issues.length > 0 ? 'warning' : 'passed',
          issues: checkResult.issues,
          metrics: checkResult.metrics
        });

        if (checkResult.issues.length === 0) {
          results.summary.passed++;
          spinner.succeed(chalk.green(`${check.name}: Passed`));
        } else {
          results.summary.warnings += checkResult.issues.length;
          spinner.warn(chalk.yellow(`${check.name}: ${checkResult.issues.length} issues found`));
        }
      } catch (error) {
        results.summary.failed++;
        results.checks.push({
          name: check.name,
          key: checkKey,
          status: 'failed',
          error: error.message
        });
        spinner.fail(chalk.red(`${check.name}: Failed - ${error.message}`));
      }
    }

    // Display results
    await displayCheckResults(results, options);

    // Save output if specified
    if (options.output) {
      await saveCheckResults(results, options.output, options.format);
    }

    // Exit with appropriate code
    const exitCode = results.summary.failed > 0 ? 1 : 0;
    process.exit(exitCode);

  } catch (error) {
    spinner.fail(chalk.red('❌ Check command failed'));
    console.error(chalk.red('Error:'), error.message);

    if (options.parent?.debug) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

function getChecksToRun(options) {
  const checksToRun = [];

  if (options.all) {
    return Object.keys(CHECKS);
  }

  Object.keys(options).forEach(key => {
    if (options[key] && CHECKS[key]) {
      checksToRun.push(key);
    }
  });

  return checksToRun;
}

async function displayCheckResults(results, options) {
  const format = options.format || 'table';

  console.log(chalk.cyan.bold('\n📋 CHECK RESULTS SUMMARY\n'));

  // Summary table
  console.log(chalk.yellow('Overall Status:'));
  console.log(`   ✅ Passed: ${results.summary.passed}`);
  console.log(`   ⚠️  Warnings: ${results.summary.warnings}`);
  console.log(`   ❌ Failed: ${results.summary.failed}`);

  if (format === 'table') {
    await displayTableView(results);
  } else if (format === 'json') {
    console.log(JSON.stringify(results, null, 2));
  } else {
    await displaySummaryView(results);
  }
}

async function displayTableView(results) {
  const table = require('table');

  // Checks table
  const checkData = results.checks.map(check => [
    check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌',
    check.name,
    check.status,
    check.issues?.length || 0
  ]);

  console.log(chalk.cyan('\n📊 Check Results:'));
  console.log(table.table([
    ['Status', 'Check', 'Result', 'Issues'],
    ...checkData
  ]));
}

async function displaySummaryView(results) {
  results.checks.forEach(check => {
    console.log(chalk.cyan(`\n${check.name}:`));

    if (check.status === 'passed') {
      console.log(chalk.green('   ✅ No issues found'));
    } else if (check.status === 'warning') {
      console.log(chalk.yellow(`   ⚠️  ${check.issues.length} issues found:`));
      check.issues.slice(0, 5).forEach(issue => {
        console.log(`      • ${issue.message}`);
      });
    } else if (check.status === 'failed') {
      console.log(chalk.red(`   ❌ Check failed: ${check.error}`));
    }
  });
}

async function saveCheckResults(results, outputPath, format) {
  const spinner = ora('Saving check results...').start();

  try {
    const output = formatOutput(results, format);

    if (format === 'json') {
      await fs.writeJson(outputPath, results, { spaces: 2 });
    } else {
      await fs.writeFile(outputPath, output, 'utf8');
    }

    spinner.succeed(chalk.green(`Check results saved to: ${outputPath}`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to save check results'));
    throw error;
  }
}

// Individual check functions
async function runSecurityCheck(options) {
  const issues = [];
  const projectPath = process.cwd();

  // Check for potential secrets
  const files = await fs.readdir(projectPath, { recursive: true });

  for (const file of files) {
    if (typeof file === 'string' && !file.includes('node_modules')) {
      try {
        const content = await fs.readFile(path.join(projectPath, file), 'utf8');
        if (content.includes('password') || content.includes('secret') || content.match(/sk-[a-zA-Z0-9]{32,}/)) {
          issues.push({
            type: 'security',
            severity: 'high',
            message: 'Potential sensitive information detected',
            file: file,
            suggestion: 'Use environment variables or secure secret management'
          });
        }
      } catch (error) {
        // Skip binary files
      }
    }
  }

  return { issues, metrics: { filesChecked: files.length } };
}

async function runPerformanceCheck(options) {
  const issues = [];
  const projectPath = process.cwd();

  // Check for large files
  const files = await fs.readdir(projectPath, { recursive: true, withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      const stats = await fs.stat(path.join(projectPath, file.name));
      if (stats.size > 1024 * 1024) { // > 1MB
        issues.push({
          type: 'performance',
          severity: 'medium',
          message: `Large file detected (${Math.round(stats.size / 1024)}KB)`,
          file: file.name,
          suggestion: 'Consider splitting large files or optimizing content'
        });
      }
    }
  }

  return { issues, metrics: { largeFiles: issues.length } };
}

async function runMaintainabilityCheck(options) {
  const issues = [];

  // Check for deeply nested files
  const projectPath = process.cwd();
  const files = await fs.readdir(projectPath, { recursive: true });

  for (const file of files) {
    if (typeof file === 'string') {
      const depth = file.split('/').length;
      if (depth > 6) {
        issues.push({
          type: 'maintainability',
          severity: 'low',
          message: `Deeply nested file (${depth} levels)`,
          file: file,
          suggestion: 'Consider reorganizing file structure for better maintainability'
        });
      }
    }
  }

  return { issues, metrics: { deepFiles: issues.length } };
}

async function runTestCoverageCheck(options) {
  const issues = [];
  const projectPath = process.cwd();

  // Look for test files
  const testFiles = await glob('**/*.{test,spec}.{js,ts,py}', { cwd: projectPath });
  const sourceFiles = await glob('**/*.{js,ts,py}', {
    cwd: projectPath,
    ignore: ['**/*.{test,spec}.{js,ts,py}', 'node_modules/**']
  });

  const coverageRatio = testFiles.length / sourceFiles.length;

  if (coverageRatio < 0.1) {
    issues.push({
      type: 'testing',
      severity: 'high',
      message: `Low test coverage (${Math.round(coverageRatio * 100)}%)`,
      file: null,
      suggestion: 'Increase test coverage to improve code quality and reliability'
    });
  }

  return {
    issues,
    metrics: {
      testFiles: testFiles.length,
      sourceFiles: sourceFiles.length,
      coverageRatio: Math.round(coverageRatio * 100)
    }
  };
}

async function runDependenciesCheck(options) {
  const issues = [];
  const projectPath = process.cwd();
  let deps = [];

  // Check package.json for outdated patterns
  const packagePath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packagePath)) {
    const packageJson = await fs.readJson(packagePath);

    if (packageJson.dependencies) {
      deps = Object.keys(packageJson.dependencies);
      if (deps.length > 50) {
        issues.push({
          type: 'dependencies',
          severity: 'medium',
          message: `Large number of dependencies (${deps.length})`,
          file: 'package.json',
          suggestion: 'Consider dependency optimization and tree shaking'
        });
      }
    }
  }

  return { issues, metrics: { dependencyCount: deps?.length || 0 } };
}

async function runCodeStyleCheck(options) {
  const issues = [];

  // Check for inconsistent naming
  const projectPath = process.cwd();
  const files = await fs.readdir(projectPath, { recursive: true });

  let hasCamelCase = false;
  let hasSnakeCase = false;

  for (const file of files) {
    if (typeof file === 'string' && file.includes('.')) {
      if (file.match(/[a-z]+[A-Z]/)) hasCamelCase = true;
      if (file.includes('_')) hasSnakeCase = true;
    }
  }

  if (hasCamelCase && hasSnakeCase) {
    issues.push({
      type: 'style',
      severity: 'low',
      message: 'Mixed naming conventions detected',
      file: null,
      suggestion: 'Standardize naming conventions across the project'
    });
  }

  return { issues, metrics: { mixedNaming: hasCamelCase && hasSnakeCase } };
}

module.exports = checkCommand;
