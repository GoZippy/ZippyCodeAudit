/**
 * Task Item Component
 * Displays individual audit tasks with status management
 */

class TaskItem {
  constructor(task) {
    this.task = task;
    this.element = null;
  }

  /**
   * Render the task item HTML
   */
  render() {
    const priorityClass = `task-priority ${this.task.priority}`;
    const statusClass = `task-status ${this.task.status}`;

    return `
      <div class="task-item" data-status="${this.task.status}" data-priority="${this.task.priority}">
        <div class="task-header">
          <h4 class="task-title">${this.task.title}</h4>
          <span class="${priorityClass}">${this.task.priority}</span>
        </div>
        <div class="task-meta">
          <span>Status: ${this.task.status}</span>
          <span>Assignee: ${this.task.assignee || 'Unassigned'}</span>
          <span>Created: ${new Date(this.task.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="task-description">${this.task.description || 'No description provided'}</div>
      </div>
    `;
  }
}

/**
 * Task List Manager
 */
class TaskList {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.tasks = [];
    this.activeFilter = 'all';
  }

  /**
   * Initialize the task list
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Task container not found: ${this.containerId}`);
      return;
    }

    this.setupFilters();
  }

  /**
   * Setup filter buttons
   */
  setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update filter and render
        this.activeFilter = button.dataset.filter;
        this.render();
      });
    });
  }

  /**
   * Update tasks with new data
   */
  update(tasks) {
    this.tasks = tasks || [];
    this.render();
  }

  /**
   * Filter tasks based on current filter
   */
  getFilteredTasks() {
    if (this.activeFilter === 'all') {
      return this.tasks;
    }
    return this.tasks.filter(task => task.status === this.activeFilter);
  }

  /**
   * Render filtered tasks
   */
  render() {
    if (!this.container) return;

    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      this.container.innerHTML = '<div class="task-item"><div class="task-content"><div class="task-title">No tasks found</div></div></div>';
      return;
    }

    this.container.innerHTML = filteredTasks
      .map(task => new TaskItem(task).render())
      .join('');
  }
}

/**
 * Initialize task list
 */
function initializeTaskList() {
  const taskList = new TaskList('tasksList');
  taskList.init();

  window.TaskList = taskList;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTaskList);
} else {
  initializeTaskList();
}
