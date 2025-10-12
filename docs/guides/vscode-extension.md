# 🔌 VS Code Extension Guide

Complete guide for using the ZippyCodeAudit VS Code extension for integrated code auditing within your development environment.

## 🚀 Installation

### From VS Code Marketplace

1. Open Visual Studio Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X` on Mac)
3. Search for "ZippyCodeAudit"
4. Click **Install**
5. Reload VS Code when prompted

### Manual Installation

1. Download the `.vsix` file from GitHub releases
2. Run: `code --install-extension zippycodesaudit-vscode-1.0.0.vsix`
3. Reload VS Code

### Development Installation

```bash
# Clone the repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit

# Build the extension
npm run build:vscode

# Package for installation
npm run package:vscode

# Install the generated .vsix file
code --install-extension extensions/vscode/zippycodesaudit-vscode-1.0.0.vsix
```

## 🎯 Getting Started

### Initial Setup

1. Open your project in VS Code
2. The extension will automatically activate
3. Look for the "🧩 ZippyAudit" button in the status bar
4. Use Command Palette (`Ctrl+Shift+P`) for quick access

### First Audit

```bash
# Via Command Palette
Ctrl+Shift+P → "ZippyCodeAudit: Analyze Project"

# Via Status Bar
Click the "🧩 ZippyAudit" button

# Via Context Menu
Right-click on a file → "ZippyCodeAudit: Analyze"
```

## 🔧 Features Overview

### Status Bar Integration

**Visual Indicators**
- **🧩 ZippyAudit**: Extension is active and ready
- **$(check)**: Analysis completed successfully
- **$(sync~spin)**: Currently running analysis
- **$(error)**: Analysis failed or disabled

**Quick Actions**
- Click the status bar button for instant project analysis
- Hover for current status and recent activity
- Right-click for additional options

### Tree View Sidebar

**Navigation Panel**
- **Quick Actions**: Common audit commands
- **Recent Reports**: Previously generated reports
- **Current Issues**: Active issues and tasks

**Tree Structure**
```
🛠️ Quick Actions
  🔍 Analyze Project
  ✅ Run Quality Checks
  📊 Generate Report
  🚀 Initialize System

📊 Recent Reports
  📄 audit-2025-01-11.md
  📄 security-audit-2025-01-10.md

⚠️ Current Issues
  🔒 Security: 3 issues
  ⚡ Performance: 2 issues
  🏗️ Maintainability: 5 issues
