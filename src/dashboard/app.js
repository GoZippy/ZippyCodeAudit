/**
 * ZippyCodeAudit Dashboard - Main Application
 * Lightweight, performance-optimized dashboard for audit management
 */

// Application State
const AppState = {
  currentPage: 'overview',
  theme: localStorage.getItem('theme') || 'auto',
  refreshInterval: parseInt(localStorage.getItem('refreshInterval')) || 60000,
  data: {
    metrics: {},
    reports: [],
    tasks: [],
    activity: []
  },
  isLoading: false,
  error: null
};

// API Configuration - Simplified for Electron
const API_BASE_URL = window.electronAPI && window.electronAPI.isElectron
  ? 'http://localhost:3006/api'
  : window.location.origin + '/api';

// DOM Elements Cache
const DOM = {
  pages: {},
  navButtons: {},
  sidebarNavButtons: {},
  refreshBtn: null,
  exportBtn: null,
  themeToggle: null,
  loadingState: null,
  errorState: null
};

// Initialize Application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    // Initialize mode switcher
    if (window.ModeSwitcher) {
      window.ModeSwitcher.init();
      window.ModeSwitcher.onChange((mode) => {
        // Reload data with mode-specific formatting
        loadDashboardData();
      });
    }

    // Initialize tooltip manager
    if (window.TooltipManager) {
      window.TooltipManager.init();
    }

    // Initialize WebSocket for real-time updates
    if (window.getWebSocketClient) {
      setupWebSocketConnection();
    }

    // Cache DOM elements
    cacheDOMElements();

    // Setup event listeners
    setupEventListeners();

    // Initialize theme
    initializeTheme();

    // Setup project selection
    await setupProjectSelection();

    // Don't auto-load data - wait for user to select a project first
    // This prevents the infinite loading spinner issue

    // Setup auto-refresh if enabled (but don't start it until project selected)
    // setupAutoRefresh();

    // Always show welcome state first - let user explicitly add project
    showWelcomeState();

    // Initialize page navigation (this will set the correct active states)
    // Check for page parameter in URL hash first
    const urlPage = getPageFromUrl();
    showPage(urlPage || AppState.currentPage);

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Check if first run for onboarding
    checkFirstRun();

  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to initialize dashboard');
  }
}

/**
 * Cache frequently used DOM elements
 */
function cacheDOMElements() {
  // Pages
  DOM.pages = {
    overview: document.getElementById('overviewPage'),
    reports: document.getElementById('reportsPage'),
    tasks: document.getElementById('tasksPage'),
    analytics: document.getElementById('analyticsPage'),
    projects: document.getElementById('projectsPage'),
    settings: document.getElementById('settingsPage')
  };

  // Navigation
  DOM.navButtons = Array.from(document.querySelectorAll('.nav-button')).reduce((acc, btn) => {
    acc[btn.dataset.page] = btn;
    return acc;
  }, {});

  // Sidebar Navigation
  DOM.sidebarNavButtons = Array.from(document.querySelectorAll('.sidebar-nav-item')).reduce((acc, btn) => {
    acc[btn.dataset.page] = btn;
    return acc;
  }, {});

  // Actions
  DOM.refreshBtn = document.getElementById('refreshBtn');
  DOM.exportBtn = document.getElementById('exportBtn');
  DOM.themeToggle = document.getElementById('themeToggle');

  // Sidebar elements
  DOM.sidebarToggle = document.getElementById('sidebarToggle');
  DOM.sidebarOverlay = document.getElementById('sidebarOverlay');
  DOM.sidebar = document.querySelector('.sidebar');
  DOM.sidebarRefreshBtn = document.getElementById('sidebarRefreshBtn');
  DOM.sidebarExportBtn = document.getElementById('sidebarExportBtn');
  DOM.sidebarThemeToggle = document.getElementById('sidebarThemeToggle');

  // States
  DOM.loadingState = document.getElementById('loadingState');
  DOM.errorState = document.getElementById('errorState');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  console.log('🔧 Setting up event listeners...');

  // Navigation - with error handling
  if (DOM.navButtons) {
    Object.entries(DOM.navButtons).forEach(([page, button]) => {
      if (button) {
        button.addEventListener('click', () => {
          console.log(`📄 Navigating to page: ${page}`);
          showPage(page);
        });
      }
    });
  }

  // Sidebar navigation - with error handling
  const sidebarNavButtons = document.querySelectorAll('.sidebar-nav-item');
  if (sidebarNavButtons.length > 0) {
    sidebarNavButtons.forEach(button => {
      if (button && button.dataset && button.dataset.page) {
        button.addEventListener('click', (e) => {
          const page = e.currentTarget.dataset.page;
          console.log(`📱 Sidebar navigation to page: ${page}`);
          showPage(page);
          closeSidebar();
        });
      }
    });
  }

  // Actions
  DOM.refreshBtn?.addEventListener('click', refreshData);
  DOM.exportBtn?.addEventListener('click', exportData);
  DOM.themeToggle?.addEventListener('click', toggleTheme);

  // Sidebar actions
  DOM.sidebarRefreshBtn?.addEventListener('click', refreshData);
  DOM.sidebarExportBtn?.addEventListener('click', exportData);
  DOM.sidebarThemeToggle?.addEventListener('click', toggleTheme);
  DOM.sidebarToggle?.addEventListener('click', toggleSidebar);
  DOM.sidebarOverlay?.addEventListener('click', closeSidebar);

  // Project onboarding wizard - with error handling
  const addProjectBtn = document.getElementById('addProjectBtn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', (e) => {
      console.log('🚀 Add project button clicked');
      e.preventDefault();
      showProjectOnboardingWizard();
    });
  }

  // Onboarding option cards - with error handling
  const onboardingCards = document.querySelectorAll('.onboarding-card');
  if (onboardingCards.length > 0) {
    onboardingCards.forEach(card => {
      if (card && card.dataset && card.dataset.source) {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          const source = card.dataset.source;
          console.log(`📋 Onboarding card clicked: ${source}`);
          showProjectOnboardingWizard(source);
        });
      }
    });
  }

  // Settings
  document.getElementById('refreshInterval')?.addEventListener('change', handleRefreshIntervalChange);
  document.getElementById('themePreference')?.addEventListener('change', handleThemePreferenceChange);

  // Global error handling
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleGlobalError);

  // Browser navigation (back/forward)
  window.addEventListener('hashchange', handleHashChange);
}

