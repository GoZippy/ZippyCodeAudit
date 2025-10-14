#!/usr/bin/env node

/**
 * Simple API server for ZippyCodeAudit Dashboard
 * Provides endpoints for the dashboard to fetch real data
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static dashboard files
app.use(express.static(path.join(__dirname, 'dist', 'dashboard')));

// Serve public files (manifest, favicon, etc.)
app.use('/public', express.static(path.join(__dirname, 'src', 'dashboard', 'public')));

// Also serve from root for PWA manifest
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'dashboard', 'public', 'manifest.json'));
});

app.get('/favicon.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'dashboard', 'public', 'favicon.svg'));
});

/**
 * Get project metrics
 */
app.get('/api/projects/:projectPath/metrics', async (req, res) => {
  try {
    const { projectPath } = req.params;
    console.log(`Getting metrics for project: ${projectPath}`);

    // For now, return some basic metrics
    const metrics = {
      totalFiles: Math.floor(Math.random() * 100) + 50,
      totalIssues: Math.floor(Math.random() * 20) + 5,
      projectHealth: Math.floor(Math.random() * 40) + 60,
      completedTasks: Math.floor(Math.random() * 10) + 2
    };

    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * Get project reports
 */
app.get('/api/projects/:projectPath/reports', async (req, res) => {
  try {
    const { projectPath } = req.params;
    console.log(`Getting reports for project: ${projectPath}`);

    const reports = [
      {
        id: '1',
        title: 'Security Audit',
        date: new Date().toISOString(),
        type: 'security',
        issues: 5,
        files: 150,
        score: 85
      },
      {
        id: '2',
        title: 'Performance Audit',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'performance',
        issues: 3,
        files: 150,
        score: 92
      }
    ];

    res.json(reports);
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * Get project tasks
 */
app.get('/api/projects/:projectPath/tasks', async (req, res) => {
  try {
    const { projectPath } = req.params;
    console.log(`Getting tasks for project: ${projectPath}`);

    const tasks = [
      {
        id: '1',
        title: 'Fix security vulnerability in auth module',
        description: 'Address potential XSS issue in authentication component',
        category: 'security',
        priority: 'high',
        status: 'pending',
        assignee: 'Developer Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Optimize bundle size',
        description: 'Reduce JavaScript bundle size for better performance',
        category: 'performance',
        priority: 'medium',
        status: 'in-progress',
        assignee: 'Frontend Team',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json(tasks);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

/**
 * Get project activity
 */
app.get('/api/projects/:projectPath/activity', async (req, res) => {
  try {
    const { projectPath } = req.params;
    console.log(`Getting activity for project: ${projectPath}`);

    const activities = [
      {
        id: '1',
        type: 'audit',
        title: 'Audit completed',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'task',
        title: 'Task created: Security fix',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    res.json(activities);
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

// In-memory project storage (replace with ProjectRegistry in production)
let projects = [
  {
    id: 'proj_current',
    name: 'Current Directory',
    path: '.',
    type: 'generic',
    registeredAt: new Date().toISOString(),
    auditCount: 0,
    lastAudited: null
  },
  {
    id: 'proj_zippycodesaudit',
    name: 'ZippyCodeAudit',
    path: 'K:/Projects/ZippyCodeAudit/ZippyCodeAudit-Main',
    type: 'nodejs',
    registeredAt: new Date().toISOString(),
    auditCount: 1,
    lastAudited: new Date().toISOString()
  }
];

/**
 * Get all registered projects
 */
app.get('/api/projects', async (req, res) => {
  try {
    res.json(projects);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

/**
 * Add a new project
 */
app.post('/api/projects', async (req, res) => {
  try {
    const { name, path, type, description, tags } = req.body;

    if (!name || !path || !type) {
      return res.status(400).json({ error: 'Missing required fields: name, path, type' });
    }

    // Generate unique ID
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newProject = {
      id,
      name,
      path,
      type,
      description: description || '',
      tags: tags || [],
      registeredAt: new Date().toISOString(),
      auditCount: 0,
      lastAudited: null
    };

    projects.unshift(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

/**
 * Add project (wizard endpoint)
 */
app.post('/api/projects/add', async (req, res) => {
  try {
    const { projectPath, metadata } = req.body;

    if (!projectPath) {
      return res.status(400).json({ success: false, error: 'projectPath is required' });
    }

    // Generate unique ID
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newProject = {
      id,
      name: metadata?.detection?.projectType || path.basename(projectPath),
      path: projectPath,
      type: metadata?.detection?.projectType || 'Unknown',
      description: metadata?.description || '',
      tags: metadata?.tags || [],
      source: metadata?.source || 'local',
      sourceUrl: metadata?.sourceUrl || null,
      detection: metadata?.detection || null,
      complexity: metadata?.complexity || 'unknown',
      frameworks: metadata?.frameworks || [],
      languages: metadata?.languages || {},
      fileCount: metadata?.fileCount || 0,
      registeredAt: new Date().toISOString(),
      auditCount: 0,
      lastAudited: null
    };

    projects.unshift(newProject);
    res.json({ success: true, project: newProject });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ success: false, error: 'Failed to add project' });
  }
});

/**
 * Update a project
 */
app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(projects[projectIndex]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * Delete a project
 */
app.delete('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const deletedProject = projects.splice(projectIndex, 1)[0];
    res.json(deletedProject);
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

/**
 * Get project reports
 */
app.get('/api/reports', async (req, res) => {
  try {
    const { path: projectPath } = req.query;
    console.log(`Getting reports for project: ${projectPath}`);

    // Return sample reports for demo purposes
    const reports = [
      {
        id: '1',
        title: 'Security Audit',
        date: new Date().toISOString(),
        type: 'security',
        issues: 5,
        files: 150,
        score: 85
      },
      {
        id: '2',
        title: 'Performance Audit',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'performance',
        issues: 3,
        files: 150,
        score: 92
      }
    ];

    res.json(reports);
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * Analyze endpoint (for dashboard metrics) - Only analyze when explicitly requested
 */
app.get('/api/analyze', async (req, res) => {
  try {
    const { path: projectPath, format, force } = req.query;

    // Only log analysis when explicitly requested (not for every dashboard load)
    if (force === 'true' || req.headers['x-requested-with'] === 'dashboard-analysis') {
      console.log(`Analyzing project: ${projectPath}`);
    }

    // Simple analysis for demo purposes - in production this would use AuditEngine
    const analysis = {
      metadata: {
        totalFilesAnalyzed: Math.floor(Math.random() * 100) + 50,
        totalIssues: Math.floor(Math.random() * 20) + 5,
        analysisTime: Date.now()
      },
      issues: [
        {
          type: 'security',
          severity: 'medium',
          message: 'Potential security issue detected',
          file: 'src/auth.js'
        }
      ],
      recommendations: [
        {
          title: 'Improve security practices',
          description: 'Review authentication implementation',
          priority: 'high'
        }
      ]
    };

    if (format === 'json') {
      res.json(analysis);
    } else {
      res.json(analysis);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ZippyCodeAudit API',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ZippyCodeAudit API server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
  console.log(`💊 Health check at http://localhost:${PORT}/health`);
});

module.exports = app;
