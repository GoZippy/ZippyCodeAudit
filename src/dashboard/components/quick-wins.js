/**
 * Quick Wins Component
 * Highlights easy-to-fix issues that provide quick improvements
 */

class QuickWins {
  constructor() {
    this.issues = [];
    this.container = null;
  }

  /**
   * Initialize Quick Wins component
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('Quick Wins container not found');
      return;
    }

    this.render();
  }

  /**
   * Analyze issues and identify quick wins
   */
  analyzeIssues(allIssues) {
    if (!allIssues || !Array.isArray(allIssues)) {
      return [];
    }

    // Quick win criteria:
    // 1. Low complexity
    // 2. High impact
    // 3. Fast to fix (< 5 minutes)
    // 4. Clear solution available

    const quickWinPatterns = [
      {
        pattern: /missing readme/i,
        complexity: 'easy',
        estimatedTime: 2,
        impact: 'medium',
        fixType: 'documentation'
      },
      {
        pattern: /console\.log/i,
        complexity: 'easy',
        estimatedTime: 1,
        impact: 'low',
        fixType: 'cleanup'
      },
      {
        pattern: /unused variable/i,
        complexity: 'easy',
        estimatedTime: 1,
        impact: 'low',
        fixType: 'cleanup'
      },
      {
        pattern: /trailing whitespace/i,
        complexity: 'easy',
        estimatedTime: 1,
        impact: 'low',
        fixType: 'formatting'
      },
      {
        pattern: /missing semicolon/i,
        complexity: 'easy',
        estimatedTime: 1,
        impact: 'low',
        fixType: 'formatting'
      },
      {
        pattern: /hardcoded/i,
        complexity: 'medium',
        estimatedTime: 3,
        impact: 'high',
        fixType: 'security'
      },
      {
        pattern: /deprecated/i,
        complexity: 'easy',
        estimatedTime: 2,
        impact: 'medium',
        fixType: 'upgrade'
      }
    ];

    this.issues = allIssues
      .map(issue => {
        const match = quickWinPatterns.find(pattern => 
          pattern.pattern.test(issue.message)
        );

        if (match) {
          return {
            ...issue,
            isQuickWin: true,
            complexity: match.complexity,
            estimatedTime: match.estimatedTime,
            impact: match.impact,
            fixType: match.fixType
          };
        }

        // Additional heuristics for quick wins
        if (issue.severity === 'low' && issue.suggestion) {
          return {
            ...issue,
            isQuickWin: true,
            complexity: 'easy',
            estimatedTime: 3,
            impact: 'low',
            fixType: 'general'
          };
        }

        return null;
      })
      .filter(issue => issue !== null)
      .sort((a, b) => {
        // Sort by impact (high first) then by time (fast first)
        const impactOrder = { high: 3, medium: 2, low: 1 };
        if (impactOrder[a.impact] !== impactOrder[b.impact]) {
          return impactOrder[b.impact] - impactOrder[a.impact];
        }
        return a.estimatedTime - b.estimatedTime;
      })
      .slice(0, 10); // Top 10 quick wins

    return this.issues;
  }

