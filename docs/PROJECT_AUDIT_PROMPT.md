# 🧩 PROJECT AUDIT PROMPT

## Purpose
This prompt is designed for AI coding assistants (Cursor, ChatGPT, Copilot, Bolt.new) and senior developers to perform comprehensive project audits using the ZippyCodeAudit system.

## 🎯 Objective
Conduct a **complete, context-aware audit** of this repository to evaluate its health, alignment with requirements, and improvement opportunities using advanced analysis techniques.

## 🧠 AI/Engineer Role
You are a **Principal Engineer, Product Architect, and QA Lead** with expertise in:
- **Software Architecture**: Design patterns, scalability, maintainability
- **Code Quality**: Standards, best practices, technical debt assessment
- **Project Management**: Requirements alignment, task prioritization, risk assessment
- **DevOps**: CI/CD, deployment, monitoring, security

## 🔍 Analysis Framework

### Phase 1: Project Context Gathering
1. **Tech Stack Detection**: Identify languages, frameworks, databases, tools
2. **Architecture Analysis**: MVC patterns, microservices, monoliths, APIs
3. **Dependency Mapping**: Package management, external services, integrations
4. **Project Structure**: Organization, conventions, documentation quality

### Phase 2: Requirements vs Implementation Assessment
1. **Documentation Review**: README, specs, requirements, user stories
2. **Feature Completeness**: Implemented vs documented functionality
3. **Code Coverage**: Test coverage, edge cases, error handling
4. **User Experience**: Usability, accessibility, performance

### Phase 3: Quality & Risk Evaluation
1. **Code Quality Metrics**: Complexity, duplication, maintainability
2. **Security Assessment**: Vulnerabilities, authentication, data protection
3. **Performance Analysis**: Bottlenecks, resource usage, optimization opportunities
4. **Scalability Review**: Growth capacity, resource requirements

### Phase 4: Improvement Prioritization
1. **Technical Debt Identification**: Outdated patterns, deprecated APIs
2. **Missing Components**: Tests, documentation, monitoring
3. **Process Gaps**: Development workflow, code review, deployment
4. **Risk Mitigation**: Critical issues, blocking problems

## 📋 Detailed Instructions

### 1. Automated Analysis
- **Language Detection**: Examine package.json, requirements.txt, go.mod, etc.
- **Framework Identification**: React, Vue, Django, Express, Spring, etc.
- **Database Analysis**: SQL/NoSQL, ORM usage, migration patterns
- **Infrastructure Review**: Docker, cloud services, deployment configs

### 2. Documentation Assessment
- **README Quality**: Completeness, accuracy, maintenance status
- **API Documentation**: OpenAPI, inline comments, examples
- **Architecture Docs**: Diagrams, decision records, system overview
- **Contributing Guidelines**: Setup, standards, review processes

### 3. Code Quality Evaluation
- **Structure & Organization**: File layout, naming conventions, imports
- **Error Handling**: Try/catch, validation, graceful degradation
- **Testing Coverage**: Unit, integration, e2e test comprehensiveness
- **Security Practices**: Input validation, authentication, authorization

### 4. Performance & Scalability
- **Resource Usage**: Memory, CPU, network, database queries
- **Caching Strategies**: Implementation, effectiveness, invalidation
- **Database Optimization**: Indexes, queries, connection pooling
- **CDN & Asset Management**: Static files, compression, optimization

### 5. DevOps & Operations
- **CI/CD Pipelines**: Build, test, deploy automation
- **Monitoring & Logging**: Error tracking, performance monitoring
- **Backup & Recovery**: Data protection, disaster recovery plans
- **Environment Management**: Dev, staging, production configurations

## 🧾 Output Format

```
# 🔍 Project Audit Summary

## 📊 Detected Tech Stack
- **Languages**: [JavaScript, Python, Go, etc.]
- **Frameworks**: [React, Django, Express, etc.]
- **Databases**: [PostgreSQL, MongoDB, Redis, etc.]
- **Tools**: [Docker, Kubernetes, Webpack, etc.]
- **Cloud Services**: [AWS, Azure, GCP, etc.]

## 🏗️ Current State Overview
- **Project Health**: [Excellent/Good/Fair/Poor]
- **Completeness**: [%] of documented features implemented
- **Architecture**: [Monolith/Microservices/Serverless description]
- **Team Size**: [Individual/Small Team/Large Team]

## ✅ Alignment vs Requirements
- **Feature Parity**: [Well aligned/Partial gaps/Major gaps]
- **Documentation Accuracy**: [Up to date/Needs updates/Outdated]
- **API Compliance**: [Standards followed/Inconsistent/Missing]

## 🔧 Missing / Outdated Elements
- **Critical**: [Security vulnerabilities, broken features]
- **Important**: [Missing tests, poor documentation]
- **Nice to Have**: [Performance optimizations, UI improvements]

## 🐛 Code Quality Observations
- **Maintainability**: [Well structured/Hard to modify]
- **Test Coverage**: [%] with [Unit/Integration/E2E] breakdown
- **Error Handling**: [Comprehensive/Partial/Missing]
- **Security**: [Strong/Moderate/Weak]

## ⚠️ Risks & Blockers
- **High Risk**: [Issues that could cause failures]
- **Medium Risk**: [Problems affecting scalability/maintainability]
- **Low Risk**: [Minor issues, nice to fix]

## 📈 Recommended Improvements (Prioritized)
1. **[URGENT]** [Critical security/performance issues]
2. **[HIGH]** [Major functionality gaps]
3. **[MEDIUM]** [Code quality improvements]
4. **[LOW]** [Nice-to-have enhancements]

## 🚀 Next Best Steps
1. [Immediate action item]
2. [Short-term improvement]
3. [Long-term strategic change]

## 📝 Additional Notes
- [Context-specific observations]
- [Architecture decisions to document]
- [Team considerations]
```

## 🧭 Usage Guidelines

### For AI Assistants
1. **Context Loading**: Request full repository context including hidden files
2. **Progressive Analysis**: Start broad, then deep-dive into specific concerns
3. **Evidence-Based**: Support findings with specific file references and code examples
4. **Actionable Output**: Provide concrete next steps and implementation guidance

### For Human Engineers
1. **Collaborative Review**: Use this prompt alongside manual code review
2. **Context Sharing**: Run analysis with team for broader perspective
3. **Iterative Improvement**: Re-run audits after implementing changes
4. **Documentation**: Maintain audit history for trend analysis

### Integration Notes
- **GitHub Actions**: Automated weekly audits with report generation
- **VS Code Extension**: Integrated analysis within development workflow
- **CLI Tool**: On-demand audits with customizable output formats
- **Web Dashboard**: Visual audit management and team collaboration

## 🔗 Related Files
- **[PROJECT_AUDIT_TASKS.md](../PROJECT_AUDIT_TASKS.md)**: Task tracking from audit findings
- **[PROJECT_AUDIT_RUNBOOK.md](../PROJECT_AUDIT_RUNBOOK.md)**: Operational procedures
- **[README_AUDIT_SYSTEM.md](../README_AUDIT_SYSTEM.md)**: System documentation

## 📚 Version History
- **v2.0**: Enhanced analysis framework with security and performance focus
- **v1.5**: Added DevOps and operations assessment
- **v1.0**: Initial comprehensive audit framework

---

*"Audit what you automate — automate what you audit." 🌀*
*— ZippyCodeAudit Philosophy*
