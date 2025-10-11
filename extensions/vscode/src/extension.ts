/**
 * ZippyCodeAudit VS Code Extension
 * Integrated code auditing toolkit for Visual Studio Code
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

// Extension state
let auditStatusBarItem: vscode.StatusBarItem;
let auditTreeView: vscode.TreeView<AuditTreeItem>;
let auditTreeDataProvider: AuditTreeDataProvider;

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('ZippyCodeAudit extension is now active!');

  // Initialize status bar
  auditStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  auditStatusBarItem.command = 'zippy-audit.analyze';
  context.subscriptions.push(auditStatusBarItem);

  // Initialize tree view
  auditTreeDataProvider = new AuditTreeDataProvider();
  auditTreeView = vscode.window.createTreeView('zippyAuditView', {
    treeDataProvider: auditTreeDataProvider,
    showCollapseAll: true
  });
  context.subscriptions.push(auditTreeView);

  // Register commands
  registerCommands(context);

  // Setup auto-check on file save if enabled
  setupAutoCheck(context);

  // Show welcome message
  showWelcomeMessage();

  // Update status bar
  updateStatusBar();
}

/**
 * Register all extension commands
 */
function registerCommands(context: vscode.ExtensionContext) {
  // Analyze project command
  const analyzeCommand = vscode.commands.registerCommand('zippy-audit.analyze', async () => {
    await analyzeProject();
  });

  // Run quality checks command
  const checkCommand = vscode.commands.registerCommand('zippy-audit.check', async () => {
    await runQualityChecks();
  });

  // Generate report command
  const reportCommand = vscode.commands.registerCommand('zippy-audit.report', async () => {
    await generateReport();
  });

  // Initialize project command
  const initCommand = vscode.commands.registerCommand('zippy-audit.init', async () => {
    await initializeProject();
  });

  // Open dashboard command
  const dashboardCommand = vscode.commands.registerCommand('zippy-audit.openDashboard', () => {
    openDashboard();
  });

  // Open settings command
  const settingsCommand = vscode.commands.registerCommand('zippy-audit.settings', () => {
    openSettings();
  });

  context.subscriptions.push(
    analyzeCommand,
    checkCommand,
    reportCommand,
    initCommand,
    dashboardCommand,
    settingsCommand
  );
}

/**
 * Analyze current project
 */
async function analyzeProject() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  auditStatusBarItem.text = '$(sync~spin) Analyzing...';
  auditStatusBarItem.show();

  try {
    // Get configuration
    const config = vscode.workspace.getConfiguration('zippycodesaudit');
    const apiTier = config.get<string>('apiTier', 'public');
    const apiEndpoint = config.get<string>('apiEndpoint', '');
    const apiKey = config.get<string>('apiKey', '');

    // Prepare analysis data
    const projectData = await prepareProjectData(workspaceFolder.uri.fsPath);

    // Call appropriate API based on tier
    const result = await callAnalysisAPI(apiTier, apiEndpoint, apiKey, projectData);

    // Display results
    await displayAnalysisResults(result);

    // Update tree view
    auditTreeDataProvider.refresh();

    auditStatusBarItem.text = '$(check) Analysis Complete';
    vscode.window.showInformationMessage(`Analysis complete! Found ${result.issues?.length || 0} issues.`);

  } catch (error) {
    console.error('Analysis failed:', error);
    auditStatusBarItem.text = '$(error) Analysis Failed';
    vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
  }

  // Hide status bar after delay
  setTimeout(() => {
    updateStatusBar();
  }, 3000);
}

/**
 * Run quality checks
 */
async function runQualityChecks() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active file to check');
    return;
  }

  const document = editor.document;
  const code = document.getText();
  const language = getLanguageFromDocument(document);

  if (!code || !language) {
    vscode.window.showWarningMessage('Unable to analyze current file');
    return;
  }

  try {
    // Get configuration
    const config = vscode.workspace.getConfiguration('zippycodesaudit');
    const apiTier = config.get<string>('apiTier', 'public');

    // Call check API
    const result = await callCheckAPI(apiTier, code, language);

    // Display check results
    await displayCheckResults(result);

  } catch (error) {
    console.error('Quality check failed:', error);
    vscode.window.showErrorMessage(`Quality check failed: ${error.message}`);
  }
}

/**
 * Generate audit report
 */
