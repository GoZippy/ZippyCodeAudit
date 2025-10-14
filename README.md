# 🧩 ZippyCodeAudit

**A comprehensive, multi-project code auditing toolkit for vibe coders who want to keep their projects clean, consistent, and continuously improving with AI-powered insights.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/GoZippy/ZippyCodeAudit)

## 🎯 What is ZippyCodeAudit?

ZippyCodeAudit is an open-source project auditing system that combines AI-powered analysis, automated workflows, and developer-friendly tools to help you:

- **🔍 Audit** your codebase for quality, consistency, and completeness
- **📊 Track** findings and improvement tasks systematically
- **🤖 Generate** AI-ready prompts for automated improvements
- **🌐 Manage** multiple projects with complete isolation
- **🎨 Visualize** audit results in an intuitive web dashboard
- **🔗 Integrate** seamlessly with your development workflow
- **📱 Work** across platforms (Windows, Mac, Linux, mobile)

## 🚀 Key Features

### 🤖 AI-Powered Analysis
- Comprehensive codebase analysis using advanced AI prompts
- Automated detection of technical debt, inconsistencies, and improvement opportunities
- Context-aware recommendations for your specific tech stack
- AI-ready markdown reports for tools like Cursor, VS Code, and other AI assistants

### 📊 Multi-Project Management
- Register and manage multiple projects with complete isolation
- Project-specific audit results, tasks, and configurations
- Visual project selection and switching in the dashboard
- Cross-project analytics and reporting

### 🔧 Developer Tools
- **CLI Tool**: Command-line interface for quick audits and reports
- **Web Dashboard**: Interactive web interface for audit management (PWA-ready)
- **VS Code Extension**: Integrated development environment support
- **REST API**: Programmatic access for custom integrations

### 🎨 Visual Dashboard
- Real-time project metrics and health scores
- Interactive charts and progress tracking
- Project-specific task management
- Mobile-responsive design with PWA capabilities

### 🌐 Cross-Platform Support
- Works on Windows, macOS, Linux, and mobile devices
- Docker-compatible for containerized environments
- Browser-based dashboard accessible from anywhere
- Consistent experience across all platforms

## 📦 Quick Start

### Option 1: Complete Setup (Recommended)
```bash
# 1. Clone the repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit

# 2. Run complete setup (Windows PowerShell)
.\setup-complete.ps1

# 3. Start services
zippy-audit dashboard start

# 4. Access dashboard
open http://localhost:3001
```

### Option 2: Manual Installation
```bash
# Install dependencies
npm install

# Build dashboard
npm run build:dashboard

# Start API server
node simple-api.js

# Start dashboard (in another terminal)
npx serve dist/dashboard -p 3001

# Access dashboard
open http://localhost:3001
```

### Option 3: Add Projects from UI
1. **Open Dashboard**: `http://localhost:3001`
2. **Navigate to Projects tab**
3. **Click "Add Project"**
4. **Fill in project details** (name, path, type)
5. **Start auditing!**

## 🎮 Usage

### Dashboard Interface
1. **Project Selection**: Use dropdown to switch between projects
2. **Real-time Metrics**: View current project health and statistics
3. **Task Management**: Track and manage audit findings
4. **Report Generation**: Create AI-ready improvement reports

### CLI Commands
```bash
# Project Management
zippy-audit project list              # List all projects
zippy-audit project add <path>        # Register new project
zippy-audit project discover          # Auto-discover projects

# Analysis & Reporting
zippy-audit analyze                   # Run comprehensive analysis
zippy-audit report --ai --format markdown  # Generate AI-ready report

# Dashboard Management
zippy-audit dashboard start           # Start dashboard services
zippy-audit dashboard stop            # Stop dashboard services
zippy-audit dashboard status          # Check service status
```

### IDE Integration
- **VS Code Extension**: Install from marketplace or build from source
- **Cursor Integration**: Use Command Palette for quick audits
- **One-click Improvements**: Generate prompts for AI assistants

## 🏗️ Architecture

```
ZippyCodeAudit/
├── src/
│   ├── core/           # Core analysis engine & project registry
│   ├── cli/            # Command-line interface
│   ├── dashboard/      # Web dashboard (PWA-ready)
│   ├── services/       # API services
│   └── extensions/     # IDE extensions (VS Code, etc.)
├── docs/
│   ├── guides/         # Setup and user guides
│   ├── examples/       # Usage examples
│   └── api/           # API documentation
├── tests/              # Test suites
└── scripts/           # Setup and utility scripts
```

## 🤝 Integration with AI Tools

### AI-Ready Reports
The system generates structured prompts for AI assistants:

```markdown
## 🤖 AI Improvement Prompts

### Primary Improvement Task
You are an expert software developer tasked with improving the codebase for: **My Project**

**Key Issues to Address:**
1. **HIGH**: Potential security vulnerability in auth module
2. **MEDIUM**: Code quality issues in components

**Improvement Strategy:**
1. Analyze each issue systematically
2. Prioritize based on severity and impact
3. Implement fixes with proper testing
4. Ensure no regressions are introduced
```

### IDE Integration
- **Cursor/VS Code**: Built-in commands for project analysis
- **Real-time Feedback**: Live audit results during development
- **One-click Fixes**: Automated improvement suggestions

## 📚 Documentation

- **[Complete Setup Guide](./docs/guides/setup.md)**: Installation and configuration
- **[User Guide](./docs/guides/user-guide.md)**: Complete usage instructions
- **[Project Management](./docs/guides/project-management.md)**: Multi-project workflows
- **[API Reference](./docs/api/)**: Technical API documentation
- **[Examples](./docs/examples/)**: Code samples and tutorials
- **[Contributing](./CONTRIBUTING.md)**: Guidelines for contributors

## 🔗 Integration with ZippyMCP

ZippyCodeAudit integrates seamlessly with the [ZippyMCP](https://github.com/GoZippy/zippy-mcp.git) ecosystem, providing:

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
