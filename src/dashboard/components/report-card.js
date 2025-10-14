/**
 * Report Card Component
 * Displays audit report summaries with actionable insights
 */

class ReportCard {
  constructor(report) {
    this.report = report;
    this.element = null;
  }

  /**
   * Render the report card HTML
   */
  render() {
    const date = new Date(this.report.date).toLocaleDateString();
    const score = this.report.score || 0;

    return `
      <div class="report-card">
        <div class="report-header">
          <h3 class="report-title">${this.report.title}</h3>
          <div class="report-date">${date}</div>
        </div>
        <div class="report-stats">
          <div class="stat-item">
            <span class="stat-label">Issues:</span>
            <span class="stat-value">${this.report.issues || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Files:</span>
            <span class="stat-value">${this.report.files || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Score:</span>
            <span class="stat-value">${score}%</span>
          </div>
        </div>
        <div class="report-actions">
          <button class="btn btn-small" onclick="viewReport('${this.report.id}')">View</button>
          <button class="btn btn-small btn-secondary" onclick="downloadReport('${this.report.id}')">Download</button>
        </div>
      </div>
    `;
  }
}

/**
 * Reports Grid Manager
 */
class ReportsGrid {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.reports = [];
  }

  /**
   * Initialize the reports grid
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Reports container not found: ${this.containerId}`);
      return;
    }
  }

  /**
   * Update reports with new data
   */
  update(reports) {
    this.reports = reports || [];
    this.render();
  }

  /**
   * Render all reports
   */
  render() {
    if (!this.container) return;

    if (this.reports.length === 0) {
      this.container.innerHTML = '<div class="no-reports">No audit reports available</div>';
      return;
    }

    this.container.innerHTML = this.reports
      .map(report => new ReportCard(report).render())
      .join('');
  }
}

/**
 * Initialize reports grid
 */
function initializeReportsGrid() {
  const reportsGrid = new ReportsGrid('reportsGrid');
  reportsGrid.init();

  window.ReportsGrid = reportsGrid;
}

// Global functions for report actions (to be implemented)
window.viewReport = function(reportId) {
  console.log('Viewing report:', reportId);
  // TODO: Implement report viewing
};

window.downloadReport = function(reportId) {
  console.log('Downloading report:', reportId);
  // TODO: Implement report download
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReportsGrid);
} else {
  initializeReportsGrid();
}
