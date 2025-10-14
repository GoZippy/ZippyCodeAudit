/**
 * Metrics Card Component
 * Displays key audit metrics with real-time updates
 */

class MetricsCard {
  constructor(elementId, label, icon) {
    this.elementId = elementId;
    this.label = label;
    this.icon = icon;
    this.element = null;
    this.value = 0;
  }

  /**
   * Initialize the metrics card
   */
  init() {
    this.element = document.getElementById(this.elementId);
    if (!this.element) {
      console.warn(`Metrics card element not found: ${this.elementId}`);
      return;
    }

    this.render();
  }

  /**
   * Update the card with new value
   */
  update(value) {
    this.value = value;
    if (this.element) {
      const valueElement = this.element.querySelector('.metric-value');
      if (valueElement) {
        valueElement.textContent = value.toLocaleString();
      }
    }
  }

  /**
   * Render the card HTML
   */
  render() {
    if (!this.element) return;

    this.element.innerHTML = `
      <div class="metric-icon">${this.icon}</div>
      <div class="metric-content">
        <div class="metric-value">${this.value.toLocaleString()}</div>
        <div class="metric-label">${this.label}</div>
      </div>
    `;
  }
}

/**
 * Initialize all metrics cards
 */
function initializeMetricsCards() {
  const cards = [
    new MetricsCard('totalFiles', 'Files Analyzed', '📊'),
    new MetricsCard('totalIssues', 'Issues Found', '⚠️'),
    new MetricsCard('projectHealth', 'Health Score', '📈'),
    new MetricsCard('completedTasks', 'Tasks Done', '✅')
  ];

  cards.forEach(card => card.init());

  // Export cards for external updates
  window.MetricsCards = cards;
}

/**
 * Update all metrics cards with new data
 */
function updateMetricsCards(data) {
  if (window.MetricsCards && data.metrics) {
    window.MetricsCards.forEach(card => {
      const value = data.metrics[card.elementId.replace(/([A-Z])/g, (match) => match.toLowerCase())];
      if (value !== undefined) {
        card.update(value);
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMetricsCards);
} else {
  initializeMetricsCards();
}
