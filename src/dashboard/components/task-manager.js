/**
 * Interactive Task Manager
 * Drag-and-drop task management with quick actions
 */

class TaskManager {
  constructor() {
    this.tasks = [];
    this.container = null;
    this.draggedTask = null;
    this.filters = {
      severity: 'all',
      status: 'all',
      search: ''
    };
  }

  /**
   * Initialize task manager
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('Task manager container not found');
      return;
    }

    this.setupEventListeners();
    this.render();
  }

  /**
   * Load tasks from issues
   */
  loadTasks(issues) {
    this.tasks = issues.map((issue, index) => ({
      id: issue.id || `task-${index}`,
      title: issue.message || 'Untitled Issue',
      description: issue.suggestion || '',
      severity: issue.severity || 'low',
      status: issue.status || 'pending',
      file: issue.file || '',
      line: issue.line || 0,
      type: issue.type || 'general',
      priority: issue.priority || this.calculatePriority(issue.severity),
      estimatedTime: issue.estimatedTime || this.estimateTime(issue),
      assignee: issue.assignee || null,
      createdAt: issue.createdAt || new Date().toISOString(),
      tags: issue.tags || []
    }));

    this.sortTasks();
    this.render();
  }

  /**
   * Calculate priority based on severity
   */
  calculatePriority(severity) {
    const priorityMap = { high: 1, medium: 2, low: 3 };
    return priorityMap[severity] || 3;
  }

  /**
   * Estimate time to fix
   */
  estimateTime(issue) {
    const severityTime = { high: 30, medium: 15, low: 5 };
    return severityTime[issue.severity] || 10;
  }

