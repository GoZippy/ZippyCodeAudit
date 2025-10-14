// API Configuration
const API_BASE_URL = window.electronAPI && window.electronAPI.isElectron
  ? 'http://localhost:3006/api'
  : 'http://localhost:3006/api';

/**
 * Project Onboarding Wizard Component
 * Multi-step wizard for adding new projects
 */

class ProjectOnboardingWizard {
  constructor(mode = 'vibe') {
    this.mode = mode;
    this.currentStep = 1;
    this.totalSteps = 4;
    this.projectData = {};
    this.onComplete = null;
  }

  /**
   * Show wizard
   */
  show(container, onComplete) {
    this.onComplete = onComplete;
    this.currentStep = 1;
    this.projectData = {};
    
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
    wizard.className = 'onboarding-wizard-container';
    wizard.innerHTML = `
      <div class="wizard-overlay"></div>
      <div class="wizard-modal">
        <div class="wizard-header">
          <h2 id="wizardTitle">Add New Project</h2>
          <button class="wizard-close-btn" id="closeWizard">&times;</button>
        </div>
        <div class="wizard-progress">
          <div class="progress-steps">
            ${this.renderProgressSteps()}
          </div>
        </div>
        <div class="wizard-content" id="wizardContent">
          <!-- Step content goes here -->
        </div>
        <div class="wizard-footer">
          <button class="btn-secondary" id="wizardBack" style="display: none;">Back</button>
          <button class="btn-primary" id="wizardNext">Next</button>
        </div>
      </div>
    `;

    // Event listeners
    wizard.querySelector('#closeWizard').addEventListener('click', () => this.close());
    wizard.querySelector('#wizardBack').addEventListener('click', () => this.previousStep());
    wizard.querySelector('#wizardNext').addEventListener('click', () => this.nextStep());

    return wizard;
  }

  /**
   * Render progress steps
   */
  renderProgressSteps() {
    const steps = ['Source', 'Detection', 'Configuration', 'First Audit'];
    return steps.map((step, index) => `
      <div class="progress-step ${index + 1 === this.currentStep ? 'active' : ''} ${index + 1 < this.currentStep ? 'completed' : ''}" data-step="${index + 1}">
        <div class="step-number">${index + 1}</div>
        <div class="step-label">${step}</div>
      </div>
    `).join('');
  }

