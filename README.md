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

```bash
# Clone the repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit

# Run the setup script
./scripts/setup.sh

# Or use npm for Node.js projects
npm install -g zippycodesaudit

# Or use pip for Python projects
pip install zippycodesaudit
```

### Manual Installation

1. **Prerequisites**: Node.js 16+, Python 3.8+, or .NET 6+
2. **Clone and setup**: See detailed guides in [`docs/guides/`](docs/guides/)

## 🎮 Usage

### Quick Audit

```bash
# CLI audit of current project
zippy-audit

# Web dashboard
zippy-audit web

# VS Code integration
# Install extension and use Command Palette
```

### GitHub Integration

1. Copy audit files to your repository:
   ```bash
   cp -r audit-system/* your-project/
   ```

2. Configure GitHub Secrets (optional for AI features):
   - `AI_AUDIT_ENDPOINT`
   - `AI_AUDIT_API_KEY`

3. Enable GitHub Actions workflow for automated auditing

### Custom Integration

```javascript
import { ZippyCodeAudit } from 'zippycodesaudit';

const audit = new ZippyCodeAudit({
  projectPath: './my-project',
  config: {
    includePatterns: ['src/**/*', 'docs/**/*'],
    excludePatterns: ['node_modules/**', 'dist/**'],
    customRules: [...]
  }
});

const results = await audit.analyze();
console.log(results.report);
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