  /**
   * Sort tasks by priority
   */
  sortTasks() {
    this.tasks.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter controls
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-filter-type]')) {
        const filterType = e.target.dataset.filterType;
        this.filters[filterType] = e.target.value;
        this.render();
      }
    });

    // Search
    document.addEventListener('input', (e) => {
      if (e.target.matches('[data-task-search]')) {
        this.filters.search = e.target.value.toLowerCase();
        this.render();
      }
    });

    // Bulk actions
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-bulk-action]')) {
        const action = e.target.dataset.bulkAction;
        this.handleBulkAction(action);
      }
    });
  }

  /**
   * Render task manager
   */
  render() {
    if (!this.container) return;

    const filteredTasks = this.getFilteredTasks();
    const isVibeMode = window.ModeSwitcher && window.ModeSwitcher.isVibeMode();

    const html = `
      <div class="task-manager">
        <div class="task-manager-header">
          <h3>${isVibeMode ? '📋 Your Tasks' : 'Task Management'}</h3>
          <div class="task-stats">
            <span class="stat">
              <span class="stat-value">${this.tasks.length}</span>
              <span class="stat-label">${isVibeMode ? 'total' : 'Total'}</span>
            </span>
            <span class="stat">
              <span class="stat-value">${this.tasks.filter(t => t.status === 'pending').length}</span>
              <span class="stat-label">${isVibeMode ? 'to do' : 'Pending'}</span>
            </span>
            <span class="stat">
              <span class="stat-value">${this.tasks.filter(t => t.status === 'completed').length}</span>
              <span class="stat-label">${isVibeMode ? 'done' : 'Completed'}</span>
            </span>
          </div>
        </div>

        <div class="task-manager-filters">
          <input 
            type="text" 
            class="task-search" 
            data-task-search
            placeholder="${isVibeMode ? '🔍 Search tasks...' : 'Search tasks...'}"
            value="${this.filters.search}"
          />
          
          <select data-filter-type="severity" class="task-filter">
            <option value="all">All Severities</option>
            <option value="high" ${this.filters.severity === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${this.filters.severity === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="low" ${this.filters.severity === 'low' ? 'selected' : ''}>Low</option>
          </select>

          <select data-filter-type="status" class="task-filter">
            <option value="all">All Status</option>
            <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in-progress" ${this.filters.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${this.filters.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>

          <div class="bulk-actions">
            <button class="btn-bulk" data-bulk-action="select-all">
              ${isVibeMode ? 'Select All' : 'Select All'}
            </button>
            <button class="btn-bulk" data-bulk-action="complete-selected">
              ${isVibeMode ? '✅ Complete' : 'Mark Complete'}
            </button>
            <button class="btn-bulk" data-bulk-action="delete-selected">
              ${isVibeMode ? '🗑️ Remove' : 'Delete'}
            </button>
          </div>
        </div>

        <div class="task-list" id="taskList">
          ${filteredTasks.length > 0 
            ? filteredTasks.map(task => this.renderTaskCard(task, isVibeMode)).join('')
            : `<div class="task-list-empty">
                <div class="empty-icon">🎉</div>
                <h4>${isVibeMode ? 'All done! Great work!' : 'No tasks found'}</h4>
                <p>${isVibeMode ? 'Time to celebrate or find new challenges!' : 'Try adjusting your filters'}</p>
              </div>`
          }
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachTaskEventListeners();
  }

  /**
   * Render individual task card
   */
  renderTaskCard(task, isVibeMode) {
    const severityColors = {
      high: 'severity-high',
      medium: 'severity-medium',
      low: 'severity-low'
    };

    const severityIcons = {
      high: '🔴',
      medium: '🟡',
      low: '🔵'
    };

    const statusIcons = {
      pending: '⏳',
      'in-progress': '⚙️',
      completed: '✅'
    };

    return `
      <div 
        class="task-card ${severityColors[task.severity]} ${task.status === 'completed' ? 'completed' : ''}" 
        data-task-id="${task.id}"
        draggable="true"
      >
        <div class="task-card-header">
          <input type="checkbox" class="task-checkbox" data-task-checkbox="${task.id}" />
          <div class="task-priority" title="Priority ${task.priority}">
            ${severityIcons[task.severity]}
          </div>
          <div class="task-title">${task.title}</div>
          <div class="task-status">${statusIcons[task.status]}</div>
        </div>

        ${task.description ? `
          <div class="task-description">${task.description}</div>
        ` : ''}

        <div class="task-meta">
          ${task.file ? `
            <span class="task-meta-item">
              📄 ${this.truncateFilename(task.file)}
            </span>
          ` : ''}
          <span class="task-meta-item">
            ⏱️ ${task.estimatedTime} min
          </span>
          <span class="task-meta-item task-severity-badge badge-${task.severity}">
            ${task.severity}
          </span>
        </div>

        <div class="task-actions">
          <button class="task-action-btn" data-task-action="start" data-task-id="${task.id}" title="${isVibeMode ? 'Start working on this' : 'Start Task'}">
            ▶️ ${isVibeMode ? 'Start' : 'Start'}
          </button>
          <button class="task-action-btn" data-task-action="complete" data-task-id="${task.id}" title="${isVibeMode ? 'Mark as done' : 'Complete'}">
            ✅ ${isVibeMode ? 'Done' : 'Complete'}
          </button>
          <button class="task-action-btn" data-task-action="ignore" data-task-id="${task.id}" title="${isVibeMode ? 'Skip this one' : 'Ignore'}">
            👋 ${isVibeMode ? 'Skip' : 'Ignore'}
          </button>
          <button class="task-action-btn btn-danger" data-task-action="delete" data-task-id="${task.id}" title="${isVibeMode ? 'Remove forever' : 'Delete'}">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to task cards
   */
  attachTaskEventListeners() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    // Task actions
    taskList.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-task-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.taskAction;
        const taskId = actionBtn.dataset.taskId;
        this.handleTaskAction(action, taskId);
      }
    });

    // Drag and drop
    taskList.addEventListener('dragstart', (e) => {
      const taskCard = e.target.closest('.task-card');
      if (taskCard) {
        this.draggedTask = taskCard.dataset.taskId;
        taskCard.classList.add('dragging');
      }
    });

    taskList.addEventListener('dragend', (e) => {
      const taskCard = e.target.closest('.task-card');
      if (taskCard) {
        taskCard.classList.remove('dragging');
        this.draggedTask = null;
      }
    });

    taskList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(taskList, e.clientY);
      const draggingCard = document.querySelector('.dragging');
      
      if (afterElement == null) {
        taskList.appendChild(draggingCard);
      } else {
        taskList.insertBefore(draggingCard, afterElement);
      }
    });

    taskList.addEventListener('drop', (e) => {
      e.preventDefault();
      this.reorderTasks();
    });
  }

  /**
   * Get element after drag position
   */
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  /**
   * Reorder tasks based on DOM order
   */
  reorderTasks() {
    const taskCards = document.querySelectorAll('.task-card');
    const newOrder = Array.from(taskCards).map(card => card.dataset.taskId);
    
    const reorderedTasks = [];
    newOrder.forEach((id, index) => {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
        task.priority = index + 1;
        reorderedTasks.push(task);
      }
    });

    this.tasks = reorderedTasks;
    
    if (window.showToast) {
      window.showToast('📋 Tasks reordered!', 'success');
    }
  }

  /**
   * Handle task action
   */
  handleTaskAction(action, taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);

    switch (action) {
      case 'start':
        task.status = 'in-progress';
        if (window.showToast) {
          window.showToast(`⚙️ Started: ${task.title}`, 'info');
        }
        break;

      case 'complete':
        task.status = 'completed';
        if (taskCard) {
          taskCard.classList.add('completing');
          setTimeout(() => {
            this.render();
            if (window.showToast) {
              window.showToast(`✅ Completed: ${task.title}`, 'success');
            }
          }, 300);
          return;
        }
        break;

      case 'ignore':
        if (taskCard) {
          taskCard.classList.add('ignoring');
          setTimeout(() => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.render();
            if (window.showToast) {
              window.showToast(`👋 Ignored: ${task.title}`, 'info');
            }
          }, 300);
          return;
        }
        break;

      case 'delete':
        if (confirm('Delete this task permanently?')) {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          if (window.showToast) {
            window.showToast(`🗑️ Deleted: ${task.title}`, 'info');
          }
        }
        break;
    }

    this.render();
  }

  /**
   * Handle bulk actions
   */
  handleBulkAction(action) {
    const selectedCheckboxes = document.querySelectorAll('.task-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => 
      cb.dataset.taskCheckbox
    );

    if (action === 'select-all') {
      const allCheckboxes = document.querySelectorAll('.task-checkbox');
      const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
      allCheckboxes.forEach(cb => cb.checked = !allChecked);
      return;
    }

    if (selectedIds.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No tasks selected', 'warning');
      }
      return;
    }

    switch (action) {
      case 'complete-selected':
        selectedIds.forEach(id => {
          const task = this.tasks.find(t => t.id === id);
          if (task) task.status = 'completed';
        });
        if (window.showToast) {
          window.showToast(`✅ Completed ${selectedIds.length} tasks`, 'success');
        }
        break;

      case 'delete-selected':
        if (confirm(`Delete ${selectedIds.length} tasks permanently?`)) {
          this.tasks = this.tasks.filter(t => !selectedIds.includes(t.id));
          if (window.showToast) {
            window.showToast(`🗑️ Deleted ${selectedIds.length} tasks`, 'info');
          }
        }
        break;
    }

    this.render();
  }

  /**
   * Get filtered tasks
   */
  getFilteredTasks() {
    return this.tasks.filter(task => {
      // Severity filter
      if (this.filters.severity !== 'all' && task.severity !== this.filters.severity) {
        return false;
      }

      // Status filter
      if (this.filters.status !== 'all' && task.status !== this.filters.status) {
        return false;
      }

      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.file.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }

  /**
   * Truncate filename
   */
  truncateFilename(filename, maxLength = 30) {
    if (filename.length <= maxLength) return filename;
    const start = filename.substring(0, 15);
    const end = filename.substring(filename.length - 10);
    return `${start}...${end}`;
  }

  /**
   * Export tasks
   */
  exportTasks() {
    const data = {
      exportedAt: new Date().toISOString(),
      totalTasks: this.tasks.length,
      tasks: this.tasks
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      total: this.tasks.length,
      pending: this.tasks.filter(t => t.status === 'pending').length,
      inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      high: this.tasks.filter(t => t.severity === 'high').length,
      medium: this.tasks.filter(t => t.severity === 'medium').length,
      low: this.tasks.filter(t => t.severity === 'low').length,
      totalEstimatedTime: this.tasks.reduce((sum, t) => sum + t.estimatedTime, 0)
    };
  }
}

// Export globally
window.TaskManager = TaskManager;
window.TaskManagerInstance = new TaskManager();

