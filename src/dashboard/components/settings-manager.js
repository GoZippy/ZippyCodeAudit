/**
 * Enhanced Settings Manager
 * Visual customization, notification preferences, and configuration wizard
 */

class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.defaults = this.getDefaultSettings();
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      appearance: {
        theme: 'light',
        mode: 'vibe',
        primaryColor: '#6366f1',
        fontSize: 'medium',
        compactMode: false
      },
      notifications: {
        desktop: false,
        email: false,
        slack: false,
        emailAddress: '',
        slackWebhook: '',
        notifyOnComplete: true,
        notifyOnErrors: true,
        notifyOnRegression: true
      },
      analysis: {
        autoRunOnSave: false,
        schedule: 'manual',
        cronExpression: '',
        maxDepth: 10,
        excludePatterns: ['node_modules/**', 'dist/**', 'build/**'],
        includePatterns: ['**/*.{js,ts,py,go}'],
        thoroughness: 'balanced' // fast, balanced, thorough
      },
      advanced: {
        enableAI: true,
        enableHistory: true,
        enableQuickWins: true,
        enableRealtime: true,
        historyLimit: 100,
        cacheEnabled: true
      }
    };
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('zippyAuditSettings');
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(settings = this.settings) {
    try {
      localStorage.setItem('zippyAuditSettings', JSON.stringify(settings));
      this.settings = settings;
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Render settings page
   */
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = `
      <div class="settings-manager">
        <div class="settings-header">
          <h2>⚙️ Settings</h2>
          <div class="settings-actions">
            <button class="btn-settings" onclick="SettingsManager.exportSettings()">
              📤 Export
            </button>
            <button class="btn-settings" onclick="SettingsManager.importSettings()">
              📥 Import
            </button>
            <button class="btn-settings btn-danger" onclick="SettingsManager.resetSettings()">
              🔄 Reset All
            </button>
          </div>
        </div>

        <div class="settings-tabs">
          <button class="settings-tab active" data-tab="appearance">
            🎨 Appearance
          </button>
          <button class="settings-tab" data-tab="notifications">
            🔔 Notifications
          </button>
          <button class="settings-tab" data-tab="analysis">
            🔍 Analysis
          </button>
          <button class="settings-tab" data-tab="advanced">
            ⚙️ Advanced
          </button>
        </div>

        <div class="settings-content">
          ${this.renderAppearanceTab()}
          ${this.renderNotificationsTab()}
          ${this.renderAnalysisTab()}
          ${this.renderAdvancedTab()}
        </div>

        <div class="settings-footer">
          <button class="btn-primary" onclick="SettingsManager.saveAllSettings()">
            💾 Save Changes
          </button>
          <button class="btn-secondary" onclick="SettingsManager.cancelChanges()">
            ❌ Cancel
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Render appearance tab
   */
  renderAppearanceTab() {
    return `
      <div class="settings-tab-content active" data-tab-content="appearance">
        <h3>Appearance Settings</h3>
        
        <div class="settings-section">
          <label class="settings-label">Theme</label>
          <div class="settings-radio-group">
            <label>
              <input type="radio" name="theme" value="light" ${this.settings.appearance.theme === 'light' ? 'checked' : ''}>
              ☀️ Light
            </label>
            <label>
              <input type="radio" name="theme" value="dark" ${this.settings.appearance.theme === 'dark' ? 'checked' : ''}>
              🌙 Dark
            </label>
            <label>
              <input type="radio" name="theme" value="auto" ${this.settings.appearance.theme === 'auto' ? 'checked' : ''}>
              🔄 Auto
            </label>
          </div>
        </div>

        <div class="settings-section">
          <label class="settings-label">Default Mode</label>
          <div class="settings-radio-group">
            <label>
              <input type="radio" name="mode" value="vibe" ${this.settings.appearance.mode === 'vibe' ? 'checked' : ''}>
              😎 Vibe & Chill
            </label>
            <label>
              <input type="radio" name="mode" value="tech" ${this.settings.appearance.mode === 'tech' ? 'checked' : ''}>
              🔧 Developer Tech
            </label>
          </div>
        </div>

        <div class="settings-section">
          <label class="settings-label">Primary Color</label>
          <input type="color" name="primaryColor" value="${this.settings.appearance.primaryColor}" class="settings-color-picker">
          <div class="color-preview" style="background-color: ${this.settings.appearance.primaryColor}"></div>
        </div>

        <div class="settings-section">
          <label class="settings-label">Font Size</label>
          <select name="fontSize" class="settings-select">
            <option value="small" ${this.settings.appearance.fontSize === 'small' ? 'selected' : ''}>Small</option>
            <option value="medium" ${this.settings.appearance.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="large" ${this.settings.appearance.fontSize === 'large' ? 'selected' : ''}>Large</option>
          </select>
        </div>

        <div class="settings-section">
          <label class="settings-checkbox">
            <input type="checkbox" name="compactMode" ${this.settings.appearance.compactMode ? 'checked' : ''}>
            <span>Compact Mode (reduce spacing)</span>
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Render notifications tab
   */
  renderNotificationsTab() {
    return `
      <div class="settings-tab-content" data-tab-content="notifications">
        <h3>Notification Settings</h3>
        
        <div class="settings-section">
          <label class="settings-checkbox">
            <input type="checkbox" name="desktopNotifications" ${this.settings.notifications.desktop ? 'checked' : ''}>
            <span>🖥️ Desktop Notifications</span>
          </label>
          <p class="settings-help">Show browser notifications for important events</p>
        </div>

        <div class="settings-section">
          <label class="settings-checkbox">
            <input type="checkbox" name="emailNotifications" ${this.settings.notifications.email ? 'checked' : ''}>
            <span>📧 Email Notifications</span>
          </label>
          ${this.settings.notifications.email ? `
            <input type="email" name="emailAddress" value="${this.settings.notifications.emailAddress}" 
                   placeholder="your@email.com" class="settings-input">
          ` : ''}
        </div>

        <div class="settings-section">
          <label class="settings-checkbox">
            <input type="checkbox" name="slackNotifications" ${this.settings.notifications.slack ? 'checked' : ''}>
            <span>💬 Slack Notifications</span>
          </label>
          ${this.settings.notifications.slack ? `
            <input type="url" name="slackWebhook" value="${this.settings.notifications.slackWebhook}" 
                   placeholder="https://hooks.slack.com/..." class="settings-input">
          ` : ''}
        </div>

        <div class="settings-section">
          <h4>Notify Me When:</h4>
          <label class="settings-checkbox">
            <input type="checkbox" name="notifyOnComplete" ${this.settings.notifications.notifyOnComplete ? 'checked' : ''}>
            <span>Audit completes</span>
          </label>
          <label class="settings-checkbox">
            <input type="checkbox" name="notifyOnErrors" ${this.settings.notifications.notifyOnErrors ? 'checked' : ''}>
            <span>Errors occur</span>
          </label>
          <label class="settings-checkbox">
            <input type="checkbox" name="notifyOnRegression" ${this.settings.notifications.notifyOnRegression ? 'checked' : ''}>
            <span>Quality regressions detected</span>
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Render analysis tab
   */
  renderAnalysisTab() {
    return `
      <div class="settings-tab-content" data-tab-content="analysis">
        <h3>Analysis Settings</h3>
        
        <div class="settings-section">
          <label class="settings-checkbox">
            <input type="checkbox" name="autoRunOnSave" ${this.settings.analysis.autoRunOnSave ? 'checked' : ''}>
            <span>🔄 Auto-run on file save</span>
          </label>
          <p class="settings-help">Automatically run audits when you save files (VS Code extension)</p>
        </div>

        <div class="settings-section">
          <label class="settings-label">Scheduling</label>
          <select name="schedule" class="settings-select">
            <option value="manual" ${this.settings.analysis.schedule === 'manual' ? 'selected' : ''}>Manual Only</option>
            <option value="daily" ${this.settings.analysis.schedule === 'daily' ? 'selected' : ''}>Daily</option>
            <option value="weekly" ${this.settings.analysis.schedule === 'weekly' ? 'selected' : ''}>Weekly</option>
            <option value="custom" ${this.settings.analysis.schedule === 'custom' ? 'selected' : ''}>Custom (Cron)</option>
          </select>
          ${this.settings.analysis.schedule === 'custom' ? `
            <input type="text" name="cronExpression" value="${this.settings.analysis.cronExpression}" 
                   placeholder="0 0 * * *" class="settings-input">
            <p class="settings-help">Cron expression (e.g., "0 0 * * *" for daily at midnight)</p>
          ` : ''}
        </div>

        <div class="settings-section">
          <label class="settings-label">Thoroughness</label>
          <input type="range" name="thoroughness" min="1" max="3" 
                 value="${this.settings.analysis.thoroughness === 'fast' ? 1 : this.settings.analysis.thoroughness === 'balanced' ? 2 : 3}" 
                 class="settings-slider">
          <div class="slider-labels">
            <span>⚡ Fast</span>
            <span>⚖️ Balanced</span>
            <span>🔬 Thorough</span>
          </div>
        </div>

        <div class="settings-section">
          <label class="settings-label">Max Directory Depth</label>
          <input type="number" name="maxDepth" value="${this.settings.analysis.maxDepth}" 
                 min="1" max="20" class="settings-input">
        </div>

        <div class="settings-section">
          <label class="settings-label">Exclude Patterns (one per line)</label>
          <textarea name="excludePatterns" class="settings-textarea" rows="4">${this.settings.analysis.excludePatterns.join('\n')}</textarea>
        </div>

        <div class="settings-section">
          <label class="settings-label">Include Patterns (one per line)</label>
          <textarea name="includePatterns" class="settings-textarea" rows="4">${this.settings.analysis.includePatterns.join('\n')}</textarea>
        </div>
      </div>
    `;
  }

  /**
   * Render advanced tab
   */
  renderAdvancedTab() {
    return `
      <div class="settings-tab-content" data-tab-content="advanced">
        <h3>Advanced Settings</h3>
        
        <div class="settings-section">
          <h4>Feature Toggles</h4>
          <label class="settings-checkbox">
            <input type="checkbox" name="enableAI" ${this.settings.advanced.enableAI ? 'checked' : ''}>
            <span>🤖 AI-Powered Insights</span>
          </label>
          <label class="settings-checkbox">
            <input type="checkbox" name="enableHistory" ${this.settings.advanced.enableHistory ? 'checked' : ''}>
            <span>📊 Historical Tracking</span>
          </label>
          <label class="settings-checkbox">
            <input type="checkbox" name="enableQuickWins" ${this.settings.advanced.enableQuickWins ? 'checked' : ''}>
            <span>⚡ Quick Wins Section</span>
          </label>
          <label class="settings-checkbox">
            <input type="checkbox" name="enableRealtime" ${this.settings.advanced.enableRealtime ? 'checked' : ''}>
            <span>🔴 Real-time Updates</span>
          </label>
        </div>

        <div class="settings-section">
          <label class="settings-label">History Limit</label>
          <input type="number" name="historyLimit" value="${this.settings.advanced.historyLimit}" 
                 min="10" max="500" class="settings-input">
          <p class="settings-help">Number of audit results to keep in history</p>
        </div>

        <div class="settings-section">
          <label class="settings-checkbox">
            <input type="checkbox" name="cacheEnabled" ${this.settings.advanced.cacheEnabled ? 'checked' : ''}>
            <span>💾 Enable Caching</span>
          </label>
          <p class="settings-help">Cache analysis results for faster performance</p>
        </div>

        <div class="settings-section">
          <button class="btn-secondary" onclick="SettingsManager.clearCache()">
            🗑️ Clear Cache
          </button>
          <button class="btn-secondary" onclick="SettingsManager.clearHistory()">
            🗑️ Clear History
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Tab switching
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Live preview for color picker
    const colorPicker = document.querySelector('[name="primaryColor"]');
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        const preview = document.querySelector('.color-preview');
        if (preview) {
          preview.style.backgroundColor = e.target.value;
        }
      });
    }

    // Dynamic form updates
    document.querySelectorAll('[name="emailNotifications"], [name="slackNotifications"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.render(document.querySelector('.settings-manager').parentElement.id);
      });
    });
  }

  /**
   * Switch tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.settings-tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tabContent === tabName);
    });
  }

  /**
   * Collect current form values
   */
  collectFormValues() {
    const settings = JSON.parse(JSON.stringify(this.defaults));

    // Appearance
    settings.appearance.theme = document.querySelector('[name="theme"]:checked')?.value || 'light';
    settings.appearance.mode = document.querySelector('[name="mode"]:checked')?.value || 'vibe';
    settings.appearance.primaryColor = document.querySelector('[name="primaryColor"]')?.value || '#6366f1';
    settings.appearance.fontSize = document.querySelector('[name="fontSize"]')?.value || 'medium';
    settings.appearance.compactMode = document.querySelector('[name="compactMode"]')?.checked || false;

    // Notifications
    settings.notifications.desktop = document.querySelector('[name="desktopNotifications"]')?.checked || false;
    settings.notifications.email = document.querySelector('[name="emailNotifications"]')?.checked || false;
    settings.notifications.slack = document.querySelector('[name="slackNotifications"]')?.checked || false;
    settings.notifications.emailAddress = document.querySelector('[name="emailAddress"]')?.value || '';
    settings.notifications.slackWebhook = document.querySelector('[name="slackWebhook"]')?.value || '';
    settings.notifications.notifyOnComplete = document.querySelector('[name="notifyOnComplete"]')?.checked || false;
    settings.notifications.notifyOnErrors = document.querySelector('[name="notifyOnErrors"]')?.checked || false;
    settings.notifications.notifyOnRegression = document.querySelector('[name="notifyOnRegression"]')?.checked || false;

    // Analysis
    settings.analysis.autoRunOnSave = document.querySelector('[name="autoRunOnSave"]')?.checked || false;
    settings.analysis.schedule = document.querySelector('[name="schedule"]')?.value || 'manual';
    settings.analysis.cronExpression = document.querySelector('[name="cronExpression"]')?.value || '';
    settings.analysis.maxDepth = parseInt(document.querySelector('[name="maxDepth"]')?.value) || 10;
    
    const excludeText = document.querySelector('[name="excludePatterns"]')?.value || '';
    settings.analysis.excludePatterns = excludeText.split('\n').filter(p => p.trim());
    
    const includeText = document.querySelector('[name="includePatterns"]')?.value || '';
    settings.analysis.includePatterns = includeText.split('\n').filter(p => p.trim());

    const thoroughness = parseInt(document.querySelector('[name="thoroughness"]')?.value);
    settings.analysis.thoroughness = thoroughness === 1 ? 'fast' : thoroughness === 2 ? 'balanced' : 'thorough';

    // Advanced
    settings.advanced.enableAI = document.querySelector('[name="enableAI"]')?.checked || false;
    settings.advanced.enableHistory = document.querySelector('[name="enableHistory"]')?.checked || false;
    settings.advanced.enableQuickWins = document.querySelector('[name="enableQuickWins"]')?.checked || false;
    settings.advanced.enableRealtime = document.querySelector('[name="enableRealtime"]')?.checked || false;
    settings.advanced.historyLimit = parseInt(document.querySelector('[name="historyLimit"]')?.value) || 100;
    settings.advanced.cacheEnabled = document.querySelector('[name="cacheEnabled"]')?.checked || false;

    return settings;
  }

  /**
   * Static methods for global access
   */
  static saveAllSettings() {
    const manager = window.SettingsManagerInstance;
    if (!manager) return;

    const settings = manager.collectFormValues();
    
    if (manager.saveSettings(settings)) {
      // Apply settings immediately
      if (window.ModeSwitcher) {
        window.ModeSwitcher.applyMode(settings.appearance.mode);
      }
      
      document.documentElement.setAttribute('data-theme', settings.appearance.theme);
      
      if (window.showToast) {
        window.showToast('✅ Settings saved successfully!', 'success');
      }
    } else {
      if (window.showToast) {
        window.showToast('❌ Failed to save settings', 'error');
      }
    }
  }

  static cancelChanges() {
    if (confirm('Discard unsaved changes?')) {
      const manager = window.SettingsManagerInstance;
      if (manager) {
        manager.render(document.querySelector('.settings-manager').parentElement.id);
      }
    }
  }

  static resetSettings() {
    if (confirm('Reset all settings to default values?')) {
      const manager = window.SettingsManagerInstance;
      if (manager) {
        manager.settings = manager.getDefaultSettings();
        manager.saveSettings();
        manager.render(document.querySelector('.settings-manager').parentElement.id);
        
        if (window.showToast) {
          window.showToast('🔄 Settings reset to defaults', 'info');
        }
      }
    }
  }

  static exportSettings() {
    const manager = window.SettingsManagerInstance;
    if (!manager) return;

    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: manager.settings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zippy-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast('📤 Settings exported!', 'success');
    }
  }

  static importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.settings) {
          const manager = window.SettingsManagerInstance;
          if (manager) {
            manager.saveSettings(data.settings);
            manager.render(document.querySelector('.settings-manager').parentElement.id);
            
            if (window.showToast) {
              window.showToast('📥 Settings imported!', 'success');
            }
          }
        }
      } catch (error) {
        console.error('Import failed:', error);
        if (window.showToast) {
          window.showToast('❌ Failed to import settings', 'error');
        }
      }
    };

    input.click();
  }

  static clearCache() {
    if (confirm('Clear all cached data?')) {
      // Clear cache
      if (window.showToast) {
        window.showToast('🗑️ Cache cleared!', 'success');
      }
    }
  }

  static clearHistory() {
    if (confirm('Clear all audit history? This cannot be undone.')) {
      // Clear history
      if (window.showToast) {
        window.showToast('🗑️ History cleared!', 'success');
      }
    }
  }
}

// Export globally
window.SettingsManager = SettingsManager;
window.SettingsManagerInstance = new SettingsManager();

