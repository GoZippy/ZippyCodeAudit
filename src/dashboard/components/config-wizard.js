/**
 * Configuration Wizard Component
 * Step-by-step configuration for audit settings
 */

class ConfigWizard {
  constructor(detectionResults, mode = 'vibe') {
    this.detection = detectionResults;
    this.mode = mode;
    this.currentStep = 1;
    this.totalSteps = 4;
    this.config = {};
  }

  /**
   * Show wizard
   */
  show(container, onComplete) {
    this.onComplete = onComplete;
    this.currentStep = 1;
    
    const wizard = this.createWizardElement();
    container.innerHTML = '';
    container.appendChild(wizard);
    
    this.renderStep(1);
  }

  /**
   * Create wizard element
   */
  createWizardElement() {
    const wizard = document.createElement('div');
    wizard.className = 'config-wizard-container';
    wizard.innerHTML = `
      <div class="wizard-overlay"></div>
      <div class="wizard-modal config-wizard">
        <div class="wizard-header">
          <h2>Configure Audit Settings</h2>
          <button class="wizard-close-btn" id="closeConfigWizard">&times;</button>
        </div>
        <div class="wizard-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 25%;"></div>
          </div>
          <div class="progress-label">Step <span id="currentStepNum">1</span> of ${this.totalSteps}</div>
        </div>
        <div class="wizard-content" id="configWizardContent">
          <!-- Content here -->
        </div>
        <div class="wizard-footer">
          <button class="btn-secondary" id="configWizardBack">Back</button>
          <button class="btn-primary" id="configWizardNext">Next</button>
        </div>
      </div>
    `;

    // Event listeners
    wizard.querySelector('#closeConfigWizard').addEventListener('click', () => this.close());
    wizard.querySelector('#configWizardBack').addEventListener('click', () => this.previousStep());
    wizard.querySelector('#configWizardNext').addEventListener('click', () => this.nextStep());

    return wizard;
  }

  /**
   * Render step
   */
  renderStep(step) {
    const content = document.getElementById('configWizardContent');
    const stepNum = document.getElementById('currentStepNum');
    const progressFill = document.querySelector('.progress-fill');
    const backBtn = document.getElementById('configWizardBack');
    const nextBtn = document.getElementById('configWizardNext');

    // Update progress
    stepNum.textContent = step;
    progressFill.style.width = `${(step / this.totalSteps) * 100}%`;

    // Update buttons
    backBtn.style.display = step > 1 ? 'inline-block' : 'none';
    nextBtn.textContent = step === this.totalSteps ? 'Save Configuration' : 'Next';

    // Render content
    switch (step) {
      case 1:
        content.innerHTML = this.renderDetectionReview();
        this.attachDetectionReviewListeners();
        break;
      case 2:
        content.innerHTML = this.renderEnvironmentSetup();
        this.attachEnvironmentListeners();
        break;
      case 3:
        content.innerHTML = this.renderTestSuiteSelection();
        this.attachTestSuiteListeners();
        break;
      case 4:
        content.innerHTML = this.renderSchedulePreferences();
        this.attachScheduleListeners();
        break;
    }
  }

