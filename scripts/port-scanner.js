#!/usr/bin/env node

/**
 * ZippyCodeAudit Port Scanner and Allocator
 * Dynamically finds available ports to avoid conflicts with existing services
 */

const net = require('net');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');

// Port requirements for ZippyCodeAudit services
const PORT_REQUIREMENTS = {
  dashboard: {
    name: 'Web Dashboard',
    default: 3001,
    priority: 'high', // Critical for user interface
    range: [3000, 4000]
  },
  api: {
    name: 'API Services',
    default: 3000,
    priority: 'high', // Critical for functionality
    range: [3000, 4000]
  },
  monitoring: {
    name: 'Monitoring (Optional)',
    default: 3002,
    priority: 'medium', // Nice to have for debugging
    range: [3000, 4000]
  }
};

// IANA registered ports to avoid (common system services)
const RESERVED_PORTS = [
  20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, // Common services
  3306, 5432, 6379, 27017, // Databases
  8080, 8443, 9000, 9090, // Common dev ports
  3000, 3001, 3002, 3003, 3004, 3005 // Common Node.js ports
];

class PortScanner {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.scanResults = {
      available: {},
      conflicts: {},
      recommendations: {}
    };
  }

  /**
   * Check if a port is available
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });

      server.on('error', () => resolve(false));
    });
  }

  /**
   * Get active connections for a port
   */
  async getPortProcess(port) {
    if (this.isWindows) {
      try {
        const { execSync } = require('child_process');
        const output = execSync(`netstat -ano | findstr ":${port} "`, { encoding: 'utf8' });
        return output.trim();
      } catch {
        return null;
      }
    } else {
      try {
        const { execSync } = require('child_process');
        const output = execSync(`lsof -i :${port} 2>/dev/null || netstat -tulpn | grep ":${port} "`, { encoding: 'utf8' });
        return output.trim();
      } catch {
        return null;
      }
    }
  }

  /**
   * Scan a range of ports for availability
   */
  async scanPortRange(start, end, excludeReserved = true) {
    const available = [];
    const conflicts = [];

    const portsToCheck = excludeReserved
      ? this.filterReservedPorts(start, end)
      : Array.from({ length: end - start + 1 }, (_, i) => start + i);

    for (const port of portsToCheck) {
      const isAvailable = await this.isPortAvailable(port);

      if (isAvailable) {
        available.push(port);
      } else {
        const process = await this.getPortProcess(port);
        conflicts.push({
          port,
          process: process || 'Unknown process'
        });
      }
    }

    return { available, conflicts };
  }

  /**
   * Filter out reserved/system ports
   */
  filterReservedPorts(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      .filter(port => !RESERVED_PORTS.includes(port));
  }

  /**
   * Find optimal port for a service
   */
  async findOptimalPort(requirement) {
    const { name, default: defaultPort, range, priority } = requirement;

    console.log(`🔍 Finding port for ${name}...`);

    // First, try the default port
    const defaultAvailable = await this.isPortAvailable(defaultPort);
    if (defaultAvailable) {
      console.log(`✅ Default port ${defaultPort} is available for ${name}`);
      return defaultPort;
    }

    // Check if default port conflict is critical
    const process = await this.getPortProcess(defaultPort);
    console.log(`⚠️  Default port ${defaultPort} is in use by: ${process || 'Unknown process'}`);

    if (priority === 'high') {
      console.log(`🚨 Critical service ${name} needs port ${defaultPort}`);
      this.scanResults.recommendations[name] = `Kill conflicting process or use alternative port`;
    }

    // Scan the preferred range
    const { available, conflicts } = await this.scanPortRange(range[0], range[1]);

    if (available.length > 0) {
      const chosenPort = available[0]; // Use first available
      console.log(`✅ Found alternative port ${chosenPort} for ${name}`);
      this.scanResults.available[name] = chosenPort;
      return chosenPort;
    }

    // Fallback: scan a wider range
    console.log(`🔄 Scanning wider range for ${name}...`);
    const widerRange = [4000, 9000];
    const { available: widerAvailable } = await this.scanPortRange(widerRange[0], widerRange[1]);

    if (widerAvailable.length > 0) {
      const chosenPort = widerAvailable[0];
      console.log(`✅ Found fallback port ${chosenPort} for ${name}`);
      this.scanResults.available[name] = chosenPort;
      return chosenPort;
    }

    throw new Error(`No available ports found for ${name}. Please free up some ports or specify custom ports.`);
  }

  /**
   * Scan all required services
   */
  async scanAllServices() {
    console.log('🧩 Scanning ports for ZippyCodeAudit services...\n');

    const portAssignments = {};

    for (const [serviceKey, requirement] of Object.entries(PORT_REQUIREMENTS)) {
      try {
        const port = await this.findOptimalPort(requirement);
        portAssignments[serviceKey] = port;

        // Store conflict info if any
        const process = await this.getPortProcess(requirement.default);
        if (process) {
          this.scanResults.conflicts[serviceKey] = {
            port: requirement.default,
            process,
            recommended: port
          };
        }
      } catch (error) {
        console.error(`❌ Failed to find port for ${requirement.name}:`, error.message);
        portAssignments[serviceKey] = null;
      }
    }

    return portAssignments;
  }

  /**
   * Generate port configuration
   */
  generatePortConfig(portAssignments) {
    const config = {
      dashboard: {
        port: portAssignments.dashboard,
        url: `http://localhost:${portAssignments.dashboard}`,
        description: 'Web dashboard for audit management'
      },
      api: {
        port: portAssignments.api,
        url: `http://localhost:${portAssignments.api}/api`,
        description: 'API services for audit functionality'
      }
    };

    // Add optional services if ports were assigned
    if (portAssignments.monitoring) {
      config.monitoring = {
        port: portAssignments.monitoring,
        url: `http://localhost:${portAssignments.monitoring}`,
        description: 'Monitoring and health checks'
      };
    }

    return config;
  }

  /**
   * Save port configuration to file
   */
  async savePortConfig(config, projectPath) {
    const configPath = path.join(projectPath, '.zippycodesaudit-ports.json');

    await fs.writeJson(configPath, {
      generatedAt: new Date().toISOString(),
      platform: os.platform(),
      ports: config,
      scanResults: this.scanResults
    }, { spaces: 2 });

    return configPath;
  }

  /**
   * Display scan results to user
   */
  displayResults(portAssignments, config) {
    console.log('\n📊 Port Scan Results:');
    console.log('=' .repeat(50));

    Object.entries(portAssignments).forEach(([service, port]) => {
      if (port) {
        const requirement = PORT_REQUIREMENTS[service];
        const icon = requirement.priority === 'high' ? '🚨' : '✅';

        console.log(`${icon} ${requirement.name}:`);
        console.log(`   Port: ${port}`);
        console.log(`   URL: ${config[service].url}`);
        console.log(`   Status: Available`);
        console.log('');
      }
    });

    // Show conflicts
    if (Object.keys(this.scanResults.conflicts).length > 0) {
      console.log('⚠️  Port Conflicts Found:');
      Object.entries(this.scanResults.conflicts).forEach(([service, conflict]) => {
        console.log(`   ${conflict.port} (recommended alternative: ${conflict.recommended})`);
        console.log(`   Used by: ${conflict.process}`);
      });
      console.log('');
    }

    // Show access instructions
    console.log('🌐 Access Your Services:');
    console.log('─'.repeat(30));

    if (config.dashboard.port) {
      console.log(`📊 Web Dashboard:`);
      console.log(`   ${config.dashboard.url}`);
      console.log(`   Features: Visual audit management, reports, task tracking`);
      console.log('');
    }

    if (config.api.port) {
      console.log(`🔗 API Services:`);
      console.log(`   ${config.api.url}`);
      console.log(`   Features: Programmatic access to audit functionality`);
      console.log('');
    }

    console.log('💡 Tips:');
    console.log(`   • These URLs will be saved to .zippycodesaudit-ports.json`);
    console.log(`   • Use 'zippy-audit config --set dashboard.port=<port>' to change ports`);
    console.log(`   • Run 'node scripts/port-scanner.js' to rescan ports`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const scanner = new PortScanner();
    const portAssignments = await scanner.scanAllServices();

    // Check if we got all required ports
    const missingPorts = Object.entries(portAssignments)
      .filter(([service, port]) => {
        const requirement = PORT_REQUIREMENTS[service];
        return requirement.priority === 'high' && !port;
      });

    if (missingPorts.length > 0) {
      console.error('\n❌ CRITICAL: Missing required ports for high-priority services:');
      missingPorts.forEach(([service]) => {
        console.error(`   • ${PORT_REQUIREMENTS[service].name}`);
      });
      console.error('\n💡 Solutions:');
      console.error('   1. Kill conflicting processes manually');
      console.error('   2. Use custom ports: zippy-audit config --set <service>.port=<port>');
      console.error('   3. Run on a different machine with fewer services');
      process.exit(1);
    }

    // Generate and save configuration
    const config = scanner.generatePortConfig(portAssignments);
    const projectPath = process.cwd();
    const configPath = await scanner.savePortConfig(config, projectPath);

    // Display results
    scanner.displayResults(portAssignments, config);

    console.log(`\n✅ Port configuration saved to: ${configPath}`);
    console.log('🚀 Ready to launch ZippyCodeAudit services!\n');

    // Return port assignments for use by other scripts
    return portAssignments;

  } catch (error) {
    console.error('❌ Port scanning failed:', error.message);
    process.exit(1);
  }
}

/**
 * CLI interface
 */
if (require.main === module) {
  main()
    .then((portAssignments) => {
      // Exit successfully if we got here
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { PortScanner, main };
