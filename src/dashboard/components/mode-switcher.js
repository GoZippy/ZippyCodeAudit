/**
 * Mode Switcher Component
 * Manages "Vibe & Chill" vs "Developer Tech" modes
 */

class ModeSwitcher {
  constructor() {
    this.currentMode = localStorage.getItem('userMode') || 'vibe';
    this.callbacks = [];
  }

  /**
   * Initialize the mode switcher
   */
  init() {
    this.applyMode(this.currentMode);
    this.setupModeToggle();
  }

  /**
   * Set up the mode toggle UI
   */
  setupModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    if (!modeToggle) return;

    // Update toggle state
    this.updateToggleUI(modeToggle);

    // Handle mode changes
    modeToggle.addEventListener('click', () => {
      this.toggleMode();
    });
  }

  /**
   * Toggle between modes
   */
  toggleMode() {
    this.currentMode = this.currentMode === 'vibe' ? 'tech' : 'vibe';
    this.applyMode(this.currentMode);
    localStorage.setItem('userMode', this.currentMode);
    
    // Notify listeners
    this.callbacks.forEach(callback => callback(this.currentMode));
    
    // Update UI
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
      this.updateToggleUI(modeToggle);
    }

    // Show transition toast
    this.showModeTransition();
  }

  /**
   * Update toggle button UI
   */
  updateToggleUI(toggleElement) {
    const isVibe = this.currentMode === 'vibe';
    toggleElement.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${isVibe ? 
          '<path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="4"/>' :
          '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
        }
      </svg>
      <span>${isVibe ? '😎 Vibe & Chill' : '🔧 Developer Tech'}</span>
    `;
    toggleElement.setAttribute('title', isVibe ? 'Switch to Developer Tech Mode' : 'Switch to Vibe & Chill Mode');
  }

  /**
   * Apply mode to the UI
   */
  applyMode(mode) {
    const body = document.body;
    
    // Remove existing mode classes
    body.classList.remove('mode-vibe', 'mode-tech');
    
    // Add new mode class
    body.classList.add(`mode-${mode}`);
    
    // Update UI elements based on mode
    this.updateUIForMode(mode);
  }

  /**
   * Update UI elements for specific mode
   */
  updateUIForMode(mode) {
    const isVibe = mode === 'vibe';
    
    // Show/hide mode-specific elements
    document.querySelectorAll('[data-mode-vibe]').forEach(el => {
      el.style.display = isVibe ? '' : 'none';
    });
    
    document.querySelectorAll('[data-mode-tech]').forEach(el => {
      el.style.display = isVibe ? 'none' : '';
    });
    
    // Update metric labels
    this.updateMetricLabels(mode);
    
    // Update complexity of displayed data
    this.updateDataComplexity(mode);
  }

  /**
   * Update metric labels based on mode
   */
  updateMetricLabels(mode) {
    const labels = {
      vibe: {
        totalFiles: '📁 Files Checked',
        totalIssues: '⚠️ Things to Fix',
        projectHealth: '❤️ Project Health',
        completedTasks: '✅ Fixed Items'
      },
      tech: {
        totalFiles: 'Total Files Analyzed',
        totalIssues: 'Issues Detected',
        projectHealth: 'Health Score',
        completedTasks: 'Completed Tasks'
      }
    };

    const currentLabels = labels[mode];
    Object.keys(currentLabels).forEach(key => {
      const labelElement = document.querySelector(`#${key} + .metric-label, .metric-label[data-metric="${key}"]`);
      if (labelElement) {
        labelElement.textContent = currentLabels[key];
      }
    });
  }

  /**
   * Update data complexity based on mode
   */
  updateDataComplexity(mode) {
    const isVibe = mode === 'vibe';
    
    // Simplified vs detailed views
    document.querySelectorAll('.data-simple').forEach(el => {
      el.style.display = isVibe ? 'block' : 'none';
    });
    
    document.querySelectorAll('.data-detailed').forEach(el => {
      el.style.display = isVibe ? 'none' : 'block';
    });
  }

  /**
   * Show mode transition notification
   */
  showModeTransition() {
    const toast = document.createElement('div');
    toast.className = 'mode-transition-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${this.currentMode === 'vibe' ? '😎' : '🔧'}</span>
        <span class="toast-text">
          Switched to <strong>${this.currentMode === 'vibe' ? 'Vibe & Chill' : 'Developer Tech'}</strong> mode
        </span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Register a callback for mode changes
   */
  onChange(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Check if in Vibe mode
   */
  isVibeMode() {
    return this.currentMode === 'vibe';
  }

  /**
   * Check if in Tech mode
   */
  isTechMode() {
    return this.currentMode === 'tech';
  }

  /**
   * Get mode-specific text
   */
  getModeText(vibeText, techText) {
    return this.currentMode === 'vibe' ? vibeText : techText;
  }

  /**
   * Get mode-specific format
   */
  formatValue(value, options = {}) {
    if (this.currentMode === 'vibe') {
      return this.formatVibeValue(value, options);
    } else {
      return this.formatTechValue(value, options);
    }
  }

  /**
   * Format value for Vibe mode (friendly, emoji-based)
   */
  formatVibeValue(value, options = {}) {
    const { type, threshold } = options;
    
    switch (type) {
      case 'health':
        if (value >= 90) return `${value}% 🎉 Awesome!`;
        if (value >= 75) return `${value}% 👍 Pretty Good`;
        if (value >= 60) return `${value}% 😐 Needs Work`;
        return `${value}% 😰 Needs Attention`;
      
      case 'count':
        if (value === 0) return '✨ None';
        if (value <= 5) return `${value} 👌 Just a few`;
        if (value <= 20) return `${value} 📝 Several`;
        return `${value} 📚 Quite a few`;
      
      case 'files':
        return `${value} file${value !== 1 ? 's' : ''} 📄`;
      
      default:
        return String(value);
    }
  }

  /**
   * Format value for Tech mode (precise, technical)
   */
  formatTechValue(value, options = {}) {
    const { type, unit, precision = 0 } = options;
    
    switch (type) {
      case 'percentage':
        return `${value.toFixed(precision)}%`;
      
      case 'count':
        return value.toLocaleString();
      
      case 'bytes':
        return this.formatBytes(value);
      
      case 'duration':
        return this.formatDuration(value);
      
      default:
        return unit ? `${value} ${unit}` : String(value);
    }
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format duration
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

// Export singleton instance
window.ModeSwitcher = window.ModeSwitcher || new ModeSwitcher();