  /**
   * Render detection review
   */
  renderDetectionReview() {
    const isVibe = this.mode === 'vibe';
    
    return `
      <div class="config-step detection-review">
        <h3>${isVibe ? "Here's what I found! 🔍" : 'Review Detected Configuration'}</h3>
        <p class="step-description">${isVibe ? 'Does this look right?' : 'Verify auto-detected project settings'}</p>
        
        <div class="detection-items">
          <div class="detection-item">
            <div class="item-header">
              <span class="item-label">Project Type</span>
              <span class="confidence-badge high">95% confident</span>
            </div>
            <div class="item-value">
              <strong>${this.detection.projectType || 'Unknown'}</strong>
              <button class="btn-edit" data-field="projectType">Edit</button>
            </div>
          </div>

          ${this.detection.primaryLanguage ? `
            <div class="detection-item">
              <div class="item-header">
                <span class="item-label">Primary Language</span>
                <span class="confidence-badge high">90% confident</span>
              </div>
              <div class="item-value">
                <strong>${this.detection.primaryLanguage}</strong>
                <button class="btn-edit" data-field="language">Edit</button>
              </div>
            </div>
          ` : ''}

          ${this.detection.frameworks && this.detection.frameworks.length > 0 ? `
            <div class="detection-item">
              <div class="item-header">
                <span class="item-label">Frameworks</span>
                <span class="confidence-badge high">90% confident</span>
              </div>
              <div class="item-value">
                <div class="framework-chips">
                  ${this.detection.frameworks.map(f => `<span class="chip">${f.name}</span>`).join('')}
                </div>
                <button class="btn-edit" data-field="frameworks">Edit</button>
              </div>
            </div>
          ` : ''}

          <div class="detection-item">
            <div class="item-header">
              <span class="item-label">Files</span>
            </div>
            <div class="item-value">
              <strong>${this.detection.fileCount || 0} files</strong>
            </div>
          </div>

          <div class="detection-item">
            <div class="item-header">
              <span class="item-label">Complexity</span>
            </div>
            <div class="item-value">
              <strong>${this.detection.complexity || 'unknown'}</strong>
            </div>
          </div>
        </div>

        ${isVibe ? `
          <div class="vibe-message">
            <p>✅ Everything looks good! These settings will help me give you the best audit results.</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Attach detection review listeners
   */
  attachDetectionReviewListeners() {
    const editBtns = document.querySelectorAll('.btn-edit');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        this.showEditDialog(field);
      });
    });
  }

  /**
   * Show edit dialog
   */
  showEditDialog(field) {
    alert(`Edit ${field} - Feature coming soon!`);
  }

  /**
   * Render environment setup
   */
  renderEnvironmentSetup() {
    // Mock environment conflicts
    const hasConflicts = false;
    
    return `
      <div class="config-step environment-setup">
        <h3>${this.mode === 'vibe' ? 'Environment Check 🔧' : 'Environment Configuration'}</h3>
        <p class="step-description">${this.mode === 'vibe' ? 'Making sure everything is compatible' : 'Resolve environment conflicts'}</p>
        
        ${hasConflicts ? `
          <div class="conflict-warning">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
              <h4>Version Mismatch Detected</h4>
              <p>Your local environment may not match project requirements.</p>
            </div>
          </div>

          <div class="resolution-options">
            <div class="resolution-card recommended">
              <h4>🐳 Docker Container (Recommended)</h4>
              <p>Run audit in isolated environment</p>
              <button class="btn-primary">Setup Docker</button>
            </div>
            <div class="resolution-card">
              <h4>🔄 Version Manager</h4>
              <p>Switch to required version</p>
              <button class="btn-secondary">Use nvm</button>
            </div>
            <div class="resolution-card">
              <h4>⚠️ Proceed Anyway</h4>
              <p>Use current environment</p>
              <button class="btn-secondary">Continue</button>
            </div>
          </div>
        ` : `
          <div class="success-message">
            <div class="success-icon">✅</div>
            <div class="success-content">
              <h4>${this.mode === 'vibe' ? "You're all set!" : 'Environment Compatible'}</h4>
              <p>${this.mode === 'vibe' ? 'Your setup looks perfect for this project!' : 'Local environment matches project requirements'}</p>
            </div>
          </div>

          <div class="environment-details">
            <div class="env-item">
              <span class="env-label">${this.detection.projectType}</span>
              <span class="env-status">✓ Installed</span>
            </div>
            ${this.detection.buildTools && this.detection.buildTools.length > 0 ? `
              <div class="env-item">
                <span class="env-label">Build Tools</span>
                <span class="env-status">✓ Detected</span>
              </div>
            ` : ''}
          </div>
        `}
      </div>
    `;
  }

  /**
   * Attach environment listeners
   */
  attachEnvironmentListeners() {
    // Add listeners for environment resolution options
  }

  /**
   * Render test suite selection
   */
  renderTestSuiteSelection() {
    const isVibe = this.mode === 'vibe';
    
    return `
      <div class="config-step test-suite-selection">
        <h3>${isVibe ? 'Pick Your Tests! 🎯' : 'Select Test Suite'}</h3>
        <p class="step-description">${isVibe ? 'Choose how deep you want to go' : 'Configure audit tests to run'}</p>
        
        ${isVibe ? `
          <div class="preset-buttons">
            <button class="preset-btn" data-preset="quick">
              <span class="preset-icon">⚡</span>
              <span class="preset-name">Quick</span>
              <span class="preset-time">30s</span>
            </button>
            <button class="preset-btn active" data-preset="standard">
              <span class="preset-icon">⚖️</span>
              <span class="preset-name">Standard</span>
              <span class="preset-time">2min</span>
            </button>
            <button class="preset-btn" data-preset="thorough">
              <span class="preset-icon">🔬</span>
              <span class="preset-name">Thorough</span>
              <span class="preset-time">5min+</span>
            </button>
          </div>
        ` : `
          <div class="test-categories">
            <div class="category-section">
              <h4>
                <input type="checkbox" checked id="cat-tier1" />
                <label for="cat-tier1">Essential Checks (Always Available)</label>
              </h4>
              <div class="test-list">
                <label class="test-item">
                  <input type="checkbox" checked />
                  <span class="test-name">Code Quality</span>
                  <span class="test-time">~30s</span>
                </label>
                <label class="test-item">
                  <input type="checkbox" checked />
                  <span class="test-name">Basic Security</span>
                  <span class="test-time">~20s</span>
                </label>
                <label class="test-item">
                  <input type="checkbox" checked />
                  <span class="test-name">Formatting</span>
                  <span class="test-time">~15s</span>
                </label>
              </div>
            </div>

            <div class="category-section">
              <h4>
                <input type="checkbox" checked id="cat-tier2" />
                <label for="cat-tier2">Language-Specific Tests</label>
              </h4>
              <div class="test-list">
                <label class="test-item">
                  <input type="checkbox" checked />
                  <span class="test-name">ESLint</span>
                  <span class="test-time">~25s</span>
                </label>
                ${this.detection.frameworks && this.detection.frameworks.some(f => f.name === 'React') ? `
                  <label class="test-item">
                    <input type="checkbox" checked />
                    <span class="test-name">React Hooks Rules</span>
                    <span class="test-time">~15s</span>
                  </label>
                ` : ''}
              </div>
            </div>

            <div class="estimated-total">
              Total Estimated Time: <strong>~2 minutes</strong>
            </div>
          </div>
        `}
      </div>
    `;
  }

  /**
   * Attach test suite listeners
   */
  attachTestSuiteListeners() {
    if (this.mode === 'vibe') {
      const presetBtns = document.querySelectorAll('.preset-btn');
      presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          presetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.config.preset = btn.dataset.preset;
        });
      });
      
      if (!this.config.preset) {
        this.config.preset = 'standard';
      }
    }
  }

  /**
   * Render schedule preferences
   */
  renderSchedulePreferences() {
    const isVibe = this.mode === 'vibe';
    
    return `
      <div class="config-step schedule-preferences">
        <h3>${isVibe ? 'When to Run Audits? ⏰' : 'Schedule Preferences'}</h3>
        <p class="step-description">${isVibe ? 'Set it and forget it!' : 'Configure audit scheduling options'}</p>
        
        <div class="schedule-options">
          <div class="schedule-option">
            <input type="radio" name="schedule" id="schedule-manual" value="manual" checked />
            <label for="schedule-manual">
              <strong>${isVibe ? 'When I ask' : 'Manual'}</strong>
              <span>${isVibe ? 'I'll run audits when you tell me to' : 'Run audits on demand'}</span>
            </label>
          </div>

          <div class="schedule-option">
            <input type="radio" name="schedule" id="schedule-daily" value="daily" />
            <label for="schedule-daily">
              <strong>Daily</strong>
              <span>${isVibe ? 'Automatic check every day' : 'Run audit daily at specified time'}</span>
            </label>
          </div>

          <div class="schedule-option">
            <input type="radio" name="schedule" id="schedule-commit" value="commit" />
            <label for="schedule-commit">
              <strong>${isVibe ? 'Before commits' : 'Git Hook'}</strong>
              <span>${isVibe ? 'Check code before you commit' : 'Run pre-commit hooks'}</span>
            </label>
          </div>

          <div class="schedule-option">
            <input type="radio" name="schedule" id="schedule-ci" value="ci" />
            <label for="schedule-ci">
              <strong>CI/CD Integration</strong>
              <span>${isVibe ? 'Auto-check when you push code' : 'Integrate with GitHub Actions / Jenkins'}</span>
            </label>
          </div>
        </div>

        ${isVibe ? `
          <div class="vibe-recommendation">
            <p>💡 <strong>Recommendation:</strong> Start with manual runs to get familiar, then set up automatic checks later!</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Attach schedule listeners
   */
  attachScheduleListeners() {
    const scheduleOptions = document.querySelectorAll('input[name="schedule"]');
    scheduleOptions.forEach(option => {
      option.addEventListener('change', () => {
        this.config.schedule = option.value;
      });
    });

    if (!this.config.schedule) {
      this.config.schedule = 'manual';
    }
  }

  /**
   * Next step
   */
  nextStep() {
    if (this.currentStep === this.totalSteps) {
      this.complete();
    } else {
      this.currentStep++;
      this.renderStep(this.currentStep);
    }
  }

  /**
   * Previous step
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderStep(this.currentStep);
    }
  }

  /**
   * Complete wizard
   */
  complete() {
    if (this.onComplete) {
      this.onComplete(this.config);
    }
    this.close();
  }

  /**
   * Close wizard
   */
  close() {
    const container = document.querySelector('.config-wizard-container');
    if (container) {
      container.remove();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigWizard;
}

