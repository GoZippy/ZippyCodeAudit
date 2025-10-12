# 🌐 Web Dashboard Guide

Complete guide for using the ZippyCodeAudit web dashboard for visual audit management and team collaboration.

## 🚀 Getting Started

### Accessing the Dashboard

After running the setup script, access your dashboard at:
```
http://localhost:YOUR_DASHBOARD_PORT
```

The port number is automatically assigned during setup and saved to `.zippycodesaudit-ports.json`.

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🧩 ZippyCodeAudit                    🔄 📥 🌙          │
├─────────────────────────────────────────────────────────┤
│ Overview | Reports | Tasks | Analytics | Settings       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📊 Project Overview                                     │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│ │ 📊 Files    │ ⚠️ Issues   │ 📈 Health   │ ✅ Tasks    │ │
│ │ Analyzed    │ Found       │ Score       │ Done        │ │
│ │ 847         │ 23          │ 78%         │ 15          │ │
│ └─────────────┴─────────────┴─────────────┴─────────────┘ │
│                                                         │
│ 📋 Recent Activity                                      │
│ • 🔍 Audit Completed - 2 hours ago                     │
│ • ✅ Task Completed - 4 hours ago                       │
│ • 📊 Report Generated - 1 day ago                       │
└─────────────────────────────────────────────────────────┘
```

## 📊 Overview Page

### Project Metrics Cards

**Files Analyzed**
- Total number of files processed in the last audit
- Updates in real-time as new audits complete

**Issues Found**
- Total issues identified across all categories
- Color-coded by severity (red=high, yellow=medium, blue=low)

**Health Score**
- Overall project health percentage (0-100%)
- Based on issues found, code quality, and best practices

**Tasks Done**
- Number of completed improvement tasks
- Tracks progress on audit recommendations

### Recent Activity Feed

- **🔍 Audit Completed**: When new audits finish
- **✅ Task Completed**: When improvement tasks are marked done
- **📊 Report Generated**: When new reports are created
- **🔧 Settings Updated**: When configuration changes

## 📈 Reports Page

### Report Cards

Each report shows:
- **Title**: Report name and date
- **Type**: Security, Performance, Maintainability, etc.
- **Metrics**: Issues found, files analyzed, score
- **Actions**: View details, download, share

### Report History

- **Chronological View**: Reports sorted by generation date
- **Filtering**: Filter by type, score range, or date range
- **Comparisons**: Side-by-side comparison of multiple reports
- **Trends**: Visual charts showing improvement over time

### Report Details

Clicking a report shows:
- **Full Analysis**: Complete audit results
- **Issue Breakdown**: Detailed issue list with file locations
- **Recommendations**: Specific improvement suggestions
- **Export Options**: Download as PDF, HTML, or JSON

## ✅ Tasks Page

### Task Management Interface

**Task Cards**
- **Title**: Brief description of the improvement needed
- **Priority**: High/Medium/Low with color coding
- **Status**: Pending/In Progress/Completed/Blocked
- **Assignee**: Who is responsible for completion
- **Due Date**: Optional deadline for completion

**Task Filters**
- **All**: Show all tasks
- **Pending**: Tasks waiting to be started
- **In Progress**: Currently being worked on
- **Completed**: Successfully finished tasks

**Task Actions**
- **Edit**: Modify task details or priority
- **Assign**: Change who is responsible
- **Mark Complete**: Update status when done
- **Delete**: Remove if no longer relevant

### Task Workflow

1. **Audit identifies issues** → Tasks created automatically
2. **Team lead assigns tasks** → Assign to appropriate developers
3. **Developers work on tasks** → Update status to "In Progress"
4. **Code review and testing** → Verify improvements
5. **Mark complete** → Update status and add notes

## 📊 Analytics Page

### Code Quality Trends

**Historical Charts**
- **Score Over Time**: Project health trend line
- **Issues by Category**: Breakdown of issue types
- **File Coverage**: Percentage of codebase analyzed
- **Improvement Rate**: How quickly issues are resolved

**Language Distribution**
- **Pie Chart**: Files by programming language
- **Bar Chart**: Issues by language
- **Trend Lines**: Language usage changes over time

**Team Performance**
- **Individual Contributions**: Issues resolved per developer
- **Velocity Metrics**: Tasks completed over time
- **Quality Scores**: Individual and team averages

### Deep Insights

**Complexity Analysis**
- **Cyclomatic Complexity**: Function complexity distribution
- **Code Duplication**: Repeated code patterns
- **Technical Debt**: Estimated effort to fix issues

**Performance Metrics**
- **Bundle Size Trends**: Frontend asset sizes over time
- **Load Time Analysis**: Page performance improvements
- **Memory Usage**: Resource consumption patterns

## ⚙️ Settings Page

### Analysis Settings

**Auto-Refresh Interval**
- **30 seconds**: Real-time updates (resource intensive)
- **1 minute**: Frequent updates (recommended)
- **5 minutes**: Occasional updates (battery friendly)
- **Disabled**: Manual refresh only

**Theme Preference**
- **Auto**: Follow system dark/light mode
- **Light**: Always use light theme
- **Dark**: Always use dark theme

### Notification Settings

**Email Notifications**
- **Daily Summary**: End-of-day progress report
- **Weekly Report**: Comprehensive weekly analysis
- **Critical Issues**: Immediate alerts for high-priority problems

**Integration Settings**
- **Slack Webhook**: Send notifications to team channels
- **GitHub Integration**: Create issues for audit findings
- **CI/CD Triggers**: Automatic audits on code changes

## 🎨 Customization

### Dashboard Themes

**Light Theme**
- Clean, bright interface
- Easy on the eyes in well-lit environments
- Standard corporate environment theme

**Dark Theme**
- Reduced eye strain in low-light conditions
- Popular with developers
- Modern, sleek appearance

**Custom Themes** (Premium)
- Brand colors and logos
- Custom CSS overrides
- Company-specific styling

### Layout Customization

**Widget Arrangement**
- Drag and drop dashboard widgets
- Hide/show specific metrics
- Custom widget sizes and positions

**Report Templates**
- Custom report layouts
- Branded headers and footers
- Include/exclude specific sections

## 🔗 Integration Features

### Team Collaboration

**Shared Dashboards**
- Multiple users can access the same dashboard
- Real-time updates for all team members
- Role-based access permissions

**Comment System**
- Add notes to specific audit findings
- Discuss improvements with team members
- Track decision rationale

**Task Assignment**
- Assign tasks to specific team members
- Set due dates and priorities
- Track completion status

### External Integrations

**Version Control**
- GitHub, GitLab, Bitbucket integration
- Automatic audits on pull requests
- Issue creation for audit findings

**Project Management**
- Jira, Trello, Asana integration
- Create tasks from audit recommendations
- Sync progress between systems

**Communication**
- Slack, Discord, Teams integration
- Automated notifications for critical issues
- Team status updates

## 📱 Mobile Access

### Responsive Design

**Mobile-First Approach**
- Touch-friendly interface
- Optimized for small screens
- Fast loading on mobile networks

**Progressive Web App**
- Install on mobile home screen
- Offline functionality for core features
- Push notifications for updates

**Mobile Features**
- Swipe gestures for navigation
- Collapsible sections for space
- Mobile-optimized charts and graphs

## 🛠️ Troubleshooting

### Dashboard Not Loading

**Port Issues**
```bash
# Check if dashboard is running
npm run serve:dashboard

