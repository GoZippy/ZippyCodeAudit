# 🧩 ZippyCodeAudit VS Code Extension

Integrated code auditing toolkit for Visual Studio Code that brings the power of ZippyCodeAudit directly into your development workflow.

## ✨ Features

### 🔍 **Integrated Analysis**
- Run comprehensive project audits directly from VS Code
- Real-time quality checks on file save (configurable)
- Context-aware analysis for current file or entire project

### 📊 **Visual Feedback**
- Status bar integration showing current project health
- Tree view with quick actions and recent reports
- Inline issue highlighting and suggestions

### 🚀 **Seamless Workflow**
- One-click project initialization
- Multiple output formats (JSON, Markdown, HTML)
- Integration with ZippyMCP services (Public/Premium/Private tiers)

### 🎯 **Smart Context**
- Automatic language detection
- Project-aware analysis
- Configurable settings per workspace

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "ZippyCodeAudit"
4. Click Install

### Manual Installation
1. Download the `.vsix` file from releases
2. Run: `code --install-extension zippycodesaudit-vscode-1.0.0.vsix`

## 🚀 Usage

### Quick Start
1. Open your project in VS Code
2. Click the "🧩 ZippyAudit" button in the status bar
3. Or use Command Palette: `Ctrl+Shift+P` → "ZippyCodeAudit: Analyze Project"

### Available Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `ZippyCodeAudit: Analyze Project` | Run comprehensive audit | Status bar / Command Palette |
| `ZippyCodeAudit: Run Quality Checks` | Check current file | Right-click in editor |
| `ZippyCodeAudit: Generate Report` | Create audit report | Command Palette |
| `ZippyCodeAudit: Initialize Project` | Set up audit system | Command Palette |
| `ZippyCodeAudit: Open Dashboard` | Launch web dashboard | Command Palette |
| `ZippyCodeAudit: Open Settings` | Configure extension | Command Palette |

### Context Menu Integration
- Right-click in Explorer or Editor
- Select files for targeted analysis
- Quick access to audit commands

## ⚙️ Configuration

Configure the extension through VS Code Settings:

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

### Settings Explained

| Setting | Description | Default | Options |
|---------|-------------|---------|---------|
| `enable` | Enable/disable extension | `true` | `true`/`false` |
| `autoCheck` | Auto-check files on save | `false` | `true`/`false` |
| `reportFormat` | Default report format | `"markdown"` | `"json"`, `"markdown"`, `"html"`, `"table"` |
| `apiTier` | API service tier | `"public"` | `"public"`, `"premium"`, `"private"` |
| `apiEndpoint` | Custom API endpoint | `""` | Custom URL |
| `apiKey` | API authentication key | `""` | Your API key |

## 🎨 User Interface

### Status Bar
- **🧩 ZippyAudit** - Shows current status and provides quick access
- **$(check)** - Analysis complete
- **$(sync~spin)** - Currently analyzing
- **$(error)** - Analysis failed

### Tree View
- **Quick Actions** - Common audit commands
- **Recent Reports** - Previously generated reports
- **Current Issues** - Active issues and tasks

### Output Channels
- **ZippyCodeAudit** - Main analysis results
- **ZippyCodeAudit Check** - File-specific quality checks

## 🔗 Integration with ZippyMCP

The extension seamlessly integrates with ZippyMCP services:

### Public Tier (Free)
- Basic analysis and community templates
- Rate-limited requests (10/hour)
- Community support

### Premium Tier (Paid)
- Enhanced AI analysis
- Custom templates and team features
- Priority support

### Private Tier (Enterprise)
- Advanced AI with custom models
- Organization-wide insights
- Enterprise integrations

## 🛠️ Development

### Building the Extension
```bash
cd extensions/vscode
npm install
npm run compile
```

### Running Tests
```bash
npm run test
```

### Packaging
```bash
npm run vscode:prepublish
```

## 📋 Requirements

- **VS Code**: 1.80.0 or higher
- **Node.js**: 16.0.0 or higher (for development)

## 🐛 Troubleshooting

### Common Issues

**Extension not loading**
- Restart VS Code
- Check Developer Console for errors
- Ensure VS Code version is supported

**Analysis failing**
- Check API endpoint configuration
- Verify API key if using premium/private tiers
- Check network connectivity

**Reports not generating**
- Verify output directory exists
- Check file permissions
- Ensure sufficient disk space

### Getting Help

1. Check the [GitHub Issues](https://github.com/GoZippy/ZippyCodeAudit/issues)
2. Review the [Documentation](https://github.com/GoZippy/ZippyCodeAudit#readme)
3. Join our [Discord Community](https://discord.gg/zippy)

## 📄 License

This extension is part of the ZippyCodeAudit project and follows the same MIT License.

## 🙏 Acknowledgments

- Built for the vibe coding community
- Powered by the ZippyMCP ecosystem
- Inspired by developers who value code quality

---

*"Audit what you code — code what you audit." 🌀*

**Version:** 1.0.0
**VS Code Engine:** ^1.80.0
**Last Updated:** 2025-01-11
