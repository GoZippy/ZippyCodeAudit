/**
 * Interactive CLI Mode (TUI)
 * Terminal UI with arrow key navigation
 * 
 * Note: This is a simplified implementation that works without external dependencies.
 * For a full-featured TUI, consider adding 'blessed' or 'ink' as dependencies.
 */

const readline = require('readline');
const chalk = require('chalk');

class InteractiveCLI {
  constructor() {
    this.selectedIndex = 0;
    this.items = [];
    this.mode = 'menu'; // menu, issues, details
    this.currentIssue = null;
    this.filterSeverity = 'all';
  }

  /**
   * Start interactive mode
   */
  async start(auditResults) {
    this.results = auditResults;
    this.items = this.getMenuItems();
    
    console.clear();
    this.showHeader();
    
    return new Promise((resolve) => {
      this.setupKeyboardHandling(resolve);
      this.render();
    });
  }

  /**
   * Setup keyboard handling
   */
  setupKeyboardHandling(resolve) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.emitKeypressEvents(process.stdin);
    
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        this.cleanup(rl);
        resolve();
        return;
      }

      this.handleKeypress(key);
    });
  }

  /**
   * Handle keypress events
   */
  handleKeypress(key) {
    switch (key.name) {
      case 'up':
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        break;
      case 'down':
        this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
        break;
      case 'return':
        this.handleSelection();
        break;
      case 'backspace':
        this.goBack();
        break;
      case 'q':
        if (this.mode === 'menu') {
          process.exit(0);
        }
        break;
      case 'f':
        this.cycleFilter();
        break;
      case 'h':
        this.showHelp();
        return; // Don't re-render
    }

    this.render();
  }

  /**
   * Get menu items based on current mode
   */
  getMenuItems() {
    if (this.mode === 'menu') {
      return [
        { label: '🔍 View All Issues', action: 'view-issues' },
        { label: '🔴 View High Severity Issues', action: 'filter-high' },
        { label: '🟡 View Medium Severity Issues', action: 'filter-medium' },
        { label: '🔵 View Low Severity Issues', action: 'filter-low' },
        { label: '📊 View Statistics', action: 'statistics' },
        { label: '💡 View Recommendations', action: 'recommendations' },
        { label: '📤 Export Report', action: 'export' },
        { label: '❌ Exit', action: 'exit' }
      ];
    } else if (this.mode === 'issues') {
      const issues = this.getFilteredIssues();
      return issues.map((issue, index) => ({
        label: `${this.getSeverityIcon(issue.severity)} ${issue.message}`,
        issue: issue,
        index: index
      }));
    }

    return [];
  }

  /**
   * Get filtered issues
   */
  getFilteredIssues() {
    if (!this.results || !this.results.issues) return [];
    
    if (this.filterSeverity === 'all') {
      return this.results.issues;
    }
    
    return this.results.issues.filter(i => i.severity === this.filterSeverity);
  }

  /**
   * Handle selection
   */
  handleSelection() {
    const selected = this.items[this.selectedIndex];
    
    if (!selected) return;

    if (this.mode === 'menu') {
      this.handleMenuAction(selected.action);
    } else if (this.mode === 'issues') {
      this.showIssueDetails(selected.issue);
    }
  }

  /**
   * Handle menu action
   */
  handleMenuAction(action) {
    switch (action) {
      case 'view-issues':
        this.filterSeverity = 'all';
        this.mode = 'issues';
        this.selectedIndex = 0;
        this.items = this.getMenuItems();
        break;
      case 'filter-high':
        this.filterSeverity = 'high';
        this.mode = 'issues';
        this.selectedIndex = 0;
        this.items = this.getMenuItems();
        break;
      case 'filter-medium':
        this.filterSeverity = 'medium';
        this.mode = 'issues';
        this.selectedIndex = 0;
        this.items = this.getMenuItems();
        break;
      case 'filter-low':
        this.filterSeverity = 'low';
        this.mode = 'issues';
        this.selectedIndex = 0;
        this.items = this.getMenuItems();
        break;
      case 'statistics':
        this.showStatistics();
        break;
      case 'recommendations':
        this.showRecommendations();
        break;
      case 'export':
        this.exportReport();
        break;
      case 'exit':
        process.exit(0);
        break;
    }
  }

  /**
   * Go back to previous view
   */
  goBack() {
    if (this.mode === 'issues') {
      this.mode = 'menu';
      this.selectedIndex = 0;
      this.filterSeverity = 'all';
      this.items = this.getMenuItems();
    } else if (this.mode === 'details') {
      this.mode = 'issues';
      this.selectedIndex = 0;
      this.items = this.getMenuItems();
    }
  }

  /**
   * Cycle filter
   */
  cycleFilter() {
    if (this.mode !== 'issues') return;

    const filters = ['all', 'high', 'medium', 'low'];
    const currentIndex = filters.indexOf(this.filterSeverity);
    this.filterSeverity = filters[(currentIndex + 1) % filters.length];
    this.selectedIndex = 0;
    this.items = this.getMenuItems();
  }

  /**
   * Show issue details
   */
  showIssueDetails(issue) {
    console.clear();
    this.showHeader();
    
    console.log(chalk.cyan.bold('\n📋 Issue Details\n'));
    console.log(chalk.yellow('═'.repeat(60)));
    
    console.log(chalk.white.bold('\nMessage:'));
    console.log(chalk.gray(`  ${issue.message}`));
    
    if (issue.file) {
      console.log(chalk.white.bold('\nFile:'));
      console.log(chalk.gray(`  ${issue.file}${issue.line ? `:${issue.line}` : ''}`));
    }
    
    console.log(chalk.white.bold('\nSeverity:'));
    const severityColor = issue.severity === 'high' ? chalk.red : 
                          issue.severity === 'medium' ? chalk.yellow : chalk.blue;
    console.log(severityColor(`  ${issue.severity.toUpperCase()}`));
    
    if (issue.type) {
      console.log(chalk.white.bold('\nType:'));
      console.log(chalk.gray(`  ${issue.type}`));
    }
    
    if (issue.suggestion) {
      console.log(chalk.white.bold('\nSuggestion:'));
      console.log(chalk.green(`  ${issue.suggestion}`));
    }
    
    console.log(chalk.yellow('\n' + '═'.repeat(60)));
    console.log(chalk.gray('\nPress [Backspace] to go back, [Q] to quit'));
    
    this.mode = 'details';
  }

  /**
   * Show statistics
   */
  showStatistics() {
    console.clear();
    this.showHeader();
    
    console.log(chalk.cyan.bold('\n📊 Audit Statistics\n'));
    console.log(chalk.yellow('═'.repeat(60)));
    
    const stats = {
      totalFiles: this.results.metadata?.totalFilesAnalyzed || 0,
      totalIssues: this.results.issues?.length || 0,
      highSeverity: this.results.issues?.filter(i => i.severity === 'high').length || 0,
      mediumSeverity: this.results.issues?.filter(i => i.severity === 'medium').length || 0,
      lowSeverity: this.results.issues?.filter(i => i.severity === 'low').length || 0,
      analysisTime: this.results.metadata?.analysisTime || 0
    };
    
    console.log(chalk.white.bold('Files Analyzed: ') + chalk.cyan(stats.totalFiles));
    console.log(chalk.white.bold('Total Issues: ') + chalk.cyan(stats.totalIssues));
    console.log(chalk.red.bold('  High: ') + chalk.red(stats.highSeverity));
    console.log(chalk.yellow.bold('  Medium: ') + chalk.yellow(stats.mediumSeverity));
    console.log(chalk.blue.bold('  Low: ') + chalk.blue(stats.lowSeverity));
    console.log(chalk.white.bold('Analysis Time: ') + chalk.cyan(`${(stats.analysisTime / 1000).toFixed(2)}s`));
    
    console.log(chalk.yellow('\n' + '═'.repeat(60)));
    console.log(chalk.gray('\nPress any key to go back...'));
    
    // Wait for keypress
    process.stdin.once('data', () => {
      this.mode = 'menu';
      this.selectedIndex = 0;
      this.items = this.getMenuItems();
      this.render();
    });
  }

  /**
   * Show recommendations
   */
  showRecommendations() {
    console.clear();
    this.showHeader();
    
    console.log(chalk.cyan.bold('\n💡 Recommendations\n'));
    console.log(chalk.yellow('═'.repeat(60)));
    
    if (this.results.recommendations && this.results.recommendations.length > 0) {
      this.results.recommendations.forEach((rec, index) => {
        console.log(chalk.green(`\n${index + 1}. ${rec}`));
      });
    } else {
      console.log(chalk.gray('\nNo recommendations available.'));
    }
    
    console.log(chalk.yellow('\n' + '═'.repeat(60)));
    console.log(chalk.gray('\nPress any key to go back...'));
    
    // Wait for keypress
    process.stdin.once('data', () => {
      this.mode = 'menu';
      this.selectedIndex = 0;
      this.items = this.getMenuItems();
      this.render();
    });
  }

  /**
   * Export report
   */
  exportReport() {
    const fs = require('fs-extra');
    const path = require('path');
    
    const filename = `zippy-audit-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeJsonSync(filepath, this.results, { spaces: 2 });
    
    console.clear();
    this.showHeader();
    console.log(chalk.green.bold('\n✅ Report exported successfully!'));
    console.log(chalk.gray(`\nSaved to: ${filepath}`));
    console.log(chalk.gray('\nPress any key to go back...'));
    
    // Wait for keypress
    process.stdin.once('data', () => {
      this.mode = 'menu';
      this.selectedIndex = 0;
      this.items = this.getMenuItems();
      this.render();
    });
  }

  /**
   * Show help
   */
  showHelp() {
    console.clear();
    this.showHeader();
    
    console.log(chalk.cyan.bold('\n❓ Keyboard Shortcuts\n'));
    console.log(chalk.yellow('═'.repeat(60)));
    console.log(chalk.white.bold('\nNavigation:'));
    console.log(chalk.gray('  ↑/↓     - Navigate menu items'));
    console.log(chalk.gray('  Enter   - Select item'));
    console.log(chalk.gray('  Backspace - Go back'));
    console.log(chalk.gray('  ESC/Ctrl+C - Exit'));
    
    console.log(chalk.white.bold('\nFilters:'));
    console.log(chalk.gray('  F       - Cycle severity filter (when viewing issues)'));
    
    console.log(chalk.white.bold('\nOther:'));
    console.log(chalk.gray('  H       - Show this help'));
    console.log(chalk.gray('  Q       - Quit (from main menu)'));
    
    console.log(chalk.yellow('\n' + '═'.repeat(60)));
    console.log(chalk.gray('\nPress any key to go back...'));
    
    // Wait for keypress
    process.stdin.once('data', () => {
      this.render();
    });
  }

  /**
   * Render current view
   */
  render() {
    console.clear();
    this.showHeader();
    
    if (this.mode === 'menu') {
      console.log(chalk.cyan.bold('\n🎯 Main Menu\n'));
    } else if (this.mode === 'issues') {
      const filterText = this.filterSeverity === 'all' ? 'All' : this.filterSeverity.toUpperCase();
      console.log(chalk.cyan.bold(`\n📋 Issues - ${filterText} (${this.items.length})\n`));
      console.log(chalk.gray('Press [F] to cycle filter, [Backspace] to go back'));
      console.log();
    }
    
    console.log(chalk.yellow('═'.repeat(60)));
    
    // Show items with selection indicator
    this.items.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      const prefix = isSelected ? chalk.green('▶ ') : '  ';
      const label = isSelected ? chalk.white.bold(item.label) : chalk.gray(item.label);
      console.log(prefix + label);
    });
    
    if (this.items.length === 0) {
      console.log(chalk.gray('  No items to display'));
    }
    
    console.log(chalk.yellow('═'.repeat(60)));
    console.log(chalk.gray('\n↑/↓: Navigate  Enter: Select  H: Help  ESC: Exit'));
  }

  /**
   * Show header
   */
  showHeader() {
    console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║        🔍 ZippyCodeAudit - Interactive Mode 🔍         ║'));
    console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════════════╝'));
  }

  /**
   * Get severity icon
   */
  getSeverityIcon(severity) {
    return severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🔵';
  }

  /**
   * Cleanup
   */
  cleanup(rl) {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    rl.close();
    console.clear();
    console.log(chalk.green('\n✅ Exited interactive mode\n'));
  }
}

module.exports = InteractiveCLI;

