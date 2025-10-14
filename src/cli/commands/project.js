/**
 * Project Management Commands
 * Handle project registration, listing, and management
 */

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ProjectRegistry = require('../../core/ProjectRegistry');

async function projectCommand(action, options) {
  const registry = new ProjectRegistry();
  await registry.initialize();

  switch (action) {
    case 'list':
      await listProjects(registry, options);
      break;
    case 'add':
      await addProject(registry, options);
      break;
    case 'remove':
      await removeProject(registry, options);
      break;
    case 'current':
      await setCurrentProject(registry, options);
      break;
    case 'discover':
      await discoverProjects(registry, options);
      break;
    case 'info':
      await showProjectInfo(registry, options);
      break;
    default:
      console.log(chalk.yellow('Available project commands:'));
      console.log('  list                    List all registered projects');
      console.log('  add <path>             Add a project to registry');
      console.log('  remove <id>            Remove a project from registry');
      console.log('  current [id]           Get/set current project');
      console.log('  discover               Auto-discover projects');
      console.log('  info <id>              Show detailed project info');
      break;
  }
}

async function listProjects(registry, options) {
  const projects = registry.listProjects();

  if (projects.length === 0) {
    console.log(chalk.yellow('No projects registered. Use "zippy-audit project add <path>" to add projects.'));
    return;
  }

  const currentProject = registry.getCurrentProject();

  console.log(chalk.blue.bold('\n📋 Registered Projects:\n'));

  projects.forEach(project => {
    const isCurrent = currentProject && currentProject.id === project.id;
    const marker = isCurrent ? chalk.green('▶ ') : '  ';

    console.log(`${marker}${chalk.cyan(project.id)} - ${chalk.white(project.name)}`);
    console.log(`   ${chalk.gray('Path:')} ${project.path}`);
    console.log(`   ${chalk.gray('Type:')} ${project.type} ${chalk.gray('|')} ${chalk.gray('Audits:')} ${project.auditCount}`);
    console.log(`   ${chalk.gray('Added:')} ${new Date(project.registeredAt).toLocaleDateString()}`);
    console.log('');
  });

  console.log(chalk.gray(`Total: ${projects.length} projects`));
}

async function addProject(registry, options) {
  let projectPath;

  if (options.path) {
    projectPath = options.path;
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Enter project path:',
        validate: (input) => {
          if (!fs.existsSync(input)) {
            return 'Path does not exist';
          }
          if (!fs.statSync(input).isDirectory()) {
            return 'Path must be a directory';
          }
          return true;
        }
      }
    ]);
    projectPath = answer.path;
  }

  try {
    const metadata = {};

    if (options.name) metadata.name = options.name;
    if (options.description) metadata.description = options.description;
    if (options.type) metadata.type = options.type;
    if (options.tags) metadata.tags = options.tags.split(',');

    const project = await registry.registerProject(projectPath, metadata);

    console.log(chalk.green(`✅ Project registered: ${project.name} (${project.id})`));

    if (options.setCurrent) {
      await registry.setCurrentProject(project.id);
      console.log(chalk.green(`▶ Set as current project`));
    }

  } catch (error) {
    console.error(chalk.red(`❌ Failed to register project: ${error.message}`));
    process.exit(1);
  }
}

async function removeProject(registry, options) {
  let projectId;

  if (options.id) {
    projectId = options.id;
  } else {
    const projects = registry.listProjects();
    if (projects.length === 0) {
      console.log(chalk.yellow('No projects to remove'));
      return;
    }

    const choices = projects.map(p => ({
      name: `${p.name} (${p.id}) - ${p.path}`,
      value: p.id
    }));

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectId',
        message: 'Select project to remove:',
        choices: choices
      }
    ]);

    projectId = answer.projectId;
  }

  try {
    const project = await registry.unregisterProject(projectId);
    console.log(chalk.green(`✅ Project removed: ${project.name}`));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to remove project: ${error.message}`));
    process.exit(1);
  }
}

async function setCurrentProject(registry, options) {
  if (options.id) {
    try {
      await registry.setCurrentProject(options.id);
      const project = registry.getProject(options.id);
      console.log(chalk.green(`✅ Current project set to: ${project.name}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to set current project: ${error.message}`));
      process.exit(1);
    }
  } else {
    const currentProject = registry.getCurrentProject();
    if (currentProject) {
      console.log(chalk.green(`Current project: ${currentProject.name} (${currentProject.id})`));
      console.log(`Path: ${currentProject.path}`);
    } else {
      console.log(chalk.yellow('No current project set'));
    }
  }
}

async function discoverProjects(registry, options) {
  console.log(chalk.blue('🔍 Discovering projects...'));

  const discovered = await registry.discoverProjects();

  if (discovered.length === 0) {
    console.log(chalk.yellow('No new projects discovered'));
    return;
  }

  console.log(chalk.green(`Found ${discovered.length} new projects:`));

  for (const project of discovered) {
    console.log(`  ${chalk.cyan(project.name)} - ${chalk.gray(project.path)} (${project.type})`);

    if (options.register) {
      try {
        await registry.registerProject(project.path, {
          name: project.name,
          type: project.type
        });
        console.log(chalk.green(`    ✅ Registered`));
      } catch (error) {
        console.log(chalk.red(`    ❌ Failed to register: ${error.message}`));
      }
    }
  }

  if (!options.register) {
    console.log(chalk.yellow('\nUse --register flag to automatically register discovered projects'));
  }
}

async function showProjectInfo(registry, options) {
  let projectId;

  if (options.id) {
    projectId = options.id;
  } else {
    const currentProject = registry.getCurrentProject();
    if (currentProject) {
      projectId = currentProject.id;
    } else {
      console.log(chalk.red('No current project. Specify project ID with --id'));
      process.exit(1);
    }
  }

  try {
    await registry.validateProject(projectId);
    const project = registry.getProject(projectId);
    const stats = registry.getProjectStats(projectId);

    console.log(chalk.blue.bold(`\n📋 Project Information\n`));
    console.log(`ID: ${chalk.cyan(project.id)}`);
    console.log(`Name: ${chalk.white(project.name)}`);
    console.log(`Path: ${chalk.gray(project.path)}`);
    console.log(`Type: ${chalk.yellow(project.type)}`);
    console.log(`Description: ${project.description || chalk.gray('None')}`);

    if (project.tags.length > 0) {
      console.log(`Tags: ${project.tags.map(tag => chalk.cyan(tag)).join(', ')}`);
    }

    console.log(chalk.blue.bold('\n📊 Statistics'));
    console.log(`Files: ${stats.fileCount.toLocaleString()}`);
    console.log(`Size: ${formatBytes(stats.size)}`);
    console.log(`Audits: ${stats.auditCount}`);
    console.log(`Last Audited: ${stats.lastAudited ? new Date(stats.lastAudited).toLocaleDateString() : 'Never'}`);
    console.log(`Registered: ${new Date(project.registeredAt).toLocaleDateString()}`);

    console.log(chalk.blue.bold('\n⚙️ Settings'));
    console.log(`Auto Audit: ${project.settings.autoAudit ? 'Enabled' : 'Disabled'}`);
    console.log(`Include Patterns: ${project.settings.includePatterns.join(', ')}`);
    console.log(`Exclude Patterns: ${project.settings.excludePatterns.join(', ')}`);

  } catch (error) {
    console.error(chalk.red(`❌ ${error.message}`));
    process.exit(1);
  }
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = projectCommand;
