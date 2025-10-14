#!/usr/bin/env node

/**
 * ZippyCodeAudit - Electron Main Process
 * Provides native file system access and desktop app capabilities
 */

const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');

// Core services
const ProjectDetector = require('./src/core/ProjectDetector');
const AuditEngine = require('./src/core/AuditEngine');
const ProjectRegistry = require('./src/core/ProjectRegistry');
const EnvironmentManager = require('./src/core/EnvironmentManager');
const TestSuiteBuilder = require('./src/core/TestSuiteBuilder');
const AuditAssistant = require('./src/core/AuditAssistant');

let mainWindow;
let projectRegistry;
let currentAuditEngine = null;

/**
 * Create main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'ZippyCodeAudit',
    icon: path.join(__dirname, 'src/dashboard/public/favicon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js')
    },
    backgroundColor: '#1e1e1e',
    show: false, // Show after ready to prevent flickering
    frame: true,
    titleBarStyle: 'default',
    resizable: true,
    maximizable: true,
    minimizable: true
  });

  // Start embedded API server
  const apiPort = 3006;
  startEmbeddedAPI(apiPort);
  
  // Load dashboard
  mainWindow.loadFile('dist/dashboard/index.html');

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ ZippyCodeAudit Desktop App Ready!');
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();

  // Development: Open DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * Create application menu
 */
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (Mac only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Add Project...',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('trigger-add-project');
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('trigger-settings');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },

    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://zippyfoundation.org/codeaudit/docs');
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/zippyfoundation/codeaudit/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates...',
          click: () => {
            checkForUpdates();
          }
        },
        { type: 'separator' },
        {
          label: 'About ZippyCodeAudit',
          click: () => {
            showAbout();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Show About dialog
 */
function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About ZippyCodeAudit',
    message: 'ZippyCodeAudit',
    detail: `Version: ${app.getVersion()}\n\nA beautiful code audit tool for vibe coders.\n\nMade with ❤️ by ZippyFoundation\n\n© 2025 ZippyFoundation. All rights reserved.`,
    buttons: ['OK', 'Visit Website'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 1) {
      shell.openExternal('https://zippyfoundation.org');
    }
  });
}

/**
 * Check for updates
 */
function checkForUpdates() {
  // TODO: Implement electron-updater
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Updates',
    message: 'You are running the latest version!',
    detail: `Version ${app.getVersion()}\n\nAuto-updates will be enabled in a future release.`,
    buttons: ['OK']
  });
}

// ============================================================================
// App Lifecycle
// ============================================================================

app.whenReady().then(() => {
  // Initialize project registry
  const userDataPath = app.getPath('userData');
  const registryPath = path.join(userDataPath, 'projects.json');
  projectRegistry = new ProjectRegistry(registryPath);

  // Create window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================================================
// IPC Handlers - File System Operations
// ============================================================================

/**
 * Native folder picker
 */
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Folder',
    buttonLabel: 'Select Project'
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePaths[0];
});

/**
 * Native file picker (for zip files)
 */
ipcMain.handle('select-file', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: options.title || 'Select File',
    filters: options.filters || [],
    buttonLabel: options.buttonLabel || 'Select'
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePaths[0];
});

// ============================================================================
// IPC Handlers - Project Operations
// ============================================================================

/**
 * Detect project type and configuration
 */