async function generateReport() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  try {
    // Get configuration
    const config = vscode.workspace.getConfiguration('zippycodesaudit');
    const reportFormat = config.get<string>('reportFormat', 'markdown');

    // Generate report (simplified for extension)
    const report = await generateReportData(workspaceFolder.uri.fsPath, reportFormat);

    // Save and open report
    await saveAndOpenReport(report, reportFormat);

    vscode.window.showInformationMessage(`Report generated in ${reportFormat} format`);

  } catch (error) {
    console.error('Report generation failed:', error);
    vscode.window.showErrorMessage(`Report generation failed: ${error.message}`);
  }
}

/**
 * Initialize audit system in project
 */
async function initializeProject() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  try {
    const docsPath = path.join(workspaceFolder.uri.fsPath, 'docs');

    // Create docs directory if it doesn't exist
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true });
    }

    // Copy audit system files
    await copyAuditSystemFiles(docsPath);

    // Refresh workspace
    vscode.commands.executeCommand('workbench.action.reloadWindow');

    vscode.window.showInformationMessage('ZippyCodeAudit system initialized! Check the docs/ folder.');

  } catch (error) {
    console.error('Initialization failed:', error);
    vscode.window.showErrorMessage(`Initialization failed: ${error.message}`);
  }
}

/**
 * Open web dashboard
 */
function openDashboard() {
  const dashboardUrl = 'http://localhost:3001'; // Default dashboard URL
  vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
}

/**
 * Open extension settings
 */
function openSettings() {
  vscode.commands.executeCommand('workbench.action.openSettings', 'zippycodesaudit');
}

/**
 * Prepare project data for analysis
 */
async function prepareProjectData(projectPath: string) {
  const projectData = {
    path: projectPath,
    name: path.basename(projectPath),
    files: [],
    packageInfo: {}
  };

  try {
    // Read package.json if exists
    const packagePath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      projectData.packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    }

    // Get file structure (simplified)
    const files = await getProjectFiles(projectPath);
    projectData.files = files.slice(0, 100); // Limit for API

  } catch (error) {
    console.error('Failed to prepare project data:', error);
  }

  return projectData;
}

/**
 * Get project files recursively
 */
async function getProjectFiles(dirPath: string, files: any[] = []) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      await getProjectFiles(fullPath, files);
    } else if (stat.isFile() && !item.startsWith('.')) {
      files.push({
        path: path.relative(process.cwd(), fullPath),
        size: stat.size,
        extension: path.extname(item)
      });
    }
  }

  return files;
}

/**
 * Call analysis API based on tier
 */
async function callAnalysisAPI(tier: string, endpoint: string, apiKey: string, data: any) {
  const baseUrl = endpoint || getDefaultEndpoint(tier);

  const headers: any = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await axios.post(`${baseUrl}/analyze`, data, { headers });

  return response.data;
}

/**
 * Call check API
 */
async function callCheckAPI(tier: string, code: string, language: string) {
  const endpoint = getDefaultEndpoint(tier);

  const response = await axios.post(`${endpoint}/check`, {
    code,
    language,
    format: 'json'
  });

  return response.data;
}

/**
 * Display analysis results
 */
async function displayAnalysisResults(result: any) {
  const issues = result.issues || [];
  const score = result.score || 0;

  // Create output channel
  const channel = vscode.window.createOutputChannel('ZippyCodeAudit');
  channel.clear();
  channel.appendLine('=== ZippyCodeAudit Analysis Results ===\n');
  channel.appendLine(`Project Score: ${score}%`);
  channel.appendLine(`Issues Found: ${issues.length}\n`);

  if (issues.length > 0) {
    channel.appendLine('Issues:');
    issues.slice(0, 10).forEach((issue: any, index: number) => {
      channel.appendLine(`${index + 1}. [${issue.severity?.toUpperCase() || 'UNKNOWN'}] ${issue.message}`);
      if (issue.file) {
        channel.appendLine(`   File: ${issue.file}`);
      }
      if (issue.suggestion) {
        channel.appendLine(`   Suggestion: ${issue.suggestion}`);
      }
      channel.appendLine('');
    });
  }

  channel.show();

  // Show summary in info message
  vscode.window.showInformationMessage(
    `Analysis complete! Score: ${score}%, Issues: ${issues.length}`,
    'View Details'
  ).then(selection => {
    if (selection === 'View Details') {
      channel.show();
    }
  });
}

/**
 * Display check results
 */
