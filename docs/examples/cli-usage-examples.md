# 💻 CLI Usage Examples

Comprehensive examples showing how to use the ZippyCodeAudit CLI tool for various scenarios and use cases.

## 🚀 Quick Start Examples

### Basic Project Analysis

```bash
# Analyze current project with default settings
zippy-audit analyze

# Analyze with specific output format
zippy-audit analyze --format json --output audit-results.json

# Analyze with custom include/exclude patterns
zippy-audit analyze \
  --include "src/**/*,docs/**/*" \
  --exclude "node_modules/**,dist/**" \
  --format markdown \
  --output docs/audit-report.md
```

### Quality Checks

```bash
# Run all available checks
zippy-audit check --all

# Check specific aspects
zippy-audit check --security --performance --maintainability

# Check current file only
zippy-audit check --code-style --test-coverage

# Save check results
zippy-audit check --all --format table --output quality-check-results.txt
```

### Report Generation

```bash
# Generate basic report
zippy-audit report --type summary

# Generate detailed HTML report
zippy-audit report --type detailed --format html --output detailed-report.html

# Generate compliance report
zippy-audit report --type compliance --format pdf --output compliance-report.pdf
```

### Project Initialization

```bash
# Initialize audit system in current project
zippy-audit init --audit-system

# Initialize with CI workflow
zippy-audit init --ci-workflow

# Initialize with VS Code integration
zippy-audit init --vscode-extension

# Initialize everything
zippy-audit init --audit-system --ci-workflow --vscode-extension
```

## 🔧 Advanced Usage Examples

### Custom Configuration

```bash
# Set custom analysis depth
zippy-audit config --set analysis.maxDepth=15

# Configure API endpoint for premium features
zippy-audit config --set api.endpoint=https://your-domain.com/api/premium
zippy-audit config --set api.key=your-premium-api-key

# Set default output format
zippy-audit config --set reporting.format=html

# Configure auto-refresh for dashboard
zippy-audit config --set dashboard.refreshInterval=30000
```

### Batch Processing

```bash
# Analyze multiple projects
for project in project1 project2 project3; do
  cd "$project"
  zippy-audit analyze --format json --output "../reports/${project}-audit.json"
  cd ..
done

# Generate reports for all subdirectories
find . -type d -name "src" -exec dirname {} \; | while read dir; do
  cd "$dir"
  zippy-audit report --output "../reports/$(basename "$dir")-report.md"
  cd ../..
done
```

### CI/CD Integration

```bash
# GitHub Actions workflow example
name: Code Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
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

### Custom Analysis Scripts

```bash
#!/bin/bash
# custom-audit.sh - Custom audit workflow

echo "🧩 Running custom ZippyCodeAudit workflow..."

# Step 1: Basic analysis
echo "📊 Running basic analysis..."
zippy-audit analyze --format json --output temp-analysis.json

# Step 2: Quality checks
echo "🔍 Running quality checks..."
zippy-audit check --all --format table

# Step 3: Security scan
echo "🔒 Running security checks..."
zippy-audit check --security --format markdown --output security-report.md

# Step 4: Generate final report
echo "📋 Generating comprehensive report..."
zippy-audit report --type detailed --format html --output final-report.html

echo "✅ Custom audit workflow completed!"
echo "📁 Check output files: temp-analysis.json, security-report.md, final-report.html"
```

## 🎯 Language-Specific Examples

### JavaScript/TypeScript Projects

```bash
# Analyze React application
zippy-audit analyze \
  --include "src/**/*.{js,jsx,ts,tsx},public/**/*" \
  --exclude "node_modules/**,build/**,coverage/**" \
  --format markdown

# Check for React best practices
zippy-audit check \
  --include "src/**/*.{js,jsx,ts,tsx}" \
  --exclude "node_modules/**" \
  --maintainability --code-style

# Generate component analysis
zippy-audit report \
  --type detailed \
  --format html \
  --output component-analysis.html
```

### Python Projects

```bash
# Analyze Django application
zippy-audit analyze \
  --include "**/*.py,**/*.html,**/*.css,**/*.js" \
  --exclude "__pycache__/**,*.pyc,venv/**,migrations/**" \
  --format json

# Check Python code quality
zippy-audit check \
  --test-coverage \
  --maintainability \
  --dependencies \
  --format table

# Generate security report
zippy-audit check \
  --security \
  --format markdown \
  --output security-audit.md
```

### Go Projects

```bash
# Analyze Go application
zippy-audit analyze \
  --include "**/*.go,**/*.mod,**/*.sum" \
  --exclude "vendor/**,bin/**,dist/**" \
  --format markdown

# Check Go code quality
zippy-audit check \
  --performance \
  --maintainability \
  --dependencies

# Generate comprehensive report
zippy-audit report \
  --type detailed \
  --format html \
  --output go-project-report.html
```

## 🔗 Integration Examples

### Slack Notifications

```bash
#!/bin/bash
# Slack notification script