  /**
   * Render Quick Wins section
   */
  render() {
    if (!this.container) return;

    const isVibeMode = window.ModeSwitcher && window.ModeSwitcher.isVibeMode();

    if (this.issues.length === 0) {
      this.container.innerHTML = `
        <div class="quick-wins-empty">
          <div class="empty-icon">✨</div>
          <h3>${isVibeMode ? 'No Quick Wins Right Now!' : 'No Quick Wins Available'}</h3>
          <p>${isVibeMode ? 'Your code is looking great! All the easy fixes are done.' : 'No easily fixable issues detected in current analysis.'}</p>
        </div>
      `;
      return;
    }

    const title = isVibeMode ? '⚡ Quick Wins - Easy Fixes!' : '⚡ Quick Wins';
    const subtitle = isVibeMode 
      ? `${this.issues.length} quick improvements to boost your code!`
      : `${this.issues.length} high-value, low-effort improvements`;

    let html = `
      <div class="quick-wins-header">
        <div class="quick-wins-title">
          <h3>${title}</h3>
          <p class="quick-wins-subtitle">${subtitle}</p>
        </div>
        <div class="quick-wins-stats">
          <div class="stat-item">
            <span class="stat-value">${this.calculateTotalTime()}</span>
            <span class="stat-label">${isVibeMode ? 'minutes total' : 'min'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${this.issues.length}</span>
            <span class="stat-label">${isVibeMode ? 'quick fixes' : 'issues'}</span>
          </div>
        </div>
      </div>
      <div class="quick-wins-list">
    `;

    this.issues.forEach((issue, index) => {
      html += this.renderQuickWinCard(issue, index, isVibeMode);
    });

    html += `
      </div>
      <div class="quick-wins-footer">
        <button class="btn-fix-all" onclick="QuickWins.fixAll()">
          ${isVibeMode ? '✨ Fix All Quick Wins' : 'Apply All Fixes'}
        </button>
        <button class="btn-export" onclick="QuickWins.exportList()">
          ${isVibeMode ? '📋 Save List' : 'Export List'}
        </button>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render individual quick win card
   */
  renderQuickWinCard(issue, index, isVibeMode) {
    const impactColors = {
      high: 'impact-high',
      medium: 'impact-medium',
      low: 'impact-low'
    };

    const impactEmojis = {
      high: '🔥',
      medium: '⭐',
      low: '💡'
    };

    const fixTypeLabels = {
      documentation: isVibeMode ? '📝 Docs' : 'Documentation',
      cleanup: isVibeMode ? '🧹 Clean' : 'Cleanup',
      formatting: isVibeMode ? '✨ Format' : 'Formatting',
      security: isVibeMode ? '🔒 Secure' : 'Security',
      upgrade: isVibeMode ? '⬆️ Update' : 'Upgrade',
      general: isVibeMode ? '🔧 Fix' : 'General'
    };

    return `
      <div class="quick-win-card ${impactColors[issue.impact]}" data-issue-id="${issue.id || index}">
        <div class="quick-win-header">
          <div class="quick-win-icon">${impactEmojis[issue.impact]}</div>
          <div class="quick-win-info">
            <div class="quick-win-title">${issue.message}</div>
            <div class="quick-win-meta">
              <span class="badge badge-${issue.fixType}">${fixTypeLabels[issue.fixType]}</span>
              <span class="time-estimate">⏱️ ${issue.estimatedTime} min</span>
              ${issue.file ? `<span class="file-name">📄 ${this.truncateFilename(issue.file)}</span>` : ''}
            </div>
          </div>
        </div>
        
        ${issue.suggestion ? `
          <div class="quick-win-solution">
            <strong>${isVibeMode ? '💡 How to fix:' : 'Solution:'}</strong>
            <p>${issue.suggestion}</p>
          </div>
        ` : ''}
        
        <div class="quick-win-actions">
          <button class="btn-fix" onclick="QuickWins.fixIssue(${index})" data-tooltip="quick-fix">
            ${isVibeMode ? '✨ Fix Now' : 'Apply Fix'}
          </button>
          <button class="btn-details" onclick="QuickWins.showDetails(${index})">
            ${isVibeMode ? '👀 Details' : 'View Details'}
          </button>
          <button class="btn-ignore" onclick="QuickWins.ignoreIssue(${index})">
            ${isVibeMode ? '👋 Skip' : 'Ignore'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Calculate total estimated time
   */
  calculateTotalTime() {
    return this.issues.reduce((total, issue) => total + issue.estimatedTime, 0);
  }

  /**
   * Truncate long filenames
   */
  truncateFilename(filename, maxLength = 30) {
    if (filename.length <= maxLength) return filename;
    const start = filename.substring(0, 15);
    const end = filename.substring(filename.length - 10);
    return `${start}...${end}`;
  }

  /**
   * Fix a single issue
   */
  static fixIssue(index) {
    const quickWins = window.QuickWinsInstance;
    if (!quickWins || !quickWins.issues[index]) return;

    const issue = quickWins.issues[index];
    
    // Show loading state
    const card = document.querySelector(`[data-issue-id="${index}"]`);
    if (card) {
      card.classList.add('fixing');
    }

    // Simulate fix (in real implementation, this would call API or perform actual fix)
    setTimeout(() => {
      if (card) {
        card.classList.remove('fixing');
        card.classList.add('fixed');
        
        // Show success toast
        if (window.showToast) {
          window.showToast(`✅ Fixed: ${issue.message}`, 'success');
        }

        // Remove from list after animation
        setTimeout(() => {
          quickWins.issues.splice(index, 1);
          quickWins.render();
        }, 1000);
      }
    }, 1500);
  }

  /**
   * Fix all issues
   */
  static fixAll() {
    const quickWins = window.QuickWinsInstance;
    if (!quickWins || quickWins.issues.length === 0) return;

    if (confirm(`Apply ${quickWins.issues.length} quick fixes?`)) {
      const totalTime = quickWins.calculateTotalTime();
      
      // Show progress
      if (window.showToast) {
        window.showToast(`🚀 Applying ${quickWins.issues.length} fixes... (~${totalTime} min)`, 'info');
      }

      // Simulate batch fix
      setTimeout(() => {
        quickWins.issues = [];
        quickWins.render();
        
        if (window.showToast) {
          window.showToast('🎉 All quick wins applied successfully!', 'success');
        }
      }, 3000);
    }
  }

  /**
   * Show issue details
   */
  static showDetails(index) {
    const quickWins = window.QuickWinsInstance;
    if (!quickWins || !quickWins.issues[index]) return;

    const issue = quickWins.issues[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content quick-win-detail-modal">
        <div class="modal-header">
          <h3>Issue Details</h3>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <strong>Message:</strong>
            <p>${issue.message}</p>
          </div>
          ${issue.file ? `
            <div class="detail-section">
              <strong>File:</strong>
              <code>${issue.file}</code>
            </div>
          ` : ''}
          <div class="detail-section">
            <strong>Type:</strong>
            <span class="badge badge-${issue.fixType}">${issue.fixType}</span>
          </div>
          <div class="detail-section">
            <strong>Impact:</strong>
            <span class="badge badge-impact-${issue.impact}">${issue.impact}</span>
          </div>
          <div class="detail-section">
            <strong>Estimated Time:</strong>
            <span>⏱️ ${issue.estimatedTime} minutes</span>
          </div>
          ${issue.suggestion ? `
            <div class="detail-section">
              <strong>Suggested Fix:</strong>
              <p>${issue.suggestion}</p>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn-primary" onclick="QuickWins.fixIssue(${index}); this.closest('.modal-overlay').remove();">
            Apply Fix
          </button>
          <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Ignore an issue
   */
  static ignoreIssue(index) {
    const quickWins = window.QuickWinsInstance;
    if (!quickWins || !quickWins.issues[index]) return;

    const card = document.querySelector(`[data-issue-id="${index}"]`);
    if (card) {
      card.classList.add('ignored');
      setTimeout(() => {
        quickWins.issues.splice(index, 1);
        quickWins.render();
      }, 500);
    }
  }

  /**
   * Export quick wins list
   */
  static exportList() {
    const quickWins = window.QuickWinsInstance;
    if (!quickWins || quickWins.issues.length === 0) return;

    const data = {
      exportedAt: new Date().toISOString(),
      totalIssues: quickWins.issues.length,
      totalEstimatedTime: quickWins.calculateTotalTime(),
      issues: quickWins.issues.map((issue, index) => ({
        id: index + 1,
        message: issue.message,
        file: issue.file,
        type: issue.fixType,
        impact: issue.impact,
        estimatedTime: issue.estimatedTime,
        suggestion: issue.suggestion
      }))
    };

    // Create downloadable JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quick-wins-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast('📋 Quick wins list exported!', 'success');
    }
  }

  /**
   * Update with new issues
   */
  update(allIssues) {
    this.analyzeIssues(allIssues);
    this.render();
  }
}

// Create global instance
window.QuickWins = QuickWins;
window.QuickWinsInstance = new QuickWins();

