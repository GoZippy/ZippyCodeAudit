/**
 * Enhanced Charts and Visualizations
 * Provides interactive charts and visual components
 */

class EnhancedCharts {
  constructor() {
    this.charts = new Map();
  }

  /**
   * Create health score gauge
   */
  createHealthGauge(containerId, score, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const {
      size = 200,
      thickness = 20,
      animated = true
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - thickness) / 2;

    // Determine color based on score
    const color = this.getHealthColor(score);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = thickness;
    ctx.stroke();

    // Draw score arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (score / 100) * 2 * Math.PI;

    if (animated) {
      this.animateArc(ctx, centerX, centerY, radius, thickness, startAngle, endAngle, color);
    } else {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw score text
    this.drawCenteredText(ctx, centerX, centerY, score, size);

    return canvas;
  }

  /**
   * Animate arc drawing
   */
  animateArc(ctx, x, y, radius, thickness, startAngle, endAngle, color) {
    let currentAngle = startAngle;
    const angleStep = (endAngle - startAngle) / 60;

    const animate = () => {
      if (currentAngle < endAngle) {
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, currentAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        currentAngle += angleStep;
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Draw centered text in gauge
   */
  drawCenteredText(ctx, x, y, score, size) {
    ctx.font = `bold ${size * 0.2}px Inter, sans-serif`;
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(score), x, y - 10);

    ctx.font = `${size * 0.08}px Inter, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('Health Score', x, y + 20);
  }

  /**
   * Get health color based on score
   */
  getHealthColor(score) {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  }

  /**
   * Create trend chart (line chart)
   */
  createTrendChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const {
      width = 600,
      height = 300,
      color = '#6366f1',
      showGrid = true,
      showPoints = true
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid
    if (showGrid) {
      this.drawGrid(ctx, padding, chartWidth, chartHeight);
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    if (showPoints) {
      data.forEach((point, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw axes labels
    this.drawAxesLabels(ctx, data, padding, width, height, minValue, maxValue);

    return canvas;
  }

  /**
   * Draw grid lines
   */
  drawGrid(ctx, padding, chartWidth, chartHeight) {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }
  }

  /**
   * Draw axes labels
   */
  drawAxesLabels(ctx, data, padding, width, height, minValue, maxValue) {
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';

    // X-axis labels (dates)
    const step = Math.ceil(data.length / 5);
    data.forEach((point, i) => {
      if (i % step === 0 || i === data.length - 1) {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        ctx.fillText(point.label || '', x, height - 10);
      }
    });

    // Y-axis labels (values)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (i / 5) * (maxValue - minValue);
      const y = height - padding - (i / 5) * (height - padding * 2);
      ctx.fillText(Math.round(value), padding - 10, y + 4);
    }
  }

  /**
   * Create bar chart
   */
  createBarChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const {
      width = 400,
      height = 300,
      colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const padding = 40;
    const chartHeight = height - padding * 2;
    const barWidth = (width - padding * 2) / data.length - 10;

    // Find max value
    const maxValue = Math.max(...data.map(d => d.value));

    // Draw bars
    data.forEach((item, i) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = padding + i * ((width - padding * 2) / data.length) + 5;
      const y = height - padding - barHeight;
      const color = colors[i % colors.length];

      // Draw bar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - 10);

      // Draw value
      ctx.fillStyle = '#1e293b';
      ctx.fillText(item.value, x + barWidth / 2, y - 10);
    });

    return canvas;
  }

  /**
   * Create pie chart
   */
  createPieChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const {
      size = 300,
      colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 40;

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Draw segments
    let currentAngle = -Math.PI / 2;
    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const color = colors[i % colors.length];

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 25);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 25);

      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, labelX, labelY);

      currentAngle += sliceAngle;
    });

    return canvas;
  }

  /**
   * Create progress ring
   */
  createProgressRing(containerId, percentage, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const {
      size = 120,
      thickness = 10,
      color = '#6366f1',
      label = ''
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - thickness) / 2;

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = thickness;
    ctx.stroke();

    // Progress arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center text
    ctx.font = `bold ${size * 0.25}px Inter, sans-serif`;
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(percentage)}%`, centerX, centerY);

    if (label) {
      ctx.font = `${size * 0.1}px Inter, sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(label, centerX, centerY + size * 0.15);
    }

    return canvas;
  }

  /**
   * Create sparkline (minimal line chart)
   */
  createSparkline(containerId, values, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const {
      width = 100,
      height = 30,
      color = '#6366f1',
      fillArea = false
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    values.forEach((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((value - minValue) / valueRange) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under line
    if (fillArea) {
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = color + '30';
      ctx.fill();
    }

    return canvas;
  }

  /**
   * Destroy chart
   */
  destroyChart(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    this.charts.delete(containerId);
  }

  /**
   * Clear all charts
   */
  clearAll() {
    this.charts.forEach((chart, id) => {
      this.destroyChart(id);
    });
  }
}

// Export singleton instance
window.EnhancedCharts = window.EnhancedCharts || new EnhancedCharts();