/**
 * Toggle sidebar visibility (mobile)
 */
function toggleSidebar() {
  const sidebar = DOM.sidebar;
  const overlay = DOM.sidebarOverlay;

  if (sidebar && overlay) {
    const isOpen = sidebar.classList.contains('open');

    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
}

/**
 * Open sidebar (mobile)
 */
function openSidebar() {
  const sidebar = DOM.sidebar;
  const overlay = DOM.sidebarOverlay;

  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close sidebar (mobile)
 */
function closeSidebar() {
  const sidebar = DOM.sidebar;
  const overlay = DOM.sidebarOverlay;

  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Initialize theme system
 */
function initializeTheme() {
  const theme = AppState.theme;

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    AppState.theme = 'dark'; // Ensure AppState matches DOM
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    AppState.theme = 'light'; // Ensure AppState matches DOM
  } else {
    // Auto theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const autoTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', autoTheme);
    AppState.theme = autoTheme; // Update AppState to match the actual theme being used
  }

  // Update theme toggle icon
  updateThemeToggleIcon();
}

/**
 * Get page from URL hash
 */
function getPageFromUrl() {
  const hash = window.location.hash.substring(1); // Remove the '#'
  const validPages = ['overview', 'reports', 'tasks', 'analytics', 'projects', 'settings'];

  if (validPages.includes(hash)) {
    return hash;
  }

  return null;
}

/**
 * Update URL hash with current page
 */
function updateUrlHash(pageName) {
  // Only update if it's different from current hash to avoid unnecessary history entries
  if (window.location.hash.substring(1) !== pageName) {
    window.location.hash = pageName;
  }
}

/**
 * Show specific page
 */
function showPage(pageName) {
  console.log(`🔄 Showing page: ${pageName}`);
  
  // Hide all pages
  Object.values(DOM.pages).forEach(page => {
    if (page) page.classList.add('hidden');
  });

  // Show target page
  if (DOM.pages[pageName]) {
    DOM.pages[pageName].classList.remove('hidden');
    AppState.currentPage = pageName;

    // Update URL hash for bookmarkable navigation
    updateUrlHash(pageName);
  } else {
    console.warn(`⚠️ Page not found: ${pageName}`);
    return;
  }

  // Update header navigation
  Object.entries(DOM.navButtons).forEach(([page, button]) => {
    if (button) {
      button.classList.toggle('active', page === pageName);
    }
  });

  // Update sidebar navigation
  Object.entries(DOM.sidebarNavButtons).forEach(([page, button]) => {
    if (button) {
      button.classList.toggle('active', page === pageName);
    }
  });

  // Load page-specific data
  loadPageData(pageName);
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  if (AppState.isLoading) return;

  AppState.isLoading = true;
  showLoadingState();

  try {
    // Load real data from API
    await loadRealData();

    AppState.error = null;
    hideLoadingState();

    // Update all pages with new data
    updateAllPages();

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    showError(error.message);
  } finally {
    AppState.isLoading = false;
  }
}

/**
 * Load real data from audit API
 */
async function loadRealData() {
  try {
    console.log('🔄 Starting data load...');

    // Get current project path and settings
    const currentProject = getCurrentProject();

    // If no project, load empty data
    if (!currentProject) {
      console.log('ℹ️ No project selected, loading empty data');
      AppState.data = {
        metrics: {
          totalFiles: 0,
          totalIssues: 0,
          projectHealth: 100,
          completedTasks: 0
        },
        reports: [],
        tasks: [],
        activity: [],
        currentProject: null
      };
      return;
    }

    console.log('📊 Loading data for project:', currentProject.path);

    // Load data from multiple API endpoints with individual error handling
    const results = await Promise.allSettled([
      loadProjectMetrics(currentProject),
      loadProjectReports(currentProject),
      loadProjectTasks(currentProject),
      loadProjectActivity(currentProject)
    ]);

    const metricsData = results[0].status === 'fulfilled' ? results[0].value : { totalFiles: 0, totalIssues: 0, projectHealth: 0, completedTasks: 0 };
    const reportsData = results[1].status === 'fulfilled' ? results[1].value : [];
    const tasksData = results[2].status === 'fulfilled' ? results[2].value : [];
    const activityData = results[3].status === 'fulfilled' ? results[3].value : [];

    console.log('✅ Data loaded:', { metrics: metricsData.totalFiles, reports: reportsData.length, tasks: tasksData.length });

    AppState.data = {
      metrics: metricsData,
      reports: reportsData,
      tasks: tasksData,
      activity: activityData,
      currentProject: currentProject
    };

  } catch (error) {
    console.error('❌ Failed to load real data:', error);
    // Don't throw - just show empty data
    AppState.data = {
      metrics: {
        totalFiles: 0,
        totalIssues: 0,
        projectHealth: 100,
        completedTasks: 0
      },
      reports: [],
      tasks: [],
      activity: [],
      currentProject: null
    };
  }
}

/**
 * Get current project information
 */
function getCurrentProject() {
  // For now, return null - user must explicitly select a project
  // This prevents the infinite loading issue
  return null;
}

/**
 * Show welcome state when no project is selected
 */
function showWelcomeState() {
  // Set isLoading to false to prevent other functions from showing loading state
  AppState.isLoading = false;

  // Hide loading state
  const loadingState = document.getElementById('loadingState');
  if (loadingState) {
    loadingState.classList.add('hidden');
  }

  // Show welcome message in overview page
  const overviewPage = DOM.pages.overview;
  if (overviewPage) {
    overviewPage.classList.remove('hidden'); // Make sure overview page is visible
    overviewPage.innerHTML = `
      <div class="welcome-state">
        <div class="welcome-icon">🚀</div>
        <h2>Welcome to ZippyCodeAudit!</h2>
        <p>Get started by adding your first project to analyze.</p>
        <button class="welcome-btn" onclick="showProjectOnboardingWizard()">Add Your First Project</button>
      </div>
    `;
  }
}

/**
 * Load dashboard data when a project is selected
 */
async function loadDashboardDataForProject() {
  if (AppState.isLoading) return;

  AppState.isLoading = true;
  showLoadingState();

  try {
    console.log('🔄 Loading dashboard data...');

    // Load data with timeout to prevent hanging
    const dataPromise = loadRealData();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Data loading timeout')), 5000)
    );

    await Promise.race([dataPromise, timeoutPromise]);

    AppState.error = null;
    hideLoadingState();
    updateAllPages();

    console.log('✅ Dashboard data loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load dashboard data:', error);

    // Show error but don't crash the app
    AppState.error = error.message;
    hideLoadingState();

    // Show a simple error message instead of crashing
    showError('Unable to load project data. Please try refreshing or adding a different project.');
  } finally {
    AppState.isLoading = false;
  }
}

/**
 * Load project metrics from audit API
 */
async function loadProjectMetrics(project) {
  try {
    // If no project, return empty metrics
    if (!project || !project.path) {
      return {
        totalFiles: 0,
        totalIssues: 0,
        projectHealth: 100,
        completedTasks: 0
      };
    }

    // Use the actual audit API endpoint - only analyze when explicitly requested
    const response = await fetch(`http://localhost:3006/api/analyze?path=${encodeURIComponent(project.path)}&format=json&force=false`, {
      headers: {
        'X-Requested-With': 'dashboard-metrics'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to load metrics: ${response.statusText}`);
    }
    const data = await response.json();

    // Transform audit data to metrics format
    return {
      totalFiles: data.metadata?.totalFilesAnalyzed || 0,
      totalIssues: data.metadata?.totalIssues || 0,
      projectHealth: Math.max(0, 100 - (data.metadata?.totalIssues || 0) * 2), // Simple health calculation
      completedTasks: data.tasks?.filter(t => t.status === 'completed').length || 0
    };
  } catch (error) {
    console.warn('Metrics API not available, using fallback data:', error);
    return {
      totalFiles: 0,
      totalIssues: 0,
      projectHealth: 0,
      completedTasks: 0
    };
  }
}

/**
 * Load project reports from API
 */
async function loadProjectReports(project) {
  try {
    if (!project || !project.path) {
      return [];
    }

    // For now, return recent reports based on audit history
    // In a full implementation, this would load from a reports API
    const response = await fetch(`http://localhost:3006/api/reports?path=${encodeURIComponent(project.path)}`);
    if (!response.ok) {
      throw new Error(`Failed to load reports: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Reports API not available, using empty data:', error);
    return [];
  }
}

/**
 * Load project tasks from API
 */
async function loadProjectTasks(project) {
  try {
    if (!project || !project.path) {
      return [];
    }

    // Transform audit issues into tasks
    const response = await fetch(`http://localhost:3006/api/analyze?path=${encodeURIComponent(project.path)}&format=json`);
    if (!response.ok) {
      throw new Error(`Failed to load tasks: ${response.statusText}`);
    }
    const data = await response.json();

    // Transform issues into tasks
    return (data.issues || []).map((issue, index) => ({
      id: `task-${index + 1}`,
      title: issue.message,
      description: `${issue.type} issue in ${issue.file || 'unknown file'}`,
      category: issue.severity,
      priority: issue.severity === 'high' ? 'high' : issue.severity === 'medium' ? 'medium' : 'low',
      status: 'pending',
      assignee: 'Unassigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('Tasks API not available, using empty data:', error);
    return [];
  }
}

/**
 * Load project activity from API
 */
async function loadProjectActivity(project) {
  try {
    if (!project || !project.path) {
      return [];
    }

    // Fetch activity data from API
    const response = await fetch(`http://localhost:3006/api/activity?path=${encodeURIComponent(project.path)}`);
    if (!response.ok) {
      throw new Error(`Failed to load activity: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Activity API not available, using fallback data:', error);

    // Generate activity based on recent audit actions as fallback
    const activities = [];
    const now = new Date();

    // Add recent audit activity
    activities.push({
      id: 'activity-1',
      type: 'audit',
      title: 'Audit completed',
      timestamp: now.toISOString()
    });

    return activities;
  }
}

/**
 * Setup project selection functionality
 */
async function setupProjectSelection() {
  // Create project selector in header
  const header = document.querySelector('.header-content');
  if (!header) return;

  const projectSelector = document.createElement('div');
  projectSelector.className = 'project-selector';
  projectSelector.innerHTML = `
    <select id="projectSelect" class="project-select">
      <option value="">Loading Projects...</option>
    </select>
  `;

  // Insert before navigation
  const nav = header.querySelector('.nav');
  header.insertBefore(projectSelector, nav);

  // Load available projects from API
  await loadAvailableProjects();

  // Setup change handler
  const select = document.getElementById('projectSelect');
  select.addEventListener('change', handleProjectChange);
}

/**
 * Load available projects
 */
async function loadAvailableProjects() {
  try {
    // Fetch projects from API
    const response = await fetch('http://localhost:3006/api/projects');
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.statusText}`);
    }

    const projects = await response.json();

    const select = document.getElementById('projectSelect');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="">Select Project...</option>';

    // Add project options
    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.path;
      option.textContent = `${project.name} (${project.type})`;
      select.appendChild(option);
    });

    // Set current project if available
    const currentProject = getCurrentProject();
    if (currentProject && currentProject.path) {
      select.value = currentProject.path;
    }

  } catch (error) {
    console.warn('Failed to load available projects:', error);

    // Fallback to hardcoded projects if API fails
    const fallbackProjects = [
      { name: 'Current Directory', path: '.', type: 'generic' },
      { name: 'ZippyCodeAudit', path: 'K:/Projects/ZippyCodeAudit/ZippyCodeAudit-Main', type: 'nodejs' }
    ];

    const select = document.getElementById('projectSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select Project...</option>';

    fallbackProjects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.path;
      option.textContent = `${project.name} (${project.type})`;
      select.appendChild(option);
    });
  }
}

/**
 * Handle project change
 */
async function handleProjectChange(event) {
  const projectPath = event.target.value;
  if (!projectPath) return;

  // Update URL with project parameter
  const url = new URL(window.location);
  url.searchParams.set('project', projectPath);
  window.history.pushState({}, '', url);

  // Reload data for new project
  await loadDashboardData();

  // Show success message
  showNotification(`Switched to project: ${projectPath}`, 'success');
}

/**
 * Update all pages with current data
 */
function updateAllPages() {
  updateOverviewPage();
  updateReportsPage();
  updateTasksPage();
  updateAnalyticsPage();
}

/**
 * Update overview page
 */
function updateOverviewPage() {
  const { metrics, activity } = AppState.data;

  // Update metrics
  Object.entries(metrics).forEach(([key, value]) => {
    const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (element) {
      element.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    }
  });

  // Update recent activity
  const activityContainer = document.getElementById('recentActivity');
  if (activityContainer && activity.length > 0) {
    activityContainer.innerHTML = activity.slice(0, 5).map(activity =>
      createActivityItem(activity)
    ).join('');
  }

  // Update Quick Wins
  if (window.QuickWinsInstance && AppState.data.issues) {
    window.QuickWinsInstance.analyzeIssues(AppState.data.issues);
    window.QuickWinsInstance.init('quickWinsContainer');
  }
}

/**
 * Update reports page
 */
function updateReportsPage() {
  const { reports } = AppState.data;
  const reportsGrid = document.getElementById('reportsGrid');

  if (reportsGrid && reports.length > 0) {
    reportsGrid.innerHTML = reports.map(report =>
      createReportCard(report)
    ).join('');
  }
}

/**
 * Update tasks page
 */
function updateTasksPage() {
  const { tasks } = AppState.data;
  const tasksList = document.getElementById('tasksList');

  if (tasksList && tasks.length > 0) {
    // Filter tasks based on current filter
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filteredTasks = activeFilter === 'all'
      ? tasks
      : tasks.filter(task => task.status === activeFilter);

    tasksList.innerHTML = filteredTasks.map(task =>
      createTaskItem(task)
    ).join('');
  }
}

/**
 * Update analytics page
 */
function updateAnalyticsPage() {
  // Analytics would be populated here with charts and insights
  const analyticsGrid = document.getElementById('analyticsGrid');
  if (analyticsGrid) {
    // For now, just show a placeholder
    analyticsGrid.innerHTML = `
      <div class="chart-container">
        <div class="chart-title">Code Quality Trends</div>
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
          Charts will be rendered here
        </div>
      </div>
    `;
  }
}

/**
 * Create activity item HTML
 */
function createActivityItem(activity) {
  const timeAgo = formatTimeAgo(new Date(activity.timestamp));
  return `
    <div class="activity-item">
      <div class="activity-icon">${getActivityIcon(activity.type)}</div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-time">${timeAgo}</div>
      </div>
    </div>
  `;
}

/**
 * Create report card HTML
 */
function createReportCard(report) {
  return `
    <div class="report-card">
      <div class="report-header">
        <h3 class="report-title">${report.title}</h3>
        <div class="report-date">${new Date(report.date).toLocaleDateString()}</div>
      </div>
      <div class="report-stats">
        <div class="stat-item">
          <span class="stat-label">Issues:</span>
          <span class="stat-value">${report.issues}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Files:</span>
          <span class="stat-value">${report.files}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Score:</span>
          <span class="stat-value">${report.score}%</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create task item HTML
 */
function createTaskItem(task) {
  return `
    <div class="task-item" data-status="${task.status}" data-priority="${task.priority}">
      <div class="task-header">
        <h4 class="task-title">${task.title}</h4>
        <span class="task-priority ${task.priority}">${task.priority}</span>
      </div>
      <div class="task-meta">
        <span>Status: ${task.status}</span>
        <span>Assignee: ${task.assignee}</span>
        <span>Created: ${new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="task-description">${task.description}</div>
    </div>
  `;
}

/**
 * Get activity icon based on type
 */
function getActivityIcon(type) {
  const icons = {
    audit: '🔍',
    task: '✅',
    report: '📊',
    fix: '🔧'
  };
  return icons[type] || '📝';
}

/**
 * Format time ago
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

/**
 * Setup auto-refresh functionality
 */
function setupAutoRefresh() {
  if (AppState.refreshInterval > 0) {
    setInterval(() => {
      if (!AppState.isLoading && AppState.currentPage === 'overview') {
        loadDashboardData();
      }
    }, AppState.refreshInterval);
  }
}

/**
 * Refresh data manually
 */
async function refreshData() {
  if (!AppState.isLoading) {
    await loadDashboardData();
  }
}

/**
 * Export data
 */
async function exportData() {
  try {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      data: AppState.data
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zippycodesaudit-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export failed:', error);
    showError('Failed to export data');
  }
}

/**
 * Setup WebSocket connection for real-time updates
 */
function setupWebSocketConnection() {
  const wsClient = window.getWebSocketClient();

  // Connect to server
  wsClient.connect();

  // Handle connection events
  wsClient.on('connected', () => {
    console.log('WebSocket connected - ready for real-time updates');
    wsClient.subscribe();
  });

  wsClient.on('disconnected', () => {
    console.log('WebSocket disconnected');
  });

  // Handle audit events
  wsClient.on('audit-started', (data) => {
    showLiveProgress(data);
    showToast('🔍 Audit started...', 'info');
  });

  wsClient.on('file-processed', (data) => {
    updateLiveProgress(data);
  });

  wsClient.on('stage-changed', (data) => {
    updateLiveStage(data);
  });

  wsClient.on('issue-detected', (issue) => {
    // Could add live issue notifications here
    console.log('Issue detected:', issue);
  });

  wsClient.on('audit-completed', (results) => {
    hideLiveProgress();
    showToast('✅ Audit completed!', 'success');
    // Refresh dashboard data
    setTimeout(() => loadDashboardData(), 500);
  });

  wsClient.on('audit-error', (error) => {
    hideLiveProgress();
    showToast(`❌ Audit failed: ${error.message}`, 'error');
  });
}

/**
 * Show live progress indicator
 */
function showLiveProgress(data) {
  let progressContainer = document.getElementById('liveProgressContainer');
  
  if (!progressContainer) {
    progressContainer = document.createElement('div');
    progressContainer.id = 'liveProgressContainer';
    progressContainer.className = 'live-progress-container';
    progressContainer.innerHTML = `
      <div class="live-progress-card">
        <div class="live-progress-header">
          <div class="live-progress-icon">⚡</div>
          <div class="live-progress-title">Live Audit in Progress</div>
          <button class="live-progress-close" onclick="hideLiveProgress()">×</button>
        </div>
        <div class="live-progress-body">
          <div class="live-progress-stage" id="liveProgressStage">Initializing...</div>
          <div class="live-progress-bar">
            <div class="live-progress-fill" id="liveProgressFill" style="width: 0%"></div>
          </div>
          <div class="live-progress-stats">
            <div class="live-stat">
              <span class="live-stat-label">Files:</span>
              <span class="live-stat-value" id="liveFilesProcessed">0</span>
              <span class="live-stat-total">/ <span id="liveTotalFiles">0</span></span>
            </div>
            <div class="live-stat">
              <span class="live-stat-label">Issues:</span>
              <span class="live-stat-value live-stat-issues" id="liveIssuesFound">0</span>
            </div>
            <div class="live-stat">
              <span class="live-stat-label">Progress:</span>
              <span class="live-stat-value" id="liveProgress">0%</span>
            </div>
          </div>
          <div class="live-current-file" id="liveCurrentFile"></div>
        </div>
      </div>
    `;
    document.body.appendChild(progressContainer);
  }

  // Update initial values
  document.getElementById('liveTotalFiles').textContent = data.totalFiles || 0;
  document.getElementById('liveFilesProcessed').textContent = data.filesProcessed || 0;
  document.getElementById('liveIssuesFound').textContent = data.issuesFound || 0;
  document.getElementById('liveProgress').textContent = (data.progress || 0) + '%';
  document.getElementById('liveProgressFill').style.width = (data.progress || 0) + '%';

  progressContainer.style.display = 'block';
  setTimeout(() => progressContainer.classList.add('show'), 10);
}

/**
 * Update live progress indicator
 */
function updateLiveProgress(data) {
  document.getElementById('liveFilesProcessed').textContent = data.filesProcessed || 0;
  document.getElementById('liveIssuesFound').textContent = data.issuesFound || 0;
  document.getElementById('liveProgress').textContent = (data.progress || 0) + '%';
  document.getElementById('liveProgressFill').style.width = (data.progress || 0) + '%';
  
  if (data.filename) {
    const fileElement = document.getElementById('liveCurrentFile');
    fileElement.textContent = `Processing: ${data.filename}`;
    fileElement.classList.add('pulse');
    setTimeout(() => fileElement.classList.remove('pulse'), 300);
  }
}

/**
 * Update live stage
 */
function updateLiveStage(data) {
  const stageElement = document.getElementById('liveProgressStage');
  if (stageElement) {
    stageElement.textContent = data.message || data.stage;
  }
}

/**
 * Hide live progress indicator
 */
function hideLiveProgress() {
  const progressContainer = document.getElementById('liveProgressContainer');
  if (progressContainer) {
    progressContainer.classList.remove('show');
    setTimeout(() => {
      progressContainer.style.display = 'none';
    }, 300);
  }
}

/**
 * Toggle theme
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  AppState.theme = newTheme;

  updateThemeToggleIcon();
}

/**
 * Update theme toggle icon
 */
function updateThemeToggleIcon() {
  if (DOM.themeToggle) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    DOM.themeToggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
  }
}

/**
 * Handle refresh interval change
 */
function handleRefreshIntervalChange(event) {
  const newInterval = parseInt(event.target.value);
  AppState.refreshInterval = newInterval;
  localStorage.setItem('refreshInterval', newInterval.toString());

  // Restart auto-refresh with new interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  setupAutoRefresh();
}

/**
 * Handle theme preference change
 */
function handleThemePreferenceChange(event) {
  const newPreference = event.target.value;
  AppState.theme = newPreference;
  localStorage.setItem('theme', newPreference);
  initializeTheme();
}

/**
 * Show loading state
 */
function showLoadingState() {
  DOM.loadingState?.classList.remove('hidden');
  Object.values(DOM.pages).forEach(page => {
    page?.classList.add('hidden');
  });
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  console.log('🔄 hideLoadingState called');
  console.log('DOM.loadingState before:', DOM.loadingState);
  if (DOM.loadingState) {
    DOM.loadingState.classList.add('hidden');
    console.log('✅ Loading state hidden');
  } else {
    console.error('❌ DOM.loadingState is null/undefined');
  }
}

/**
 * Show error state
 */
function showError(message) {
  AppState.error = message;
  DOM.errorState?.classList.remove('hidden');
  Object.values(DOM.pages).forEach(page => {
    page?.classList.add('hidden');
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;

  // Add to DOM
  const container = document.querySelector('.container') || document.body;
  container.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

/**
 * Handle hash change (browser back/forward navigation)
 */
function handleHashChange() {
  const urlPage = getPageFromUrl();
  if (urlPage && urlPage !== AppState.currentPage) {
    showPage(urlPage);
  }
}

/**
 * Handle global errors
 */
function handleGlobalError(error) {
  console.error('Global error:', error);
  showError('An unexpected error occurred');
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Help overlay (?)
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      showKeyboardShortcutsHelp();
      return;
    }

    // ESC to close overlays
    if (e.key === 'Escape') {
      closeAllOverlays();
      return;
    }

    // Navigation shortcuts (1-6 for pages)
    if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.metaKey) {
      const pages = ['overview', 'reports', 'tasks', 'analytics', 'projects', 'settings'];
      const pageIndex = parseInt(e.key) - 1;
      if (pages[pageIndex]) {
        showPage(pages[pageIndex]);
      }
      return;
    }

    // Refresh (R)
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      loadDashboardData();
      return;
    }

    // Toggle mode (M)
    if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (window.ModeSwitcher) {
        window.ModeSwitcher.toggleMode();
      }
      return;
    }

    // Export data (E)
    if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      exportData();
      return;
    }

    // Toggle theme (T)
    if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleTheme();
      return;
    }
  });

  // Setup help button
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      showKeyboardShortcutsHelp();
    });
  }
}

/**
 * Show keyboard shortcuts help overlay
 */
function showKeyboardShortcutsHelp() {
  const existingOverlay = document.getElementById('keyboardHelpOverlay');
  if (existingOverlay) {
    existingOverlay.remove();
    return;
  }

  const isVibeMode = window.ModeSwitcher && window.ModeSwitcher.isVibeMode();

  const overlay = document.createElement('div');
  overlay.id = 'keyboardHelpOverlay';
  overlay.className = 'keyboard-help-overlay';
  overlay.innerHTML = `
    <div class="keyboard-help-modal">
      <div class="keyboard-help-header">
        <h2>${isVibeMode ? '⌨️ Helpful Shortcuts' : '⌨️ Keyboard Shortcuts'}</h2>
        <button class="close-btn" onclick="document.getElementById('keyboardHelpOverlay').remove()">×</button>
      </div>
      <div class="keyboard-help-content">
        <div class="shortcuts-section">
          <h3>Navigation</h3>
          <div class="shortcut-item">
            <kbd>1-6</kbd>
            <span>${isVibeMode ? 'Jump to different pages' : 'Navigate to pages (Overview, Reports, Tasks, etc.)'}</span>
          </div>
          <div class="shortcut-item">
            <kbd>?</kbd>
            <span>${isVibeMode ? 'Show this help' : 'Toggle help overlay'}</span>
          </div>
          <div class="shortcut-item">
            <kbd>ESC</kbd>
            <span>${isVibeMode ? 'Close popups' : 'Close overlays and modals'}</span>
          </div>
        </div>
        <div class="shortcuts-section">
          <h3>Actions</h3>
          <div class="shortcut-item">
            <kbd>R</kbd>
            <span>${isVibeMode ? 'Refresh your data' : 'Refresh dashboard data'}</span>
          </div>
          <div class="shortcut-item">
            <kbd>M</kbd>
            <span>${isVibeMode ? 'Switch modes (Vibe ⟷ Tech)' : 'Toggle between Vibe & Tech modes'}</span>
          </div>
          <div class="shortcut-item">
            <kbd>E</kbd>
            <span>${isVibeMode ? 'Export your results' : 'Export data'}</span>
          </div>
          <div class="shortcut-item">
            <kbd>T</kbd>
            <span>${isVibeMode ? 'Switch light/dark theme' : 'Toggle theme'}</span>
          </div>
        </div>
        <div class="shortcuts-section" data-mode-tech>
          <h3>Advanced</h3>
          <div class="shortcut-item">
            <kbd>Ctrl/Cmd + K</kbd>
            <span>Quick command palette</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl/Cmd + /</kbd>
            <span>Toggle sidebar</span>
          </div>
        </div>
      </div>
      <div class="keyboard-help-footer">
        <p>${isVibeMode ? '💡 Pro tip: Press the key shown to perform the action!' : 'Press any shortcut key to close this dialog'}</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Apply mode-specific visibility
  if (window.ModeSwitcher) {
    window.ModeSwitcher.updateUIForMode(window.ModeSwitcher.getMode());
  }

  // Close on click outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Close on any key press
  const closeOnKey = (e) => {
    overlay.remove();
    document.removeEventListener('keydown', closeOnKey);
  };
  document.addEventListener('keydown', closeOnKey);
}

/**
 * Close all overlays
 */
function closeAllOverlays() {
  const overlays = document.querySelectorAll('.keyboard-help-overlay, .modal-overlay, .tooltip-persistent');
  overlays.forEach(overlay => overlay.remove());
}

/**
 * Check if first run and show onboarding
 */
function checkFirstRun() {
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
  
  if (!hasSeenOnboarding) {
    setTimeout(() => {
      showOnboardingWizard();
    }, 1000);
  }
}

/**
 * Show onboarding wizard
 */
function showOnboardingWizard() {
  const overlay = document.createElement('div');
  overlay.id = 'onboardingOverlay';
  overlay.className = 'onboarding-overlay';
  overlay.innerHTML = `
    <div class="onboarding-modal">
      <div class="onboarding-header">
        <h2>👋 Welcome to ZippyCodeAudit!</h2>
      </div>
      <div class="onboarding-content">
        <p>Let's get you started with code auditing. Which best describes you?</p>
        <div class="skill-options">
          <button class="skill-option" data-skill="beginner">
            <div class="skill-icon">🌱</div>
            <div class="skill-title">Just Starting Out</div>
            <div class="skill-desc">I'm new to code auditing and want guidance</div>
          </button>
          <button class="skill-option" data-skill="intermediate">
            <div class="skill-icon">🚀</div>
            <div class="skill-title">Getting the Hang of It</div>
            <div class="skill-desc">I know the basics and want helpful insights</div>
          </button>
          <button class="skill-option" data-skill="advanced">
            <div class="skill-icon">⚡</div>
            <div class="skill-title">Power User</div>
            <div class="skill-desc">I want detailed metrics and advanced features</div>
          </button>
        </div>
      </div>
      <div class="onboarding-footer">
        <button class="skip-btn" onclick="skipOnboarding()">Skip for now</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Handle skill selection
  const skillOptions = overlay.querySelectorAll('.skill-option');
  skillOptions.forEach(option => {
    option.addEventListener('click', () => {
      const skill = option.getAttribute('data-skill');
      completeOnboarding(skill);
    });
  });
}

/**
 * Complete onboarding with skill level
 */
function completeOnboarding(skill) {
  localStorage.setItem('hasSeenOnboarding', 'true');
  localStorage.setItem('userSkillLevel', skill);

  // Set appropriate mode
  if (window.ModeSwitcher) {
    const mode = (skill === 'advanced') ? 'tech' : 'vibe';
    window.ModeSwitcher.currentMode = mode;
    window.ModeSwitcher.applyMode(mode);
    localStorage.setItem('userMode', mode);
  }

  // Remove overlay
  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 300);
  }

  // Show success message
  showToast(skill === 'advanced' ? 
    '🔧 Developer Tech mode activated!' : 
    '😎 Vibe & Chill mode activated!', 
    'success'
  );

  // Show quick tour
  setTimeout(() => {
    showQuickTour();
  }, 500);
}

/**
 * Skip onboarding
 */
function skipOnboarding() {
  localStorage.setItem('hasSeenOnboarding', 'true');
  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Show quick feature tour
 */
function showQuickTour() {
  const tourSteps = [
    {
      element: '.metrics-grid',
      title: 'Your Project Health',
      description: 'These cards show your project\'s current status at a glance.'
    },
    {
      element: '#modeToggle',
      title: 'Switch Modes Anytime',
      description: 'Toggle between Vibe & Chill and Developer Tech modes based on your needs.'
    },
    {
      element: '.sidebar-nav',
      title: 'Navigate Easily',
      description: 'Access different sections from the sidebar or use number keys (1-6).'
    }
  ];

  let currentStep = 0;

  function showStep(index) {
    if (index >= tourSteps.length) {
      return;
    }

    const step = tourSteps[index];
    const element = document.querySelector(step.element);
    if (!element) {
      showStep(index + 1);
      return;
    }

    const rect = element.getBoundingClientRect();
    const spotlight = document.createElement('div');
    spotlight.className = 'tour-spotlight';
    spotlight.style.top = `${rect.top - 8}px`;
    spotlight.style.left = `${rect.left - 8}px`;
    spotlight.style.width = `${rect.width + 16}px`;
    spotlight.style.height = `${rect.height + 16}px`;

    const tooltip = document.createElement('div');
    tooltip.className = 'tour-tooltip';
    tooltip.innerHTML = `
      <h3>${step.title}</h3>
      <p>${step.description}</p>
      <div class="tour-actions">
        <button class="tour-btn-skip" onclick="endTour()">Skip Tour</button>
        <div class="tour-progress">${index + 1} / ${tourSteps.length}</div>
        <button class="tour-btn-next" onclick="nextTourStep()">${index === tourSteps.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    `;

    tooltip.style.top = `${rect.bottom + 16}px`;
    tooltip.style.left = `${rect.left}px`;

    document.body.appendChild(spotlight);
    document.body.appendChild(tooltip);

    // Store for cleanup
    window.currentTourElements = { spotlight, tooltip };
  }

  window.nextTourStep = function() {
    if (window.currentTourElements) {
      window.currentTourElements.spotlight.remove();
      window.currentTourElements.tooltip.remove();
    }
    currentStep++;
    if (currentStep < tourSteps.length) {
      showStep(currentStep);
    } else {
      endTour();
    }
  };

  window.endTour = function() {
    if (window.currentTourElements) {
      window.currentTourElements.spotlight.remove();
      window.currentTourElements.tooltip.remove();
    }
    showToast('🎉 You\'re all set! Press ? anytime for keyboard shortcuts.', 'success');
  };

  showStep(0);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Load page-specific data
 */
function loadPageData(pageName) {
  switch (pageName) {
    case 'tasks':
      setupTaskFilters();
      break;
    case 'projects':
      // Refresh projects list when projects page is shown
      if (window.ProjectsGrid) {
        window.ProjectsGrid.refresh();
      }
      break;
    case 'analytics':
      // Load analytics data
      break;
  }
}

/**
 * Setup task filters
 */
function setupTaskFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active filter
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter tasks
      updateTasksPage();
    });
  });
}

// Global variable for auto-refresh interval
let autoRefreshInterval = null;

// Global AI Assistant instance
let aiAssistantBubble = null;
let currentProjectDetection = null;

/**
 * Show Project Onboarding Wizard
 */
function showProjectOnboardingWizard(initialSource = null) {
  const mode = window.ModeSwitcher ? window.ModeSwitcher.getCurrentMode() : 'vibe';
  const wizard = new ProjectOnboardingWizard(mode);
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  wizard.show(container, async (projectData) => {
    try {
      showToast('Adding project...', 'info');
      
      // Save detection for later use
      currentProjectDetection = projectData.detection;
      
      // Add project to registry via API
      const response = await fetch(`${API_BASE_URL}/projects/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: projectData.path,
          metadata: {
            source: projectData.source,
            sourceUrl: projectData.url,
            detection: projectData.detection,
            preset: projectData.preset,
            complexity: projectData.detection?.complexity,
            frameworks: projectData.detection?.frameworks,
            languages: projectData.detection?.languages,
            fileCount: projectData.detection?.fileCount
          }
        })
      });
      
      const result = await response.json();
      
              if (result.success) {
                showToast('Project added successfully! 🎉', 'success');

                console.log('✅ Project added, loading dashboard data...');

                try {
                  // Initialize AI Assistant if not already done
                  if (!aiAssistantBubble && window.AIAssistantBubble) {
                    initializeAIAssistant(mode);
                  }

                  // Load dashboard data for the new project
                  await loadDashboardDataForProject();

                  // Refresh projects list
                  if (window.ProjectsGrid) {
                    window.ProjectsGrid.refresh();
                  }
                } catch (dataError) {
                  console.warn('⚠️ Dashboard data loading failed:', dataError);
                  // Don't fail the entire process if data loading fails
                  showToast('Project added! (Some data loading failed)', 'warning');
                }
      } else {
        showToast('Failed to add project: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      showToast('Failed to add project: ' + error.message, 'error');
    }
  });
  
  // If initial source specified, skip to that step
  if (initialSource) {
    // The wizard can be enhanced to jump to specific source
    console.log('Initial source:', initialSource);
  }
}

/**
 * Initialize AI Assistant
 */
function initializeAIAssistant(mode) {
  if (!currentProjectDetection || !window.AIAssistantBubble) {
    return;
  }
  
  try {
    // This would require loading the backend AuditAssistant module
    // For now, we'll create a simple client-side version
    aiAssistantBubble = new AIAssistantBubble(mode);
    
    // Create a simple assistant object for the bubble
    const simpleAssistant = {
      getWelcomeMessage: () => {
        if (mode === 'vibe') {
          return `👋 Hey! I'm Zippy, your code buddy! I just checked out your project and it looks cool! Ready to make it even better? 🚀`;
        } else {
          return `Code Assistant initialized. Project analysis complete. Ready to proceed with audit configuration.`;
        }
      },
      respondTo: (message) => {
        const lower = message.toLowerCase();
        if (lower.includes('help')) {
          return mode === 'vibe' 
            ? "I'm here to help you check your code! Just ask me anything about your project or the audit results. 😊"
            : "Available commands: analyze, explain <term>, fix <issue>, history, export";
        }
        if (lower.includes('thank')) {
          return mode === 'vibe'
            ? "You're welcome! Happy to help! 🎉"
            : "You're welcome.";
        }
        return mode === 'vibe'
          ? "I'm still learning! But I can help you understand your audit results. Try clicking on issues to see more details! 💡"
          : "Command not recognized. Type 'help' for available commands.";
      }
    };
    
    aiAssistantBubble.initialize(simpleAssistant);
  } catch (error) {
    console.error('Failed to initialize AI assistant:', error);
  }
}

/**
 * Start Progressive Audit
 */
async function startProgressiveAudit(projectId, testSuite) {
  try {
    showToast('Starting audit...', 'info');
    
    // Show live progress indicator
    showLiveProgress('Initializing audit...');
    
    // Create EventSource for server-sent events
    const eventSource = new EventSource(`${API_BASE_URL}/projects/${projectId}/audit/progressive?testSuite=${testSuite}`);
    
    eventSource.onmessage = (event) => {
      const progress = JSON.parse(event.data);
      
      if (progress.phase === 'complete') {
        eventSource.close();
        hideLiveProgress();
        updateDashboardWithResults(progress.results);
        showToast('Audit complete! ✅', 'success');
        
        if (aiAssistantBubble) {
          aiAssistantBubble.showResultsSummary(progress.results);
          const quickWinsCount = progress.results.issues?.filter(i => i.fix && i.fixTime < 300).length || 0;
          aiAssistantBubble.showNextSteps(progress.results, quickWinsCount);
        }
      } else if (progress.phase === 'error') {
        eventSource.close();
        hideLiveProgress();
        showToast('Audit failed: ' + progress.error, 'error');
      } else {
        // Update live progress
        updateLiveProgress(progress.message, progress.progress);
        updateLiveStage(progress.stage);
        
        if (aiAssistantBubble && progress.message) {
          aiAssistantBubble.showAnalysisTip(progress.stage, progress.progress);
        }
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      hideLiveProgress();
      showToast('Connection error during audit', 'error');
    };
  } catch (error) {
    console.error('Failed to start audit:', error);
    showToast('Failed to start audit: ' + error.message, 'error');
    hideLiveProgress();
  }
}

/**
 * Update dashboard with audit results
 */
function updateDashboardWithResults(results) {
  // Update metrics
  if (results.metadata) {
    AppState.data.metrics = {
      totalFiles: results.metadata.totalFilesAnalyzed || 0,
      totalIssues: results.issues?.length || 0,
      healthScore: calculateHealthScore(results),
      completedTasks: results.issues?.filter(i => i.status === 'fixed').length || 0
    };
  }
  
  // Update tasks
  if (results.issues) {
    AppState.data.tasks = results.issues.map((issue, index) => ({
      id: index + 1,
      title: issue.message || issue.title,
      description: issue.description || '',
      severity: issue.severity || 'medium',
      status: issue.status || 'pending',
      file: issue.file,
      line: issue.line
    }));
  }
  
  // Reload dashboard data
  loadDashboardData();
}

/**
 * Calculate health score
 */
function calculateHealthScore(results) {
  const files = results.metadata?.totalFilesAnalyzed || 1;
  const issues = results.issues?.length || 0;
  
  const highIssues = results.issues?.filter(i => i.severity === 'high').length || 0;
  const mediumIssues = results.issues?.filter(i => i.severity === 'medium').length || 0;
  const lowIssues = results.issues?.filter(i => i.severity === 'low').length || 0;
  
  const penalty = (highIssues * 10) + (mediumIssues * 5) + lowIssues;
  const maxPenalty = files * 5;
  
  const score = Math.max(0, Math.round(100 - (penalty / maxPenalty) * 100));
  return Math.min(100, score);
}

// Export functions for use in other modules
window.ZippyCodeAuditDashboard = {
  loadData: loadDashboardData,
  showPage,
  exportData,
  refreshData,
  showProjectOnboardingWizard
};