```

### Context Menu Integration

**File-Level Actions**
- Right-click any supported file
- Select "ZippyCodeAudit: Analyze" for targeted analysis
- Quick access to quality checks for current file

**Supported File Types**
- **JavaScript/TypeScript**: `.js`, `.ts`, `.jsx`, `.tsx`
- **Python**: `.py`, `.pyw`
- **Go**: `.go`
- **Markdown**: `.md`
- **JSON**: `.json`
- **YAML**: `.yml`, `.yaml`

### Command Palette Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `ZippyCodeAudit: Analyze Project` | Run comprehensive project audit | - |
| `ZippyCodeAudit: Run Quality Checks` | Check current file for issues | - |
| `ZippyCodeAudit: Generate Report` | Create audit report | - |
| `ZippyCodeAudit: Initialize Project` | Set up audit system | - |
| `ZippyCodeAudit: Open Dashboard` | Launch web dashboard | - |
| `ZippyCodeAudit: Open Settings` | Configure extension | - |

## ⚙️ Configuration

### VS Code Settings

Configure the extension through VS Code settings:

```json
{
  "zippycodesaudit.enable": true,
  "zippycodesaudit.autoCheck": false,
  "zippycodesaudit.reportFormat": "markdown",
  "zippycodesaudit.apiTier": "public",
  "zippycodesaudit.apiEndpoint": "",
  "zippycodesaudit.apiKey": ""
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `zippycodesaudit.enable` | boolean | `true` | Enable/disable the extension |
| `zippycodesaudit.autoCheck` | boolean | `false` | Run checks automatically on file save |
| `zippycodesaudit.reportFormat` | string | `"markdown"` | Default report output format |
| `zippycodesaudit.apiTier` | string | `"public"` | API service tier (public/premium/private) |
| `zippycodesaudit.apiEndpoint` | string | `""` | Custom API endpoint URL |
| `zippycodesaudit.apiKey` | string | `""` | API authentication key |

### Workspace vs Global Settings

**Workspace Settings** (`.vscode/settings.json`)
- Project-specific configuration
- Different settings per project
- Recommended for team projects

**Global Settings** (User Settings)
- Personal preferences
- Applied to all projects
- Good for default behavior

## 🔍 Analysis Features

### Project-Wide Analysis

**Comprehensive Audit**
- Analyzes entire project structure
- Checks all supported file types
- Provides overall health score
- Identifies improvement opportunities

**Output Channels**
- **ZippyCodeAudit**: Main analysis results
- **Problems**: VS Code Problems panel integration
- **Output**: Detailed logs and progress

### File-Specific Checks

**Current File Analysis**
- Right-click context menu option
- Analyzes only the active file
- Faster for targeted debugging
- Useful for quick quality checks

**Real-Time Feedback**
- Automatic checks on file save (if enabled)
- Inline issue highlighting (planned feature)
- Quick fix suggestions (planned feature)

### Background Processing

**Non-Blocking Analysis**
- Runs in background to avoid interrupting workflow
- Progress indicators in status bar
- Cancellable operations
- Queue management for multiple requests

## 📊 Results & Reporting

### Analysis Output

**Results Display**
- **Output Channel**: Detailed results and recommendations
- **Status Bar**: Quick status updates
- **Notifications**: Important findings and errors

**Report Generation**
- Multiple output formats (JSON, Markdown, HTML)
- Automatic file saving to project
- Integration with project documentation

### Issue Tracking

**VS Code Integration**
- **Problems Panel**: Issues appear as VS Code problems
- **Quick Fixes**: Suggested code improvements
- **File Navigation**: Click to jump to issue locations

**External Integration**
- **GitHub Issues**: Create issues for audit findings
- **Jira/Trello**: Export tasks to project management
- **Slack/Discord**: Team notifications

## 🔗 Integration Features

### Version Control Integration

**Git Integration**
- Automatic audits on commits
- Pre-commit hooks for quality checks
- Branch comparison analysis
- Pull request analysis

**GitHub Integration**
- Webhook support for repository events
- Issue creation for critical findings
- Pull request comments with analysis results

### External Tools Integration

**CI/CD Integration**
- GitHub Actions workflow templates
- GitLab CI/CD pipeline integration
- Jenkins plugin support (planned)

**Project Management**
- Jira issue creation
- Trello card generation
- Linear task creation

**Communication**
- Slack webhook notifications
- Discord bot integration
- Microsoft Teams integration

## 🎨 User Interface

### Status Bar

**Dynamic Indicators**
- **🧩 ZippyAudit**: Extension active
- **$(check)**: Analysis complete
- **$(sync~spin)**: Analysis in progress
- **$(error)**: Analysis failed

**Interactive Elements**
- Click for quick project analysis
- Hover for current status
- Right-click for additional options

### Tree View

**Collapsible Sections**
- **Quick Actions**: Expandable command list
- **Recent Reports**: Collapsible report history
- **Current Issues**: Expandable issue categories

**Context Menus**
- Right-click items for additional actions
- Quick access to related commands
- File and report management options

### Output Channels

**Multiple Channels**
- **ZippyCodeAudit**: Primary analysis results
- **ZippyCodeAudit Check**: File-specific checks
- **ZippyCodeAudit Report**: Report generation logs

**Rich Formatting**
- Color-coded severity levels
- Clickable file links
- Collapsible sections for large outputs

## 🛠️ Development Workflow

### Daily Development

**Pre-Commit Checks**
1. Save your file (triggers auto-check if enabled)
2. Review any issues in Problems panel
3. Fix critical issues before committing
4. Run full project analysis periodically

**Code Review Integration**
1. Run analysis on files being reviewed
2. Check for introduced issues
3. Verify improvement implementation
4. Generate review reports

### Team Collaboration

**Shared Configuration**
- Team-wide settings in workspace configuration
- Consistent analysis rules across team
- Shared report templates and formats

**Review Process**
- Automated analysis on pull requests
- Issue tracking for audit findings
- Team dashboard for project health monitoring

## 📈 Best Practices

### Extension Configuration

**Team Settings**
```json
{
  "zippycodesaudit.enable": true,
  "zippycodesaudit.autoCheck": true,
  "zippycodesaudit.reportFormat": "markdown",
  "zippycodesaudit.apiTier": "premium"
}
```

**Individual Preferences**
```json
{
  "zippycodesaudit.autoCheck": false,
  "zippycodesaudit.reportFormat": "html"
}
```

### Workflow Optimization

**Keyboard Shortcuts**
- Set up custom shortcuts for frequently used commands
- Use Command Palette for discovery
- Create task runner configurations

**Automation Setup**
- Enable auto-check for active development
- Set up periodic project analysis
- Configure external integrations

## 🆘 Troubleshooting

### Extension Not Loading

**Common Solutions**
- Restart VS Code completely
- Check Developer Console for errors (`Help > Toggle Developer Tools`)
- Verify VS Code version compatibility (1.80.0+)
- Reinstall the extension

**Debug Mode**
```bash
# Enable debug logging
zippy-audit config --set debug=true

# Check extension logs
code --verbose
```

### Analysis Issues

**Timeout Errors**
- Increase analysis timeout in settings
- Reduce project scope for large codebases
- Check available memory and CPU

**API Connection Issues**
- Verify API endpoint configuration
- Check network connectivity
- Validate API key if using premium tier

**File Access Issues**
- Ensure VS Code has read access to project files
- Check file permissions and workspace trust
- Verify supported file types

### Performance Issues

**Slow Analysis**
- Disable auto-check for large files
- Reduce analysis scope (fewer files)
- Increase system resources if needed

**High Memory Usage**
- Close unused VS Code windows
- Disable background analysis
- Restart VS Code periodically

## 📚 Advanced Features

### Custom Analysis Rules

**Rule Configuration**
```json
{
  "zippycodesaudit.customRules": [
    {
      "name": "Company Naming Convention",
      "pattern": "^[a-z][a-zA-Z0-9]*$",
      "message": "Variables must start with lowercase",
      "severity": "warning"
    }
  ]
}
```

**Rule Categories**
- **Style**: Naming conventions, formatting
- **Security**: Potential vulnerabilities
- **Performance**: Optimization opportunities
- **Maintainability**: Code structure issues

### API Integration

**Premium Features**
- Enhanced AI analysis with custom models
- Team collaboration features
- Advanced reporting and analytics
- Priority support

**Enterprise Features**
- Organization-wide rule management
- Custom AI model training
- White-label solutions
- On-premise deployment options

## 🔒 Security & Privacy

### Data Handling

**Local Processing**
- Analysis runs locally in VS Code
- No code sent to external servers without consent
- Results stored in project workspace

**Privacy Controls**
- Option to disable telemetry
- Configurable data retention
- Export and delete capabilities

**Secure Communication**
- HTTPS for all external API calls
- API key encryption in settings
- Secure token handling

## 📞 Support & Community

### Getting Help

- **Documentation**: This guide and related docs
- **GitHub Wiki**: https://github.com/GoZippy/ZippyCodeAudit/wiki
- **GitHub Issues**: Bug reports and feature requests
- **Community Forum**: GitHub Discussions
- **Discord**: Real-time community support

### Contributing

**Development Setup**
```bash
# Clone repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git

# Install dependencies
npm install

# Build extension
npm run build:vscode

# Run in development
npm run dev:vscode
```

**Testing**
```bash
# Run extension tests
npm run test

# Package for distribution
npm run package:vscode
```

## 🎯 Tips & Tricks

### Productivity Boosters

**Quick Analysis**
- Use context menu for file-specific checks
- Enable auto-check for immediate feedback
- Set up keyboard shortcuts for common commands

**Workflow Integration**
- Run analysis before committing code
- Use reports for code review documentation
- Set up automated quality gates

**Team Collaboration**
- Share configuration files across team
- Use consistent settings for uniform analysis
- Set up shared dashboards for team visibility

---

*"Audit your code as you develop it."*

**Version:** 1.0.0
**VS Code Version:** 1.80.0+
**Last Updated:** 2025-01-11
