# 🧩 ZippyCodeAudit

**A comprehensive code auditing toolkit for vibe coders who want to keep their projects clean, consistent, and continuously improving.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Issues](https://img.shields.io/github/issues/GoZippy/ZippyCodeAudit)](https://github.com/GoZippy/ZippyCodeAudit/issues)
[![GitHub Stars](https://img.shields.io/github/stars/GoZippy/ZippyCodeAudit)](https://github.com/GoZippy/ZippyCodeAudit/stargazers)

## 🎯 What is ZippyCodeAudit?

ZippyCodeAudit is an open-source project auditing system that combines AI-powered analysis, automated workflows, and developer-friendly tools to help you:

- **Audit** your codebase for quality, consistency, and completeness
- **Track** findings and improvement tasks systematically
- **Plan** refactoring and maintenance activities
- **Integrate** seamlessly with your development workflow
- **Scale** across teams and projects

## 🚀 Key Features

### 🤖 AI-Powered Analysis
- Comprehensive codebase analysis using advanced AI prompts
- Automated detection of technical debt, inconsistencies, and improvement opportunities
- Context-aware recommendations for your specific tech stack

### 📊 Project Management
- Structured task tracking with categories, priorities, and ownership
- Integration with GitHub Issues and project boards
- Progress monitoring and completion validation

### 🔧 Developer Tools
- **CLI Tool**: Command-line interface for quick audits and reports
- **Web Dashboard**: Interactive web interface for audit management
- **VS Code Extension**: Integrated development environment support
- **GitHub Actions**: Automated workflows for continuous auditing

### 🌐 Multi-Platform Support
- Cross-platform CLI (Windows, macOS, Linux)
- Web dashboard accessible from any browser
- VS Code extension for seamless IDE integration
- REST API for custom integrations

## 📦 Installation

### Quick Start (Recommended)

#### Option 1: Install CLI Tool Globally
```bash
# Clone the repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit

# Install CLI tool globally (Linux/macOS)
./scripts/install-cli.sh

# Or install CLI tool globally (Windows PowerShell)
.\scripts\install-cli.ps1

# Verify installation
zippy-audit --version
```

#### Option 2: Manual Installation
```bash
# Install dependencies
npm install

# Link globally (Linux/macOS)
npm link

# Or install globally (Windows)
npm install -g .
```

#### Option 3: Use as Library
```javascript
// In your Node.js project
npm install zippycodesaudit

const { AuditEngine } = require('zippycodesaudit');
const audit = new AuditEngine();
const results = await audit.runAudit();
```

### Manual Installation

1. **Prerequisites**: Node.js 16+, Python 3.8+, or .NET 6+
2. **Clone and setup**: See detailed guides in [`docs/guides/setup.md`](docs/guides/setup.md)

## 🎮 Usage

### Quick Start

```bash
# Initialize audit system in your project
zippy-audit init

# Run comprehensive analysis
zippy-audit analyze

# Check for specific issues
zippy-audit check --security --performance

# Generate detailed report
zippy-audit report --format html --output audit-report.html

# Configure settings
zippy-audit config --set analysis.maxDepth=15
```

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `analyze` | Comprehensive project analysis | `zippy-audit analyze --format json` |
| `check` | Run specific quality checks | `zippy-audit check --all` |
| `report` | Generate audit reports | `zippy-audit report --type detailed` |
| `init` | Initialize audit system | `zippy-audit init --audit-system` |
| `config` | Manage configuration | `zippy-audit config --show` |

### Output Formats

- **JSON**: Machine-readable data for integrations
- **Markdown**: Human-readable reports with formatting
- **HTML**: Web-viewable reports with styling
- **Table**: Console-friendly tabular display

### GitHub Integration

1. **Copy audit files to your repository:**
   ```bash
   cp -r docs/PROJECT_AUDIT_PROMPT.md your-project/docs/
   cp -r docs/PROJECT_AUDIT_TASKS.md your-project/docs/
   cp -r docs/PROJECT_AUDIT_RUNBOOK.md your-project/docs/
   ```

2. **Configure GitHub Secrets (optional for AI features):**
   - `AI_AUDIT_ENDPOINT`
   - `AI_AUDIT_API_KEY`

3. **Enable GitHub Actions workflow for automated auditing**

### VS Code Integration

1. Install the ZippyCodeAudit VS Code extension
2. Use Command Palette: "ZippyCodeAudit: Analyze Project"
3. Configure settings in `.vscode/settings.json`

### Custom Integration

```javascript
const { AuditEngine } = require('zippycodesaudit');

const audit = new AuditEngine({
  projectPath: './my-project',
  includePatterns: ['src/**/*', 'docs/**/*'],
  excludePatterns: ['node_modules/**', 'dist/**']
});

const results = await audit.runAudit();
console.log(results.report);

// Access specific data
console.log(`Found ${results.issues.length} issues`);
console.log(`Analyzed ${results.files.length} files`);
```

## 🏗️ Architecture

```
ZippyCodeAudit/
├── src/
│   ├── core/           # Core analysis engine
│   ├── cli/            # Command-line interface
│   ├── web/            # Web dashboard backend
│   ├── dashboard/      # Frontend dashboard
│   └── extensions/     # IDE extensions (VS Code, etc.)
├── docs/
│   ├── api/            # API documentation
│   ├── examples/       # Usage examples
│   └── guides/         # Setup and user guides
├── tests/              # Test suites
├── scripts/            # Setup and utility scripts
└── tools/              # Additional utilities
```

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests if applicable
5. **Submit** a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Start development servers
npm run dev
```

## 📚 Documentation

- **[User Guide](docs/guides/user-guide.md)**: Complete usage instructions
- **[Setup Guide](docs/guides/setup.md)**: Installation and configuration
- **[Web Dashboard Guide](docs/guides/web-dashboard.md)**: Dashboard usage
- **[VS Code Extension Guide](docs/guides/vscode-extension.md)**: Extension documentation
- **[API Reference](docs/api/)**: Technical API documentation
- **[Examples](docs/examples/)**: Code samples and tutorials
- **[Contributing](CONTRIBUTING.md)**: Guidelines for contributors

## 🔗 Integration with ZippyMCP

ZippyCodeAudit is designed to integrate seamlessly with the [ZippyMCP](https://github.com/GoZippy/zippy-mcp.git) ecosystem, providing:

- Enhanced code analysis capabilities
- Project health monitoring
- Automated quality assurance workflows
- Integration with broader development tools

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the vibe coding community
- Powered by AI assistance and collaborative development
- Part of the broader Zippy ecosystem

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/GoZippy/ZippyCodeAudit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GoZippy/ZippyCodeAudit/discussions)
- **Documentation**: [Wiki](https://github.com/GoZippy/ZippyCodeAudit/wiki)

---

**"Audit what you automate — automate what you audit." 🌀**  
*— Zippy Engineering Philosophy*
