/**
 * Init Command - Initialize ZippyCodeAudit in current project
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

async function initCommand(options) {
  const spinner = ora();

  try {
    const projectPath = process.cwd();
    console.log(chalk.blue.bold('🚀 Initializing ZippyCodeAudit...\n'));

    // Check if already initialized
    const existingFiles = await checkExistingFiles(projectPath);

    if (existingFiles.length > 0 && !options.force) {
      console.log(chalk.yellow('⚠️  Some audit files already exist:'));
      existingFiles.forEach(file => {
        console.log(`   • ${file}`);
      });
      console.log(chalk.yellow('\nUse --force to overwrite existing files.'));
      return;
    }

    // Create audit system files
    if (options.auditSystem) {
      await createAuditSystem(projectPath, options.force);
    }

    // Create CI workflow
    if (options.ciWorkflow) {
      await createCIWorkflow(projectPath, options.force);
    }

    // Configure VS Code
    if (options.vscodeExtension) {
      await configureVSCode(projectPath, options.force);
    }

    // Create default config if no specific options
    if (!options.auditSystem && !options.ciWorkflow && !options.vscodeExtension) {
      await createDefaultConfig(projectPath, options.force);
    }

    console.log(chalk.green.bold('\n✅ ZippyCodeAudit initialized successfully!'));

    // Show next steps
    showNextSteps(options);

  } catch (error) {
    spinner.fail(chalk.red('❌ Initialization failed'));
    console.error(chalk.red('Error:'), error.message);

    if (options.parent?.debug) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

async function checkExistingFiles(projectPath) {
  const filesToCheck = [
    'docs/PROJECT_AUDIT_PROMPT.md',
    'docs/PROJECT_AUDIT_TASKS.md',
    'docs/PROJECT_AUDIT_RUNBOOK.md',
    '.github/workflows/project_audit_automation.yml',
    'zippycodesaudit.config.json'
  ];

  const existingFiles = [];

  for (const file of filesToCheck) {
    if (await fs.pathExists(path.join(projectPath, file))) {
      existingFiles.push(file);
    }
  }

  return existingFiles;
}

async function createAuditSystem(projectPath, force) {
  const spinner = ora('Creating audit system files...').start();

  const auditFiles = {
    'docs/PROJECT_AUDIT_PROMPT.md': getAuditPromptContent(),
    'docs/PROJECT_AUDIT_TASKS.md': getAuditTasksContent(),
    'docs/PROJECT_AUDIT_RUNBOOK.md': getAuditRunbookContent(),
    'docs/README_AUDIT_SYSTEM.md': getAuditReadmeContent()
  };

  for (const [filePath, content] of Object.entries(auditFiles)) {
    const fullPath = path.join(projectPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));

    if (force || !await fs.pathExists(fullPath)) {
      await fs.writeFile(fullPath, content, 'utf8');
    }
  }

  spinner.succeed(chalk.green('Audit system files created'));
}

async function createCIWorkflow(projectPath, force) {
  const spinner = ora('Creating GitHub Actions workflow...').start();

  const workflowContent = getCIWorkflowContent();
  const workflowPath = path.join(projectPath, '.github/workflows/project_audit_automation.yml');

  await fs.ensureDir(path.dirname(workflowPath));

  if (force || !await fs.pathExists(workflowPath)) {
    await fs.writeFile(workflowPath, workflowContent, 'utf8');
  }

  spinner.succeed(chalk.green('GitHub Actions workflow created'));
}

async function configureVSCode(projectPath, force) {
  const spinner = ora('Configuring VS Code integration...').start();

  // Create VS Code settings
  const settingsPath = path.join(projectPath, '.vscode/settings.json');
  const settings = {
    'zippycodesaudit.enable': true,
    'zippycodesaudit.autoCheck': false,
    'zippycodesaudit.reportFormat': 'markdown'
  };

  await fs.ensureDir(path.dirname(settingsPath));

  if (force || !await fs.pathExists(settingsPath)) {
    await fs.writeJson(settingsPath, settings, { spaces: 2 });
  }

  // Create VS Code tasks
  const tasksPath = path.join(projectPath, '.vscode/tasks.json');
  const tasks = {
    version: '2.0.0',
    tasks: [
      {
        label: 'ZippyCodeAudit: Analyze',
        type: 'shell',
        command: 'zippy-audit',
        args: ['analyze'],
        group: 'build',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared'
        }
      },
      {
        label: 'ZippyCodeAudit: Check All',
        type: 'shell',
        command: 'zippy-audit',
        args: ['check', '--all'],
        group: 'test',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared'
        }
      }
    ]
  };

  if (force || !await fs.pathExists(tasksPath)) {
    await fs.writeJson(tasksPath, tasks, { spaces: 2 });
  }

  spinner.succeed(chalk.green('VS Code integration configured'));
}

async function createDefaultConfig(projectPath, force) {
  const spinner = ora('Creating default configuration...').start();

  const config = {
    project: {
      name: path.basename(projectPath),
      type: 'auto-detect'
    },
    analysis: {
      includePatterns: ['**/*.{js,ts,py,go,md,json,yml,yaml}'],
      excludePatterns: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      maxDepth: 10
    },
    reporting: {
      format: 'markdown',
      outputDir: 'docs/audit_reports'
    },
    automation: {
      enabled: false,
      schedule: '0 14 * * 1', // Weekly on Monday
      aiEndpoint: null,
      aiApiKey: null
    }
  };

  const configPath = path.join(projectPath, 'zippycodesaudit.config.json');

  if (force || !await fs.pathExists(configPath)) {
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  spinner.succeed(chalk.green('Default configuration created'));
}

