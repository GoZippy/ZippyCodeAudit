/**
 * Dashboard Command - Start and manage the web dashboard
 */

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function dashboardCommand(action, options) {
  const dashboardPath = path.join(process.cwd(), 'dist', 'dashboard');
  const apiScript = path.join(process.cwd(), 'simple-api.js');

  switch (action) {
    case 'start':
      await startDashboard(options, apiScript);
      break;
    case 'stop':
      await stopDashboard(options);
      break;
    case 'restart':
      await restartDashboard(options);
      break;
    case 'status':
      await showDashboardStatus(options);
      break;
    default:
      console.log(chalk.yellow('Available dashboard commands:'));
      console.log('  start              Start the dashboard and API server');
      console.log('  stop               Stop running dashboard services');
      console.log('  restart            Restart dashboard services');
      console.log('  status             Show dashboard status');
      break;
  }
}

async function startDashboard(options, apiScript) {
  console.log(chalk.blue.bold('🚀 Starting ZippyCodeAudit Dashboard...\n'));

  try {
    // Check if dashboard is built
    if (!await fs.pathExists(path.join(process.cwd(), 'dist', 'dashboard', 'index.html'))) {
      console.log(chalk.yellow('📦 Dashboard not built. Building now...'));
      const { execSync } = require('child_process');
      execSync('npm run build:dashboard', { stdio: 'inherit' });
    }

    // Start API server
    console.log(chalk.cyan('📡 Starting API server...'));
    const apiProcess = spawn('node', [apiScript], {
      detached: true,
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Wait a moment for API server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start dashboard server
    console.log(chalk.cyan('🖥️  Starting dashboard...'));
    const dashboardProcess = spawn('npx', ['serve', 'dist/dashboard', '-p', '3001'], {
      detached: true,
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Save process IDs for later management
    const pids = {
      api: apiProcess.pid,
      dashboard: dashboardProcess.pid,
      timestamp: new Date().toISOString()
    };

    await fs.writeJson('.zippycodesaudit-pids.json', pids, { spaces: 2 });

    console.log(chalk.green('\n✅ Dashboard started successfully!'));
    console.log(chalk.cyan('📊 API Server: http://localhost:3006'));
    console.log(chalk.cyan('🖥️  Dashboard: http://localhost:3001'));
    console.log(chalk.yellow('💡 Use "zippy-audit dashboard stop" to stop services'));

  } catch (error) {
    console.error(chalk.red('❌ Failed to start dashboard:'), error.message);
    process.exit(1);
  }
}

async function stopDashboard(options) {
  console.log(chalk.blue.bold('🛑 Stopping ZippyCodeAudit Dashboard...\n'));

  try {
    // Load saved process IDs
    if (await fs.pathExists('.zippycodesaudit-pids.json')) {
      const pids = await fs.readJson('.zippycodesaudit-pids.json');

      // Kill processes
      if (pids.api) {
        process.kill(pids.api, 'SIGTERM');
        console.log(chalk.green('✅ API server stopped'));
      }

      if (pids.dashboard) {
        process.kill(pids.dashboard, 'SIGTERM');
        console.log(chalk.green('✅ Dashboard server stopped'));
      }

      // Remove PID file
      await fs.remove('.zippycodesaudit-pids.json');
      console.log(chalk.green('✅ Process management cleaned up'));

    } else {
      console.log(chalk.yellow('⚠️  No running processes found'));
    }

  } catch (error) {
    console.error(chalk.red('❌ Failed to stop dashboard:'), error.message);
    process.exit(1);
  }
}

async function restartDashboard(options) {
  console.log(chalk.blue.bold('🔄 Restarting ZippyCodeAudit Dashboard...\n'));

  await stopDashboard(options);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await startDashboard(options);
}

async function showDashboardStatus(options) {
  console.log(chalk.blue.bold('📊 ZippyCodeAudit Dashboard Status\n'));

  try {
    // Check if PID file exists
    if (await fs.pathExists('.zippycodesaudit-pids.json')) {
      const pids = await fs.readJson('.zippycodesaudit-pids.json');

      console.log(chalk.green('✅ Services are running'));
      console.log(`   📊 API Server PID: ${pids.api}`);
      console.log(`   🖥️  Dashboard PID: ${pids.dashboard}`);
      console.log(`   ⏰ Started: ${new Date(pids.timestamp).toLocaleString()}`);

      // Check if processes are actually running
      try {
        process.kill(pids.api, 0);
        console.log(chalk.green('   ✅ API server is responsive'));
      } catch {
        console.log(chalk.red('   ❌ API server not responding'));
      }

      try {
        process.kill(pids.dashboard, 0);
        console.log(chalk.green('   ✅ Dashboard server is responsive'));
      } catch {
        console.log(chalk.red('   ❌ Dashboard server not responding'));
      }

    } else {
      console.log(chalk.yellow('⚠️  No services are running'));
      console.log(chalk.gray('   Use "zippy-audit dashboard start" to start services'));
    }

    // Show available endpoints
    console.log(chalk.blue('\n🌐 Available Endpoints:'));
    console.log(chalk.cyan('   Dashboard: http://localhost:3001'));
    console.log(chalk.cyan('   API: http://localhost:3006/api'));
    console.log(chalk.cyan('   Health: http://localhost:3006/health'));

  } catch (error) {
    console.error(chalk.red('❌ Failed to check status:'), error.message);
    process.exit(1);
  }
}

module.exports = dashboardCommand;