# Run audit
zippy-audit analyze --format json --output audit-results.json

# Extract key metrics
SCORE=$(jq '.analysis.score' audit-results.json)
ISSUES=$(jq '.analysis.issues | length' audit-results.json)

# Send to Slack
curl -X POST -H 'Content-type: application/json' \
  --data "{
    \"text\": \"🧩 ZippyCodeAudit Results\",
    \"blocks\": [
      {
        \"type\": \"section\",
        \"text\": {
          \"type\": \"mrkdwn\",
          \"text\": \"*Project Score:* ${SCORE}%\n*Issues Found:* ${ISSUES}\"
        }
      }
    ]
  }" \
  https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### GitHub Issues Integration

```bash
#!/bin/bash
# Create GitHub issues from audit findings

# Run analysis
zippy-audit analyze --format json --output audit-results.json

# Extract high-priority issues
HIGH_PRIORITY_ISSUES=$(jq '[.analysis.issues[] | select(.severity == "high")] | length' audit-results.json)

if [ "$HIGH_PRIORITY_ISSUES" -gt 0 ]; then
  # Create GitHub issue
  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$GITHUB_REPOSITORY/issues \
    -d "{
      \"title\": \"High Priority Issues Found in Code Audit\",
      \"body\": \"Found ${HIGH_PRIORITY_ISSUES} high-priority issues. Check audit-results.json for details.\",
      \"labels\": [\"audit\", \"high-priority\"]
    }"
fi
```

### Docker Integration

```dockerfile
# Dockerfile for CI/CD with ZippyCodeAudit

FROM node:18-alpine

# Install ZippyCodeAudit globally
RUN npm install -g zippycodesaudit

# Copy project files
WORKDIR /app
COPY . .

# Run audit as part of build process
RUN zippy-audit analyze --format json --output /app/audit-results.json

# Continue with normal build process
RUN npm ci --only=production
```

## 📊 Output Examples

### JSON Output

```json
{
  "success": true,
  "analysis": {
    "metrics": {
      "lines": 1247,
      "characters": 45632,
      "files": 89,
      "language": "javascript"
    },
    "issues": [
      {
        "type": "security",
        "severity": "high",
        "message": "Potential XSS vulnerability in template rendering",
        "file": "src/components/Auth.js",
        "line": 45,
        "suggestion": "Implement proper input sanitization and CSP headers"
      }
    ],
    "score": 78,
    "recommendations": [
      {
        "type": "improvement",
        "message": "Add comprehensive error handling",
        "priority": "high"
      }
    ]
  },
  "timestamp": "2025-01-11T10:30:00Z",
  "tier": "premium"
}
```

### Markdown Report

```markdown
# 🔍 Project Audit Report

**Generated:** 2025-01-11T10:30:00Z
**Project Score:** 78%
**Issues Found:** 12

## 🛠️ Detected Technologies
- JavaScript/Node.js
- React 18.2.0
- Express.js
- PostgreSQL

## ⚠️ Issues Found

### Issue #1 [HIGH PRIORITY]
**Type:** Security
**Message:** Potential XSS vulnerability in template rendering
**File:** src/components/Auth.js (line 45)
**Suggestion:** Implement proper input sanitization and CSP headers

### Issue #2 [MEDIUM PRIORITY]
**Type:** Performance
**Message:** Large bundle size detected
**File:** dist/bundle.js
**Suggestion:** Implement code splitting and lazy loading

## 💡 Recommendations

1. **Security Enhancement** - Implement CSP headers and input validation
2. **Performance Optimization** - Add code splitting for better load times
3. **Testing Coverage** - Increase test coverage from 45% to 80%
4. **Documentation** - Add API documentation for all endpoints

## 📈 Next Steps

1. Address high-priority security issues immediately
2. Implement performance optimizations for better user experience
3. Schedule regular audit reviews (weekly/monthly)
4. Set up automated CI/CD audit workflows
```

## 🔧 Troubleshooting

### Common Issues

**Command not found**
```bash
# Ensure CLI is installed globally
npm install -g zippycodesaudit

# Or use npx
npx zippycodesaudit analyze
```

**Permission denied**
```bash
# Use sudo on Linux/macOS if needed
sudo npm install -g zippycodesaudit

# Or install locally in project
npm install zippycodesaudit --save-dev
```

**Analysis timeout**
```bash
# Increase timeout for large projects
zippy-audit config --set analysis.timeout=60000

# Or reduce analysis scope
zippy-audit analyze --include "src/**/*" --max-depth 5
```

## 📚 Related Documentation

- **[CLI Reference](../api/reference.md)**: Complete API documentation
- **[Web Dashboard Guide](../guides/web-dashboard.md)**: Dashboard usage guide
- **[VS Code Extension Guide](../guides/vscode-extension.md)**: Extension documentation
- **[Setup Guide](../guides/setup.md)**: Installation and configuration

---

*"Master your codebase with powerful CLI automation."*

**Version:** 1.0.0
**Last Updated:** 2025-01-11