function showNextSteps(options) {
  console.log(chalk.cyan.bold('\n🎯 Next Steps:'));

  if (options.auditSystem) {
    console.log('   1. Review the audit files in docs/');
    console.log('   2. Customize PROJECT_AUDIT_PROMPT.md for your project');
    console.log('   3. Run: zippy-audit analyze');
  }

  if (options.ciWorkflow) {
    console.log('   1. Set up GitHub secrets for AI_AUDIT_ENDPOINT and AI_AUDIT_API_KEY (optional)');
    console.log('   2. Push to GitHub to activate the workflow');
    console.log('   3. Check Actions tab for automated audits');
  }

  if (options.vscodeExtension) {
    console.log('   1. Install the ZippyCodeAudit VS Code extension');
    console.log('   2. Use Command Palette: "ZippyCodeAudit: Analyze"');
    console.log('   3. Configure settings in .vscode/settings.json');
  }

  console.log('   4. Run: zippy-audit --help for all available commands');
  console.log('   5. Check docs/ for detailed documentation');
}

// Template content functions
function getAuditPromptContent() {
  return `# 🧩 PROJECT AUDIT PROMPT

## Purpose
This prompt is designed for AI coding assistants to perform comprehensive project audits.

## 🎯 Objective
Conduct a complete, context-aware audit of this repository to evaluate its health, alignment with requirements, and improvement opportunities.

## 🧠 Instructions
1. Analyze tech stack and project structure
2. Review requirements vs implementation
3. Identify missing, outdated, or inconsistent elements
4. Provide prioritized improvements

## Output Format
# Project Audit Summary
- Detected Tech Stack:
- Current State Overview:
- Alignment vs. Requirements:
- Missing / Outdated Elements:
- Code Quality Observations:
- Risks & Blockers:
- Recommended Improvements (ranked):
- Next Best Steps:
`;
}

function getAuditTasksContent() {
  return `# ✅ PROJECT AUDIT TASKS

## Purpose
Track all findings and recommendations from the Project Audit process.

## Task Fields
| ID | Category | Summary | Impact | Priority | Owner | Status | Notes |
|----|----------|---------|--------|----------|-------|--------|-------|

## Notes
- Archive completed tasks to maintain traceability
- Use this document for sprint planning and prioritization
`;
}

function getAuditRunbookContent() {
  return `# 🧭 PROJECT AUDIT RUNBOOK

## Purpose
Operational procedure for executing project audits.

## Phases
1. Assessment — Run AI prompt, gather findings
2. Task Registration — Log actionable issues
3. Follow-Up — Assign, track, and verify completion

## Prerequisites
- Audit files present in docs/
- Repository context available to AI tool

## Phase 1: Assessment
Run the prompt in PROJECT_AUDIT_PROMPT.md with repository context.

## Phase 2: Task Registration
Extract actionable items and add to PROJECT_AUDIT_TASKS.md.

## Phase 3: Follow-Up
Assign owners and track completion in project management tools.
`;
}

function getAuditReadmeContent() {
  return `# 🧩 Project Audit System

## Overview
Self-contained AI-assisted audit system for continuous project improvement.

## Components
- PROJECT_AUDIT_PROMPT.md — Core analysis prompt
- PROJECT_AUDIT_TASKS.md — Task tracking
- PROJECT_AUDIT_RUNBOOK.md — Operational procedures

## Setup
1. Ensure all audit files are present in docs/
2. Configure optional AI endpoint secrets
3. Run audits manually or via automation

## Usage
- Manual: Run prompt in AI assistant with repo context
- Automated: GitHub Actions workflow runs scheduled audits
- CLI: Use zippy-audit commands for quick analysis
`;
}

function getCIWorkflowContent() {
  return `name: Project Audit Automation

on:
  workflow_dispatch:
  schedule:
    - cron: '0 14 * * 1'  # Weekly on Monday
  push:
    branches: [ main ]
    paths:
      - 'docs/**'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Audit
        run: |
          echo "Audit workflow placeholder"
          # Install and run zippy-audit when available
`;
}

module.exports = initCommand;