async function displayCheckResults(result: any) {
  const issues = result.issues || [];

  if (issues.length === 0) {
    vscode.window.showInformationMessage('✅ No issues found in current file!');
    return;
  }

  // Show first few issues
  const firstIssues = issues.slice(0, 3);
  const message = `Found ${issues.length} issue(s) in current file. First issue: ${firstIssues[0]?.message || 'Unknown'}`;

  vscode.window.showWarningMessage(message, 'View All', 'Fix Issue').then(selection => {
    if (selection === 'View All') {
      // Show all issues in output channel
      const channel = vscode.window.createOutputChannel('ZippyCodeAudit Check');
      channel.clear();
      channel.appendLine('=== Quality Check Results ===\n');

      issues.forEach((issue: any, index: number) => {
        channel.appendLine(`${index + 1}. [${issue.severity?.toUpperCase() || 'UNKNOWN'}] ${issue.message}`);
        if (issue.suggestion) {
          channel.appendLine(`   Suggestion: ${issue.suggestion}`);
        }
        channel.appendLine('');
      });

      channel.show();
    }
  });
}

/**
 * Generate report data
 */
async function generateReportData(projectPath: string, format: string) {
  // Simplified report generation for extension
  const timestamp = new Date().toISOString();

  return {
    title: `Audit Report - ${path.basename(projectPath)}`,
    generatedAt: timestamp,
    format,
    summary: {
      projectPath,
      totalFiles: 0, // Would be populated from actual analysis
      issuesFound: 0,
      overallScore: 0
    },
    sections: [
      {
        title: 'Analysis Overview',
        content: 'Report generated by ZippyCodeAudit VS Code extension'
      }
    ]
  };
}

/**
 * Save and open report
 */
async function saveAndOpenReport(report: any, format: string) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return;

  const reportsDir = path.join(workspaceFolder.uri.fsPath, 'docs', 'audit_reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `AUDIT_${new Date().toISOString().split('T')[0]}.${format === 'html' ? 'html' : 'md'}`;
  const filepath = path.join(reportsDir, filename);

  let content = '';

  if (format === 'html') {
    content = generateHTMLReport(report);
  } else {
    content = generateMarkdownReport(report);
  }

  fs.writeFileSync(filepath, content);

  // Open the report
  const uri = vscode.Uri.file(filepath);
  vscode.workspace.openTextDocument(uri).then(doc => {
    vscode.window.showTextDocument(doc);
  });
}

/**
 * Generate HTML report
 */