  /**
   * Update progress steps
   */
  updateProgressSteps() {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index + 1 === this.currentStep) {
        step.classList.add('active');
      } else if (index + 1 < this.currentStep) {
        step.classList.add('completed');
      }
    });
  }

  /**
   * Render current step
   */
  renderStep(step) {
    const content = document.getElementById('wizardContent');
    const backBtn = document.getElementById('wizardBack');
    const nextBtn = document.getElementById('wizardNext');

    // Update buttons
    backBtn.style.display = step > 1 ? 'inline-block' : 'none';
    nextBtn.textContent = step === this.totalSteps ? 'Start Audit' : 'Next';

    // Render step content
    switch (step) {
      case 1:
        content.innerHTML = this.renderSourceSelection();
        this.attachSourceSelectionListeners();
        break;
      case 2:
        content.innerHTML = this.renderDetectionStep();
        this.runDetection();
        break;
      case 3:
        content.innerHTML = this.renderConfigurationStep();
        this.attachConfigurationListeners();
        break;
      case 4:
        content.innerHTML = this.renderAuditPreview();
        this.attachAuditListeners();
        break;
    }

    this.updateProgressSteps();
  }

  /**
   * Render source selection step
   */
  renderSourceSelection() {
    const isVibe = this.mode === 'vibe';
    
    return `
      <div class="source-selection ${isVibe ? 'vibe-mode' : 'tech-mode'}">
        <h3>${isVibe ? 'How would you like to add your project?' : 'Select Project Source'}</h3>
        <p class="step-description">${isVibe ? 'Pick the easiest option for you!' : 'Choose the method to import your project'}</p>
        
        <div class="source-options">
          <div class="source-card" data-source="local">
            <div class="source-icon">📁</div>
            <h4>Local Folder</h4>
            <p id="localFolderDescription">${isVibe ? 'Choose a folder from your computer' : 'Select a directory from local file system'}</p>
            <input type="text" id="localFolderPath" placeholder="C:\\Users\\YourName\\Projects\\MyProject" style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; display: none;" />
            <button class="btn-source">Select Folder</button>
          </div>

          <div class="source-card" data-source="github">
            <div class="source-icon">🐙</div>
            <h4>GitHub Repository</h4>
            <p>${isVibe ? 'Import from GitHub' : 'Clone from GitHub repository URL'}</p>
            <div class="github-input-group">
              <input type="text" placeholder="https://github.com/user/repo" id="githubUrl" />
              <button class="btn-source">Import</button>
            </div>
          </div>

          <div class="source-card" data-source="zip">
            <div class="source-icon">📦</div>
            <h4>Upload Zip</h4>
            <p>${isVibe ? 'Drag & drop a zip file' : 'Upload compressed project archive'}</p>
            <div class="drop-zone" id="dropZone">
              <div class="drop-zone-content">
                <span class="drop-icon">⬆️</span>
                <span>Drag zip file here or click to browse</span>
              </div>
              <input type="file" accept=".zip" style="display: none;" id="zipFileInput" />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach source selection listeners
   */
  attachSourceSelectionListeners() {
    // Local folder
    const localCard = document.querySelector('[data-source="local"]');
    const localPathInput = document.getElementById('localFolderPath');
    const localDescription = document.getElementById('localFolderDescription');
    
    // Check if running in Electron
    if (window.electronAPI && window.electronAPI.isElectron) {
      // Native folder picker available
      localPathInput.style.display = 'none';
      localCard.querySelector('.btn-source').addEventListener('click', async () => {
        try {
          const path = await window.electronAPI.selectFolder();
          if (path) {
            this.projectData.source = 'local';
            this.projectData.path = path;
            this.nextStep();
          }
        } catch (error) {
          console.error('Folder selection error:', error);
          alert('Failed to select folder: ' + error.message);
        }
      });
    } else {
      // Fallback to manual input for web version
      localPathInput.style.display = 'block';
      localDescription.textContent = this.mode === 'vibe' 
        ? 'Enter the full path to your project folder'
        : 'Provide absolute path to project directory';
      localCard.querySelector('.btn-source').textContent = 'Continue';
      
      localCard.querySelector('.btn-source').addEventListener('click', () => {
        const path = localPathInput.value.trim();
        if (!path) {
          alert('Please enter a project folder path');
          return;
        }
        this.projectData.source = 'local';
        this.projectData.path = path;
        this.nextStep();
      });
    }

    // GitHub
    const githubCard = document.querySelector('[data-source="github"]');
    const githubUrl = document.getElementById('githubUrl');
    githubCard.querySelector('.btn-source').addEventListener('click', async () => {
      const url = githubUrl.value.trim();
      if (!url) {
        alert('Please enter a GitHub repository URL');
        return;
      }
      this.projectData.source = 'github';
      this.projectData.url = url;
      this.nextStep();
    });

    // Zip upload
    const zipCard = document.querySelector('[data-source="zip"]');
    const dropZone = document.getElementById('dropZone');
    const zipInput = document.getElementById('zipFileInput');

    dropZone.addEventListener('click', () => zipInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.zip')) {
        this.handleZipFile(file);
      }
    });

    zipInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.handleZipFile(e.target.files[0]);
      }
    });
  }

  /**
   * Handle zip file
   */
  handleZipFile(file) {
    this.projectData.source = 'zip';
    this.projectData.file = file;
    this.projectData.path = file.name.replace('.zip', '');
    this.nextStep();
  }

  /**
   * Render detection step
   */
  renderDetectionStep() {
    return `
      <div class="detection-step">
        <h3>${this.mode === 'vibe' ? "Let's see what you've got! 🔍" : 'Project Detection'}</h3>
        <div class="detection-status">
          <div class="spinner"></div>
          <p>Analyzing project structure...</p>
        </div>
        <div id="detectionResults" style="display: none;">
          <!-- Results will be inserted here -->
        </div>
      </div>
    `;
  }

  /**
   * Run detection
   */
  async runDetection() {
    const resultsDiv = document.getElementById('detectionResults');

    try {
      console.log('🔍 Starting project detection for:', this.projectData.path);

      // Call actual API for project detection
      const response = await fetch(`${API_BASE_URL}/projects/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: this.projectData.path })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Detection result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Detection failed');
      }

      this.projectData.detection = result.detection;

      // Hide spinner, show results
      document.querySelector('.detection-status').style.display = 'none';
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = this.renderDetectionResults(this.projectData.detection);
    } catch (error) {
      console.error('Detection error:', error);

      // Show error state
      document.querySelector('.detection-status').style.display = 'none';
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div class="detection-error">
          <div class="error-icon">⚠️</div>
          <h4>Detection Failed</h4>
          <p>${error.message || 'Unable to analyze project structure'}</p>
          <button class="btn btn-secondary" onclick="location.reload()">Try Again</button>
        </div>
      `;
    }
  }

  /**
   * Render detection results
   */
  renderDetectionResults(detection) {
    const isVibe = this.mode === 'vibe';
    
    return `
      <div class="detection-results ${isVibe ? 'vibe-mode' : 'tech-mode'}">
        <div class="detection-summary">
          ${isVibe ? 
            `<h4>Found: ${detection.frameworks[0]?.name || detection.projectType} project! 🎉</h4>
             <p>Looks like a ${detection.complexity} project with ${detection.fileCount} files.</p>` :
            `<h4>Project Analysis Complete</h4>
             <div class="detection-details">
               <div class="detail-row"><span>Type:</span> <strong>${detection.projectType}</strong></div>
               <div class="detail-row"><span>Language:</span> <strong>${detection.primaryLanguage}</strong></div>
               <div class="detail-row"><span>Files:</span> <strong>${detection.fileCount}</strong></div>
               <div class="detail-row"><span>Complexity:</span> <strong>${detection.complexity}</strong></div>
             </div>`
          }
        </div>

        ${detection.frameworks.length > 0 ? `
          <div class="detected-frameworks">
            <h5>Frameworks</h5>
            <div class="framework-tags">
              ${detection.frameworks.map(f => `<span class="tag">${f.name}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${detection.buildTools.length > 0 ? `
          <div class="detected-tools">
            <h5>Build Tools</h5>
            <div class="tool-tags">
              ${detection.buildTools.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render configuration step
   */
  renderConfigurationStep() {
    const detection = this.projectData.detection;
    
    return `
      <div class="configuration-step">
        <h3>${this.mode === 'vibe' ? 'Almost ready! 🎯' : 'Configure Audit Suite'}</h3>
        <p class="step-description">${this.mode === 'vibe' ? 'Choose how thorough you want the check to be' : 'Select audit tests to run'}</p>
        
        <div class="preset-options">
          <div class="preset-card" data-preset="quick">
            <div class="preset-icon">⚡</div>
            <h4>Quick Health Check</h4>
            <p>Essential checks (30 seconds)</p>
            <span class="preset-time">~30s</span>
          </div>

          <div class="preset-card active" data-preset="standard">
            <div class="preset-icon">⚖️</div>
            <h4>Standard Audit</h4>
            <p>Recommended for most projects (2 minutes)</p>
            <span class="preset-time">~2 min</span>
            <span class="badge-recommended">Recommended</span>
          </div>

          <div class="preset-card" data-preset="thorough">
            <div class="preset-icon">🔬</div>
            <h4>Thorough Analysis</h4>
            <p>Deep dive with all checks (5+ minutes)</p>
            <span class="preset-time">~5 min</span>
          </div>
        </div>

        ${this.mode === 'tech' ? `
          <details class="advanced-config">
            <summary>Advanced Configuration</summary>
            <div class="config-options">
              <label><input type="checkbox" checked /> Security Scan</label>
              <label><input type="checkbox" checked /> Code Quality</label>
              <label><input type="checkbox" checked /> Formatting</label>
              <label><input type="checkbox" /> Performance Analysis</label>
              <label><input type="checkbox" /> Test Coverage</label>
            </div>
          </details>
        ` : ''}
      </div>
    `;
  }

  /**
   * Attach configuration listeners
   */
  attachConfigurationListeners() {
    const presetCards = document.querySelectorAll('.preset-card');
    presetCards.forEach(card => {
      card.addEventListener('click', () => {
        presetCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.projectData.preset = card.dataset.preset;
      });
    });

    // Set default preset
    if (!this.projectData.preset) {
      this.projectData.preset = 'standard';
    }
  }

  /**
   * Render audit preview
   */
  renderAuditPreview() {
    const isVibe = this.mode === 'vibe';
    
    return `
      <div class="audit-preview">
        <h3>${isVibe ? "All set! Let's go! 🚀" : 'Ready to Start Audit'}</h3>
        <div class="preview-summary">
          <div class="summary-item">
            <span class="label">Project:</span>
            <span class="value">${this.projectData.path || 'Unknown'}</span>
          </div>
          <div class="summary-item">
            <span class="label">Type:</span>
            <span class="value">${this.projectData.detection?.projectType || 'Unknown'}</span>
          </div>
          <div class="summary-item">
            <span class="label">Audit Type:</span>
            <span class="value">${this.projectData.preset || 'standard'}</span>
          </div>
          <div class="summary-item">
            <span class="label">Estimated Time:</span>
            <span class="value">${this.getEstimatedTime()}</span>
          </div>
        </div>
        ${isVibe ? `
          <div class="encouragement-message">
            <p>🎉 You're all set! I'll check your code and let you know how it's doing.</p>
            <p>This won't take long - sit back and relax! ☕</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Attach audit listeners
   */
  attachAuditListeners() {
    // Could add additional options here
  }

  /**
   * Get estimated time
   */
  getEstimatedTime() {
    const times = {
      quick: '~30 seconds',
      standard: '~2 minutes',
      thorough: '~5 minutes'
    };
    return times[this.projectData.preset] || '~2 minutes';
  }

  /**
   * Next step
   */
  async nextStep() {
    if (this.currentStep === this.totalSteps) {
      // Complete wizard
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
      this.onComplete(this.projectData);
    }
    this.close();
  }

  /**
   * Close wizard
   */
  close() {
    const container = document.querySelector('.onboarding-wizard-container');
    if (container) {
      container.remove();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectOnboardingWizard;
}

