# 🧩 ZippyCodeAudit User Guide

Complete guide for using ZippyCodeAudit to audit your projects routinely and maintain code quality.

## 🚀 Quick Start

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GoZippy/ZippyCodeAudit.git
   cd ZippyCodeAudit
   ```

2. **Run the automated setup:**
   ```bash
   # Linux/macOS
   ./scripts/setup.sh

   # Windows PowerShell
   .\scripts\setup.ps1
   ```

3. **Verify installation:**
   ```bash
   zippy-audit --version
   ```

### First Audit

```bash
# Initialize audit system in your project
zippy-audit init

# Run comprehensive analysis
zippy-audit analyze

# Check for quality issues
zippy-audit check --all

# Generate a report
zippy-audit report --format html --output audit-report.html
```

## 📊 Understanding Your Results

### Audit Scores

ZippyCodeAudit provides scores from 0-100% indicating project health:

- **90-100%**: Excellent - Minimal issues, well-maintained
- **70-89%**: Good - Some improvements needed
- **50-69%**: Needs Attention - Significant issues to address
- **0-49%**: Critical - Major refactoring required

### Issue Categories

| Category | Description | Priority |
|----------|-------------|----------|
| 🔒 **Security** | Vulnerabilities, authentication, data protection | High |
| ⚡ **Performance** | Speed, resource usage, optimization opportunities | Medium |
| 🏗️ **Maintainability** | Code structure, complexity, documentation | Medium |
| 🧪 **Testing** | Test coverage, quality, reliability | High |
| 📚 **Documentation** | README, API docs, comments | Low |
| 🔄 **Process** | Development workflow, CI/CD, standards | Medium |

## 🛠️ Configuration

### Configuration File

Create `zippycodesaudit.config.json` in your project root:

```json
{
  "project": {
    "name": "My Project",
    "type": "web"
  },
  "analysis": {
    "includePatterns": ["src/**/*.{js,ts,py}"],
    "excludePatterns": ["node_modules/**", "dist/**"],
    "maxDepth": 10
  },
  "reporting": {
    "format": "markdown",
    "outputDir": "docs/audit_reports"
  }
}
```

### Environment Variables

Create `.env` file for API configuration:

```bash
# API Configuration
ZIPPY_MCP_API_URL=http://localhost:3000/api
API_KEY=your-api-key-here

# Dashboard Settings
DASHBOARD_PORT=3001
```

## 🌐 Web Dashboard

### Accessing the Dashboard

After setup, access your dashboard at:
```
http://localhost:YOUR_DASHBOARD_PORT
```

### Dashboard Features

- **📊 Overview**: Project health metrics and recent activity
- **📈 Reports**: Historical audit data and trend analysis
- **✅ Tasks**: Task management for audit findings
- **📱 Mobile**: Responsive design for on-the-go access
- **🌙 Themes**: Dark/light mode support

### Navigation

- **Overview**: Current project status and metrics
- **Reports**: Historical audit reports and comparisons
- **Tasks**: Manage audit findings and improvements
- **Analytics**: Deep dive into codebase metrics
- **Settings**: Configure dashboard preferences

## 🔌 VS Code Extension

### Installation

1. Open VS Code in your project
2. Install the ZippyCodeAudit extension
3. Access via Command Palette or Status Bar

### Features

- **Integrated Analysis**: Run audits from within VS Code
- **Real-time Checks**: Quality checks on file save
- **Context Menu**: Right-click files for targeted analysis
- **Status Bar**: Visual project health indicators
- **Tree View**: Quick access to audit commands

### Usage

```bash
# Via Command Palette
Ctrl+Shift+P → "ZippyCodeAudit: Analyze Project"

# Via Status Bar
Click "🧩 ZippyAudit" button

# Via Context Menu
Right-click file → "ZippyCodeAudit: Analyze"
```

## 🔧 Advanced Usage

### Custom Analysis Rules

Create custom audit rules in your configuration:

```json
{
  "customRules": [
    {
      "name": "Company Naming Convention",
      "pattern": "^[a-z][a-zA-Z0-9]*$",
      "message": "Variable names must start with lowercase",
      "severity": "medium"
    }
  ]
}
```

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Install ZippyCodeAudit
  run: npm install -g zippycodesaudit

- name: Run Audit
  run: zippy-audit analyze --format json --output audit-results.json

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: audit-results
    path: audit-results.json
```

### Team Collaboration

```bash
# Share audit results
zippy-audit report --format html --output team-report.html

# Set up automated daily audits
zippy-audit config --set automation.schedule="0 9 * * 1-5"

# Configure team notifications
zippy-audit config --set notifications.slackWebhook="https://hooks.slack.com/..."
```

## 📈 Best Practices

### Regular Auditing Schedule

- **Daily**: Quick quality checks before commits
- **Weekly**: Full project analysis and report generation
- **Monthly**: Deep dive into trends and architectural reviews
- **Quarterly**: Comprehensive system-wide audits

### Issue Prioritization

1. **🚨 Critical**: Security vulnerabilities, data loss risks
2. **🔴 High**: Major functionality gaps, performance issues
3. **🟡 Medium**: Code quality improvements, documentation updates
4. **🔵 Low**: Nice-to-have features, minor optimizations

### Team Workflow

1. **Initialize**: Run `zippy-audit init` in each project
2. **Daily Checks**: Use `zippy-audit check --all` before commits
3. **Weekly Reports**: Generate `zippy-audit report` for team review
4. **Issue Tracking**: Use `PROJECT_AUDIT_TASKS.md` for improvement tracking
5. **Trend Monitoring**: Use dashboard for long-term health tracking

## 🆘 Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Check available ports
node scripts/port-scanner.js

# Use different ports
zippy-audit config --set dashboard.port=3002
zippy-audit config --set api.port=3003
```

**Analysis Timeout**
```bash
# Increase timeout for large projects
zippy-audit config --set analysis.timeout=60000

# Reduce scope for faster analysis
zippy-audit analyze --max-depth 5
```

**Permission Issues**
```bash
# Use sudo for global installation
sudo npm install -g .

# Or install locally in project
npm install zippycodesaudit --save-dev
```

### Getting Help

- **Documentation**: [GitHub Wiki](https://github.com/GoZippy/ZippyCodeAudit/wiki)
- **Issues**: [GitHub Issues](https://github.com/GoZippy/ZippyCodeAudit/issues)
- **Community**: [Discord](https://discord.gg/zippy)

## 📚 Related Documentation

- **[CLI Examples](examples/cli-usage-examples.md)**: Detailed command usage
- **[API Reference](api/reference.md)**: Complete API documentation
- **[Web Dashboard Guide](guides/web-dashboard.md)**: Dashboard usage
- **[VS Code Extension](guides/vscode-extension.md)**: Extension documentation

---

*"Audit what you code — code what you audit." 🌀*

**Version:** 1.0.0
**Last Updated:** 2025-01-11
