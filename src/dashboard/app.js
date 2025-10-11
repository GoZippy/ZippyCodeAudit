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

// DOM Elements Cache
const DOM = {
  pages: {},
  navButtons: {},
  refreshBtn: null,
  exportBtn: null,
  themeToggle: null,
  loadingState: null,
  errorState: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    // Cache DOM elements
    cacheDOMElements();

    // Setup event listeners
    setupEventListeners();

    // Initialize theme
    initializeTheme();

    // Load initial data
    await loadDashboardData();

    // Setup auto-refresh if enabled
    setupAutoRefresh();

    // Initialize page navigation
    showPage('overview');

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
    settings: document.getElementById('settingsPage')
  };

  // Navigation
  DOM.navButtons = Array.from(document.querySelectorAll('.nav-button')).reduce((acc, btn) => {
    acc[btn.dataset.page] = btn;
    return acc;
  }, {});

  // Actions
  DOM.refreshBtn = document.getElementById('refreshBtn');
  DOM.exportBtn = document.getElementById('exportBtn');
  DOM.themeToggle = document.getElementById('themeToggle');

  // States
  DOM.loadingState = document.getElementById('loadingState');
  DOM.errorState = document.getElementById('errorState');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Navigation
  Object.entries(DOM.navButtons).forEach(([page, button]) => {
    button.addEventListener('click', () => showPage(page));
  });

  // Actions
  DOM.refreshBtn?.addEventListener('click', refreshData);
  DOM.exportBtn?.addEventListener('click', exportData);
  DOM.themeToggle?.addEventListener('click', toggleTheme);

  // Settings
  document.getElementById('refreshInterval')?.addEventListener('change', handleRefreshIntervalChange);
  document.getElementById('themePreference')?.addEventListener('change', handleThemePreferenceChange);

  // Global error handling
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleGlobalError);
}

/**
 * Initialize theme system
 */
function initializeTheme() {
  const theme = AppState.theme;

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    // Auto theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  // Update theme toggle icon
  updateThemeToggleIcon();
}

/**
 * Show specific page
 */
function showPage(pageName) {
  // Hide all pages
  Object.values(DOM.pages).forEach(page => {
    page.classList.add('hidden');
  });

  // Show target page
  if (DOM.pages[pageName]) {
    DOM.pages[pageName].classList.remove('hidden');
    AppState.currentPage = pageName;
  }

  // Update navigation
  Object.entries(DOM.navButtons).forEach(([page, button]) => {
    button.classList.toggle('active', page === pageName);
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
    // In a real implementation, this would fetch from an API
    // For now, we'll simulate data loading
    await simulateDataLoading();

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
 * Simulate data loading for demo purposes
 */
async function simulateDataLoading() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock data
  AppState.data = {
    metrics: {
      totalFiles: Math.floor(Math.random() * 1000) + 500,
      totalIssues: Math.floor(Math.random() * 50) + 10,
      projectHealth: Math.floor(Math.random() * 40) + 60,
      completedTasks: Math.floor(Math.random() * 20) + 5
    },
    reports: generateMockReports(),
    tasks: generateMockTasks(),
    activity: generateMockActivity()
  };
}

/**
 * Generate mock reports data
 */
function generateMockReports() {
  const reports = [];
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    reports.push({
      id: `report-${i + 1}`,
      title: `Audit Report ${date.toISOString().split('T')[0]}`,
      date: date.toISOString(),
      type: ['full', 'security', 'performance'][i % 3],
      issues: Math.floor(Math.random() * 20) + 5,
      files: Math.floor(Math.random() * 200) + 100,
      score: Math.floor(Math.random() * 40) + 60
    });
  }

  return reports;
}

/**
 * Generate mock tasks data
 */
function generateMockTasks() {
  const tasks = [];
  const categories = ['security', 'performance', 'maintainability', 'documentation'];
  const priorities = ['high', 'medium', 'low'];
  const statuses = ['pending', 'in-progress', 'completed'];

  for (let i = 0; i < 15; i++) {
    tasks.push({
      id: `task-${i + 1}`,
      title: `Fix ${categories[i % categories.length]} issue in component ${i + 1}`,
      description: `Detailed description of the task that needs to be completed for better code quality.`,
      category: categories[i % categories.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      assignee: `Developer ${i % 3 + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return tasks;
}

/**
 * Generate mock activity data
 */
function generateMockActivity() {
  const activities = [];
  const types = ['audit', 'task', 'report', 'fix'];

  for (let i = 0; i < 10; i++) {
    activities.push({
      id: `activity-${i + 1}`,
      type: types[i % types.length],
      title: `${types[i % types.length].charAt(0).toUpperCase() + types[i % types.length].slice(1)} completed`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
  DOM.loadingState?.classList.add('hidden');
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
 * Handle global errors
 */
function handleGlobalError(error) {
  console.error('Global error:', error);
  showError('An unexpected error occurred');
}

/**
 * Load page-specific data
 */
function loadPageData(pageName) {
  switch (pageName) {
    case 'tasks':
      setupTaskFilters();
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

// Export functions for use in other modules
window.ZippyCodeAuditDashboard = {
  loadData: loadDashboardData,
  showPage,
  exportData,
  refreshData
};