function generateHTMLReport(report: any) {
  return `<!DOCTYPE html>
<html>
<head>
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e8f4f8; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>
    <div class="section">
        <h2>Summary</h2>
        <div class="metric">Project: ${report.summary.projectPath}</div>
        <div class="metric">Score: ${report.summary.overallScore}%</div>
        <div class="metric">Issues: ${report.summary.issuesFound}</div>
    </div>
</body>
</html>`;
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(report: any) {
  return `# ${report.title}

**Generated:** ${new Date(report.generatedAt).toLocaleString()}

## Summary
- **Project:** ${report.summary.projectPath}
- **Score:** ${report.summary.overallScore}%
- **Issues:** ${report.summary.issuesFound}

## Analysis Overview
Report generated by ZippyCodeAudit VS Code extension.

---
*Powered by ZippyCodeAudit*
`;
}

/**
 * Copy audit system files to project
 */
async function copyAuditSystemFiles(docsPath: string) {
  const auditFiles = [
    'PROJECT_AUDIT_PROMPT.md',
    'PROJECT_AUDIT_TASKS.md',
    'PROJECT_AUDIT_RUNBOOK.md'
  ];

  for (const file of auditFiles) {
    const sourcePath = path.join(__dirname, '..', '..', '..', 'docs', file);
    const destPath = path.join(docsPath, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

/**
 * Setup auto-check on file save
 */
function setupAutoCheck(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('zippycodesaudit');
  const autoCheck = config.get<boolean>('autoCheck', false);

  if (autoCheck) {
    const disposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
      // Only check supported file types
      const supportedExtensions = ['.js', '.ts', '.py', '.go', '.md'];
      if (supportedExtensions.includes(path.extname(document.fileName))) {
        await runQualityChecks();
      }
    });

    context.subscriptions.push(disposable);
  }
}

/**
 * Update status bar
 */
function updateStatusBar() {
  const config = vscode.workspace.getConfiguration('zippycodesaudit');
  const enabled = config.get<boolean>('enable', true);

  if (enabled) {
    auditStatusBarItem.text = '$(check) ZippyAudit';
    auditStatusBarItem.tooltip = 'Click to run project analysis';
  } else {
    auditStatusBarItem.text = '$(x) ZippyAudit';
    auditStatusBarItem.tooltip = 'ZippyCodeAudit is disabled';
  }

  auditStatusBarItem.show();
}

/**
 * Show welcome message
 */
function showWelcomeMessage() {
  const config = vscode.workspace.getConfiguration('zippycodesaudit');

  // Only show if not previously dismissed
  if (!config.get<boolean>('welcomeShown', false)) {
    vscode.window.showInformationMessage(
      'Welcome to ZippyCodeAudit! 🎉\n\nGet started with code auditing in your projects.',
      'Get Started',
      'View Docs',
      'Don\'t Show Again'
    ).then(selection => {
      switch (selection) {
        case 'Get Started':
          vscode.commands.executeCommand('zippy-audit.analyze');
          break;
        case 'View Docs':
          vscode.env.openExternal(vscode.Uri.parse('https://github.com/GoZippy/ZippyCodeAudit#readme'));
          break;
        case 'Don\'t Show Again':
          config.update('welcomeShown', true, vscode.ConfigurationTarget.Global);
          break;
      }
    });
  }
}

/**
 * Get default endpoint based on tier
 */
function getDefaultEndpoint(tier: string): string {
  const endpoints = {
    public: 'http://localhost:3000/api/public',
    premium: 'http://localhost:3000/api/premium',
    private: 'http://localhost:3000/api/private'
  };

  return endpoints[tier as keyof typeof endpoints] || endpoints.public;
}

/**
 * Get language from document
 */
function getLanguageFromDocument(document: vscode.TextDocument): string {
  const extension = path.extname(document.fileName);

  const languageMap: { [key: string]: string } = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.py': 'python',
    '.go': 'go',
    '.md': 'markdown',
    '.json': 'json',
    '.html': 'html',
    '.css': 'css'
  };

  return languageMap[extension] || 'unknown';
}

/**
 * Tree Data Provider for VS Code view
 */
class AuditTreeDataProvider implements vscode.TreeDataProvider<AuditTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AuditTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(element: AuditTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AuditTreeItem): Thenable<AuditTreeItem[]> {
    if (!element) {
      // Root level - show main sections
      return Promise.resolve([
        new AuditTreeItem('Quick Actions', vscode.TreeItemCollapsibleState.Expanded, 'actions'),
        new AuditTreeItem('Recent Reports', vscode.TreeItemCollapsibleState.Collapsed, 'reports'),
        new AuditTreeItem('Current Issues', vscode.TreeItemCollapsibleState.Collapsed, 'issues')
      ]);
    }

    // Handle different sections
    switch (element.context) {
      case 'actions':
        return Promise.resolve([
          new AuditTreeItem('Analyze Project', vscode.TreeItemCollapsibleState.None, 'analyze', 'zippy-audit.analyze'),
          new AuditTreeItem('Run Quality Checks', vscode.TreeItemCollapsibleState.None, 'check', 'zippy-audit.check'),
          new AuditTreeItem('Generate Report', vscode.TreeItemCollapsibleState.None, 'report', 'zippy-audit.report'),
          new AuditTreeItem('Initialize System', vscode.TreeItemCollapsibleState.None, 'init', 'zippy-audit.init')
        ]);

      default:
        return Promise.resolve([]);
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}

/**
 * Tree item for VS Code view
 */
class AuditTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly context: string,
    public readonly command?: string
  ) {
    super(label, collapsibleState);

    this.tooltip = this.getTooltip();
    this.iconPath = this.getIcon();

    if (command) {
      this.command = {
        command,
        title: label,
        arguments: []
      };
    }
  }

  private getTooltip(): string {
    switch (this.context) {
      case 'analyze': return 'Run comprehensive project analysis';
      case 'check': return 'Check current file for quality issues';
      case 'report': return 'Generate audit report';
      case 'init': return 'Initialize audit system in project';
      default: return this.label;
    }
  }

  private getIcon(): string | vscode.ThemeIcon {
    switch (this.context) {
      case 'actions': return new vscode.ThemeIcon('tools');
      case 'reports': return new vscode.ThemeIcon('file-text');
      case 'issues': return new vscode.ThemeIcon('warning');
      case 'analyze': return new vscode.ThemeIcon('search');
      case 'check': return new vscode.ThemeIcon('checklist');
      case 'report': return new vscode.ThemeIcon('file-code');
      case 'init': return new vscode.ThemeIcon('add');
      default: return new vscode.ThemeIcon('question');
    }
  }
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  console.log('ZippyCodeAudit extension deactivated');
}