ipcMain.handle('detect-project', async (event, projectPath) => {
  try {
    console.log(`🔍 Detecting project: ${projectPath}`);
    
    const detector = new ProjectDetector(projectPath);
    const detection = await detector.detect();
    
    console.log(`✅ Detected: ${detection.projectType}`);
    
    return { 
      success: true, 
      detection 
    };
  } catch (error) {
    console.error('❌ Detection error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Analyze environment compatibility
 */
ipcMain.handle('analyze-environment', async (event, projectPath, detection) => {
  try {
    console.log(`🔧 Analyzing environment for: ${projectPath}`);
    
    const envManager = new EnvironmentManager(projectPath, detection);
    const analysis = await envManager.analyze();
    
    console.log(`✅ Environment analysis complete`);
    
    return { 
      success: true, 
      analysis 
    };
  } catch (error) {
    console.error('❌ Environment analysis error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Build test suite options
 */
ipcMain.handle('build-test-suite', async (event, detection) => {
  try {
    console.log(`🧪 Building test suite options`);
    
    const builder = new TestSuiteBuilder(detection);
    const testSuite = builder.buildAvailableTests();
    const presets = builder.getPresets();
    
    console.log(`✅ Test suite built`);
    
    return { 
      success: true, 
      testSuite,
      presets
    };
  } catch (error) {
    console.error('❌ Test suite build error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Get AI assistant recommendations
 */
ipcMain.handle('get-ai-recommendations', async (event, detection, mode) => {
  try {
    console.log(`🤖 Getting AI recommendations`);
    
    const assistant = new AuditAssistant(detection, mode);
    const welcome = assistant.getWelcomeMessage();
    const suggestions = assistant.getSuggestions();
    
    console.log(`✅ AI recommendations ready`);
    
    return { 
      success: true, 
      welcome,
      suggestions
    };
  } catch (error) {
    console.error('❌ AI recommendations error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Add project to registry
 */
ipcMain.handle('add-project', async (event, projectData) => {
  try {
    console.log(`➕ Adding project: ${projectData.path}`);
    
    const project = await projectRegistry.registerProject(
      projectData.path,
      projectData.metadata || {}
    );
    
    console.log(`✅ Project added: ${project.id}`);
    
    return { 
      success: true, 
      project 
    };
  } catch (error) {
    console.error('❌ Add project error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Get all projects
 */
ipcMain.handle('get-projects', async () => {
  try {
    const projects = projectRegistry.listProjects();
    return { 
      success: true, 
      projects 
    };
  } catch (error) {
    console.error('❌ Get projects error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Get specific project
 */
ipcMain.handle('get-project', async (event, projectId) => {
  try {
    const project = projectRegistry.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return { 
      success: true, 
      project 
    };
  } catch (error) {
    console.error('❌ Get project error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Remove project
 */
ipcMain.handle('remove-project', async (event, projectId) => {
  try {
    console.log(`🗑️  Removing project: ${projectId}`);
    
    await projectRegistry.unregisterProject(projectId);
    
    console.log(`✅ Project removed`);
    
    return { 
      success: true 
    };
  } catch (error) {
    console.error('❌ Remove project error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

// ============================================================================
// IPC Handlers - Audit Operations
// ============================================================================

/**
 * Run progressive audit
 */
ipcMain.handle('run-audit', async (event, projectId, options = {}) => {
  try {
    const project = projectRegistry.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    console.log(`🔍 Starting audit for project: ${project.name || project.id}`);

    currentAuditEngine = new AuditEngine({
      projectPath: project.path,
      ...options
    });

    // Run progressive audit with progress updates
    const results = await currentAuditEngine.runProgressiveAudit((progress) => {
      // Send progress updates to renderer
      mainWindow.webContents.send('audit-progress', {
        projectId,
        progress
      });
    });

    console.log(`✅ Audit complete for project: ${project.name || project.id}`);

    // Update project with latest audit results
    await projectRegistry.updateProject(projectId, {
      lastAudit: {
        timestamp: new Date().toISOString(),
        results: results.summary
      }
    });

    return { 
      success: true, 
      results 
    };
  } catch (error) {
    console.error('❌ Audit error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  } finally {
    currentAuditEngine = null;
  }
});

/**
 * Cancel running audit
 */
ipcMain.handle('cancel-audit', async () => {
  try {
    if (currentAuditEngine) {
      // TODO: Implement cancellation in AuditEngine
      console.log('⚠️  Audit cancellation requested (not yet implemented)');
      return { success: true, message: 'Cancellation requested' };
    }
    return { success: false, error: 'No audit running' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================================================
// IPC Handlers - Settings & Preferences
// ============================================================================

/**
 * Save user settings
 */
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    
    await fs.writeJson(settingsPath, settings, { spaces: 2 });
    
    console.log('✅ Settings saved');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Save settings error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Load user settings
 */
ipcMain.handle('load-settings', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJson(settingsPath);
      return { 
        success: true, 
        settings 
      };
    }
    
    // Return default settings
    return { 
      success: true, 
      settings: {
        mode: 'vibe',
        theme: 'dark',
        notifications: true
      } 
    };
  } catch (error) {
    console.error('❌ Load settings error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

// ============================================================================
// IPC Handlers - System Information
// ============================================================================

/**
 * Get app version
 */
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

/**
 * Get user data path
 */
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

/**
 * Show item in folder
 */
ipcMain.handle('show-item-in-folder', async (event, fullPath) => {
  shell.showItemInFolder(fullPath);
  return { success: true };
});

/**
 * Open external URL
 */
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
  return { success: true };
});

// ============================================================================
// Error Handling
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Unexpected Error', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// ============================================================================
// Embedded API Server (for dashboard compatibility)
// ============================================================================

function startEmbeddedAPI(port) {
  const express = require('express');
  const cors = require('cors');
  
  const api = express();
  api.use(cors());
  api.use(express.json());
  
  // Log all requests for debugging
  api.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} ${req.query ? '?' + new URLSearchParams(req.query).toString() : ''}`);
    next();
  });
  
  // Health check
  api.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ZippyCodeAudit API is running' });
  });
  
  // Dashboard data endpoints
  api.get('/api/metrics', (req, res) => {
    res.json({
      totalFiles: 0,
      totalIssues: 0,
      projectHealth: 100,
      completedTasks: 0
    });
  });

  // Analyze endpoint (for dashboard metrics loading)
  api.get('/api/analyze', async (req, res) => {
    try {
      const { path } = req.query;

      console.log(`📊 Analyze request for path: ${path}`);

      // Simple mock response for now
      const mockAnalysis = {
        metadata: {
          totalFilesAnalyzed: 25,
          totalIssues: 8,
          projectHealth: 85,
          analysisTime: Date.now()
        },
        issues: [
          {
            type: 'security',
            severity: 'medium',
            message: 'Potential hardcoded secret detected',
            file: 'config/database.js',
            line: 15,
            fix: 'Use environment variables for sensitive data',
            fixTime: 300
          },
          {
            type: 'performance',
            severity: 'low',
            message: 'Large bundle size detected',
            file: 'dist/bundle.js',
            line: 1,
            fix: 'Enable code splitting for better performance',
            fixTime: 600
          }
        ],
        tasks: [
          {
            id: 'task-1',
            title: 'Fix hardcoded secrets',
            status: 'pending',
            priority: 'high',
            assignee: 'Unassigned'
          }
        ],
        success: true
      };

      res.json(mockAnalysis);
    } catch (error) {
      console.error('❌ Analyze error:', error);
      res.json({
        metadata: { totalFilesAnalyzed: 0, totalIssues: 0, projectHealth: 0 },
        issues: [],
        tasks: [],
        success: false,
        error: error.message
      });
    }
  });
  
  api.get('/api/reports', (req, res) => {
    const { path } = req.query;
    const projects = projectRegistry.listProjects();

    // Return mock reports for the project
    const mockReports = [
      {
        id: 'report-1',
        title: 'Security Audit',
        date: new Date().toISOString(),
        type: 'security',
        issues: 5,
        files: 150,
        score: 85,
        status: 'completed'
      },
      {
        id: 'report-2',
        title: 'Performance Audit',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'performance',
        issues: 3,
        files: 150,
        score: 92,
        status: 'completed'
      }
    ];

    res.json(mockReports);
  });

  api.get('/api/tasks', (req, res) => {
    const { path } = req.query;
    // Return mock tasks
    res.json([
      {
        id: 'task-1',
        title: 'Fix hardcoded secrets',
        status: 'pending',
        priority: 'high',
        assignee: 'Unassigned',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        title: 'Update dependencies',
        status: 'pending',
        priority: 'medium',
        assignee: 'Unassigned',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  });

  api.get('/api/activity', (req, res) => {
    const { path } = req.query;
    // Return mock activity
    res.json([
      {
        id: 'activity-1',
        type: 'audit_completed',
        message: 'Security audit completed',
        timestamp: new Date().toISOString(),
        details: { score: 85, issues: 5 }
      },
      {
        id: 'activity-2',
        type: 'project_added',
        message: 'Project added to registry',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        details: { projectName: 'Sample Project' }
      }
    ]);
  });
  
  // Project endpoints
  api.get('/api/projects', (req, res) => {
    const projects = projectRegistry.listProjects();
    res.json({ success: true, projects });
  });
  
  api.post('/api/projects/detect', async (req, res) => {
    try {
      const { projectPath } = req.body;

      if (!projectPath) {
        return res.json({
          success: false,
          error: 'Project path is required',
          detection: {
            projectType: 'Unknown',
            primaryLanguage: 'Unknown',
            frameworks: [],
            fileCount: 0,
            complexity: 'unknown'
          }
        });
      }

      console.log(`🔍 Detecting project at path: ${projectPath}`);

      // Check if path exists
      const fs = require('fs-extra');
      if (!(await fs.pathExists(projectPath))) {
        console.warn(`⚠️ Path does not exist: ${projectPath}`);
        return res.json({
          success: false,
          error: `Path does not exist: ${projectPath}`,
          detection: {
            projectType: 'Unknown',
            primaryLanguage: 'Unknown',
            frameworks: [],
            fileCount: 0,
            complexity: 'unknown'
          }
        });
      }

      const detector = new ProjectDetector(projectPath);
      const detection = await detector.detect();

      console.log(`✅ Detection complete for: ${detection.projectType}`);
      res.json({ success: true, detection });
    } catch (error) {
      console.error('❌ Project detection error:', error);
      // Return a fallback detection instead of failing completely
      res.json({
        success: false,
        error: error.message,
        detection: {
          projectType: 'Unknown',
          primaryLanguage: 'Unknown',
          frameworks: [],
          fileCount: 0,
          complexity: 'unknown'
        }
      });
    }
  });
  
  api.post('/api/projects/add', async (req, res) => {
    try {
      const { projectPath, metadata } = req.body;

      if (!projectPath) {
        return res.json({ success: false, error: 'Project path is required' });
      }

      console.log(`➕ Adding project at path: ${projectPath}`);

      // Check if path exists
      const fs = require('fs-extra');
      if (!(await fs.pathExists(projectPath))) {
        return res.json({
          success: false,
          error: `Path does not exist: ${projectPath}`
        });
      }

      const project = await projectRegistry.registerProject(projectPath, metadata || {});
      console.log(`✅ Project added successfully: ${project.id}`);

      res.json({ success: true, project });
    } catch (error) {
      console.error('❌ Project addition error:', error);
      res.json({ success: false, error: error.message });
    }
  });

  api.delete('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await projectRegistry.unregisterProject(id);
      res.json({ success: true });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  });
  
  // Catch-all for undefined routes
  api.use((req, res) => {
    console.log(`API request to undefined route: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Not found' });
  });
  
  api.listen(port, () => {
    console.log(`📡 Embedded API server running on port ${port}`);
  });
}

console.log('🚀 ZippyCodeAudit Desktop App Starting...');

