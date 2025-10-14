/**
 * Activity Item Component
 * Displays recent audit activities with real-time updates
 */

class ActivityItem {
  constructor(activity) {
    this.activity = activity;
    this.element = null;
  }

  /**
   * Render the activity item HTML
   */
  render() {
    const timeAgo = this.formatTimeAgo(new Date(this.activity.timestamp));

    return `
      <div class="activity-item">
        <div class="activity-icon">${this.getActivityIcon(this.activity.type)}</div>
        <div class="activity-content">
          <div class="activity-title">${this.activity.title}</div>
          <div class="activity-time">${timeAgo}</div>
        </div>
      </div>
    `;
  }

  /**
   * Get activity icon based on type
   */
  getActivityIcon(type) {
    const icons = {
      audit: '🔍',
      task: '✅',
      report: '📊',
      fix: '🔧',
      analysis: '📈',
      check: '✓'
    };
    return icons[type] || '📝';
  }

  /**
   * Format time ago
   */
  formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
}

/**
 * Activity List Manager
 */
class ActivityList {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.activities = [];
  }

  /**
   * Initialize the activity list
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Activity container not found: ${this.containerId}`);
      return;
    }
  }

  /**
   * Update activities with new data
   */
  update(activities) {
    this.activities = activities || [];
    this.render();
  }

  /**
   * Render all activities
   */
  render() {
    if (!this.container) return;

    if (this.activities.length === 0) {
      this.container.innerHTML = '<div class="activity-item"><div class="activity-content"><div class="activity-title">No recent activity</div></div></div>';
      return;
    }

    this.container.innerHTML = this.activities
      .slice(0, 5) // Show only last 5 activities
      .map(activity => new ActivityItem(activity).render())
      .join('');
  }

  /**
   * Add a new activity
   */
  addActivity(activity) {
    this.activities.unshift(activity);
    this.render();
  }
}

/**
 * Initialize activity list
 */
function initializeActivityList() {
  const activityList = new ActivityList('recentActivity');
  activityList.init();

  window.ActivityList = activityList;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeActivityList);
} else {
  initializeActivityList();
}