# Check port configuration
cat .zippycodesaudit-ports.json

# Restart with different port
zippy-audit config --set dashboard.port=3002
```

**Browser Issues**
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check browser console for errors

**Network Issues**
- Verify localhost access
- Check firewall settings
- Ensure no proxy conflicts

### Performance Issues

**Slow Loading**
- Reduce auto-refresh interval in settings
- Close other browser tabs
- Clear browser cache

**High Memory Usage**
- Disable auto-refresh for long sessions
- Use manual refresh for occasional updates
- Close dashboard when not in use

### Data Issues

**Missing Data**
- Check if audit has been run recently
- Verify project configuration
- Check API connectivity

**Outdated Information**
- Force refresh the dashboard
- Re-run recent audits
- Check for configuration changes

## 📚 Advanced Features

### Custom Dashboards

**Widget Creation**
- Create custom metric widgets
- Add external data sources
- Combine multiple data points

**Dashboard Sharing**
- Generate shareable links
- Export dashboard configurations
- Import team templates

### API Access

**REST API**
- Programmatic access to all dashboard data
- Custom integrations with external tools
- Automated report generation

**Webhook Support**
- Real-time notifications for events
- Integration with external systems
- Custom event handling

## 🔒 Security & Privacy

### Data Protection

**Local Storage Only**
- Dashboard data stored locally in browser
- No data sent to external servers without consent
- User controls data retention

**Encryption**
- All data transmission encrypted (HTTPS)
- Local storage encrypted where supported
- Secure API key handling

**Privacy Controls**
- Option to anonymize personal data
- Configurable data retention periods
- Export and delete data options

## 📞 Support

### Getting Help

- **Documentation**: This guide and related docs
- **Community**: GitHub Discussions and Discord
- **Issues**: Bug reports and feature requests
- **Premium Support**: Priority assistance for paid users

### Common Questions

**Q: Dashboard shows "No data available"**
A: Run `zippy-audit analyze` to generate audit data first

**Q: Dashboard is slow on my machine**
A: Try disabling auto-refresh or increasing the interval in settings

**Q: How do I share dashboard with my team?**
A: Currently local-only. Team features available in premium tier.

**Q: Can I customize the dashboard appearance?**
A: Basic themes available. Custom themes in premium tier.

---

*"Visualize your code quality journey."*

**Version:** 1.0.0
**Last Updated:** 2025-01-11
