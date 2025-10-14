/**
 * Project Card Component
 * Displays individual project information with management actions
 */

class ProjectCard {
  constructor(project) {
    this.project = project;
    this.element = null;
  }

  /**
   * Render the project card HTML
   */
  render() {
    const registeredDate = new Date(this.project.registeredAt).toLocaleDateString();

    return `
      <div class="project-card" data-project-id="${this.project.id}">
        <div class="project-header">
          <h3 class="project-title">${this.project.name}</h3>
          <span class="project-type">${this.project.type}</span>
        </div>

        <div class="project-path">${this.project.path}</div>

        <div class="project-meta">
          <span>Registered: ${registeredDate}</span>
          <span>Audits: ${this.project.auditCount || 0}</span>
          <span>Last: ${this.project.lastAudited ? new Date(this.project.lastAudited).toLocaleDateString() : 'Never'}</span>
        </div>

        <div class="project-actions">
          <button class="project-btn" onclick="auditProject('${this.project.id}')">Audit</button>
          <button class="project-btn" onclick="editProject('${this.project.id}')">Edit</button>
          <button class="project-btn delete" onclick="deleteProject('${this.project.id}')">Delete</button>
        </div>
      </div>
    `;
  }
}

/**
 * Projects Grid Manager
 */
class ProjectsGrid {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.projects = [];
  }

  /**
   * Initialize the projects grid
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Projects container not found: ${this.containerId}`);
      return;
    }

    // Load initial projects
    this.loadProjects();
  }

  /**
   * Load projects from API
   */
  async loadProjects() {
    try {
      const response = await fetch('http://localhost:3006/api/projects');
      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.statusText}`);
      }

      this.projects = await response.json();
      this.render();

    } catch (error) {
      console.warn('Failed to load projects:', error);
      this.showEmptyState('Failed to load projects');
    }
  }

  /**
   * Refresh projects list
   */
  async refresh() {
    await this.loadProjects();
  }

  /**
   * Add a new project
   */
  async addProject(projectData) {
    try {
      const response = await fetch('http://localhost:3006/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add project: ${response.statusText}`);
      }

      const newProject = await response.json();
      this.projects.unshift(newProject);
      this.render();

      return newProject;

    } catch (error) {
      console.error('Failed to add project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    try {
      const response = await fetch(`http://localhost:3006/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }

      // Remove from local array
      this.projects = this.projects.filter(p => p.id !== projectId);
      this.render();

    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  async updateProject(projectId, updates) {
    try {
      const response = await fetch(`http://localhost:3006/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
      }

      const updatedProject = await response.json();

      // Update in local array
      const index = this.projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        this.projects[index] = updatedProject;
        this.render();
      }

      return updatedProject;

    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  /**
   * Render all projects
   */
  render() {
    if (!this.container) return;

    if (this.projects.length === 0) {
      this.showEmptyState('No projects registered yet');
      return;
    }

    this.container.innerHTML = this.projects
      .map(project => new ProjectCard(project).render())
      .join('');
  }

  /**
   * Show empty state
   */
  showEmptyState(message) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📁</div>
        <div class="empty-state-title">No Projects Found</div>
        <div class="empty-state-description">${message}</div>
        <button class="btn btn-primary" onclick="showAddProjectModal()">Add Your First Project</button>
      </div>
    `;
  }
}

/**
 * Project Form Modal
 */
class ProjectFormModal {
  constructor() {
    this.modal = null;
    this.form = null;
    this.isEdit = false;
    this.editProjectId = null;
  }

  /**
   * Initialize the modal
   */
  init() {
    this.createModal();
    this.bindEvents();
  }

  /**
   * Create modal HTML
   */
  createModal() {
    const modalHTML = `
      <div class="project-modal" id="projectModal">
        <div class="project-modal-content">
          <div class="project-modal-header">
            <h2 class="project-modal-title" id="modalTitle">Add Project</h2>
            <button class="project-modal-close" onclick="closeProjectModal()">×</button>
          </div>

          <form class="project-form" id="projectForm">
            <div class="form-group">
              <label class="form-label" for="projectName">Project Name</label>
              <input type="text" class="form-input" id="projectName" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="projectPath">Project Path</label>
              <input type="text" class="form-input" id="projectPath" required
                     placeholder="e.g., /path/to/your/project or C:\\path\\to\\project">
            </div>

            <div class="form-group">
              <label class="form-label" for="projectType">Project Type</label>
              <select class="form-input" id="projectType">
                <option value="nodejs">Node.js</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="generic">Generic</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="projectDescription">Description (Optional)</label>
              <textarea class="form-input form-textarea" id="projectDescription"
                        placeholder="Brief description of the project"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="projectTags">Tags (Optional)</label>
              <input type="text" class="form-input" id="projectTags"
                     placeholder="e.g., web, api, frontend (comma-separated)">
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeProjectModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" id="submitBtn">Add Project</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('projectModal');
    this.form = document.getElementById('projectForm');
  }

  /**
   * Bind form events
   */
  bindEvents() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  /**
   * Show modal for adding project
   */
  showAdd() {
    this.isEdit = false;
    this.editProjectId = null;

    document.getElementById('modalTitle').textContent = 'Add Project';
    document.getElementById('submitBtn').textContent = 'Add Project';

    this.form.reset();
    this.modal.classList.add('show');
  }

  /**
   * Show modal for editing project
   */
  showEdit(project) {
    this.isEdit = true;
    this.editProjectId = project.id;

    document.getElementById('modalTitle').textContent = 'Edit Project';
    document.getElementById('submitBtn').textContent = 'Update Project';

    document.getElementById('projectName').value = project.name;
    document.getElementById('projectPath').value = project.path;
    document.getElementById('projectType').value = project.type;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectTags').value = (project.tags || []).join(', ');

    this.modal.classList.add('show');
  }

  /**
   * Close modal
   */
  close() {
    this.modal.classList.remove('show');
    this.form.reset();
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    const formData = new FormData(this.form);
    const projectData = {
      name: formData.get('projectName'),
      path: formData.get('projectPath'),
      type: formData.get('projectType'),
      description: formData.get('projectDescription'),
      tags: formData.get('projectTags') ? formData.get('projectTags').split(',').map(tag => tag.trim()) : []
    };

    try {
      if (this.isEdit) {
        await window.ProjectsGrid.updateProject(this.editProjectId, projectData);
        if (typeof window.showNotification === 'function') {
          window.showNotification('Project updated successfully', 'success');
        }
      } else {
        await window.ProjectsGrid.addProject(projectData);
        if (typeof window.showNotification === 'function') {
          window.showNotification('Project added successfully', 'success');
        }
      }

      this.close();

    } catch (error) {
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Failed to ${this.isEdit ? 'update' : 'add'} project: ${error.message}`, 'error');
      }
    }
  }
}

/**
 * Initialize project management
 */
function initializeProjectManagement() {
  const projectsGrid = new ProjectsGrid('projectsGrid');
  const projectModal = new ProjectFormModal();

  projectsGrid.init();
  projectModal.init();

  // Make globally available for other components
  window.ProjectsGrid = projectsGrid;
  window.ProjectModal = projectModal;

  // Setup global functions
  window.showAddProjectModal = () => projectModal.showAdd();
  window.closeProjectModal = () => projectModal.close();
  window.auditProject = (projectId) => {
    const project = projectsGrid.projects.find(p => p.id === projectId);
    if (project) {
      // Switch to this project in the main dashboard
      const select = document.getElementById('projectSelect');
      if (select) {
        select.value = project.path;
        // Trigger change event to update dashboard
        select.dispatchEvent(new Event('change'));
      }

      // Try to switch to overview page if function is available
      if (typeof window.showPage === 'function') {
        window.showPage('overview');
      }

      // Show notification if function is available
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Switched to project: ${project.name}`, 'success');
      }
    }
  };

  window.editProject = (projectId) => {
    const project = projectsGrid.projects.find(p => p.id === projectId);
    if (project) {
      projectModal.showEdit(project);
    }
  };

  window.deleteProject = async (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsGrid.deleteProject(projectId);
        if (typeof window.showNotification === 'function') {
          window.showNotification('Project deleted successfully', 'success');
        }
      } catch (error) {
        if (typeof window.showNotification === 'function') {
          window.showNotification(`Failed to delete project: ${error.message}`, 'error');
        }
      }
    }
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProjectManagement);
} else {
  initializeProjectManagement();
}
