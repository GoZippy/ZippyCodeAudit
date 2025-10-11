/**
 * API Utilities - Lightweight API communication for dashboard
 * Handles data fetching, caching, and error management
 */

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.ZIPPY_MCP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

/**
 * API Client for ZippyMCP integration
 */
class ZippyMCPClient {
  constructor(config = {}) {
    this.config = { ...API_CONFIG, ...config };
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Fetch audit data from API
   */
  async fetchAuditData(projectId = 'current') {
    const cacheKey = `audit-${projectId}`;
    return this.makeRequest('GET', `/projects/${projectId}/audit`, null, cacheKey);
  }

  /**
   * Fetch reports data
   */
  async fetchReports(projectId = 'current') {
    const cacheKey = `reports-${projectId}`;
    return this.makeRequest('GET', `/projects/${projectId}/reports`, null, cacheKey);
  }

  /**
   * Fetch tasks data
   */
  async fetchTasks(projectId = 'current') {
    const cacheKey = `tasks-${projectId}`;
    return this.makeRequest('GET', `/projects/${projectId}/tasks`, null, cacheKey);
  }

  /**
   * Update task status
   */
  async updateTask(taskId, updates) {
    return this.makeRequest('PATCH', `/tasks/${taskId}`, updates);
  }

  /**
   * Create new task
   */
  async createTask(taskData) {
    return this.makeRequest('POST', '/tasks', taskData);
  }

  /**
   * Submit audit report
   */
  async submitReport(reportData) {
    return this.makeRequest('POST', '/reports', reportData);
  }

  /**
   * Make HTTP request with caching and retry logic
   */
  async makeRequest(method, endpoint, data = null, cacheKey = null) {
    const url = `${this.config.BASE_URL}${endpoint}`;

    // Check cache first
    if (method === 'GET' && cacheKey) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check for pending request
    const pendingKey = `${method}-${url}`;
    if (this.pendingRequests.has(pendingKey)) {
      return this.pendingRequests.get(pendingKey);
    }

    // Create request promise
    const requestPromise = this.executeRequest(method, url, data);

    // Store pending request
    this.pendingRequests.set(pendingKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache GET requests
      if (method === 'GET' && cacheKey) {
        this.setCachedData(cacheKey, result);
      }

      return result;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  async executeRequest(method, url, data) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.TIMEOUT);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getAuthHeader()
          },
          body: data ? JSON.stringify(data) : null,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) or aborts
        if (error.name === 'AbortError' || (error.message && error.message.includes('4'))) {
          break;
        }

        // Wait before retry
        if (attempt < this.config.RETRY_ATTEMPTS) {
          await this.delay(this.config.RETRY_DELAY * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Get cached data if not expired
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.config.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached data
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    // In a real implementation, this would get the auth token
    // For now, return a placeholder
    return `Bearer ${localStorage.getItem('zippyMcpToken') || 'guest'}`;
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Mock API client for offline/demo mode
 */
class MockAPIClient {
  async fetchAuditData() {
    await this.delay(800);
    return {
      metrics: {
        totalFiles: 847,
        totalIssues: 23,
        projectHealth: 78,
        completedTasks: 15
      },
      issues: [
        { type: 'security', severity: 'high', message: 'Potential XSS vulnerability', file: 'src/components/Auth.js' },
        { type: 'performance', severity: 'medium', message: 'Large bundle size detected', file: 'dist/bundle.js' }
      ]
    };
  }

  async fetchReports() {
    await this.delay(600);
    return [
      { id: '1', title: 'Security Audit', date: '2024-01-15', type: 'security', score: 85 },
      { id: '2', title: 'Performance Audit', date: '2024-01-10', type: 'performance', score: 72 }
    ];
  }

  async fetchTasks() {
    await this.delay(400);
    return [
      { id: '1', title: 'Fix XSS vulnerability', status: 'in-progress', priority: 'high' },
      { id: '2', title: 'Optimize bundle size', status: 'pending', priority: 'medium' }
    ];
  }

  async updateTask(taskId, updates) {
    await this.delay(300);
    return { success: true, taskId, updates };
  }

  async createTask(taskData) {
    await this.delay(500);
    return { success: true, taskId: Date.now().toString(), ...taskData };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * API Factory - Returns appropriate client based on configuration
 */
function createAPIClient(config = {}) {
  // Check if ZippyMCP is available/configured
  const useZippyMCP = config.useZippyMCP !== false &&
    (process.env.ZIPPY_MCP_API_URL || localStorage.getItem('zippyMcpEndpoint'));

  if (useZippyMCP) {
    return new ZippyMCPClient(config);
  } else {
    return new MockAPIClient();
  }
}

/**
 * Data synchronization utilities
 */
const DataSync = {
  /**
   * Sync dashboard data with API
   */
  async syncWithAPI(apiClient, options = {}) {
    const { force = false, sections = ['metrics', 'reports', 'tasks'] } = options;

    try {
      const results = {};

      if (sections.includes('metrics')) {
        results.metrics = await apiClient.fetchAuditData();
      }

      if (sections.includes('reports')) {
        results.reports = await apiClient.fetchReports();
      }

      if (sections.includes('tasks')) {
        results.tasks = await apiClient.fetchTasks();
      }

      return results;
    } catch (error) {
      console.error('Data sync failed:', error);
      throw new Error(`Failed to sync data: ${error.message}`);
    }
  },

  /**
   * Batch update multiple items
   */
  async batchUpdate(apiClient, updates) {
    const results = [];

    for (const update of updates) {
      try {
        const result = await apiClient.updateTask(update.taskId, update.data);
        results.push({ success: true, taskId: update.taskId, result });
      } catch (error) {
        results.push({ success: false, taskId: update.taskId, error: error.message });
      }
    }

    return results;
  }
};

/**
 * Error handling utilities
 */
const ErrorHandler = {
  /**
   * Handle API errors gracefully
   */
  handleAPIError(error, context = '') {
    console.error(`API Error ${context}:`, error);

    // Determine error type and provide user-friendly message
    if (error.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }

    if (error.message && error.message.includes('4')) {
      return 'Resource not found or access denied.';
    }

    if (error.message && error.message.includes('5')) {
      return 'Server error. Please try again later.';
    }

    return 'Network error. Please check your connection.';
  },

  /**
   * Retry failed operations
   */
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  }
};

// Export utilities
window.ZippyCodeAuditAPI = {
  createAPIClient,
  DataSync,
  ErrorHandler,
  ZippyMCPClient,
  MockAPIClient
};
