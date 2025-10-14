/**
 * Tooltip Manager
 * Provides contextual help and explanations throughout the dashboard
 */

class TooltipManager {
  constructor() {
    this.tooltips = new Map();
    this.activeTooltip = null;
    this.tooltipContent = this.getTooltipDefinitions();
  }

  /**
   * Initialize tooltip system
   */
  init() {
    this.setupTooltipElements();
    this.setupEventListeners();
    this.injectStyles();
  }

  /**
   * Setup tooltip elements
   */
  setupTooltipElements() {
    // Find all elements with data-tooltip attribute
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      this.attachTooltip(element);
    });

    // Setup info icons
    document.querySelectorAll('.info-icon, [data-help]').forEach(element => {
      this.attachHelpIcon(element);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Global click handler to close tooltips
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tooltip') && !e.target.closest('[data-tooltip]')) {
        this.hideAllTooltips();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAllTooltips();
      }
    });
  }

  /**
   * Attach tooltip to element
   */
  attachTooltip(element) {
    const tooltipKey = element.getAttribute('data-tooltip');
    const content = this.tooltipContent[tooltipKey] || tooltipKey;
    
    element.classList.add('has-tooltip');
    
    // Mouse events
    element.addEventListener('mouseenter', (e) => {
      this.showTooltip(e.target, content);
    });
    
    element.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });

    // Touch events for mobile
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.showTooltip(e.target, content);
    });
  }

  /**
   * Attach help icon to element
   */
  attachHelpIcon(element) {
    const helpKey = element.getAttribute('data-help');
    const content = this.tooltipContent[helpKey] || helpKey;
    
    // Create help icon if it doesn't exist
    if (!element.querySelector('.help-icon-btn')) {
      const helpIcon = document.createElement('button');
      helpIcon.className = 'help-icon-btn';
      helpIcon.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `;
      helpIcon.setAttribute('aria-label', 'Help');
      helpIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showTooltip(helpIcon, content, true);
      });
      element.appendChild(helpIcon);
    }
  }

  /**
   * Show tooltip
   */
  showTooltip(element, content, persistent = false) {
    // Hide existing tooltip
    this.hideTooltip();

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip' + (persistent ? ' tooltip-persistent' : '');
    
    // Parse content
    const parsedContent = this.parseContent(content);
    tooltip.innerHTML = `
      <div class="tooltip-content">
        ${parsedContent.title ? `<div class="tooltip-title">${parsedContent.title}</div>` : ''}
        <div class="tooltip-body">${parsedContent.body}</div>
        ${parsedContent.learnMore ? `<a href="${parsedContent.learnMore}" class="tooltip-learn-more" target="_blank">Learn more →</a>` : ''}
      </div>
      ${persistent ? '<button class="tooltip-close" aria-label="Close">×</button>' : ''}
    `;

    // Position tooltip
    document.body.appendChild(tooltip);
    this.positionTooltip(tooltip, element);

    // Setup close button for persistent tooltips
    if (persistent) {
      const closeBtn = tooltip.querySelector('.tooltip-close');
      closeBtn.addEventListener('click', () => this.hideTooltip());
    }

    this.activeTooltip = tooltip;
    
    // Animate in
    setTimeout(() => tooltip.classList.add('show'), 10);
  }

  /**
   * Hide active tooltip
   */
  hideTooltip() {
    if (this.activeTooltip) {
      this.activeTooltip.classList.remove('show');
      setTimeout(() => {
        if (this.activeTooltip && this.activeTooltip.parentNode) {
          this.activeTooltip.remove();
        }
        this.activeTooltip = null;
      }, 200);
    }
  }

  /**
   * Hide all tooltips
   */
  hideAllTooltips() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
      tooltip.classList.remove('show');
      setTimeout(() => tooltip.remove(), 200);
    });
    this.activeTooltip = null;
  }

  /**
   * Position tooltip relative to element
   */
  positionTooltip(tooltip, element) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);

    // Adjust if tooltip goes off screen
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    // If tooltip would go below viewport, show above element
    if (rect.bottom + tooltipRect.height + 8 > window.innerHeight) {
      top = rect.top + window.scrollY - tooltipRect.height - 8;
      tooltip.classList.add('tooltip-top');
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  /**
   * Parse content (can be string or object)
   */
  parseContent(content) {
    if (typeof content === 'string') {
      return { body: content };
    }
    return content;
  }

  /**
   * Inject tooltip styles
   */
  injectStyles() {
    if (document.getElementById('tooltip-styles')) return;

    const style = document.createElement('style');
    style.id = 'tooltip-styles';
    style.textContent = `
      .has-tooltip {
        position: relative;
        cursor: help;
      }

      .help-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        margin-left: 6px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
        vertical-align: middle;
      }

      .help-icon-btn:hover {
        opacity: 1;
        color: var(--primary-color);
      }

      .tooltip {
        position: absolute;
        z-index: 10000;
        max-width: 320px;
        padding: 12px 16px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-lg);
        font-size: var(--font-size-sm);
        line-height: 1.5;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 0.2s, transform 0.2s;
        pointer-events: none;
      }

      .tooltip.show {
        opacity: 1;
        transform: translateY(0);
      }

      .tooltip.tooltip-persistent {
        pointer-events: auto;
      }

      .tooltip-content {
        color: var(--text-primary);
      }

      .tooltip-title {
        font-weight: 600;
        font-size: var(--font-size-sm);
        margin-bottom: 6px;
        color: var(--text-primary);
      }

      .tooltip-body {
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .tooltip-learn-more {
        display: inline-block;
        margin-top: 8px;
        color: var(--primary-color);
        text-decoration: none;
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .tooltip-learn-more:hover {
        text-decoration: underline;
      }

      .tooltip-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
      }

      .tooltip-close:hover {
        opacity: 1;
      }

      .tooltip::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid var(--bg-card);
        filter: drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.05));
      }

      .tooltip.tooltip-top::before {
        top: 100%;
        bottom: auto;
        border-bottom: none;
        border-top: 6px solid var(--bg-card);
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));
      }

      @media (max-width: 768px) {
        .tooltip {
          max-width: calc(100vw - 32px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get tooltip definitions
   */
  getTooltipDefinitions() {
    return {
      'health-score': {
        title: 'Project Health Score',
        body: 'A score from 0-100 indicating overall code quality. Higher scores mean fewer issues and better maintainability.',
        learnMore: '#'
      },
      'total-files': {
        title: 'Files Analyzed',
        body: 'The total number of files scanned during the audit, excluding node_modules and other ignored directories.',
      },
      'total-issues': {
        title: 'Issues Found',
        body: 'The number of potential problems detected, including security vulnerabilities, code quality issues, and style violations.',
      },
      'completed-tasks': {
        title: 'Completed Tasks',
        body: 'Tasks you\'ve marked as done from audit findings. Track your progress in fixing issues!',
      },
      'security-issues': {
        title: 'Security Issues',
        body: 'Potential security vulnerabilities like exposed secrets, insecure dependencies, or unsafe code patterns.',
        learnMore: '#'
      },
      'performance-issues': {
        title: 'Performance Issues',
        body: 'Code patterns that may slow down your application, like large files, inefficient algorithms, or resource-heavy operations.',
      },
      'maintainability-issues': {
        title: 'Maintainability Issues',
        body: 'Code complexity, deep nesting, lack of documentation, and other factors that make code harder to maintain.',
      },
      'quick-wins': {
        title: 'Quick Wins',
        body: 'Easy fixes that take less than 5 minutes but improve code quality. Great place to start!',
      },
      'vibe-mode': {
        title: '😎 Vibe & Chill Mode',
        body: 'Simplified interface with friendly language and helpful guidance. Perfect for beginners or quick checks.',
      },
      'tech-mode': {
        title: '🔧 Developer Tech Mode',
        body: 'Advanced interface with detailed metrics, raw data, and power user features. For in-depth analysis.',
      },
      'auto-refresh': {
        title: 'Auto Refresh',
        body: 'Automatically reload dashboard data at regular intervals to stay up-to-date with the latest audit results.',
      },
      'export-data': {
        title: 'Export Data',
        body: 'Download audit results in various formats (JSON, CSV, Markdown) for reporting or external analysis.',
      }
    };
  }

  /**
   * Add new tooltip definition
   */
  addTooltip(key, content) {
    this.tooltipContent[key] = content;
  }

  /**
   * Update tooltip definition
   */
  updateTooltip(key, content) {
    this.tooltipContent[key] = content;
  }
}

// Export singleton instance
window.TooltipManager = window.TooltipManager || new TooltipManager();

