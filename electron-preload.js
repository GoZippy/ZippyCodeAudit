/**
 * ZippyCodeAudit - Electron Preload Script
 * Exposes safe APIs from main process to renderer process
 * This is the security bridge between Electron and the web dashboard
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process
// to use functionality from the main process
contextBridge.exposeInMainWorld('electronAPI', {
  // ========================================================================
  // Platform Detection
  // ========================================================================
  platform: process.platform,
  isElectron: true,
  
  // ========================================================================
  // File System Operations
  // ========================================================================
  
  /**
   * Open native folder picker dialog
   * @returns {Promise<string|null>} Selected folder path or null if cancelled
   */
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  /**
   * Open native file picker dialog
   * @param {Object} options - Dialog options
   * @returns {Promise<string|null>} Selected file path or null if cancelled
   */
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  
  /**
   * Show item in system file explorer
   * @param {string} fullPath - Full path to item
   */
  showItemInFolder: (fullPath) => ipcRenderer.invoke('show-item-in-folder', fullPath),
  
  // ========================================================================
  // Project Operations
  // ========================================================================
  
  /**
   * Detect project type and configuration
   * @param {string} projectPath - Path to project folder
   * @returns {Promise<Object>} Detection results
   */
  detectProject: (projectPath) => ipcRenderer.invoke('detect-project', projectPath),
  
  /**
   * Analyze environment compatibility
   * @param {string} projectPath - Path to project folder
   * @param {Object} detection - Detection results
   * @returns {Promise<Object>} Environment analysis
   */
  analyzeEnvironment: (projectPath, detection) => 
    ipcRenderer.invoke('analyze-environment', projectPath, detection),
  
  /**
   * Build test suite options
   * @param {Object} detection - Detection results
   * @returns {Promise<Object>} Test suite options
   */
  buildTestSuite: (detection) => ipcRenderer.invoke('build-test-suite', detection),
  
  /**
   * Get AI assistant recommendations
   * @param {Object} detection - Detection results
   * @param {string} mode - User mode (vibe/tech)
   * @returns {Promise<Object>} AI recommendations
   */
  getAIRecommendations: (detection, mode) => 
    ipcRenderer.invoke('get-ai-recommendations', detection, mode),
  
  /**
   * Add project to registry
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Added project
   */
  addProject: (projectData) => ipcRenderer.invoke('add-project', projectData),
  
  /**
   * Get all projects
   * @returns {Promise<Array>} List of projects
   */
  getProjects: () => ipcRenderer.invoke('get-projects'),
  
  /**
   * Get specific project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project data
   */
  getProject: (projectId) => ipcRenderer.invoke('get-project', projectId),
  
  /**
   * Remove project from registry
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Result
   */
  removeProject: (projectId) => ipcRenderer.invoke('remove-project', projectId),
  
  // ========================================================================
  // Audit Operations
  // ========================================================================
  
  /**
   * Run progressive audit on project
   * @param {string} projectId - Project ID
   * @param {Object} options - Audit options
   * @returns {Promise<Object>} Audit results
   */
  runAudit: (projectId, options) => ipcRenderer.invoke('run-audit', projectId, options),
  
  /**
   * Cancel currently running audit
   * @returns {Promise<Object>} Result
   */
  cancelAudit: () => ipcRenderer.invoke('cancel-audit'),
  
  // ========================================================================
  // Settings & Preferences
  // ========================================================================
  
  /**
   * Save user settings
   * @param {Object} settings - Settings object
   * @returns {Promise<Object>} Result
   */
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  /**
   * Load user settings
   * @returns {Promise<Object>} Settings object
   */
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  
  // ========================================================================
  // System Information
  // ========================================================================
  
  /**
   * Get app version
   * @returns {Promise<string>} Version string
   */
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  /**
   * Get user data directory path
   * @returns {Promise<string>} Path to user data
   */
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  /**
   * Open external URL in system browser
   * @param {string} url - URL to open
   */
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // ========================================================================
  // Event Listeners (Main -> Renderer)
  // ========================================================================
  
  /**
   * Listen for "Add Project" trigger from menu
   * @param {Function} callback - Callback function
   */
  onAddProject: (callback) => {
    ipcRenderer.on('trigger-add-project', callback);
  },
  
  /**
   * Listen for "Settings" trigger from menu
   * @param {Function} callback - Callback function
   */
  onSettings: (callback) => {
    ipcRenderer.on('trigger-settings', callback);
  },
  
  /**
   * Listen for audit progress updates
   * @param {Function} callback - Callback function
   */
  onAuditProgress: (callback) => {
    ipcRenderer.on('audit-progress', (event, data) => callback(data));
  },
  
  /**
   * Listen for toast notifications
   * @param {Function} callback - Callback function
   */
  onShowToast: (callback) => {
    ipcRenderer.on('show-toast', (event, data) => callback(data));
  },
  
  /**
   * Remove event listener
   * @param {string} channel - Event channel
   * @param {Function} callback - Callback to remove
   */
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // ========================================================================
  // Utility Functions
  // ========================================================================
  
  /**
   * Log message to main process console
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Message to log
   */
  log: (level, message) => {
    console.log(`[Renderer ${level.toUpperCase()}]`, message);
  }
});

// Log that preload script has loaded
console.log('✅ Electron preload script loaded');
console.log(`   Platform: ${process.platform}`);
console.log(`   Electron API exposed to renderer`);

